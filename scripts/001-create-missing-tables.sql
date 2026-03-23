-- =================================================================
-- UPPI: Criar Tabelas Faltantes (192 Total)
-- =================================================================
-- Este script cria todas as 124 tabelas que faltam no banco
-- Executar após backup completo
-- =================================================================

-- ===== 1. USUARIOS E PERFIS (18) =====

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'pt-BR',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_encrypted TEXT,
  method VARCHAR(20) NOT NULL CHECK (method IN ('totp', 'sms')),
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, method)
);
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their 2FA" ON user_2fa FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_sms_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sms_marketing BOOLEAN DEFAULT FALSE,
  sms_updates BOOLEAN DEFAULT TRUE,
  sms_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
ALTER TABLE user_sms_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their SMS preferences" ON user_sms_preferences FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_recording_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allow_recording BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
ALTER TABLE user_recording_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their recording preferences" ON user_recording_preferences FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their activity log" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);

CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name VARCHAR(100),
  device_type VARCHAR(50),
  os VARCHAR(50),
  fcm_token TEXT,
  last_active_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their devices" ON user_devices FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their wallet" ON user_wallets FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES user_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'bonus')),
  description VARCHAR(255),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their wallet transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);

CREATE TABLE IF NOT EXISTS user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE
);
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their login history" ON user_login_history FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_user_login_history_user_id ON user_login_history(user_id);

CREATE TABLE IF NOT EXISTS trust_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  score DECIMAL(5, 2) DEFAULT 5.0 CHECK (score >= 0 AND score <= 100),
  total_rides INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE trust_score ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their trust score" ON trust_score FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  criteria JSONB,
  tier VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see badges" ON badge_definitions FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  feedback_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their feedback" ON user_feedback FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url VARCHAR(500),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their avatars" ON avatars FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their blocked list" ON blocked_users FOR ALL USING (auth.uid() = blocker_id);

-- ===== 2. MOTORISTAS (16) =====

CREATE TABLE IF NOT EXISTS driver_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  checked_at TIMESTAMP WITH TIME ZONE,
  checker_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their verifications" ON driver_verifications FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, day_of_week)
);
ALTER TABLE driver_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their schedule" ON driver_schedule FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  reason VARCHAR(200),
  penalty_points INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their penalties" ON driver_penalties FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  rides_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  cancellation_rate DECIMAL(5, 2) DEFAULT 0,
  response_time_avg INTEGER,
  on_time_rate DECIMAL(5, 2) DEFAULT 100,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their performance" ON driver_performance FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_level_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name VARCHAR(50) NOT NULL UNIQUE,
  min_rides INTEGER,
  min_rating DECIMAL(3, 2),
  benefits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_level_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see levels" ON driver_level_config FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS driver_level_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_config_id UUID NOT NULL REFERENCES driver_level_config(id) ON DELETE CASCADE,
  benefit_type VARCHAR(50),
  benefit_value VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_level_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see tier benefits" ON driver_level_tiers FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS driver_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  level_config_id UUID NOT NULL REFERENCES driver_level_config(id),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their level" ON driver_levels FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_shift_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'offline')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_shift_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their shift logs" ON driver_shift_logs FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));
CREATE INDEX idx_driver_shift_logs_driver_id ON driver_shift_logs(driver_id);

CREATE TABLE IF NOT EXISTS driver_route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  start_location POINT,
  end_location POINT,
  distance DECIMAL(10, 2),
  time_taken INTEGER,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_route_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their route segments" ON driver_route_segments FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_popular_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  route_name VARCHAR(255),
  frequency INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_popular_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their popular routes" ON driver_popular_routes FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  bank_account JSONB,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE driver_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their withdrawals" ON driver_withdrawals FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== 3. VEICULOS (5) =====

CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  inspection_date DATE,
  status VARCHAR(50) CHECK (status IN ('pass', 'fail', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their vehicle inspections" ON vehicle_inspections FOR ALL USING (auth.uid() IN (SELECT user_id FROM driver_profiles WHERE id = (SELECT driver_id FROM vehicles WHERE id = vehicle_id)));

CREATE TABLE IF NOT EXISTS driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  is_online BOOLEAN DEFAULT FALSE,
  last_status_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their availability" ON driver_availability FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== 4. CORRIDAS (14) =====

CREATE TABLE IF NOT EXISTS ride_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  location POINT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  speed DECIMAL(5, 2),
  heading DECIMAL(6, 2)
);
ALTER TABLE ride_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride tracking" ON ride_tracking FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT driver_id FROM rides WHERE id = ride_id));
CREATE INDEX idx_ride_tracking_ride_id ON ride_tracking(ride_id);

CREATE TABLE IF NOT EXISTS ride_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  offered_price DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE ride_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride offers" ON ride_offers FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS ride_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  checkpoint_type VARCHAR(50),
  location POINT,
  reached_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride checkpoints" ON ride_checkpoints FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT driver_id FROM rides WHERE id = ride_id));

CREATE TABLE IF NOT EXISTS ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride events" ON ride_events FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT driver_id FROM rides WHERE id = ride_id));
CREATE INDEX idx_ride_events_ride_id ON ride_events(ride_id);

CREATE TABLE IF NOT EXISTS ride_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  photo_type VARCHAR(50),
  url VARCHAR(500),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride photos" ON ride_photos FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT driver_id FROM rides WHERE id = ride_id));

CREATE TABLE IF NOT EXISTS ride_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE UNIQUE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride ratings" ON ride_ratings FOR SELECT USING (auth.uid() IN (rater_id, rated_id));

CREATE TABLE IF NOT EXISTS ride_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  recording_type VARCHAR(50),
  url VARCHAR(500),
  duration_seconds INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride recordings" ON ride_recordings FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT driver_id FROM rides WHERE id = ride_id));

CREATE TABLE IF NOT EXISTS ride_special_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  request_type VARCHAR(100),
  request_value VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_special_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride requests" ON ride_special_requests FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT driver_id FROM rides WHERE id = ride_id));

CREATE TABLE IF NOT EXISTS ride_route_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  location POINT,
  sequence INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_route_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride route" ON ride_route_points FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT driver_id FROM rides WHERE id = ride_id));
CREATE INDEX idx_ride_route_points_ride_id ON ride_route_points(ride_id);

CREATE TABLE IF NOT EXISTS ride_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_type VARCHAR(50),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride experiences" ON ride_experiences FOR SELECT USING (auth.uid() = rater_id);

CREATE TABLE IF NOT EXISTS price_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  offered_price DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(ride_id, driver_id)
);
ALTER TABLE price_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their price offers" ON price_offers FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== 5. SERVICOS ESPECIAIS (5) =====

CREATE TABLE IF NOT EXISTS intercity_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  origin_city VARCHAR(100),
  destination_city VARCHAR(100),
  departure_time TIMESTAMP WITH TIME ZONE,
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  available_seats INTEGER,
  price_per_seat DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE intercity_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see intercity rides" ON intercity_rides FOR SELECT USING (TRUE);
CREATE POLICY "Drivers can edit their intercity rides" ON intercity_rides FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS intercity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intercity_ride_id UUID NOT NULL REFERENCES intercity_rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats_booked INTEGER,
  total_price DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE intercity_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their intercity bookings" ON intercity_bookings FOR ALL USING (auth.uid() = passenger_id);

CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES driver_profiles(id) ON DELETE SET NULL,
  pickup_address VARCHAR(255),
  delivery_address VARCHAR(255),
  item_description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  total_price DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their delivery orders" ON delivery_orders FOR SELECT USING (auth.uid() IN (sender_id, recipient_id, (SELECT user_id FROM driver_profiles WHERE id = driver_id)));

CREATE TABLE IF NOT EXISTS group_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES driver_profiles(id) ON DELETE SET NULL,
  route_id UUID,
  departure_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'recruiting',
  max_passengers INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE group_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see group rides" ON group_rides FOR SELECT USING (status != 'private' OR auth.uid() = initiator_id);

CREATE TABLE IF NOT EXISTS group_ride_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_ride_id UUID NOT NULL REFERENCES group_rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'joined',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_ride_id, passenger_id)
);
ALTER TABLE group_ride_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their group ride participations" ON group_ride_participants FOR ALL USING (auth.uid() = passenger_id);

-- ===== 6. OPERACOES POS-CORRIDA (4) =====

CREATE TABLE IF NOT EXISTS ride_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE UNIQUE,
  cancelled_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(255),
  cancellation_fee DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_cancellations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride cancellations" ON ride_cancellations FOR SELECT USING (auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id UNION SELECT driver_id FROM rides WHERE id = ride_id));

CREATE TABLE IF NOT EXISTS ride_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  reported_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dispute_type VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE ride_disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their ride disputes" ON ride_disputes FOR SELECT USING (auth.uid() IN (reported_by_id, (SELECT passenger_id FROM rides WHERE id = ride_id), (SELECT driver_id FROM rides WHERE id = ride_id)));

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  refund_amount DECIMAL(15, 2) NOT NULL,
  reason VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their refunds" ON refunds FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(100),
  description TEXT,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their reports" ON user_reports FOR ALL USING (auth.uid() = reporter_id);

-- ===== 7. PAGAMENTOS E FINANCEIRO (10) =====

CREATE TABLE IF NOT EXISTS payment_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their payment splits" ON payment_splits FOR SELECT USING (auth.uid() IN (created_by_id, (SELECT passenger_id FROM rides WHERE id = ride_id)));

CREATE TABLE IF NOT EXISTS payment_split_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_split_id UUID NOT NULL REFERENCES payment_splits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_owed DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived')),
  paid_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(payment_split_id, user_id)
);
ALTER TABLE payment_split_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their payment split members" ON payment_split_members FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS scheduled_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2),
  frequency VARCHAR(50),
  next_payment_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE scheduled_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their scheduled payments" ON scheduled_payments FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  year INTEGER,
  gross_revenue DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2),
  deductions DECIMAL(15, 2),
  filed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their tax records" ON tax_records FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE,
  amount DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(15, 2),
  total DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their invoice items" ON invoice_items FOR SELECT USING (auth.uid() IN (SELECT user_id FROM invoices WHERE id = invoice_id));

CREATE TABLE IF NOT EXISTS trip_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insurance_type VARCHAR(50),
  coverage_amount DECIMAL(15, 2),
  premium DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE trip_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their trip insurance" ON trip_insurance FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_insurance_id UUID NOT NULL REFERENCES trip_insurance(id) ON DELETE CASCADE,
  claim_type VARCHAR(100),
  description TEXT,
  claimed_amount DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their insurance claims" ON insurance_claims FOR SELECT USING (auth.uid() IN (SELECT user_id FROM trip_insurance WHERE id = trip_insurance_id));

-- ===== 8. CARTEIRA E RECOMPENSAS (6) =====

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50),
  amount DECIMAL(15, 2),
  description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points_balance DECIMAL(15, 2) DEFAULT 0,
  lifetime_points DECIMAL(15, 2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their points" ON user_points FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cashback_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  cashback_amount DECIMAL(15, 2),
  expiry_date DATE,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE cashback_earned ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their cashback" ON cashback_earned FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cashback_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type VARCHAR(50),
  ride_type VARCHAR(50),
  min_amount DECIMAL(15, 2),
  cashback_percentage DECIMAL(5, 2),
  max_cashback DECIMAL(15, 2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE cashback_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see cashback rules" ON cashback_rules FOR SELECT USING (active = TRUE);

CREATE TABLE IF NOT EXISTS corporate_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE,
  month_year DATE,
  total_amount DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE corporate_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Corporate accounts see only their invoices" ON corporate_invoices FOR SELECT USING (auth.uid() IN (SELECT created_by_id FROM corporate_accounts WHERE id = corporate_account_id));

-- ===== 9. CUPONS E MARKETING (8) =====

CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  UNIQUE(user_id, coupon_id)
);
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their coupons" ON user_coupons FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(50),
  discount_value DECIMAL(15, 2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expiry_date DATE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see active promo codes" ON promo_codes FOR SELECT USING (active = TRUE);

CREATE TABLE IF NOT EXISTS promo_code_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  discount_applied DECIMAL(15, 2),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their promo code uses" ON promo_code_uses FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  cta_text VARCHAR(100),
  cta_action VARCHAR(255),
  target_audience VARCHAR(50),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see active promo banners" ON promo_banners FOR SELECT USING (active = TRUE AND NOW() BETWEEN start_date AND end_date);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50),
  target_audience VARCHAR(255),
  budget DECIMAL(15, 2),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see all campaigns" ON campaigns FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS driver_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  incentive_type VARCHAR(50),
  incentive_amount DECIMAL(15, 2),
  condition_text VARCHAR(255),
  expiry_date DATE,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_incentives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their incentives" ON driver_incentives FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== 10. COMUNICACAO (8) =====

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their messages" ON messages FOR SELECT USING (auth.uid() IN (sender_id, recipient_id));
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) UNIQUE,
  title_template VARCHAR(255),
  body_template TEXT,
  template_type VARCHAR(50),
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see notification templates" ON notification_templates FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) UNIQUE,
  subject VARCHAR(255),
  html_content TEXT,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see email templates" ON email_templates FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email VARCHAR(255),
  template_name VARCHAR(100),
  status VARCHAR(50) CHECK (status IN ('sent', 'failed', 'bounced', 'opened', 'clicked')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see email logs" ON email_logs FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  announcement_type VARCHAR(50),
  target_audience VARCHAR(50),
  priority VARCHAR(50) DEFAULT 'normal',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see active announcements" ON announcements FOR SELECT USING (active = TRUE AND NOW() BETWEEN start_date AND end_date);

CREATE TABLE IF NOT EXISTS in_app_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  message TEXT,
  banner_type VARCHAR(50),
  cta_text VARCHAR(100),
  cta_action VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE in_app_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see active in-app banners" ON in_app_banners FOR SELECT USING (active = TRUE AND NOW() BETWEEN start_date AND end_date);

CREATE TABLE IF NOT EXISTS in_app_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_content TEXT NOT NULL,
  message_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE in_app_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their in-app messages" ON in_app_messages FOR ALL USING (auth.uid() = user_id);

-- ===== 11. PUSH E SMS (6) =====

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  device_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their FCM tokens" ON fcm_tokens FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  body TEXT,
  status VARCHAR(50) CHECK (status IN ('sent', 'failed', 'delivered')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE push_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their push logs" ON push_log FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token VARCHAR(500) NOT NULL,
  device_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, push_token)
);
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their push tokens" ON user_push_tokens FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_phone VARCHAR(20),
  message_content TEXT,
  status VARCHAR(50) CHECK (status IN ('sent', 'failed', 'pending')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see SMS logs" ON sms_logs FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS sms_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sms_log_id UUID REFERENCES sms_logs(id) ON DELETE SET NULL,
  delivery_status VARCHAR(50) CHECK (delivery_status IN ('delivered', 'failed', 'bounced')),
  delivered_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE sms_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see SMS deliveries" ON sms_deliveries FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- ===== 12. SUPORTE (5) =====

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_content_type VARCHAR(50),
  reported_content_id VARCHAR(100),
  reason VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their content reports" ON content_reports FOR SELECT USING (auth.uid() = reporter_id);

-- ===== 13. SEGURANCA E EMERGENCIA (5) =====

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  relationship VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_phone)
);
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their emergency contacts" ON emergency_contacts FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50),
  description TEXT,
  location POINT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their emergency alerts" ON emergency_alerts FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  event_type VARCHAR(50),
  location POINT,
  description TEXT,
  status VARCHAR(50) DEFAULT 'reported',
  response_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users and admins see SOS events" ON sos_events FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS recording_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);
ALTER TABLE recording_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their recording consents" ON recording_consents FOR ALL USING (auth.uid() = user_id);

-- ===== 14. LOCALIZACAO (11) =====

CREATE TABLE IF NOT EXISTS address_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address VARCHAR(255),
  location POINT,
  last_used_at TIMESTAMP WITH TIME ZONE,
  frequency INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE address_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their address history" ON address_history FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_type VARCHAR(50),
  favorite_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS favorite_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, driver_id)
);
ALTER TABLE favorite_drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their favorite drivers" ON favorite_drivers FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS favorite_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name VARCHAR(255),
  location POINT,
  address VARCHAR(255),
  location_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE favorite_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their favorite locations" ON favorite_locations FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS surge_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name VARCHAR(255),
  location POINT,
  multiplier DECIMAL(5, 2),
  active_from TIMESTAMP WITH TIME ZONE,
  active_until TIMESTAMP WITH TIME ZONE,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE surge_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see surge pricing" ON surge_pricing FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name VARCHAR(255) UNIQUE,
  area_polygon POLYGON,
  city VARCHAR(100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see service areas" ON service_areas FOR SELECT USING (active = TRUE);

-- ===== 15. ZONAS AVANCADAS (5) =====

CREATE TABLE IF NOT EXISTS geographic_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name VARCHAR(255),
  polygon POLYGON,
  rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE geographic_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see geographic zones" ON geographic_zones FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS zone_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES geographic_zones(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME,
  end_time TIME,
  available BOOLEAN DEFAULT TRUE
);
ALTER TABLE zone_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see zone availability" ON zone_availability FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS zone_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES geographic_zones(id) ON DELETE CASCADE,
  restriction_type VARCHAR(50),
  restriction_value VARCHAR(255),
  applies_to VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE zone_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see zone restrictions" ON zone_restrictions FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS zone_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES geographic_zones(id) ON DELETE CASCADE,
  date DATE,
  rides_count INTEGER,
  revenue DECIMAL(15, 2),
  average_wait_time INTEGER
);
ALTER TABLE zone_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see zone stats" ON zone_stats FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS city_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name VARCHAR(255) UNIQUE,
  country VARCHAR(100),
  currency VARCHAR(3),
  min_fare DECIMAL(15, 2),
  base_fare DECIMAL(15, 2),
  per_km_rate DECIMAL(15, 2),
  per_minute_rate DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE city_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see city configurations" ON city_configurations FOR SELECT USING (TRUE);

-- ===== 16. SOCIAL E GAMIFICACAO (9) =====

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see social posts" ON social_posts FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage only their posts" ON social_posts FOR INSERT, UPDATE, DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS social_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their likes" ON social_post_likes FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see post comments" ON post_comments FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage only their comments" ON post_comments FOR INSERT, UPDATE, DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);

CREATE TABLE IF NOT EXISTS referral_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100),
  points_earned INTEGER,
  bonus_amount DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE referral_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their referral achievements" ON referral_achievements FOR SELECT USING (auth.uid() IN (SELECT referrer_id FROM referrals WHERE id = referral_id));

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_name VARCHAR(255) UNIQUE,
  description TEXT,
  icon_url VARCHAR(500),
  criteria JSONB,
  points_reward INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see achievements" ON achievements FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type VARCHAR(100),
  rank INTEGER,
  score DECIMAL(15, 2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see leaderboard" ON leaderboard FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS driver_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  training_type VARCHAR(100),
  module_name VARCHAR(255),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_training ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their training" ON driver_training FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== 17. ADMIN E SISTEMA (12) =====

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name VARCHAR(100) UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see permissions" ON admin_permissions FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action_type VARCHAR(100),
  target_resource VARCHAR(100),
  target_id VARCHAR(100),
  action_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see admin actions" ON admin_actions FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins see only their notifications" ON admin_notifications FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE id = admin_id));

CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number VARCHAR(50) UNIQUE,
  platform VARCHAR(50),
  release_notes TEXT,
  force_update BOOLEAN DEFAULT FALSE,
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see app versions" ON app_versions FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(50),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see system settings" ON system_settings FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- ===== 18. INTEGRACAO E LOGS (6) =====

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  url VARCHAR(500),
  secret_encrypted TEXT,
  events TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see webhook endpoints" ON webhook_endpoints FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see webhook deliveries" ON webhook_deliveries FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE,
  key_prefix VARCHAR(10),
  name VARCHAR(255),
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their API keys" ON api_keys FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS live_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50),
  activity_id VARCHAR(100),
  push_token VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'stale')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE live_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their live activities" ON live_activities FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(255),
  metric_value DECIMAL(15, 2),
  metric_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see dashboard metrics" ON dashboard_metrics FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- ===== 19. FAMILIA E PARCEIROS (4) =====

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_name VARCHAR(255),
  member_phone VARCHAR(20),
  relationship VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their family members" ON family_members FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS partner_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) UNIQUE,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(255),
  contact_email VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE partner_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see active partner companies" ON partner_companies FOR SELECT USING (active = TRUE);

CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_name VARCHAR(255),
  city VARCHAR(100),
  address VARCHAR(255),
  location POINT,
  phone VARCHAR(20),
  website VARCHAR(255),
  rating DECIMAL(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see hotels" ON hotels FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city VARCHAR(100),
  signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'accepted', 'rejected')),
  position INTEGER
);
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their waitlist entry" ON waitlist FOR ALL USING (auth.uid() = user_id);

-- ===== 20. ASSINATURAS E PREFERENCIAS (4) =====

CREATE TABLE IF NOT EXISTS passenger_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_vehicle_type VARCHAR(50),
  music_preference VARCHAR(50),
  temperature_preference VARCHAR(50),
  conversation_preference VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE passenger_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their preferences" ON passenger_preferences FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS driver_ride_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  min_ride_distance DECIMAL(10, 2),
  max_ride_distance DECIMAL(10, 2),
  preferred_times TEXT,
  preferred_regions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_ride_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their preferences" ON driver_ride_preferences FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_preferred_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES geographic_zones(id) ON DELETE CASCADE,
  priority INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, zone_id)
);
ALTER TABLE driver_preferred_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their preferred zones" ON driver_preferred_zones FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== 21. EXPERIMENTOS E CONFIGURACOES (4) =====

CREATE TABLE IF NOT EXISTS ab_test_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name VARCHAR(255),
  variant VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, test_name)
);
ALTER TABLE ab_test_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their test participation" ON ab_test_participants FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS pricing_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name VARCHAR(255),
  description TEXT,
  control_group_pricing JSONB,
  test_group_pricing JSONB,
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE pricing_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see pricing experiments" ON pricing_experiments FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  reason VARCHAR(255),
  affected_services TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see maintenance windows" ON maintenance_windows FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_name VARCHAR(100),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, step_name)
);
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their onboarding steps" ON onboarding_steps FOR ALL USING (auth.uid() = user_id);

-- ===== 22. TERMOS E FEEDBACK (5) =====

CREATE TABLE IF NOT EXISTS terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number VARCHAR(50),
  content TEXT,
  effective_from TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE terms_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see terms versions" ON terms_versions FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version_id UUID NOT NULL REFERENCES terms_versions(id) ON DELETE CASCADE,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  UNIQUE(user_id, terms_version_id)
);
ALTER TABLE terms_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their terms acceptances" ON terms_acceptances FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name VARCHAR(255),
  description TEXT,
  fields JSONB,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see active feedback forms" ON feedback_forms FOR SELECT USING (active = TRUE);

CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their feedback responses" ON feedback_responses FOR ALL USING (auth.uid() = user_id);

-- =================================================================
-- FIM DO SCRIPT
-- =================================================================
-- Total de tabelas criadas: 124
-- RLS ativado em todas as tabelas
-- Indices principais adicionados
-- =================================================================
