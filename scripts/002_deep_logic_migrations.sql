-- ============================================================
-- UPPI — Migration 002: Correções e Lógica Profunda
-- ============================================================

-- ============================================================
-- 1. hot_zones — corrigir colunas para radius_meters + intensity
-- ============================================================
ALTER TABLE hot_zones
  ADD COLUMN IF NOT EXISTS radius_meters integer NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS intensity numeric(3,2) NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Migrar dados existentes
UPDATE hot_zones SET
  radius_meters = COALESCE(radius, 500),
  intensity = CASE
    WHEN danger_level = 'critical' THEN 0.95
    WHEN danger_level = 'high'     THEN 0.75
    WHEN danger_level = 'medium'   THEN 0.50
    ELSE 0.25
  END
WHERE radius_meters = 500 OR intensity = 0.5;

-- Seed de zonas com dados completos e corrigidos
INSERT INTO hot_zones (name, latitude, longitude, radius_meters, intensity, is_active)
VALUES
  ('Centro SP',       -23.5505, -46.6333, 1000, 0.90, true),
  ('Av. Paulista',    -23.5617, -46.6559,  800, 0.80, true),
  ('Aeroporto GRU',  -23.4323, -46.4731, 2000, 0.55, true),
  ('Vila Madalena',  -23.5557, -46.6903,  600, 0.70, true),
  ('Brooklin',       -23.6026, -46.6974,  700, 0.45, true),
  ('Pinheiros',      -23.5649, -46.6822,  750, 0.65, true),
  ('Moema',          -23.5974, -46.6648,  600, 0.60, true),
  ('Itaim Bibi',     -23.5864, -46.6768,  700, 0.72, true),
  ('Santana',        -23.5032, -46.6276,  600, 0.48, true),
  ('Santo Andre',    -23.6630, -46.5357, 1200, 0.55, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. profiles — colunas faltantes (trust_score, trust_level, referral_code, etc.)
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trust_score    integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS trust_level    text NOT NULL DEFAULT 'iniciante',
  ADD COLUMN IF NOT EXISTS referral_code  text,
  ADD COLUMN IF NOT EXISTS referral_credits numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpf            text,
  ADD COLUMN IF NOT EXISTS total_rides    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating         numeric(3,2) NOT NULL DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS is_verified    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at    timestamptz;

-- Índice único no referral_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code) WHERE referral_code IS NOT NULL;

-- ============================================================
-- 3. driver_profiles — colunas faltantes
-- ============================================================
ALTER TABLE driver_profiles
  ADD COLUMN IF NOT EXISTS trust_score       integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS cancellation_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS punctuality_rate  numeric(5,2) NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS online_hours      numeric(8,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_earnings   numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS peak_rides        integer NOT NULL DEFAULT 0;

-- ============================================================
-- 4. user_achievements — corrigir coluna (era 'achievement', agora 'achievement_id')
-- ============================================================
ALTER TABLE user_achievements
  ADD COLUMN IF NOT EXISTS achievement_id text;

-- Migrar dados existentes
UPDATE user_achievements SET achievement_id = achievement WHERE achievement_id IS NULL;

-- Adicionar índice
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_achievements_unique ON user_achievements(user_id, achievement_id) WHERE achievement_id IS NOT NULL;

-- ============================================================
-- 5. referrals — coluna first_ride_completed faltante
-- ============================================================
ALTER TABLE referrals
  ADD COLUMN IF NOT EXISTS first_ride_completed boolean NOT NULL DEFAULT false;

-- ============================================================
-- 6. referral_achievements (nova tabela)
-- ============================================================
CREATE TABLE IF NOT EXISTS referral_achievements (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement   text NOT NULL,
  title         text NOT NULL,
  description   text,
  reward_amount numeric(10,2) NOT NULL DEFAULT 0,
  unlocked_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement)
);

ALTER TABLE referral_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "referral_achievements_select" ON referral_achievements;
CREATE POLICY "referral_achievements_select" ON referral_achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "referral_achievements_insert" ON referral_achievements;
CREATE POLICY "referral_achievements_insert" ON referral_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 7. address_search_history — substituir tabela com schema completo
-- ============================================================
DROP TABLE IF EXISTS address_search_history CASCADE;

CREATE TABLE IF NOT EXISTS address_search_history (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address           text NOT NULL,
  formatted_address text NOT NULL,
  place_id          text,
  latitude          double precision,
  longitude         double precision,
  street_name       text,
  street_number     text,
  neighborhood      text,
  city              text,
  address_type      text NOT NULL DEFAULT 'destination', -- 'destination' | 'stop' | 'origin'
  search_count      integer NOT NULL DEFAULT 1,
  last_used_at      timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_address_history_user ON address_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_address_history_search ON address_search_history(user_id, last_used_at DESC);

ALTER TABLE address_search_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "address_history_all" ON address_search_history;
CREATE POLICY "address_history_all" ON address_search_history USING (auth.uid() = user_id);

-- ============================================================
-- 8. driver_schedule (nova tabela — agenda do motorista)
-- ============================================================
CREATE TABLE IF NOT EXISTS driver_schedule (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 6=Sab
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(driver_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_driver_schedule_driver ON driver_schedule(driver_id);

ALTER TABLE driver_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "driver_schedule_select" ON driver_schedule;
CREATE POLICY "driver_schedule_select" ON driver_schedule FOR SELECT USING (auth.uid() = driver_id);
DROP POLICY IF EXISTS "driver_schedule_all" ON driver_schedule;
CREATE POLICY "driver_schedule_all" ON driver_schedule USING (auth.uid() = driver_id);

-- ============================================================
-- 9. support_tickets + support_messages — RLS faltante
-- ============================================================
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "support_tickets_select" ON support_tickets;
CREATE POLICY "support_tickets_select" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "support_tickets_insert" ON support_tickets;
CREATE POLICY "support_tickets_insert" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "support_tickets_update" ON support_tickets;
CREATE POLICY "support_tickets_update" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "support_messages_select" ON support_messages;
CREATE POLICY "support_messages_select" ON support_messages FOR SELECT USING (
  auth.uid() = sender_id
  OR EXISTS (SELECT 1 FROM support_tickets WHERE id = support_messages.ticket_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "support_messages_insert" ON support_messages;
CREATE POLICY "support_messages_insert" ON support_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ============================================================
-- 10. payments tabela (para passageiro ver seu histórico de pagamentos)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES profiles(id),
  ride_id         uuid REFERENCES rides(id),
  amount          numeric(10,2) NOT NULL,
  method          text NOT NULL DEFAULT 'cash',
  status          text NOT NULL DEFAULT 'completed', -- 'pending' | 'completed' | 'failed' | 'refunded'
  external_id     text,
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON payments(ride_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 11. leaderboard — RLS + coluna faltante
-- ============================================================
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leaderboard_select" ON leaderboard;
CREATE POLICY "leaderboard_select" ON leaderboard FOR SELECT USING (true);
DROP POLICY IF EXISTS "leaderboard_insert" ON leaderboard;
CREATE POLICY "leaderboard_insert" ON leaderboard FOR INSERT WITH CHECK (true);

ALTER TABLE leaderboard
  ADD COLUMN IF NOT EXISTS full_name  text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS total_earnings numeric(10,2) DEFAULT 0;

-- ============================================================
-- 12. social_post_likes (nova tabela)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_likes (
  id      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_likes_all" ON post_likes;
CREATE POLICY "post_likes_all" ON post_likes USING (true);

-- social_posts e post_comments RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "social_posts_select" ON social_posts;
CREATE POLICY "social_posts_select" ON social_posts FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "social_posts_insert" ON social_posts;
CREATE POLICY "social_posts_insert" ON social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "social_posts_update" ON social_posts;
CREATE POLICY "social_posts_update" ON social_posts FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_comments_select" ON post_comments;
CREATE POLICY "post_comments_select" ON post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "post_comments_insert" ON post_comments;
CREATE POLICY "post_comments_insert" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 13. family_members (para app família)
-- ============================================================
CREATE TABLE IF NOT EXISTS family_members (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id   uuid REFERENCES profiles(id),
  name        text NOT NULL,
  phone       text NOT NULL,
  relationship text NOT NULL DEFAULT 'outro',
  avatar_url  text,
  can_request_ride boolean NOT NULL DEFAULT true,
  spend_limit numeric(10,2),
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_members_owner ON family_members(owner_id);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "family_members_all" ON family_members;
CREATE POLICY "family_members_all" ON family_members USING (auth.uid() = owner_id);

-- ============================================================
-- 14. user_2fa (configurações de 2FA)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_2fa (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  enabled     boolean NOT NULL DEFAULT false,
  totp_secret text,
  backup_codes text[],
  sms_enabled boolean NOT NULL DEFAULT false,
  last_used_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_2fa_all" ON user_2fa;
CREATE POLICY "user_2fa_all" ON user_2fa USING (auth.uid() = user_id);

-- ============================================================
-- 15. trip_recordings (para gravação de viagem)
-- ============================================================
CREATE TABLE IF NOT EXISTS trip_recordings (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id     uuid REFERENCES rides(id),
  storage_url text NOT NULL,
  duration_seconds integer,
  file_size_bytes  bigint,
  status      text NOT NULL DEFAULT 'processing', -- 'processing' | 'ready' | 'deleted'
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trip_recordings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "trip_recordings_all" ON trip_recordings;
CREATE POLICY "trip_recordings_all" ON trip_recordings USING (auth.uid() = user_id);

-- ============================================================
-- 16. REALTIME para novas tabelas
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_locations;

-- ============================================================
-- 17. RPCs
-- ============================================================

-- RPC: calculate_wallet_balance
CREATE OR REPLACE FUNCTION calculate_wallet_balance(p_user_id uuid)
RETURNS numeric AS $$
  SELECT COALESCE(
    SUM(
      CASE
        WHEN type IN ('credit', 'bonus', 'refund') THEN amount
        WHEN type IN ('debit', 'withdrawal')       THEN -amount
        ELSE 0
      END
    ), 0
  )
  FROM wallet_transactions
  WHERE user_id = p_user_id AND status = 'completed';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- RPC: check_and_grant_achievements
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS TABLE(achievement_id text, title text, is_new boolean) AS $$
DECLARE
  v_total_rides    integer;
  v_total_saved    numeric;
  v_rating         numeric;
  v_night_rides    integer;
  v_weekend_rides  integer;
  v_streak         integer;
BEGIN
  -- Estatísticas do usuário
  SELECT COALESCE(total_rides, 0) INTO v_total_rides FROM profiles WHERE id = p_user_id;
  SELECT COALESCE(rating, 5.0)   INTO v_rating       FROM profiles WHERE id = p_user_id;

  SELECT COUNT(*) INTO v_night_rides
  FROM rides
  WHERE passenger_id = p_user_id AND status = 'completed'
    AND EXTRACT(HOUR FROM created_at) >= 22 OR EXTRACT(HOUR FROM created_at) < 6;

  SELECT COUNT(*) INTO v_weekend_rides
  FROM rides
  WHERE passenger_id = p_user_id AND status = 'completed'
    AND EXTRACT(DOW FROM created_at) IN (0, 6);

  SELECT COALESCE(SUM(GREATEST(0, COALESCE(passenger_price_offer, 0) - COALESCE(final_price, 0))), 0)
  INTO v_total_saved
  FROM rides
  WHERE passenger_id = p_user_id AND status = 'completed';

  -- Streak simples (dias consecutivos recentes)
  v_streak := 0;

  -- Verificar e conceder conquistas
  RETURN QUERY
  WITH defs(aid, atitle, adesc, unlocked) AS (
    VALUES
      ('first-ride',       'Primeira Corrida',        'Complete sua primeira corrida',        v_total_rides >= 1),
      ('rides-10',         'Explorador',               'Complete 10 corridas',                v_total_rides >= 10),
      ('rides-50',         'Viajante',                 'Complete 50 corridas',                v_total_rides >= 50),
      ('rides-100',        'Veterano',                 'Complete 100 corridas',               v_total_rides >= 100),
      ('rides-500',        'Lenda do Asfalto',         'Complete 500 corridas',               v_total_rides >= 500),
      ('save-50',          'Economista',               'Economize R$50 negociando',           v_total_saved >= 50),
      ('save-200',         'Pao Duro',                 'Economize R$200 negociando',          v_total_saved >= 200),
      ('save-1000',        'Mestre da Negociacao',     'Economize R$1.000 negociando',        v_total_saved >= 1000),
      ('rating-high',      'Cinco Estrelas',           'Mantenha avaliacao acima de 4.8',     v_rating >= 4.8),
      ('night-owl',        'Coruja Noturna',           'Faca 10 corridas a noite',            v_night_rides >= 10),
      ('weekend-warrior',  'Fim de Semana',            'Faca 20 corridas nos finais de semana', v_weekend_rides >= 20)
  ),
  inserted AS (
    INSERT INTO user_achievements (user_id, achievement_id, achievement, title, description, unlocked_at)
    SELECT p_user_id, aid, aid, atitle, adesc, now()
    FROM defs
    WHERE unlocked
    ON CONFLICT (user_id, achievement_id) DO NOTHING
    RETURNING achievement_id, title
  )
  SELECT d.aid, d.atitle, (i.achievement_id IS NOT NULL) AS is_new
  FROM defs d
  LEFT JOIN inserted i ON i.achievement_id = d.aid
  WHERE d.unlocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: record_address_search (salva ou incrementa histórico)
CREATE OR REPLACE FUNCTION record_address_search(
  p_user_id         uuid,
  p_address         text,
  p_formatted_address text,
  p_place_id        text DEFAULT NULL,
  p_lat             double precision DEFAULT NULL,
  p_lng             double precision DEFAULT NULL,
  p_street_name     text DEFAULT NULL,
  p_street_number   text DEFAULT NULL,
  p_neighborhood    text DEFAULT NULL,
  p_address_type    text DEFAULT 'destination'
)
RETURNS void AS $$
BEGIN
  INSERT INTO address_search_history
    (user_id, address, formatted_address, place_id, latitude, longitude,
     street_name, street_number, neighborhood, address_type, search_count, last_used_at)
  VALUES
    (p_user_id, p_address, p_formatted_address, p_place_id, p_lat, p_lng,
     p_street_name, p_street_number, p_neighborhood, p_address_type, 1, now())
  ON CONFLICT (user_id, place_id) DO UPDATE SET
    search_count = address_search_history.search_count + 1,
    last_used_at = now(),
    address_type = EXCLUDED.address_type;
EXCEPTION WHEN OTHERS THEN
  -- Fallback sem place_id como chave
  INSERT INTO address_search_history
    (user_id, address, formatted_address, place_id, latitude, longitude,
     street_name, street_number, neighborhood, address_type, search_count, last_used_at)
  VALUES
    (p_user_id, p_address, p_formatted_address, p_place_id, p_lat, p_lng,
     p_street_name, p_street_number, p_neighborhood, p_address_type, 1, now())
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índice único para o ON CONFLICT na RPC
CREATE UNIQUE INDEX IF NOT EXISTS idx_address_history_user_place
  ON address_search_history(user_id, place_id)
  WHERE place_id IS NOT NULL;

-- RPC: search_address_history (busca histórico com texto)
CREATE OR REPLACE FUNCTION search_address_history(
  p_user_id uuid,
  p_query   text,
  p_limit   integer DEFAULT 5
)
RETURNS TABLE(
  id                uuid,
  address           text,
  formatted_address text,
  place_id          text,
  latitude          double precision,
  longitude         double precision,
  street_name       text,
  street_number     text,
  neighborhood      text,
  address_type      text,
  search_count      integer,
  last_used_at      timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id, h.address, h.formatted_address, h.place_id,
    h.latitude, h.longitude, h.street_name, h.street_number,
    h.neighborhood, h.address_type, h.search_count, h.last_used_at
  FROM address_search_history h
  WHERE h.user_id = p_user_id
    AND (
      h.formatted_address ILIKE '%' || p_query || '%'
      OR h.street_name    ILIKE '%' || p_query || '%'
      OR h.neighborhood   ILIKE '%' || p_query || '%'
    )
  ORDER BY h.search_count DESC, h.last_used_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- RPC: update_trust_score
CREATE OR REPLACE FUNCTION update_trust_score(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  v_rating           numeric;
  v_total_rides      integer;
  v_cancellations    integer;
  v_punctuality      numeric;
  v_score            integer;
BEGIN
  SELECT
    COALESCE(p.rating, 5.0),
    COALESCE(p.total_rides, 0)
  INTO v_rating, v_total_rides
  FROM profiles p WHERE p.id = p_user_id;

  SELECT
    COALESCE(dp.cancellation_count, 0),
    COALESCE(dp.punctuality_rate, 100)
  INTO v_cancellations, v_punctuality
  FROM driver_profiles dp WHERE dp.id = p_user_id;

  -- Score composto 0-100
  v_score := LEAST(100, GREATEST(0,
    (v_rating * 10)::integer          -- até 50 pontos
    + LEAST(30, v_total_rides / 2)     -- até 30 pontos
    + (v_punctuality * 0.2)::integer   -- até 20 pontos
    - LEAST(20, v_cancellations * 2)   -- desconto por cancelamentos
  ));

  UPDATE profiles SET
    trust_score = v_score,
    trust_level = CASE
      WHEN v_score >= 85 THEN 'elite'
      WHEN v_score >= 65 THEN 'verificado'
      WHEN v_score >= 45 THEN 'confiavel'
      ELSE 'iniciante'
    END
  WHERE id = p_user_id;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: get_leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_type   text DEFAULT 'passenger',
  p_period text DEFAULT 'weekly',
  p_limit  integer DEFAULT 20
)
RETURNS TABLE(
  user_id      uuid,
  full_name    text,
  avatar_url   text,
  score        integer,
  rank         integer,
  rides_count  integer,
  rating_avg   numeric,
  total_earnings numeric
) AS $$
BEGIN
  IF p_type = 'driver' THEN
    RETURN QUERY
    SELECT
      dp.id,
      pr.full_name,
      pr.avatar_url,
      dp.total_rides AS score,
      ROW_NUMBER() OVER (ORDER BY dp.total_rides DESC)::integer AS rank,
      dp.total_rides,
      dp.rating,
      dp.total_earnings
    FROM driver_profiles dp
    JOIN profiles pr ON pr.id = dp.id
    WHERE dp.total_rides > 0
    ORDER BY dp.total_rides DESC
    LIMIT p_limit;
  ELSE
    RETURN QUERY
    SELECT
      pr.id,
      pr.full_name,
      pr.avatar_url,
      pr.total_rides AS score,
      ROW_NUMBER() OVER (ORDER BY pr.total_rides DESC)::integer AS rank,
      pr.total_rides,
      pr.rating,
      0::numeric AS total_earnings
    FROM profiles pr
    WHERE pr.total_rides > 0 AND pr.user_type = 'passenger'
    ORDER BY pr.total_rides DESC
    LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- 18. Trigger: incrementar total_rides ao completar uma corrida
-- ============================================================
CREATE OR REPLACE FUNCTION on_ride_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    -- Incrementar contagem do passageiro
    UPDATE profiles SET total_rides = total_rides + 1 WHERE id = NEW.passenger_id;
    -- Incrementar contagem do motorista
    IF NEW.driver_id IS NOT NULL THEN
      UPDATE driver_profiles SET total_rides = total_rides + 1 WHERE id = NEW.driver_id;
      -- Criar wallet_transaction de crédito para o motorista (85% do valor)
      IF NEW.final_price IS NOT NULL AND NEW.final_price > 0 THEN
        INSERT INTO wallet_transactions (user_id, type, amount, description, ride_id, status)
        VALUES (
          NEW.driver_id,
          'credit',
          NEW.final_price * 0.85,
          'Ganho da corrida #' || LEFT(NEW.id::text, 8),
          NEW.id,
          'completed'
        ) ON CONFLICT DO NOTHING;

        -- Atualizar total_earnings do motorista
        UPDATE driver_profiles SET
          total_earnings = total_earnings + (NEW.final_price * 0.85)
        WHERE id = NEW.driver_id;
      END IF;

      -- Criar registro de pagamento para o passageiro
      INSERT INTO payments (user_id, ride_id, amount, method, status, description)
      VALUES (
        NEW.passenger_id,
        NEW.id,
        COALESCE(NEW.final_price, NEW.passenger_price_offer, 0),
        NEW.payment_method::text,
        'completed',
        'Corrida para ' || NEW.dropoff_address
      ) ON CONFLICT DO NOTHING;
    END IF;
    -- Disparar check de conquistas (assíncrono via notify)
    PERFORM pg_notify('achievements_check', NEW.passenger_id::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_ride_completed ON rides;
CREATE TRIGGER trg_ride_completed
  AFTER UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION on_ride_completed();

-- ============================================================
-- 19. Trigger: criar referral_code automático no perfil
-- ============================================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(LEFT(REPLACE(NEW.id::text, '-', ''), 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_referral_code ON profiles;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Atualizar referral_code dos perfis existentes que não têm
UPDATE profiles SET referral_code = UPPER(LEFT(REPLACE(id::text, '-', ''), 8))
WHERE referral_code IS NULL;
