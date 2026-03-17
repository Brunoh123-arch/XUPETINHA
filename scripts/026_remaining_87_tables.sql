-- ============================================================
-- UPPI - Script: 87 Tabelas Faltantes para chegar a 192
-- Execute via Supabase Dashboard > SQL Editor quando disponível
-- ============================================================

-- =====================
-- BLOCO A: ADMIN/SISTEMA
-- =====================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_users_admin" ON admin_users USING (is_admin());

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  description TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_actions_admin" ON admin_actions USING (is_admin());

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(admin_user_id, resource, action)
);
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_permissions_admin" ON admin_permissions USING (is_admin());

CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_config_public" ON app_config FOR SELECT USING (is_public = TRUE);
CREATE POLICY "app_config_admin" ON app_config USING (is_admin());

CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  platform TEXT NOT NULL,
  release_notes TEXT,
  is_mandatory BOOLEAN DEFAULT FALSE,
  download_url TEXT,
  released_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(version, platform)
);
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_versions_read" ON app_versions FOR SELECT USING (TRUE);
CREATE POLICY "app_versions_admin" ON app_versions USING (is_admin());

CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module, key)
);
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_config_admin" ON system_config USING (is_admin());

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_admin" ON audit_logs USING (is_admin());

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_keys_own" ON api_keys USING (auth.uid() = user_id);
CREATE POLICY "api_keys_admin" ON api_keys USING (is_admin());

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  affected_services TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_windows_read" ON maintenance_windows FOR SELECT USING (TRUE);
CREATE POLICY "maintenance_windows_admin" ON maintenance_windows USING (is_admin());

CREATE TABLE IF NOT EXISTS pricing_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  experiment_type TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '[]',
  traffic_percentage INT DEFAULT 100,
  status TEXT DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  winner_variant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE pricing_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing_experiments_admin" ON pricing_experiments USING (is_admin());

CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_type, version)
);
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legal_documents_read" ON legal_documents FOR SELECT USING (TRUE);
CREATE POLICY "legal_documents_admin" ON legal_documents USING (is_admin());

CREATE TABLE IF NOT EXISTS terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES legal_documents(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changes_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE terms_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "terms_versions_read" ON terms_versions FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES legal_documents(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  UNIQUE(user_id, document_id)
);
ALTER TABLE terms_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "terms_acceptances_own" ON terms_acceptances USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  description TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret_key TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_endpoints_admin" ON webhook_endpoints USING (is_admin());

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_code INT,
  status TEXT DEFAULT 'pending',
  attempt_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_deliveries_admin" ON webhook_deliveries USING (is_admin());

CREATE TABLE IF NOT EXISTS live_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  activity_token TEXT,
  platform TEXT DEFAULT 'ios',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE live_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live_activities_own" ON live_activities USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  metric_hour INT,
  total_rides INT DEFAULT 0,
  completed_rides INT DEFAULT 0,
  cancelled_rides INT DEFAULT 0,
  active_drivers INT DEFAULT 0,
  new_users INT DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0,
  avg_ride_value NUMERIC(12,2) DEFAULT 0,
  avg_rating NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_date, metric_hour)
);
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dashboard_metrics_admin" ON dashboard_metrics USING (is_admin());

-- =====================
-- BLOCO B: GEO/ZONAS
-- =====================
CREATE TABLE IF NOT EXISTS geographic_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL DEFAULT 'service',
  coordinates JSONB,
  parent_zone_id UUID REFERENCES geographic_zones(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE geographic_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geographic_zones_read" ON geographic_zones FOR SELECT USING (is_active = TRUE);
CREATE POLICY "geographic_zones_admin" ON geographic_zones USING (is_admin());

CREATE TABLE IF NOT EXISTS city_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  boundaries JSONB,
  population INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE city_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "city_zones_read" ON city_zones FOR SELECT USING (is_active = TRUE);

CREATE TABLE IF NOT EXISTS surge_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES service_areas(id) ON DELETE CASCADE,
  multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  demand_level TEXT DEFAULT 'normal' CHECK (demand_level IN ('low','normal','high','very_high','extreme')),
  active_drivers INT DEFAULT 0,
  pending_requests INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE surge_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "surge_pricing_read" ON surge_pricing FOR SELECT USING (TRUE);
CREATE POLICY "surge_pricing_admin" ON surge_pricing USING (is_admin());

CREATE TABLE IF NOT EXISTS airports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  iata_code TEXT UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  has_dedicated_zone BOOLEAN DEFAULT FALSE,
  pickup_instructions TEXT,
  extra_fee NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "airports_read" ON airports FOR SELECT USING (is_active = TRUE);
CREATE POLICY "airports_admin" ON airports USING (is_admin());

CREATE TABLE IF NOT EXISTS popular_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('shopping','airport','hospital','stadium','university','park','restaurant','hotel','other')),
  address TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  city TEXT NOT NULL,
  ride_count INT DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE popular_destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "popular_destinations_read" ON popular_destinations FOR SELECT USING (is_active = TRUE);

CREATE TABLE IF NOT EXISTS favorite_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  place_type TEXT DEFAULT 'other',
  use_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE favorite_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorite_locations_own" ON favorite_locations USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('driver','place','route')),
  target_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON favorites USING (auth.uid() = user_id);

-- =====================
-- BLOCO C: SOCIAL/COMUNIDADE
-- =====================
CREATE TABLE IF NOT EXISTS social_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_post_likes_own" ON social_post_likes USING (auth.uid() = user_id);
CREATE POLICY "social_post_likes_read" ON social_post_likes FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_follows_own" ON user_follows USING (auth.uid() = follower_id);
CREATE POLICY "user_follows_read" ON user_follows FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rides','safety','social','loyalty','special','driver','passenger')),
  icon_url TEXT,
  badge_url TEXT,
  xp_reward INT DEFAULT 0,
  points_reward INT DEFAULT 0,
  condition_type TEXT NOT NULL,
  condition_value NUMERIC(12,2) NOT NULL,
  is_secret BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_read" ON achievements FOR SELECT USING (is_active = TRUE);
CREATE POLICY "achievements_admin" ON achievements USING (is_admin());

CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('weekly_rides','monthly_earnings','rating','safety','referrals')),
  rank_position INT NOT NULL,
  score NUMERIC(14,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, leaderboard_type, period_start)
);
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leaderboard_read" ON leaderboard FOR SELECT USING (TRUE);
CREATE POLICY "leaderboard_admin" ON leaderboard USING (is_admin());

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','qualified','rewarded','expired')),
  referrer_reward NUMERIC(12,2) DEFAULT 0,
  referee_reward NUMERIC(12,2) DEFAULT 0,
  qualified_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id)
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_own" ON referrals USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE TABLE IF NOT EXISTS referral_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  milestone INT NOT NULL,
  reward_amount NUMERIC(12,2) NOT NULL,
  referrals_count INT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone)
);
ALTER TABLE referral_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referral_achievements_own" ON referral_achievements USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL DEFAULT 'sos',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  description TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sos_events_own" ON sos_events USING (auth.uid() = user_id);
CREATE POLICY "sos_events_admin" ON sos_events USING (is_admin());

-- =====================
-- BLOCO D: VIAGENS ESPECIAIS
-- =====================
CREATE TABLE IF NOT EXISTS group_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  origin_address TEXT NOT NULL,
  origin_lat NUMERIC(10,7) NOT NULL,
  origin_lng NUMERIC(10,7) NOT NULL,
  destination_address TEXT NOT NULL,
  destination_lat NUMERIC(10,7) NOT NULL,
  destination_lng NUMERIC(10,7) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  max_passengers INT DEFAULT 4,
  current_passengers INT DEFAULT 1,
  price_per_person NUMERIC(12,2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','full','in_progress','completed','cancelled')),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE group_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_rides_own" ON group_rides USING (auth.uid() = organizer_id);
CREATE POLICY "group_rides_read" ON group_rides FOR SELECT USING (status = 'open');

CREATE TABLE IF NOT EXISTS group_ride_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_ride_id UUID REFERENCES group_rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined','confirmed','cancelled')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_ride_id, user_id)
);
ALTER TABLE group_ride_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "group_ride_participants_own" ON group_ride_participants USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS intercity_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE UNIQUE,
  route_id UUID REFERENCES intercity_routes(id) ON DELETE SET NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  distance_km NUMERIC(10,2),
  toll_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE intercity_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercity_rides_participant" ON intercity_rides USING (
  ride_id IN (SELECT id FROM rides WHERE passenger_id = auth.uid() OR driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()))
);

CREATE TABLE IF NOT EXISTS intercity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES intercity_routes(id) ON DELETE SET NULL,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TEXT,
  passengers INT DEFAULT 1,
  total_price NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE intercity_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercity_bookings_own" ON intercity_bookings USING (auth.uid() = passenger_id);
CREATE POLICY "intercity_bookings_admin" ON intercity_bookings USING (is_admin());

CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  pickup_address TEXT NOT NULL,
  pickup_lat NUMERIC(10,7) NOT NULL,
  pickup_lng NUMERIC(10,7) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_lat NUMERIC(10,7) NOT NULL,
  delivery_lng NUMERIC(10,7) NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  package_type TEXT DEFAULT 'small' CHECK (package_type IN ('small','medium','large','fragile','document')),
  package_description TEXT,
  estimated_price NUMERIC(12,2),
  final_price NUMERIC(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','pickup','in_transit','delivered','failed','cancelled')),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  proof_url TEXT,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "delivery_orders_own" ON delivery_orders USING (auth.uid() = sender_id);
CREATE POLICY "delivery_orders_driver" ON delivery_orders USING (driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid()));
CREATE POLICY "delivery_orders_admin" ON delivery_orders USING (is_admin());

-- =====================
-- BLOCO E: EMPRESAS/MISC
-- =====================
CREATE TABLE IF NOT EXISTS partner_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('hospital','hotel','airport','shopping','corporate','university','other')),
  address TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  contact_email TEXT,
  contact_phone TEXT,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  special_zone BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE partner_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_companies_read" ON partner_companies FOR SELECT USING (is_active = TRUE);
CREATE POLICY "partner_companies_admin" ON partner_companies USING (is_admin());

CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partner_companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stars INT CHECK (stars BETWEEN 1 AND 5),
  address TEXT NOT NULL,
  latitude NUMERIC(10,7) NOT NULL,
  longitude NUMERIC(10,7) NOT NULL,
  pickup_instructions TEXT,
  extra_fee NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotels_read" ON hotels FOR SELECT USING (is_active = TRUE);
CREATE POLICY "hotels_admin" ON hotels USING (is_admin());

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  user_type TEXT DEFAULT 'passenger' CHECK (user_type IN ('passenger','driver')),
  city TEXT,
  referral_code TEXT,
  position INT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting','invited','registered')),
  invited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist_read" ON waitlist FOR SELECT USING (TRUE);
CREATE POLICY "waitlist_admin" ON waitlist USING (is_admin());

CREATE TABLE IF NOT EXISTS passenger_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  preferred_vehicle_type TEXT,
  preferred_payment TEXT DEFAULT 'pix',
  max_wait_minutes INT DEFAULT 10,
  preferred_gender_driver TEXT DEFAULT 'any',
  allow_pool BOOLEAN DEFAULT TRUE,
  quiet_ride BOOLEAN DEFAULT FALSE,
  ac_required BOOLEAN DEFAULT FALSE,
  accessibility_needs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE passenger_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "passenger_preferences_own" ON passenger_preferences USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('passenger','driver','common')),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, step_name)
);
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onboarding_steps_own" ON onboarding_steps USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS feedback_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  form_type TEXT NOT NULL CHECK (form_type IN ('nps','csat','custom','exit')),
  trigger_event TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  target_audience TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feedback_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_forms_read" ON feedback_forms FOR SELECT USING (is_active = TRUE);
CREATE POLICY "feedback_forms_admin" ON feedback_forms USING (is_admin());

CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES feedback_forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  responses JSONB NOT NULL DEFAULT '{}',
  score INT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_responses_own" ON feedback_responses USING (auth.uid() = user_id);
CREATE POLICY "feedback_responses_admin" ON feedback_responses USING (is_admin());

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL,
  target_audience JSONB DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  sent_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_admin" ON campaigns USING (is_admin());
