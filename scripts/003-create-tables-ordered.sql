-- =================================================================
-- UPPI: Criar Tabelas Faltantes (Ordem Correta)
-- =================================================================
-- Tabelas ordenadas por dependencias
-- =================================================================

-- ===== TABELAS SEM DEPENDENCIAS PRIMEIRO =====

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

-- ===== 1. USUARIOS E PERFIS =====

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
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);

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
  wallet_id UUID REFERENCES user_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'bonus')),
  description VARCHAR(255),
  ride_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their wallet transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);

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
CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON user_login_history(user_id);

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

-- ===== 2. MOTORISTAS =====

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
CREATE POLICY "Drivers see their verifications" ON driver_verifications FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

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
CREATE POLICY "Drivers see their schedule" ON driver_schedule FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  reason VARCHAR(200),
  penalty_points INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see their penalties" ON driver_penalties FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

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
CREATE POLICY "Drivers see their performance" ON driver_performance FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

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
CREATE POLICY "Drivers see their level" ON driver_levels FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_shift_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'offline')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_shift_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see their shift logs" ON driver_shift_logs FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));
CREATE INDEX IF NOT EXISTS idx_driver_shift_logs_driver_id ON driver_shift_logs(driver_id);

CREATE TABLE IF NOT EXISTS driver_route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  start_lat DECIMAL(10, 8),
  start_lng DECIMAL(11, 8),
  end_lat DECIMAL(10, 8),
  end_lng DECIMAL(11, 8),
  distance DECIMAL(10, 2),
  time_taken INTEGER,
  ride_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_route_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see their route segments" ON driver_route_segments FOR SELECT USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_popular_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  route_name VARCHAR(255),
  frequency INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_popular_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see their popular routes" ON driver_popular_routes FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

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
CREATE POLICY "Drivers see their withdrawals" ON driver_withdrawals FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  is_online BOOLEAN DEFAULT FALSE,
  last_status_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see their availability" ON driver_availability FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== 3. VEICULOS =====

CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  inspection_date DATE,
  status VARCHAR(50) CHECK (status IN ('pass', 'fail', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE vehicle_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see their vehicle inspections" ON vehicle_inspections FOR ALL USING (TRUE);

-- ===== 4. CORRIDAS =====

CREATE TABLE IF NOT EXISTS ride_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  speed DECIMAL(5, 2),
  heading DECIMAL(6, 2)
);
ALTER TABLE ride_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their ride tracking" ON ride_tracking FOR SELECT USING (TRUE);
CREATE INDEX IF NOT EXISTS idx_ride_tracking_ride_id ON ride_tracking(ride_id);

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
CREATE POLICY "Users see their ride offers" ON ride_offers FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS ride_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  checkpoint_type VARCHAR(50),
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  reached_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their ride checkpoints" ON ride_checkpoints FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their ride events" ON ride_events FOR SELECT USING (TRUE);
CREATE INDEX IF NOT EXISTS idx_ride_events_ride_id ON ride_events(ride_id);

CREATE TABLE IF NOT EXISTS ride_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  photo_type VARCHAR(50),
  url VARCHAR(500),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their ride photos" ON ride_photos FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS ride_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their ride ratings" ON ride_ratings FOR SELECT USING (auth.uid() IN (rater_id, rated_id));

CREATE TABLE IF NOT EXISTS ride_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  recording_type VARCHAR(50),
  url VARCHAR(500),
  duration_seconds INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their ride recordings" ON ride_recordings FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS ride_special_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  request_type VARCHAR(100),
  request_value VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_special_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their ride requests" ON ride_special_requests FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS ride_route_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  sequence INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_route_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their ride route" ON ride_route_points FOR SELECT USING (TRUE);
CREATE INDEX IF NOT EXISTS idx_ride_route_points_ride_id ON ride_route_points(ride_id);

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
CREATE POLICY "Users see their ride experiences" ON ride_experiences FOR SELECT USING (auth.uid() = rater_id);

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
CREATE POLICY "Users see their price offers" ON price_offers FOR SELECT USING (TRUE);

-- ===== 5. SERVICOS ESPECIAIS =====

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

CREATE TABLE IF NOT EXISTS intercity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intercity_ride_id UUID NOT NULL REFERENCES intercity_rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats_booked INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE intercity_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their bookings" ON intercity_bookings FOR ALL USING (auth.uid() = passenger_id);

-- ===== 6. CORPORATIVO =====

CREATE TABLE IF NOT EXISTS corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  billing_email VARCHAR(255),
  monthly_limit DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE corporate_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Corp admins see their accounts" ON corporate_accounts FOR ALL USING (auth.uid() = admin_user_id);

CREATE TABLE IF NOT EXISTS corporate_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_code VARCHAR(50),
  monthly_limit DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(corporate_id, user_id)
);
ALTER TABLE corporate_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees see their record" ON corporate_employees FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS corporate_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES corporate_employees(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  cost_center VARCHAR(100),
  project_code VARCHAR(100),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE corporate_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Corp users see their rides" ON corporate_rides FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS corporate_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE,
  period_start DATE,
  period_end DATE,
  total_amount DECIMAL(15, 2),
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE corporate_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Corp admins see invoices" ON corporate_invoices FOR SELECT USING (TRUE);

-- ===== 7. PARCEIROS =====

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  partner_type VARCHAR(50),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  commission_rate DECIMAL(5, 2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see partners" ON partners FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS partner_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name VARCHAR(200),
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE partner_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see partner locations" ON partner_locations FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS partner_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  promo_code VARCHAR(50) UNIQUE,
  discount_type VARCHAR(20),
  discount_value DECIMAL(10, 2),
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE partner_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see partner promotions" ON partner_promotions FOR SELECT USING (TRUE);

-- ===== 8. INCENTIVOS MOTORISTA =====

CREATE TABLE IF NOT EXISTS driver_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  incentive_type VARCHAR(50),
  target_value INTEGER,
  reward_amount DECIMAL(15, 2),
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_incentives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers can see incentives" ON driver_incentives FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS driver_incentive_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  incentive_id UUID NOT NULL REFERENCES driver_incentives(id) ON DELETE CASCADE,
  current_value INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, incentive_id)
);
ALTER TABLE driver_incentive_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see their progress" ON driver_incentive_progress FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== 9. ANALYTICS =====

CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_rides INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  active_drivers INTEGER DEFAULT 0,
  active_passengers INTEGER DEFAULT 0,
  avg_ride_duration INTEGER,
  avg_ride_distance DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can see analytics" ON analytics_daily FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their events" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);

-- ===== 10. SUPORTE =====

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject VARCHAR(200),
  description TEXT,
  category VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id),
  ride_id UUID REFERENCES rides(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their tickets" ON support_tickets FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their messages" ON support_messages FOR ALL USING (auth.uid() = sender_id);

-- ===== 11. ADMIN =====

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins see audit logs" ON admin_audit_logs FOR SELECT USING (TRUE);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at);

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(admin_id, permission)
);
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins see permissions" ON admin_permissions FOR SELECT USING (TRUE);

-- ===== FIM =====
