-- =============================================================
-- Uppi — Push Notifications Setup
-- FCM nativo (Capacitor + Android Play Store)
-- =============================================================

-- -------------------------------------------------------------
-- 1. Coluna fcm_token na tabela profiles (campo legado/rapido)
-- -------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Indice para lookup rapido ao buscar token de um usuario
CREATE INDEX IF NOT EXISTS idx_profiles_fcm_token
  ON profiles (fcm_token)
  WHERE fcm_token IS NOT NULL;

-- RLS: usuario pode atualizar apenas o proprio fcm_token
CREATE POLICY IF NOT EXISTS "Usuarios atualizam proprio fcm_token"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- -------------------------------------------------------------
-- 2. Tabela fcm_tokens (multi-dispositivo, normalizada)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL,
  platform   TEXT NOT NULL DEFAULT 'android' CHECK (platform IN ('android','ios','web')),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_active
  ON fcm_tokens (user_id, is_active)
  WHERE is_active = true;

-- RLS
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Usuario gerencia proprios tokens FCM"
  ON fcm_tokens
  FOR ALL
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role tem acesso total (para edge functions e api routes)
CREATE POLICY IF NOT EXISTS "Service role acessa todos tokens"
  ON fcm_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------------------------
-- 3. Tabela push_log (auditoria de envios)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS push_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  channel    TEXT NOT NULL DEFAULT 'fcm_v1',
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE push_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins leem push_log"
  ON push_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Service role acessa push_log"
  ON push_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- -------------------------------------------------------------
-- 4. Funcao auxiliar: notifica um usuario via Edge Function
--    Chama a Edge Function send-push-notification via pg_net
--    (extensao pg_net deve estar ativa no projeto Supabase)
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_user_push(
  p_user_id UUID,
  p_title   TEXT,
  p_body    TEXT,
  p_data    JSONB DEFAULT '{}'::JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url  TEXT;
  v_service_key   TEXT;
  v_request_body  TEXT;
BEGIN
  -- Variaveis de ambiente do Supabase (configuradas nas secrets do projeto)
  v_supabase_url := current_setting('app.supabase_url', true);
  v_service_key  := current_setting('app.service_role_key', true);

  v_request_body := json_build_object(
    'user_id', p_user_id,
    'title',   p_title,
    'body',    p_body,
    'data',    p_data
  )::text;

  -- Dispara o request HTTP assincrono via pg_net
  PERFORM net.http_post(
    url     := v_supabase_url || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body    := v_request_body::JSONB
  );
EXCEPTION WHEN OTHERS THEN
  -- Silencia erros de push para nao afetar transacoes criticas
  RAISE WARNING 'notify_user_push falhou para user_id=%: %', p_user_id, SQLERRM;
END;
$$;

-- -------------------------------------------------------------
-- 5. Funcao auxiliar: notifica motoristas proximos de uma corrida
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_nearby_drivers(
  p_ride_id   UUID,
  p_title     TEXT DEFAULT 'Nova corrida disponivel!',
  p_body      TEXT DEFAULT 'Ha uma nova solicitacao de corrida na sua area.'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_driver RECORD;
  v_ride   RECORD;
BEGIN
  -- Busca dados da corrida para enriquecer a notificacao
  SELECT pickup_address, price_estimate
  INTO v_ride
  FROM rides
  WHERE id = p_ride_id;

  -- Busca motoristas online num raio de 10km usando a tabela driver_locations
  FOR v_driver IN
    SELECT DISTINCT dl.driver_id
    FROM driver_locations dl
    JOIN profiles p ON p.id = dl.driver_id
    WHERE
      p.status = 'active'
      AND p.user_type = 'driver'
      AND dl.is_online = true
      AND dl.updated_at > NOW() - INTERVAL '5 minutes'
    LIMIT 30
  LOOP
    PERFORM notify_user_push(
      v_driver.driver_id,
      p_title,
      COALESCE(p_body, 'Nova corrida: ' || COALESCE(v_ride.pickup_address, 'Ver no app')),
      jsonb_build_object(
        'ride_id', p_ride_id::text,
        'type',    'new_ride',
        'action',  'open_ride'
      )
    );
  END LOOP;
END;
$$;

-- -------------------------------------------------------------
-- 6. Trigger: nova corrida criada → notifica motoristas proximos
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_notify_new_ride()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Somente dispara quando status inicial for 'searching'
  IF NEW.status = 'searching' THEN
    PERFORM notify_nearby_drivers(
      NEW.id,
      'Nova corrida disponivel!',
      'Um passageiro esta solicitando uma corrida na sua regiao.'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_ride_notify_drivers ON rides;
CREATE TRIGGER on_new_ride_notify_drivers
  AFTER INSERT ON rides
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_new_ride();

-- -------------------------------------------------------------
-- 7. Trigger: mudanca de status da corrida → notifica passageiro
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_notify_ride_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_driver_name TEXT;
  v_title       TEXT;
  v_body        TEXT;
BEGIN
  -- Ignora se status nao mudou
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Busca nome do motorista para personalizar mensagem
  SELECT COALESCE(full_name, 'Seu motorista')
  INTO v_driver_name
  FROM profiles
  WHERE id = NEW.driver_id;

  CASE NEW.status

    WHEN 'accepted' THEN
      v_title := 'Corrida aceita!';
      v_body  := v_driver_name || ' aceitou sua corrida e esta a caminho.';
      PERFORM notify_user_push(
        NEW.passenger_id,
        v_title, v_body,
        jsonb_build_object('ride_id', NEW.id::text, 'type', 'ride_accepted', 'action', 'track_ride')
      );

    WHEN 'arriving' THEN
      v_title := 'Motorista chegando!';
      v_body  := v_driver_name || ' esta quase chegando. Prepare-se!';
      PERFORM notify_user_push(
        NEW.passenger_id,
        v_title, v_body,
        jsonb_build_object('ride_id', NEW.id::text, 'type', 'driver_arriving', 'action', 'track_ride')
      );

    WHEN 'arrived' THEN
      v_title := 'Motorista chegou!';
      v_body  := v_driver_name || ' esta te esperando no local de embarque.';
      PERFORM notify_user_push(
        NEW.passenger_id,
        v_title, v_body,
        jsonb_build_object('ride_id', NEW.id::text, 'type', 'driver_arrived', 'action', 'track_ride')
      );

    WHEN 'in_progress' THEN
      v_title := 'Corrida iniciada!';
      v_body  := 'Sua corrida comecou. Boa viagem!';
      PERFORM notify_user_push(
        NEW.passenger_id,
        v_title, v_body,
        jsonb_build_object('ride_id', NEW.id::text, 'type', 'ride_started', 'action', 'track_ride')
      );

    WHEN 'completed' THEN
      v_title := 'Corrida finalizada!';
      v_body  := 'Voce chegou ao destino. Avalie sua experiencia.';
      PERFORM notify_user_push(
        NEW.passenger_id,
        v_title, v_body,
        jsonb_build_object('ride_id', NEW.id::text, 'type', 'ride_completed', 'action', 'review_ride')
      );

    WHEN 'cancelled' THEN
      -- Notifica a outra parte sobre o cancelamento
      IF NEW.passenger_id IS NOT NULL AND NEW.driver_id IS NOT NULL THEN
        v_title := 'Corrida cancelada';
        v_body  := 'A corrida foi cancelada.';
        -- Notifica quem NAO cancelou
        IF NEW.cancelled_by = 'driver' THEN
          PERFORM notify_user_push(
            NEW.passenger_id,
            v_title,
            'O motorista cancelou a corrida.',
            jsonb_build_object('ride_id', NEW.id::text, 'type', 'ride_cancelled')
          );
        ELSIF NEW.cancelled_by = 'passenger' THEN
          PERFORM notify_user_push(
            NEW.driver_id,
            v_title,
            'O passageiro cancelou a corrida.',
            jsonb_build_object('ride_id', NEW.id::text, 'type', 'ride_cancelled')
          );
        END IF;
      END IF;

    ELSE
      -- Status nao mapeado, ignora
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ride_status_change_notify ON rides;
CREATE TRIGGER on_ride_status_change_notify
  AFTER UPDATE OF status ON rides
  FOR EACH ROW
  EXECUTE FUNCTION trigger_notify_ride_status_change();

-- -------------------------------------------------------------
-- 8. Configurar variaveis de ambiente para pg_net
--    (executar uma vez apos configurar as secrets do projeto)
-- -------------------------------------------------------------
-- ALTER DATABASE postgres
--   SET app.supabase_url = 'https://SEU_PROJECT_ID.supabase.co';
-- ALTER DATABASE postgres
--   SET app.service_role_key = 'SUA_SERVICE_ROLE_KEY';

-- Habilitar extensao pg_net (se ainda nao estiver ativa):
-- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- =============================================================
-- FIM DO SCRIPT
-- Executar via: Supabase Dashboard > SQL Editor > Run
-- =============================================================
