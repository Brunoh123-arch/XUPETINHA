-- ============================================================
-- UPPI — Migration 016: Tabela de Saques de Motoristas
-- ============================================================

-- 1. Tabela driver_withdrawals
-- ============================================================
CREATE TABLE IF NOT EXISTS driver_withdrawals (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount          numeric(10,2) NOT NULL CHECK (amount > 0),
  pix_key         text NOT NULL,
  pix_key_type    text NOT NULL DEFAULT 'cpf' CHECK (pix_key_type IN ('cpf','cnpj','email','phone','random')),
  bank_name       text,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  requested_at    timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz,
  rejection_reason text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_driver_withdrawals_driver  ON driver_withdrawals(driver_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_withdrawals_status  ON driver_withdrawals(status);

-- RLS
ALTER TABLE driver_withdrawals ENABLE ROW LEVEL SECURITY;

-- Motorista pode ver/criar somente os seus próprios saques
CREATE POLICY "driver_withdrawals_select_own" ON driver_withdrawals
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "driver_withdrawals_insert_own" ON driver_withdrawals
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Admin pode ver e atualizar tudo
CREATE POLICY "driver_withdrawals_admin_all" ON driver_withdrawals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================
-- 2. Habilitar Realtime na tabela
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'driver_withdrawals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE driver_withdrawals;
  END IF;
END $$;

-- ============================================================
-- 3. RPC: request_withdrawal
-- Atomicamente: valida saldo, debita wallet_transactions e cria driver_withdrawal
-- ============================================================
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_driver_id    uuid,
  p_amount       numeric,
  p_pix_key      text,
  p_pix_key_type text DEFAULT 'cpf',
  p_bank_name    text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance     numeric;
  v_withdrawal  uuid;
BEGIN
  -- Verificar se o motorista chamador é o mesmo que p_driver_id (segurança)
  IF auth.uid() IS DISTINCT FROM p_driver_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não autorizado');
  END IF;

  -- Calcular saldo atual disponível
  SELECT calculate_wallet_balance(p_driver_id) INTO v_balance;

  IF v_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Saldo insuficiente. Disponível: R$ %s', to_char(v_balance, 'FM999990.00'))
    );
  END IF;

  -- Debitar na wallet_transactions (tipo withdrawal, status pending)
  INSERT INTO wallet_transactions (user_id, amount, type, description, status)
  VALUES (
    p_driver_id,
    p_amount,
    'withdrawal',
    format('Saque via PIX — %s', p_pix_key_type),
    'pending'
  );

  -- Criar registro na driver_withdrawals
  INSERT INTO driver_withdrawals (driver_id, amount, pix_key, pix_key_type, bank_name, status)
  VALUES (p_driver_id, p_amount, p_pix_key, p_pix_key_type, p_bank_name, 'pending')
  RETURNING id INTO v_withdrawal;

  RETURN jsonb_build_object(
    'success', true,
    'withdrawal_id', v_withdrawal,
    'amount', p_amount
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- 4. RPC: approve_withdrawal (para admin)
-- ============================================================
CREATE OR REPLACE FUNCTION approve_withdrawal(
  p_withdrawal_id uuid,
  p_notes         text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Verificar admin
  SELECT is_admin INTO v_is_admin FROM profiles WHERE id = auth.uid();
  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas admins podem aprovar saques');
  END IF;

  UPDATE driver_withdrawals
  SET status = 'approved', processed_at = now(), notes = p_notes, updated_at = now()
  WHERE id = p_withdrawal_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saque não encontrado ou já processado');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 5. RPC: reject_withdrawal (para admin)
-- ============================================================
CREATE OR REPLACE FUNCTION reject_withdrawal(
  p_withdrawal_id  uuid,
  p_reason         text DEFAULT 'Motivo não especificado'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin  boolean;
  v_driver_id uuid;
  v_amount    numeric;
BEGIN
  SELECT is_admin INTO v_is_admin FROM profiles WHERE id = auth.uid();
  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas admins podem rejeitar saques');
  END IF;

  -- Buscar info do saque
  SELECT driver_id, amount INTO v_driver_id, v_amount
  FROM driver_withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saque não encontrado ou já processado');
  END IF;

  -- Rejeitar o saque
  UPDATE driver_withdrawals
  SET status = 'rejected', processed_at = now(), rejection_reason = p_reason, updated_at = now()
  WHERE id = p_withdrawal_id;

  -- Estornar o valor para a wallet (crédito de volta)
  INSERT INTO wallet_transactions (user_id, amount, type, description, status)
  VALUES (v_driver_id, v_amount, 'credit', format('Estorno de saque rejeitado: %s', p_reason), 'completed');

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 6. RPC: admin_process_withdrawal (wrapper unificado para o admin)
-- ============================================================
CREATE OR REPLACE FUNCTION admin_process_withdrawal(
  p_admin_id      uuid,
  p_withdrawal_id uuid,
  p_action        text,  -- 'approve' | 'reject'
  p_notes         text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin  boolean;
  v_driver_id uuid;
  v_amount    numeric;
BEGIN
  -- Verificar admin
  SELECT is_admin INTO v_is_admin FROM profiles WHERE id = p_admin_id;
  IF NOT COALESCE(v_is_admin, false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas admins podem processar saques');
  END IF;

  IF p_action NOT IN ('approve', 'reject') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ação inválida. Use approve ou reject');
  END IF;

  -- Buscar info do saque
  SELECT driver_id, amount INTO v_driver_id, v_amount
  FROM driver_withdrawals
  WHERE id = p_withdrawal_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saque não encontrado ou já processado');
  END IF;

  IF p_action = 'approve' THEN
    UPDATE driver_withdrawals
    SET status = 'approved', processed_at = now(), notes = p_notes, updated_at = now()
    WHERE id = p_withdrawal_id;

  ELSIF p_action = 'reject' THEN
    UPDATE driver_withdrawals
    SET status = 'rejected', processed_at = now(), rejection_reason = COALESCE(p_notes, 'Rejeitado pelo admin'), updated_at = now()
    WHERE id = p_withdrawal_id;

    -- Estornar o valor para a wallet
    INSERT INTO wallet_transactions (user_id, amount, type, description, status)
    VALUES (v_driver_id, v_amount, 'credit', format('Estorno de saque rejeitado'), 'completed');
  END IF;

  RETURN jsonb_build_object('success', true, 'action', p_action, 'withdrawal_id', p_withdrawal_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- 7. Trigger: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_driver_withdrawals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_driver_withdrawals_updated_at ON driver_withdrawals;
CREATE TRIGGER trg_driver_withdrawals_updated_at
  BEFORE UPDATE ON driver_withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_driver_withdrawals_updated_at();
