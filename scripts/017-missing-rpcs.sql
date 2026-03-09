-- ============================================================
-- UPPI — Migration 017: RPCs faltantes para lógica profunda
-- ============================================================

-- 1. Garante que user_achievements existe com as colunas certas
-- ============================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id  text NOT NULL,
  unlocked_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user   ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achiev ON user_achievements(achievement_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user_achievements_select_own" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "user_achievements_insert_own" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. RPC: calculate_wallet_balance
-- Calcula saldo real do usuário somando wallet_transactions
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_wallet_balance(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance numeric;
BEGIN
  SELECT COALESCE(
    SUM(
      CASE
        WHEN type IN ('credit', 'bonus') AND status = 'completed' THEN amount
        WHEN type IN ('debit', 'withdrawal') AND status IN ('completed', 'pending') THEN -amount
        ELSE 0
      END
    ), 0
  )
  INTO v_balance
  FROM wallet_transactions
  WHERE user_id = p_user_id;

  RETURN GREATEST(v_balance, 0);
END;
$$;

-- ============================================================
-- 3. RPC: check_and_grant_achievements
-- Verifica e concede conquistas ao usuário com base em suas stats
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_grant_achievements(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_rides    int;
  v_total_spent    numeric;
  v_total_saved    numeric;
  v_avg_rating     numeric;
  v_night_rides    int;
  v_weekend_rides  int;
  v_new_achievements jsonb := '[]'::jsonb;

  v_achievement_defs jsonb := '[
    {"id": "first-ride",        "threshold": 1,    "field": "rides"},
    {"id": "rides-10",          "threshold": 10,   "field": "rides"},
    {"id": "rides-50",          "threshold": 50,   "field": "rides"},
    {"id": "rides-100",         "threshold": 100,  "field": "rides"},
    {"id": "rides-500",         "threshold": 500,  "field": "rides"},
    {"id": "save-50",           "threshold": 50,   "field": "saved"},
    {"id": "save-200",          "threshold": 200,  "field": "saved"},
    {"id": "save-1000",         "threshold": 1000, "field": "saved"},
    {"id": "rating-high",       "threshold": 1,    "field": "rating"},
    {"id": "night-owl",         "threshold": 10,   "field": "night"},
    {"id": "weekend-warrior",   "threshold": 20,   "field": "weekend"}
  ]'::jsonb;

  v_def jsonb;
  v_field text;
  v_threshold numeric;
  v_ach_id text;
  v_current_val numeric;
  v_already_exists boolean;
BEGIN
  -- Coleta stats do usuário
  SELECT COUNT(*) INTO v_total_rides
  FROM rides
  WHERE passenger_id = p_user_id AND status = 'completed';

  SELECT COALESCE(SUM(final_price), 0) INTO v_total_spent
  FROM rides
  WHERE passenger_id = p_user_id AND status = 'completed';

  SELECT COALESCE(SUM(
    GREATEST((COALESCE(passenger_price_offer, 0) - COALESCE(final_price, 0)), 0)
  ), 0) INTO v_total_saved
  FROM rides
  WHERE passenger_id = p_user_id AND status = 'completed';

  SELECT COALESCE(rating, 5) INTO v_avg_rating
  FROM profiles WHERE id = p_user_id;

  SELECT COUNT(*) INTO v_night_rides
  FROM rides
  WHERE passenger_id = p_user_id AND status = 'completed'
    AND EXTRACT(HOUR FROM created_at AT TIME ZONE 'America/Belem') >= 22
    OR EXTRACT(HOUR FROM created_at AT TIME ZONE 'America/Belem') < 6;

  SELECT COUNT(*) INTO v_weekend_rides
  FROM rides
  WHERE passenger_id = p_user_id AND status = 'completed'
    AND EXTRACT(DOW FROM created_at AT TIME ZONE 'America/Belem') IN (0, 6);

  -- Itera pelas definições e concede as que atingiram threshold
  FOR v_def IN SELECT * FROM jsonb_array_elements(v_achievement_defs)
  LOOP
    v_ach_id    := v_def->>'id';
    v_field     := v_def->>'field';
    v_threshold := (v_def->>'threshold')::numeric;

    -- Pega o valor atual do campo
    v_current_val := CASE v_field
      WHEN 'rides'   THEN v_total_rides
      WHEN 'saved'   THEN v_total_saved
      WHEN 'rating'  THEN CASE WHEN v_avg_rating >= 4.8 THEN 1 ELSE 0 END
      WHEN 'night'   THEN v_night_rides
      WHEN 'weekend' THEN v_weekend_rides
      ELSE 0
    END;

    -- Só concede se atingiu threshold e ainda não tem
    IF v_current_val >= v_threshold THEN
      SELECT EXISTS(
        SELECT 1 FROM user_achievements
        WHERE user_id = p_user_id AND achievement_id = v_ach_id
      ) INTO v_already_exists;

      IF NOT v_already_exists THEN
        INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
        VALUES (p_user_id, v_ach_id, now())
        ON CONFLICT (user_id, achievement_id) DO NOTHING;

        v_new_achievements := v_new_achievements || jsonb_build_object(
          'achievement_id', v_ach_id,
          'unlocked_at', now()
        );
      END IF;
    END IF;
  END LOOP;

  RETURN v_new_achievements;
EXCEPTION WHEN OTHERS THEN
  RETURN '[]'::jsonb;
END;
$$;

-- ============================================================
-- 4. PATCH API notifications via server-side markAllRead
-- Adiciona endpoint PATCH para marcar todas como lidas
-- ============================================================
-- (sem SQL necessário — já implementado no service)

-- ============================================================
-- 5. Garante que hot_zones tem os campos corretos
-- ============================================================
ALTER TABLE IF EXISTS hot_zones
  ADD COLUMN IF NOT EXISTS intensity   float     DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS is_active   boolean   DEFAULT true,
  ADD COLUMN IF NOT EXISTS radius_meters int     DEFAULT 500;

-- Popula intensity a partir de danger_level (caso exista coluna legada)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hot_zones' AND column_name = 'danger_level'
  ) THEN
    UPDATE hot_zones
    SET intensity = CASE danger_level
      WHEN 'critical' THEN 0.95
      WHEN 'high'     THEN 0.75
      WHEN 'medium'   THEN 0.5
      WHEN 'low'      THEN 0.25
      ELSE 0.5
    END
    WHERE intensity = 0.5 OR intensity IS NULL;
  END IF;
END $$;
