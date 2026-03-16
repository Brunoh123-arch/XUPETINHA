-- =====================================================
-- UPPI - SCRIPT MASTER FINAL (Migration 053)
-- =====================================================
-- 1. Cria tabelas faltantes (06 + 050 scripts)
-- 2. Corrige RLS nas tabelas sem row security
-- 3. Habilita Realtime em todas as tabelas
-- Data: 16/03/2026
-- =====================================================

-- =====================================================
-- PARTE 1: NOVAS TABELAS (do script 06)
-- =====================================================

-- ride_stops
CREATE TABLE IF NOT EXISTS ride_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  stop_order INTEGER NOT NULL,
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ride_stops_ride ON ride_stops(ride_id);

-- rating_helpful_votes
CREATE TABLE IF NOT EXISTS rating_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES ratings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rating_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_rating_helpful_votes_rating ON rating_helpful_votes(rating_id);

-- rating_reports
CREATE TABLE IF NOT EXISTS rating_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID NOT NULL REFERENCES ratings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rating_reports_rating ON rating_reports(rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_reports_status ON rating_reports(status);

-- driver_route_segments
CREATE TABLE IF NOT EXISTS driver_route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_latitude DECIMAL(10, 8) NOT NULL,
  start_longitude DECIMAL(11, 8) NOT NULL,
  end_latitude DECIMAL(10, 8) NOT NULL,
  end_longitude DECIMAL(11, 8) NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_driver_route_segments_driver ON driver_route_segments(driver_id);

-- reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  ride_id UUID REFERENCES rides(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports(reported_user_id);

-- location_history
CREATE TABLE IF NOT EXISTS location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(6, 2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_location_history_user ON location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_timestamp ON location_history(timestamp);

-- =====================================================
-- PARTE 2: NOVAS TABELAS (do script 050)
-- =====================================================

-- live_activities
CREATE TABLE IF NOT EXISTS live_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  state JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ride_id, user_id)
);

-- driver_trips_summary
CREATE TABLE IF NOT EXISTS driver_trips_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  period_date DATE NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_driver_trips_summary_driver_period
  ON driver_trips_summary (driver_id, period, period_date DESC);

-- ride_eta_log
CREATE TABLE IF NOT EXISTS ride_eta_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('offer_sent', 'accepted', 'driver_arrived', 'trip_started', 'trip_completed')),
  estimated_eta_minutes INTEGER,
  actual_minutes INTEGER,
  driver_lat DECIMAL(10,7),
  driver_lng DECIMAL(10,7),
  passenger_lat DECIMAL(10,7),
  passenger_lng DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ride_eta_log_ride ON ride_eta_log (ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_eta_log_driver ON ride_eta_log (driver_id, created_at DESC);

-- app_review_requests
CREATE TABLE IF NOT EXISTS app_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  app_version TEXT,
  total_rides_at_request INTEGER,
  rating_given INTEGER,
  rated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- blocked_users
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users (blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users (blocked_id);

-- ride_offers_log
CREATE TABLE IF NOT EXISTS ride_offers_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('notified', 'viewed', 'ignored', 'rejected', 'timed_out', 'accepted')),
  distance_km DECIMAL(8,2),
  driver_lat DECIMAL(10,7),
  driver_lng DECIMAL(10,7),
  response_time_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ride_offers_log_ride ON ride_offers_log (ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_offers_log_driver ON ride_offers_log (driver_id, created_at DESC);

-- driver_rating_breakdown
CREATE TABLE IF NOT EXISTS driver_rating_breakdown (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  overall_avg DECIMAL(3,2) DEFAULT 5.00,
  punctuality_avg DECIMAL(3,2) DEFAULT 5.00,
  driving_avg DECIMAL(3,2) DEFAULT 5.00,
  politeness_avg DECIMAL(3,2) DEFAULT 5.00,
  cleanliness_avg DECIMAL(3,2) DEFAULT 5.00,
  total_ratings INTEGER DEFAULT 0,
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_activity_log
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  device_id TEXT,
  app_version TEXT,
  platform TEXT CHECK (platform IN ('android', 'ios', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON user_activity_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_entity ON user_activity_log (entity_type, entity_id);

-- =====================================================
-- PARTE 3: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Tabelas existentes sem RLS
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_route_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Novas tabelas
ALTER TABLE ride_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_route_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_trips_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_eta_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_offers_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_rating_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 4: POLICIES RLS NAS TABELAS SEM POLICIES
-- =====================================================

-- app_versions (publico para leitura)
DROP POLICY IF EXISTS "App versions publicly readable" ON app_versions;
CREATE POLICY "App versions publicly readable"
  ON app_versions FOR SELECT USING (TRUE);

-- driver_bonuses
DROP POLICY IF EXISTS "Drivers can view own bonuses" ON driver_bonuses;
CREATE POLICY "Drivers can view own bonuses"
  ON driver_bonuses FOR SELECT USING (auth.uid() = driver_id);

-- driver_documents
DROP POLICY IF EXISTS "Drivers can view own documents" ON driver_documents;
CREATE POLICY "Drivers can view own documents"
  ON driver_documents FOR SELECT USING (auth.uid() = driver_id);
DROP POLICY IF EXISTS "Drivers can insert own documents" ON driver_documents;
CREATE POLICY "Drivers can insert own documents"
  ON driver_documents FOR INSERT WITH CHECK (auth.uid() = driver_id);
DROP POLICY IF EXISTS "Drivers can update own documents" ON driver_documents;
CREATE POLICY "Drivers can update own documents"
  ON driver_documents FOR UPDATE USING (auth.uid() = driver_id);

-- driver_earnings
DROP POLICY IF EXISTS "Drivers can view own earnings" ON driver_earnings;
CREATE POLICY "Drivers can view own earnings"
  ON driver_earnings FOR SELECT USING (auth.uid() = driver_id);

-- payment_methods
DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods;
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL USING (auth.uid() = user_id);

-- referral_achievements
DROP POLICY IF EXISTS "Users can view own referral achievements" ON referral_achievements;
CREATE POLICY "Users can view own referral achievements"
  ON referral_achievements FOR SELECT USING (auth.uid() = user_id);

-- ride_cancellations
DROP POLICY IF EXISTS "Users can view own ride cancellations" ON ride_cancellations;
CREATE POLICY "Users can view own ride cancellations"
  ON ride_cancellations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM rides WHERE id = ride_id
    AND (passenger_id = auth.uid() OR driver_id = auth.uid())
  ));
DROP POLICY IF EXISTS "Users can insert ride cancellations" ON ride_cancellations;
CREATE POLICY "Users can insert ride cancellations"
  ON ride_cancellations FOR INSERT
  WITH CHECK (auth.uid() = cancelled_by);

-- ride_disputes
DROP POLICY IF EXISTS "Users can view own disputes" ON ride_disputes;
CREATE POLICY "Users can view own disputes"
  ON ride_disputes FOR SELECT USING (auth.uid() = reported_by);
DROP POLICY IF EXISTS "Users can create disputes" ON ride_disputes;
CREATE POLICY "Users can create disputes"
  ON ride_disputes FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- ride_route_points
DROP POLICY IF EXISTS "Users can view own ride route points" ON ride_route_points;
CREATE POLICY "Users can view own ride route points"
  ON ride_route_points FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM rides WHERE id = ride_id
    AND (passenger_id = auth.uid() OR driver_id = auth.uid())
  ));

-- ride_tips
DROP POLICY IF EXISTS "Users can view own tips" ON ride_tips;
CREATE POLICY "Users can view own tips"
  ON ride_tips FOR SELECT
  USING (auth.uid() = passenger_id OR auth.uid() = driver_id);
DROP POLICY IF EXISTS "Passengers can insert tips" ON ride_tips;
CREATE POLICY "Passengers can insert tips"
  ON ride_tips FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- user_devices
DROP POLICY IF EXISTS "Users can manage own devices" ON user_devices;
CREATE POLICY "Users can manage own devices"
  ON user_devices FOR ALL USING (auth.uid() = user_id);

-- user_preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own sessions" ON user_sessions;
CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE USING (auth.uid() = user_id);

-- Novas tabelas - RLS policies
DROP POLICY IF EXISTS "Users can view own ride stops" ON ride_stops;
CREATE POLICY "Users can view own ride stops"
  ON ride_stops FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can vote on ratings" ON rating_helpful_votes;
CREATE POLICY "Users can vote on ratings"
  ON rating_helpful_votes FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can report ratings" ON rating_reports;
CREATE POLICY "Users can report ratings"
  ON rating_reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
DROP POLICY IF EXISTS "Users can view own rating reports" ON rating_reports;
CREATE POLICY "Users can view own rating reports"
  ON rating_reports FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Drivers can manage own route segments" ON driver_route_segments;
CREATE POLICY "Drivers can manage own route segments"
  ON driver_route_segments FOR ALL USING (driver_id = auth.uid());

DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT WITH CHECK (reporter_id = auth.uid());
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own location history" ON location_history;
CREATE POLICY "Users can manage own location history"
  ON location_history FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own live activities" ON live_activities;
CREATE POLICY "Users can manage own live activities"
  ON live_activities FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Drivers can view own trips summary" ON driver_trips_summary;
CREATE POLICY "Drivers can view own trips summary"
  ON driver_trips_summary FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Admins can view eta logs" ON ride_eta_log;
CREATE POLICY "Admins can view eta logs"
  ON ride_eta_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS "Users can manage own review request" ON app_review_requests;
CREATE POLICY "Users can manage own review request"
  ON app_review_requests FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own blocks" ON blocked_users;
CREATE POLICY "Users can manage own blocks"
  ON blocked_users FOR ALL USING (auth.uid() = blocker_id);
DROP POLICY IF EXISTS "Users can see if they are blocked" ON blocked_users;
CREATE POLICY "Users can see if they are blocked"
  ON blocked_users FOR SELECT USING (auth.uid() = blocked_id);

DROP POLICY IF EXISTS "Admins can view offers log" ON ride_offers_log;
CREATE POLICY "Admins can view offers log"
  ON ride_offers_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS "Rating breakdown is publicly viewable" ON driver_rating_breakdown;
CREATE POLICY "Rating breakdown is publicly viewable"
  ON driver_rating_breakdown FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity_log;
CREATE POLICY "Users can insert own activity"
  ON user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all activity" ON user_activity_log;
CREATE POLICY "Admins can view all activity"
  ON user_activity_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- =====================================================
-- PARTE 5: SERVICE ROLE BYPASS EM NOVAS TABELAS
-- =====================================================
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'ride_stops', 'rating_helpful_votes', 'rating_reports', 'driver_route_segments',
    'reports', 'location_history', 'live_activities', 'driver_trips_summary',
    'ride_eta_log', 'app_review_requests', 'blocked_users', 'ride_offers_log',
    'driver_rating_breakdown', 'user_activity_log',
    'app_versions', 'driver_bonuses', 'driver_documents', 'driver_earnings',
    'payment_methods', 'referral_achievements', 'ride_cancellations',
    'ride_disputes', 'ride_route_points', 'ride_tips',
    'user_devices', 'user_preferences', 'user_sessions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('
        DROP POLICY IF EXISTS "Service role full access" ON %I;
        CREATE POLICY "Service role full access" ON %I FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
      ', t, t);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE ''Tabela % - policy service_role: %'', t, SQLERRM;
    END;
  END LOOP;
END $$;

-- =====================================================
-- PARTE 6: REALTIME EM TODAS AS TABELAS
-- =====================================================
DO $$
DECLARE
  t TEXT;
  all_tables TEXT[] := ARRAY[
    'rides', 'ride_tracking', 'ride_stops', 'ride_route_points', 'ride_cancellations',
    'ride_disputes', 'ride_tips', 'ride_eta_log', 'ride_offers_log',
    'driver_locations', 'driver_profiles', 'driver_earnings', 'driver_bonuses',
    'driver_documents', 'driver_verifications', 'driver_schedule', 'driver_withdrawals',
    'driver_route_segments', 'driver_trips_summary', 'driver_rating_breakdown',
    'messages', 'notifications', 'notification_preferences', 'push_subscriptions',
    'user_push_tokens', 'push_log', 'fcm_tokens',
    'payments', 'user_wallets', 'wallet_transactions', 'payment_methods',
    'price_offers', 'profiles', 'user_sessions', 'user_devices', 'user_preferences',
    'user_settings', 'user_2fa', 'user_onboarding',
    'social_posts', 'post_likes', 'post_comments', 'social_follows', 'user_social_stats',
    'social_post_likes',
    'emergency_alerts', 'emergency_contacts', 'hot_zones', 'recording_consents',
    'ride_recordings', 'user_recording_preferences',
    'support_tickets', 'support_messages',
    'group_rides', 'group_ride_members', 'group_ride_participants',
    'intercity_rides', 'intercity_bookings',
    'scheduled_rides', 'delivery_orders',
    'user_achievements', 'leaderboard', 'referrals', 'referral_achievements',
    'subscriptions', 'coupons', 'coupon_uses', 'promo_codes', 'promo_code_uses',
    'campaigns', 'promotions', 'surge_pricing',
    'admin_logs', 'reports', 'platform_metrics',
    'live_activities', 'blocked_users', 'user_activity_log', 'location_history',
    'app_review_requests'
  ];
BEGIN
  FOREACH t IN ARRAY all_tables LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- tabela ja esta na publication, OK
    WHEN OTHERS THEN
      RAISE NOTICE ''Realtime % - %'', t, SQLERRM;
    END;
  END LOOP;
END $$;

-- =====================================================
-- VERIFICACAO FINAL
-- =====================================================
SELECT
  COUNT(*) AS total_tabelas,
  COUNT(*) FILTER (WHERE rowsecurity = true) AS com_rls,
  COUNT(*) FILTER (WHERE rowsecurity = false AND tablename != 'spatial_ref_sys') AS sem_rls
FROM pg_tables
WHERE schemaname = 'public';
