-- ============================================================
-- TABELAS FALTANTES - 72 tabelas
-- Projeto: UPPI | Data: 16/03/2026
-- ============================================================

-- ============================================================
-- 1. ADMIN / SISTEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','warning','error','success')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_notifications_admin" ON admin_notifications USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_permissions_admin" ON admin_permissions USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin','admin','moderator','support','finance')),
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_roles_admin" ON admin_roles USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS ab_test_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ab_test_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ab_test_own" ON ab_test_participants USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS app_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  action_url TEXT,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all','passenger','driver')),
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_banners_read" ON app_banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "app_banners_admin" ON app_banners USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_templates_admin" ON email_templates USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_templates_admin" ON notification_templates USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all','passenger','driver')),
  is_published BOOLEAN DEFAULT TRUE,
  views INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kb_articles_read" ON knowledge_base_articles FOR SELECT USING (is_published = TRUE);
CREATE POLICY "kb_articles_admin" ON knowledge_base_articles USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- ============================================================
-- 2. USUARIOS / PERFIS
-- ============================================================

CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocked_users_own" ON blocked_users USING (auth.uid() = blocker_id);

CREATE TABLE IF NOT EXISTS user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email','phone','cpf','selfie','address')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_verifications_own" ON user_verifications USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  device_info JSONB DEFAULT '{}',
  location TEXT,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE
);
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_login_history_own" ON user_login_history USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_trust_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  score NUMERIC(5,2) DEFAULT 100 CHECK (score >= 0 AND score <= 100),
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze','silver','gold','platinum','diamond')),
  rides_completed INT DEFAULT 0,
  cancellation_rate NUMERIC(5,2) DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_trust_score ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_trust_score_read" ON user_trust_score FOR SELECT USING (TRUE);
CREATE POLICY "user_trust_score_own" ON user_trust_score USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  xp_to_next_level INT DEFAULT 100,
  title TEXT DEFAULT 'Novato',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_levels_read" ON user_levels FOR SELECT USING (TRUE);
CREATE POLICY "user_levels_own" ON user_levels USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_read" ON user_badges FOR SELECT USING (TRUE);
CREATE POLICY "user_badges_own" ON user_badges USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INT DEFAULT 1,
  points INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badge_definitions_read" ON badge_definitions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "badge_definitions_admin" ON badge_definitions USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('bug','feature','complaint','compliment','other')),
  message TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  app_version TEXT,
  device_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_review','resolved','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_feedback_own" ON user_feedback USING (auth.uid() = user_id);
CREATE POLICY "user_feedback_admin" ON user_feedback USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_rides INT DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  total_distance_km NUMERIC(12,2) DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  cancellation_count INT DEFAULT 0,
  favorite_destination TEXT,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  last_ride_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_stats_own" ON user_stats USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);
ALTER TABLE user_notifications_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_notifications_log_own" ON user_notifications_log USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pix','credit_card','debit_card','wallet')),
  label TEXT,
  details JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_payment_methods_own" ON user_payment_methods USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, promotion_id)
);
ALTER TABLE user_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_promotions_own" ON user_promotions USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_2fa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_2fa_backup_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_2fa_backup_own" ON user_2fa_backup_codes USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "phone_verifications_own" ON phone_verifications USING (auth.uid() = user_id);

-- ============================================================
-- 3. MOTORISTAS
-- ============================================================

CREATE TABLE IF NOT EXISTS driver_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE driver_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_achievements_own" ON driver_achievements USING (auth.uid() = driver_id);

CREATE TABLE IF NOT EXISTS driver_bonuses_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('streak','referral','performance','event','manual')),
  description TEXT,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE driver_bonuses_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_bonuses_log_own" ON driver_bonuses_log USING (auth.uid() = driver_id);

CREATE TABLE IF NOT EXISTS driver_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('cancellation','complaint','late','fraud','other')),
  description TEXT NOT NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE driver_penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_penalties_own" ON driver_penalties USING (auth.uid() = driver_id);

CREATE TABLE IF NOT EXISTS driver_weekly_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_rides INT DEFAULT 0,
  total_earnings NUMERIC(12,2) DEFAULT 0,
  total_hours NUMERIC(8,2) DEFAULT 0,
  total_distance_km NUMERIC(12,2) DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  cancellation_count INT DEFAULT 0,
  bonuses NUMERIC(12,2) DEFAULT 0,
  penalties NUMERIC(12,2) DEFAULT 0,
  net_earnings NUMERIC(12,2) GENERATED ALWAYS AS (total_earnings + bonuses - penalties) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, week_start)
);
ALTER TABLE driver_weekly_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_weekly_summary_own" ON driver_weekly_summary USING (auth.uid() = driver_id);

CREATE TABLE IF NOT EXISTS driver_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  acceptance_rate NUMERIC(5,2) DEFAULT 100,
  completion_rate NUMERIC(5,2) DEFAULT 100,
  punctuality_rate NUMERIC(5,2) DEFAULT 100,
  avg_response_time_sec INT DEFAULT 0,
  total_compliments INT DEFAULT 0,
  total_complaints INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE driver_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_performance_own" ON driver_performance USING (auth.uid() = driver_id);
CREATE POLICY "driver_performance_read" ON driver_performance FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS driver_level_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL UNIQUE CHECK (level IN ('bronze','silver','gold','platinum','diamond')),
  min_rides INT NOT NULL,
  min_rating NUMERIC(3,2) NOT NULL,
  commission_discount NUMERIC(5,2) DEFAULT 0,
  priority_dispatch BOOLEAN DEFAULT FALSE,
  badge_icon TEXT,
  perks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE driver_level_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_level_config_read" ON driver_level_config FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS driver_route_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  origin_zone TEXT NOT NULL,
  destination_zone TEXT NOT NULL,
  ride_count INT DEFAULT 0,
  avg_earnings NUMERIC(12,2) DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE driver_route_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_route_segments_own" ON driver_route_segments USING (auth.uid() = driver_id);

-- ============================================================
-- 4. CORRIDAS
-- ============================================================

CREATE TABLE IF NOT EXISTS ride_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bid_amount NUMERIC(12,2) NOT NULL CHECK (bid_amount > 0),
  eta_minutes INT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ride_id, driver_id)
);
ALTER TABLE ride_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_bids_driver" ON ride_bids USING (auth.uid() = driver_id);
CREATE POLICY "ride_bids_passenger" ON ride_bids FOR SELECT USING (
  auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id)
);

CREATE TABLE IF NOT EXISTS ride_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  arrival_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ride_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_stops_own" ON ride_stops USING (
  auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id)
  OR auth.uid() IN (SELECT driver_id FROM rides WHERE id = ride_id)
);

CREATE TABLE IF NOT EXISTS ride_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  checkpoint_type TEXT NOT NULL CHECK (checkpoint_type IN ('start','waypoint','stop','end')),
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);
ALTER TABLE ride_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_checkpoints_own" ON ride_checkpoints USING (
  auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id)
  OR auth.uid() IN (SELECT driver_id FROM rides WHERE id = ride_id)
);

CREATE TABLE IF NOT EXISTS ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ride_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_events_own" ON ride_events USING (
  auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id)
  OR auth.uid() IN (SELECT driver_id FROM rides WHERE id = ride_id)
);

CREATE TABLE IF NOT EXISTS ride_history_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_rides INT DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  total_distance_km NUMERIC(12,2) DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);
ALTER TABLE ride_history_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_history_summary_own" ON ride_history_summary USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ride_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general','incident','damage','start','end')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ride_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_photos_own" ON ride_photos USING (
  auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id)
  OR auth.uid() IN (SELECT driver_id FROM rides WHERE id = ride_id)
);

-- ============================================================
-- 5. FINANCEIRO / PAGAMENTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS pix_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  txid TEXT UNIQUE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','expired','refunded','failed')),
  qr_code TEXT,
  qr_code_image TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  provider TEXT DEFAULT 'paradise',
  provider_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE pix_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pix_transactions_own" ON pix_transactions USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS pix_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL CHECK (key_type IN ('cpf','cnpj','email','phone','random')),
  key_value TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  bank_name TEXT,
  holder_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, key_value)
);
ALTER TABLE pix_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pix_keys_own" ON pix_keys USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_review','resolved_user','resolved_driver','refunded','closed')),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_disputes_own" ON payment_disputes USING (auth.uid() = user_id);
CREATE POLICY "payment_disputes_admin" ON payment_disputes USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS scheduled_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('subscription','installment','recurring')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE scheduled_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scheduled_payments_own" ON scheduled_payments USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cashback_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  percentage NUMERIC(5,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','credited','expired')),
  credited_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE cashback_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cashback_transactions_own" ON cashback_transactions USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  gross_income NUMERIC(12,2) DEFAULT 0,
  platform_fees NUMERIC(12,2) DEFAULT 0,
  net_income NUMERIC(12,2) DEFAULT 0,
  tax_withheld NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, year, month)
);
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tax_records_own" ON tax_records USING (auth.uid() = driver_id);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_points INT DEFAULT 0,
  available_points INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','platinum','diamond')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_points_own" ON loyalty_points USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('bronze','silver','gold','platinum','diamond')),
  min_points INT NOT NULL,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  cashback_rate NUMERIC(5,2) DEFAULT 0,
  priority_support BOOLEAN DEFAULT FALSE,
  free_cancellations INT DEFAULT 0,
  perks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_tiers_read" ON loyalty_tiers FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned','redeemed','expired','bonus','adjusted')),
  description TEXT,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_transactions_own" ON loyalty_transactions USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_items_own" ON invoice_items USING (
  auth.uid() IN (SELECT user_id FROM invoices WHERE id = invoice_id)
);

CREATE TABLE IF NOT EXISTS trip_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE UNIQUE,
  passenger_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  policy_number TEXT,
  coverage_amount NUMERIC(12,2) DEFAULT 50000,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','claimed','expired','cancelled')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE trip_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_insurance_own" ON trip_insurance USING (
  auth.uid() = passenger_id OR auth.uid() = driver_id
);

-- ============================================================
-- 6. PASSAGEIRO
-- ============================================================

CREATE TABLE IF NOT EXISTS passenger_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE passenger_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "passenger_achievements_own" ON passenger_achievements USING (auth.uid() = passenger_id);

CREATE TABLE IF NOT EXISTS passenger_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_rides INT DEFAULT 0,
  total_spent NUMERIC(12,2) DEFAULT 0,
  total_distance_km NUMERIC(12,2) DEFAULT 0,
  avg_rating_given NUMERIC(3,2) DEFAULT 0,
  cancellation_count INT DEFAULT 0,
  no_show_count INT DEFAULT 0,
  favorite_driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE passenger_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "passenger_stats_own" ON passenger_stats USING (auth.uid() = passenger_id);

CREATE TABLE IF NOT EXISTS favorite_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  icon TEXT DEFAULT 'location',
  visit_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE favorite_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorite_places_own" ON favorite_places USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS destination_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  suggestion_count INT DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, address)
);
ALTER TABLE destination_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "destination_suggestions_own" ON destination_suggestions USING (auth.uid() = user_id);

-- ============================================================
-- 7. ZONAS / AREAS
-- ============================================================

CREATE TABLE IF NOT EXISTS city_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'BR',
  is_active BOOLEAN DEFAULT TRUE,
  base_fare NUMERIC(12,2) DEFAULT 5.00,
  price_per_km NUMERIC(8,4) DEFAULT 2.50,
  price_per_minute NUMERIC(8,4) DEFAULT 0.50,
  min_fare NUMERIC(12,2) DEFAULT 8.00,
  surge_multiplier_max NUMERIC(4,2) DEFAULT 3.0,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE city_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "city_configurations_read" ON city_configurations FOR SELECT USING (TRUE);
CREATE POLICY "city_configurations_admin" ON city_configurations USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS zone_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES service_areas(id) ON DELETE CASCADE,
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  hour_start INT CHECK (hour_start BETWEEN 0 AND 23),
  hour_end INT CHECK (hour_end BETWEEN 0 AND 23),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE zone_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zone_availability_read" ON zone_availability FOR SELECT USING (TRUE);
CREATE POLICY "zone_availability_admin" ON zone_availability USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS zone_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES service_areas(id) ON DELETE CASCADE,
  restriction_type TEXT NOT NULL CHECK (restriction_type IN ('no_pickup','no_dropoff','max_fare','min_fare','vehicle_type')),
  value TEXT,
  reason TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE zone_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zone_restrictions_read" ON zone_restrictions FOR SELECT USING (TRUE);
CREATE POLICY "zone_restrictions_admin" ON zone_restrictions USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS zone_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES service_areas(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_rides INT DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0,
  avg_wait_time_sec INT DEFAULT 0,
  avg_fare NUMERIC(12,2) DEFAULT 0,
  active_drivers INT DEFAULT 0,
  demand_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zone_id, date)
);
ALTER TABLE zone_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "zone_stats_admin" ON zone_stats USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS surge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES service_areas(id) ON DELETE SET NULL,
  multiplier NUMERIC(4,2) NOT NULL CHECK (multiplier >= 1),
  reason TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  triggered_by TEXT DEFAULT 'auto' CHECK (triggered_by IN ('auto','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE surge_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "surge_events_read" ON surge_events FOR SELECT USING (TRUE);
CREATE POLICY "surge_events_admin" ON surge_events USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- ============================================================
-- 8. VEICULOS
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon_url TEXT,
  description TEXT,
  base_fare NUMERIC(12,2) DEFAULT 5.00,
  price_per_km NUMERIC(8,4) DEFAULT 2.50,
  capacity INT DEFAULT 4,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle_categories_read" ON vehicle_categories FOR SELECT USING (TRUE);
CREATE POLICY "vehicle_categories_admin" ON vehicle_categories USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES vehicle_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  min_year INT DEFAULT 2015,
  required_documents TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle_types_read" ON vehicle_types FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS vehicle_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('crlv','ipva','seguro','vistoria','outros')),
  file_url TEXT NOT NULL,
  expires_at DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicle_documents_own" ON vehicle_documents USING (
  auth.uid() IN (SELECT driver_id FROM vehicles WHERE id = vehicle_id)
);

-- ============================================================
-- 9. INTERCIDADES / ROTAS
-- ============================================================

CREATE TABLE IF NOT EXISTS intercity_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  distance_km NUMERIC(10,2) NOT NULL,
  base_price NUMERIC(12,2) NOT NULL,
  estimated_duration_min INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(origin_city, destination_city)
);
ALTER TABLE intercity_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercity_routes_read" ON intercity_routes FOR SELECT USING (is_active = TRUE);
CREATE POLICY "intercity_routes_admin" ON intercity_routes USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- ============================================================
-- 10. FAMILIA / GRUPOS
-- ============================================================

CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'basic' CHECK (plan IN ('basic','premium')),
  max_members INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_groups_own" ON family_groups USING (auth.uid() = owner_id);

CREATE TABLE IF NOT EXISTS family_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner','member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, member_id)
);
ALTER TABLE family_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_group_members_own" ON family_group_members USING (
  auth.uid() = member_id OR
  auth.uid() IN (SELECT owner_id FROM family_groups WHERE id = group_id)
);

-- ============================================================
-- 11. SEGURANCA / SOS / CONTEUDO
-- ============================================================

CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  type TEXT DEFAULT 'sos' CHECK (type IN ('sos','panic','unsafe','accident')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','resolved','false_alarm')),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sos_alerts_own" ON sos_alerts USING (auth.uid() = user_id);
CREATE POLICY "sos_alerts_admin" ON sos_alerts USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('accident','assault','breakdown','other')),
  description TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emergency_events_own" ON emergency_events USING (auth.uid() = reported_by);
CREATE POLICY "emergency_events_admin" ON emergency_events USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS emergency_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES emergency_events(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE emergency_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emergency_records_admin" ON emergency_records USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post','comment','profile','review','message')),
  content_id UUID,
  reason TEXT NOT NULL CHECK (reason IN ('spam','harassment','inappropriate','fraud','other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','action_taken','dismissed')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_reports_own" ON content_reports USING (auth.uid() = reporter_id);
CREATE POLICY "content_reports_admin" ON content_reports USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS trip_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('unsafe_driver','unsafe_passenger','wrong_route','overcharge','other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_review','resolved','closed')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE trip_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_reports_own" ON trip_reports USING (auth.uid() = reported_by);
CREATE POLICY "trip_reports_admin" ON trip_reports USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

-- ============================================================
-- 12. MARKETING / CAMPANHAS
-- ============================================================

CREATE TABLE IF NOT EXISTS promo_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('discount','cashback','bonus','referral','event')),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all','passenger','driver','new_user')),
  budget NUMERIC(12,2),
  spent NUMERIC(12,2) DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE promo_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo_campaigns_admin" ON promo_campaigns USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL UNIQUE,
  uses_count INT DEFAULT 0,
  max_uses INT DEFAULT 100,
  reward_amount NUMERIC(12,2) DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_codes_own" ON referral_codes USING (auth.uid() = user_id);
CREATE POLICY "referral_codes_read" ON referral_codes FOR SELECT USING (is_active = TRUE);

CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reward_given BOOLEAN DEFAULT FALSE,
  reward_amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_uses_own" ON referral_uses USING (auth.uid() = referred_user_id OR auth.uid() = referrer_id);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('financial','operational','users','drivers','rides')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB DEFAULT '{}',
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_admin" ON reports USING (auth.uid() IN (SELECT id FROM profiles WHERE user_type = 'admin'));

CREATE TABLE IF NOT EXISTS route_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  origin_address TEXT NOT NULL,
  origin_lat NUMERIC(10,7),
  origin_lng NUMERIC(10,7),
  destination_address TEXT NOT NULL,
  destination_lat NUMERIC(10,7),
  destination_lng NUMERIC(10,7),
  use_count INT DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, origin_address, destination_address)
);
ALTER TABLE route_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "route_history_own" ON route_history USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  speed NUMERIC(8,2),
  heading NUMERIC(8,2),
  accuracy NUMERIC(8,2),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "location_history_own" ON location_history USING (auth.uid() = driver_id);

CREATE TABLE IF NOT EXISTS feedback_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  target TEXT DEFAULT 'both' CHECK (target IN ('passenger','driver','both')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_categories_read" ON feedback_categories FOR SELECT USING (is_active = TRUE);

CREATE TABLE IF NOT EXISTS in_app_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info','warning','promo','update','system')),
  action_label TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE in_app_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "in_app_messages_own" ON in_app_messages USING (auth.uid() = user_id);

-- ============================================================
-- REALTIME NAS TABELAS CRITICAS NOVAS
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_events;
ALTER PUBLICATION supabase_realtime ADD TABLE ride_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE pix_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE in_app_messages;

-- ============================================================
-- INDICES NAS NOVAS TABELAS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ride_bids_ride_id ON ride_bids(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_bids_driver_id ON ride_bids(driver_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_user_id ON pix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_ride_id ON pix_transactions(ride_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_txid ON pix_transactions(txid);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_user_id ON cashback_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trust_score_user_id ON user_trust_score(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_id ON sos_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_location_history_driver_id ON location_history(driver_id);
CREATE INDEX IF NOT EXISTS idx_location_history_ride_id ON location_history(ride_id);
CREATE INDEX IF NOT EXISTS idx_driver_weekly_driver_id ON driver_weekly_summary(driver_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_uses_referrer ON referral_uses(referrer_id);
CREATE INDEX IF NOT EXISTS idx_route_history_user_id ON route_history(user_id);
