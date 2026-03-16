-- =====================================================
-- UPPI - TABELAS RECOMENDADAS (Migration 050)
-- =====================================================
-- +8 tabelas para producao completa
-- Total apos execucao: 155 tabelas unicas nos scripts (100 aplicadas + 55 pendentes)
-- Data: 16/03/2026
-- =====================================================

-- =====================================================
-- 1. LIVE ACTIVITIES (iOS 16.1+)
-- Persiste estado das Live Activities na tela de bloqueio
-- =====================================================
CREATE TABLE IF NOT EXISTS live_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,           -- ID retornado pelo ActivityKit do iOS
  state JSONB DEFAULT '{}',            -- estado atual: driver_name, eta, status, etc.
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ride_id, user_id)
);

ALTER TABLE live_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own live activities"
  ON live_activities FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. DRIVER TRIPS SUMMARY
-- Cache de resumo diario/semanal por motorista
-- Evita calcular on-the-fly no admin (lento com muitos dados)
-- =====================================================
CREATE TABLE IF NOT EXISTS driver_trips_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  period_date DATE NOT NULL,           -- data de referencia (inicio do periodo)
  total_trips INTEGER DEFAULT 0,
  completed_trips INTEGER DEFAULT 0,
  cancelled_trips INTEGER DEFAULT 0,
  total_distance_km DECIMAL(10,2) DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  gross_earnings DECIMAL(12,2) DEFAULT 0,
  platform_fee DECIMAL(12,2) DEFAULT 0,
  net_earnings DECIMAL(12,2) DEFAULT 0,
  tips DECIMAL(10,2) DEFAULT 0,
  bonuses DECIMAL(10,2) DEFAULT 0,
  avg_rating DECIMAL(3,2),
  online_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, period, period_date)
);

ALTER TABLE driver_trips_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers can view own summary"
  ON driver_trips_summary FOR SELECT
  USING (auth.uid() = driver_id);
CREATE POLICY "Admins can manage all summaries"
  ON driver_trips_summary FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE INDEX IF NOT EXISTS idx_driver_trips_summary_driver_period
  ON driver_trips_summary (driver_id, period, period_date DESC);

-- =====================================================
-- 3. RIDE ETA LOG
-- Loga cada ETA estimado vs real para auditoria de precisao
-- =====================================================
CREATE TABLE IF NOT EXISTS ride_eta_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('offer_sent', 'accepted', 'driver_arrived', 'trip_started', 'trip_completed')),
  estimated_eta_minutes INTEGER,       -- ETA prometido ao passageiro
  actual_minutes INTEGER,              -- tempo real que levou
  driver_lat DECIMAL(10,7),
  driver_lng DECIMAL(10,7),
  passenger_lat DECIMAL(10,7),
  passenger_lng DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ride_eta_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view eta logs"
  ON ride_eta_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE INDEX IF NOT EXISTS idx_ride_eta_log_ride ON ride_eta_log (ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_eta_log_driver ON ride_eta_log (driver_id, created_at DESC);

-- =====================================================
-- 4. APP REVIEWS REQUESTS
-- Controla quando e para quem pedir avaliacao na loja
-- Evita pedir multiplas vezes para o mesmo usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS app_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  app_version TEXT,
  total_rides_at_request INTEGER,      -- quantas corridas o usuario tinha ao pedir
  rating_given INTEGER,                -- 1-5 se o usuario avaliou (nullable)
  rated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_review_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own review request"
  ON app_review_requests FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. BLOCKED USERS
-- Passageiro bloquear motorista especifico (e vice-versa)
-- Impede matching entre usuarios bloqueados
-- =====================================================
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own blocks"
  ON blocked_users FOR ALL
  USING (auth.uid() = blocker_id);
CREATE POLICY "Users can view if they are blocked"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocked_id);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users (blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users (blocked_id);

-- =====================================================
-- 6. RIDE OFFERS LOG
-- Historico de quais motoristas viram e passaram em cada corrida
-- Usado para otimizar o algoritmo de matching
-- =====================================================
CREATE TABLE IF NOT EXISTS ride_offers_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('notified', 'viewed', 'ignored', 'rejected', 'timed_out', 'accepted')),
  distance_km DECIMAL(8,2),            -- distancia do motorista ao passageiro no momento
  driver_lat DECIMAL(10,7),
  driver_lng DECIMAL(10,7),
  response_time_seconds INTEGER,       -- tempo que levou para agir (nullable para ignored/timed_out)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ride_offers_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view offers log"
  ON ride_offers_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE INDEX IF NOT EXISTS idx_ride_offers_log_ride ON ride_offers_log (ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_offers_log_driver ON ride_offers_log (driver_id, created_at DESC);

-- =====================================================
-- 7. DRIVER RATING BREAKDOWN
-- Cache de categorias de avaliacao por motorista
-- Evita agregar em tempo real: pontualidade, direcao, educacao
-- =====================================================
CREATE TABLE IF NOT EXISTS driver_rating_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  overall_avg DECIMAL(3,2) DEFAULT 5.00,
  punctuality_avg DECIMAL(3,2) DEFAULT 5.00,   -- chegou no tempo
  driving_avg DECIMAL(3,2) DEFAULT 5.00,        -- direcao segura
  politeness_avg DECIMAL(3,2) DEFAULT 5.00,     -- educacao
  cleanliness_avg DECIMAL(3,2) DEFAULT 5.00,    -- limpeza do carro
  total_ratings INTEGER DEFAULT 0,
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE driver_rating_breakdown ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rating breakdown is publicly viewable"
  ON driver_rating_breakdown FOR SELECT
  USING (TRUE);
CREATE POLICY "Only system can update rating breakdown"
  ON driver_rating_breakdown FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- =====================================================
-- 8. USER ACTIVITY LOG
-- Log de acoes do usuario para analytics e deteccao de fraude
-- =====================================================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,                -- ex: 'ride_requested', 'payment_failed', 'login', 'promo_used'
  entity_type TEXT,                    -- ex: 'ride', 'payment', 'coupon'
  entity_id UUID,
  metadata JSONB DEFAULT '{}',         -- dados adicionais da acao
  ip_address TEXT,
  device_id TEXT,
  app_version TEXT,
  platform TEXT CHECK (platform IN ('android', 'ios', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all activity"
  ON user_activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));
CREATE POLICY "Users can insert own activity"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON user_activity_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_entity ON user_activity_log (entity_type, entity_id);

-- =====================================================
-- ADICIONAR RLS POLICIES FALTANTES EM TABELAS EXISTENTES
-- =====================================================

-- driver_bonuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_bonuses' AND policyname='Drivers can view own bonuses') THEN
    CREATE POLICY "Drivers can view own bonuses" ON driver_bonuses FOR SELECT USING (auth.uid() = driver_id);
  END IF;
END $$;

-- driver_documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_documents' AND policyname='Drivers can view own documents') THEN
    CREATE POLICY "Drivers can view own documents" ON driver_documents FOR SELECT USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_documents' AND policyname='Drivers can insert own documents') THEN
    CREATE POLICY "Drivers can insert own documents" ON driver_documents FOR INSERT WITH CHECK (auth.uid() = driver_id);
  END IF;
END $$;

-- driver_earnings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_earnings' AND policyname='Drivers can view own earnings') THEN
    CREATE POLICY "Drivers can view own earnings" ON driver_earnings FOR SELECT USING (auth.uid() = driver_id);
  END IF;
END $$;

-- payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payment_methods' AND policyname='Users can manage own payment methods') THEN
    CREATE POLICY "Users can manage own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ride_cancellations
ALTER TABLE ride_cancellations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_cancellations' AND policyname='Users can view own ride cancellations') THEN
    CREATE POLICY "Users can view own ride cancellations" ON ride_cancellations FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
  END IF;
END $$;

-- ride_tips
ALTER TABLE ride_tips ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tips' AND policyname='Users can view own tips') THEN
    CREATE POLICY "Users can view own tips" ON ride_tips FOR SELECT USING (auth.uid() = passenger_id OR auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tips' AND policyname='Passengers can insert tips') THEN
    CREATE POLICY "Passengers can insert tips" ON ride_tips FOR INSERT WITH CHECK (auth.uid() = passenger_id);
  END IF;
END $$;

-- user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_preferences' AND policyname='Users can manage own preferences') THEN
    CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_sessions' AND policyname='Users can view own sessions') THEN
    CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- TRIGGERS UPDATED_AT PARA NOVAS TABELAS
-- =====================================================
CREATE OR REPLACE TRIGGER update_driver_trips_summary_updated_at
  BEFORE UPDATE ON driver_trips_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_driver_rating_breakdown_updated_at
  BEFORE UPDATE ON driver_rating_breakdown
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
