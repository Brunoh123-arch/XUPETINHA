-- =================================================================
-- UPPI: Criar Tabelas Restantes (das 192 planejadas)
-- =================================================================
-- Banco atual: 100 tabelas
-- Este script adiciona as tabelas que ainda faltam
-- =================================================================

-- ===== GEOGRAFICO =====

CREATE TABLE IF NOT EXISTS geographic_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  geofence JSONB,
  surge_multiplier NUMERIC(3, 2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zone_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES geographic_zones(id) ON DELETE CASCADE,
  category_id UUID REFERENCES vehicle_categories(id) ON DELETE CASCADE,
  base_price NUMERIC(10, 2),
  price_per_km NUMERIC(10, 2),
  price_per_minute NUMERIC(10, 2),
  min_price NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(zone_id, category_id)
);

CREATE TABLE IF NOT EXISTS heat_map_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  demand_level INTEGER DEFAULT 1,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_heat_map_recorded ON heat_map_data(recorded_at);

-- ===== SCHEDULED RIDES =====

CREATE TABLE IF NOT EXISTS scheduled_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_address TEXT,
  pickup_latitude NUMERIC(10, 7),
  pickup_longitude NUMERIC(10, 7),
  dropoff_address TEXT,
  dropoff_latitude NUMERIC(10, 7),
  dropoff_longitude NUMERIC(10, 7),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  category_id UUID REFERENCES vehicle_categories(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'matched', 'cancelled', 'completed')),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE scheduled_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their scheduled rides" ON scheduled_rides FOR ALL USING (auth.uid() = passenger_id);

CREATE TABLE IF NOT EXISTS ride_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_ride_id UUID NOT NULL REFERENCES scheduled_rides(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50),
  send_at TIMESTAMP WITH TIME ZONE,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== DELIVERY =====

CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  package_description TEXT,
  package_size VARCHAR(50) CHECK (package_size IN ('small', 'medium', 'large', 'extra_large')),
  package_weight NUMERIC(10, 2),
  fragile BOOLEAN DEFAULT FALSE,
  requires_signature BOOLEAN DEFAULT FALSE,
  proof_of_delivery_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their deliveries" ON delivery_orders FOR ALL USING (auth.uid() = sender_id);

-- ===== GROUP RIDES =====

CREATE TABLE IF NOT EXISTS group_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_address TEXT,
  pickup_latitude NUMERIC(10, 7),
  pickup_longitude NUMERIC(10, 7),
  dropoff_address TEXT,
  dropoff_latitude NUMERIC(10, 7),
  dropoff_longitude NUMERIC(10, 7),
  max_participants INTEGER DEFAULT 4,
  current_participants INTEGER DEFAULT 1,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  price_per_person NUMERIC(10, 2),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE group_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can see open group rides" ON group_rides FOR SELECT USING (status = 'open' OR auth.uid() = host_id);

CREATE TABLE IF NOT EXISTS group_ride_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_ride_id UUID NOT NULL REFERENCES group_rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'joined' CHECK (status IN ('joined', 'left', 'removed')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_ride_id, user_id)
);
ALTER TABLE group_ride_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants see their group rides" ON group_ride_participants FOR ALL USING (auth.uid() = user_id);

-- ===== RIDE CANCELLATIONS & DISPUTES =====

CREATE TABLE IF NOT EXISTS ride_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  cancelled_by UUID NOT NULL REFERENCES auth.users(id),
  cancelled_by_type VARCHAR(20) CHECK (cancelled_by_type IN ('passenger', 'driver', 'system')),
  reason VARCHAR(255),
  fee_charged NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ride_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES auth.users(id),
  dispute_type VARCHAR(100),
  description TEXT,
  evidence_urls JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'rejected')),
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their disputes" ON ride_disputes FOR ALL USING (auth.uid() = raised_by);

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their refunds" ON refunds FOR SELECT USING (auth.uid() = user_id);

-- ===== INSURANCE =====

CREATE TABLE IF NOT EXISTS trip_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_number VARCHAR(100),
  coverage_amount NUMERIC(15, 2),
  premium NUMERIC(10, 2),
  status VARCHAR(50) DEFAULT 'active',
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE trip_insurance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their insurance" ON trip_insurance FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_insurance_id UUID NOT NULL REFERENCES trip_insurance(id) ON DELETE CASCADE,
  claim_type VARCHAR(100),
  description TEXT,
  claim_amount NUMERIC(15, 2),
  evidence_urls JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'paid')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== COMMUNICATION EXTRAS =====

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255),
  html_content TEXT,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email VARCHAR(255),
  subject VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('sent', 'failed', 'bounced', 'opened', 'clicked')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20),
  message TEXT,
  status VARCHAR(50) CHECK (status IN ('sent', 'delivered', 'failed')),
  provider VARCHAR(50),
  provider_id VARCHAR(100),
  cost NUMERIC(10, 4),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) CHECK (type IN ('info', 'warning', 'promo', 'maintenance')),
  target_audience VARCHAR(50) CHECK (target_audience IN ('all', 'passengers', 'drivers', 'admins')),
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

CREATE TABLE IF NOT EXISTS in_app_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  action_url VARCHAR(500),
  action_label VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE in_app_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their in-app messages" ON in_app_messages FOR ALL USING (auth.uid() = user_id);

-- ===== PROMO =====

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2),
  max_discount NUMERIC(10, 2),
  min_ride_value NUMERIC(10, 2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_code_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  discount_applied NUMERIC(10, 2),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(promo_code_id, user_id, ride_id)
);
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their promo uses" ON promo_code_uses FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  action_url VARCHAR(500),
  target_audience VARCHAR(50),
  position INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('email', 'push', 'sms', 'in_app')),
  target_audience VARCHAR(50),
  target_conditions JSONB DEFAULT '{}',
  content JSONB DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== SUPPORT EXTRAS =====

CREATE TABLE IF NOT EXISTS support_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  parent_id UUID REFERENCES support_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES support_messages(id) ON DELETE CASCADE,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== COMPLIANCE =====

CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) CHECK (entity_type IN ('driver', 'vehicle', 'user')),
  entity_id UUID NOT NULL,
  compliance_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'compliant', 'non_compliant', 'expired')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_record_id UUID NOT NULL REFERENCES compliance_records(id) ON DELETE CASCADE,
  document_type VARCHAR(100),
  document_url VARCHAR(500),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== VEHICLE EXTRAS =====

CREATE TABLE IF NOT EXISTS vehicle_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES vehicle_brands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  category_id UUID REFERENCES vehicle_categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  hex_code VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== ADMIN EXTRAS =====

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE UNIQUE,
  secret_encrypted TEXT,
  method VARCHAR(20) CHECK (method IN ('totp', 'sms')),
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES admin_roles(id),
  invited_by UUID NOT NULL REFERENCES admin_users(id),
  token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== INTEGRATIONS =====

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(10),
  permissions JSONB DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR(500) NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  success BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_endpoint ON webhook_logs(endpoint_id);

CREATE TABLE IF NOT EXISTS third_party_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(100),
  credentials_encrypted TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== LOGS & METRICS =====

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  service VARCHAR(100),
  message TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at);

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type VARCHAR(100),
  message TEXT,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_url VARCHAR(500),
  request_method VARCHAR(10),
  request_body JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100),
  metric_value NUMERIC(15, 4),
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded ON performance_metrics(recorded_at);

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(100),
  period VARCHAR(20) CHECK (period IN ('hourly', 'daily', 'weekly', 'monthly')),
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  value NUMERIC(15, 4),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_period ON dashboard_metrics(period_start);

-- ===== FAMILY & PREFERENCES =====

CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_name VARCHAR(255),
  member_phone VARCHAR(20),
  relationship VARCHAR(50),
  can_book_rides BOOLEAN DEFAULT FALSE,
  monthly_limit NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their family" ON family_members FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS partner_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(500),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  discount_percentage NUMERIC(5, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  phone VARCHAR(20),
  website VARCHAR(500),
  rating NUMERIC(3, 2),
  partner_id UUID REFERENCES partner_companies(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS passenger_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_vehicle_type VARCHAR(50),
  preferred_payment_method UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  music_preference VARCHAR(50) CHECK (music_preference IN ('none', 'quiet', 'driver_choice', 'passenger_choice')),
  temperature_preference VARCHAR(50) CHECK (temperature_preference IN ('cold', 'cool', 'moderate', 'warm')),
  conversation_preference VARCHAR(50) CHECK (conversation_preference IN ('quiet', 'some', 'chatty')),
  accessibility_needs JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE passenger_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their preferences" ON passenger_preferences FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS driver_ride_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  min_ride_distance NUMERIC(10, 2),
  max_ride_distance NUMERIC(10, 2),
  preferred_regions TEXT[],
  preferred_times TEXT[],
  avoid_areas TEXT[],
  accepts_pets BOOLEAN DEFAULT FALSE,
  accepts_luggage BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_ride_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their preferences" ON driver_ride_preferences FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

CREATE TABLE IF NOT EXISTS driver_preferred_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES geographic_zones(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, zone_id)
);
ALTER TABLE driver_preferred_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Drivers see only their zones" ON driver_preferred_zones FOR ALL USING (auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id));

-- ===== EXPERIMENTS =====

CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  variants JSONB DEFAULT '[]',
  traffic_percentage INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT FALSE,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_test_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);
ALTER TABLE ab_test_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their test participation" ON ab_test_participants FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS pricing_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  control_pricing JSONB,
  test_pricing JSONB,
  zones JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT FALSE,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  description TEXT,
  affected_services TEXT[] DEFAULT '{}',
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, step_name)
);
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their onboarding" ON onboarding_steps FOR ALL USING (auth.uid() = user_id);

-- ===== TERMS & FEEDBACK =====

CREATE TABLE IF NOT EXISTS terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(50) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('terms', 'privacy', 'driver_terms', 'cookie')),
  content TEXT,
  effective_from TIMESTAMP WITH TIME ZONE,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version_id UUID NOT NULL REFERENCES terms_versions(id) ON DELETE CASCADE,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  UNIQUE(user_id, terms_version_id)
);
ALTER TABLE terms_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their acceptances" ON terms_acceptances FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB DEFAULT '[]',
  trigger_event VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  responses JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see only their feedback" ON feedback_responses FOR ALL USING (auth.uid() = user_id);

-- ===== WAITLIST =====

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  phone VARCHAR(20),
  city VARCHAR(100),
  user_type VARCHAR(20) CHECK (user_type IN ('passenger', 'driver')),
  referral_code VARCHAR(50),
  status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'registered', 'rejected')),
  invited_at TIMESTAMP WITH TIME ZONE,
  registered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_waitlist_city ON waitlist(city);

-- =================================================================
-- FIM DO SCRIPT
-- =================================================================
-- Tabelas adicionadas: ~70
-- RLS habilitado onde aplicavel
-- Indices criados para consultas frequentes
-- =================================================================
