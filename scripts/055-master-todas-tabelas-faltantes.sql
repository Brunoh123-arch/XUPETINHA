-- ============================================================
-- SCRIPT MASTER: Todas as tabelas faltantes + RLS + Realtime
-- Baseado no BANCO-DE-DADOS.md (203 tabelas totais documentadas)
-- Banco atual: 103 tabelas => faltam ~100
-- ============================================================

-- ============================================================
-- PARTE 1: HABILITAR RLS NAS TABELAS EXISTENTES SEM RLS
-- ============================================================

ALTER TABLE IF EXISTS app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referral_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_route_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PARTE 2: POLICIES RLS PARA TABELAS EXISTENTES SEM POLICIES
-- ============================================================

-- app_versions (public read, admin write)
DROP POLICY IF EXISTS "app_versions_public_read" ON app_versions;
CREATE POLICY "app_versions_public_read" ON app_versions FOR SELECT USING (true);

-- driver_bonuses
DROP POLICY IF EXISTS "driver_bonuses_own" ON driver_bonuses;
CREATE POLICY "driver_bonuses_own" ON driver_bonuses FOR ALL USING (driver_id = auth.uid());

-- driver_documents
DROP POLICY IF EXISTS "driver_documents_own" ON driver_documents;
CREATE POLICY "driver_documents_own" ON driver_documents FOR ALL USING (driver_id = auth.uid());

-- driver_earnings
DROP POLICY IF EXISTS "driver_earnings_own" ON driver_earnings;
CREATE POLICY "driver_earnings_own" ON driver_earnings FOR ALL USING (driver_id = auth.uid());

-- payment_methods
DROP POLICY IF EXISTS "payment_methods_own" ON payment_methods;
CREATE POLICY "payment_methods_own" ON payment_methods FOR ALL USING (user_id = auth.uid());

-- referral_achievements
DROP POLICY IF EXISTS "referral_achievements_own" ON referral_achievements;
CREATE POLICY "referral_achievements_own" ON referral_achievements FOR ALL USING (user_id = auth.uid());

-- ride_cancellations (passenger ou driver podem ver suas corridas)
DROP POLICY IF EXISTS "ride_cancellations_participant" ON ride_cancellations;
CREATE POLICY "ride_cancellations_participant" ON ride_cancellations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM rides r WHERE r.id = ride_id 
    AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())
  ));
DROP POLICY IF EXISTS "ride_cancellations_insert" ON ride_cancellations;
CREATE POLICY "ride_cancellations_insert" ON ride_cancellations FOR INSERT
  WITH CHECK (cancelled_by = auth.uid());

-- ride_disputes (quem abriu pode ver)
DROP POLICY IF EXISTS "ride_disputes_own" ON ride_disputes;
CREATE POLICY "ride_disputes_own" ON ride_disputes FOR ALL USING (raised_by = auth.uid());

-- ride_route_points
DROP POLICY IF EXISTS "ride_route_points_participant" ON ride_route_points;
CREATE POLICY "ride_route_points_participant" ON ride_route_points FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM rides r WHERE r.id = ride_id 
    AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())
  ));
DROP POLICY IF EXISTS "ride_route_points_driver_insert" ON ride_route_points;
CREATE POLICY "ride_route_points_driver_insert" ON ride_route_points FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM rides r WHERE r.id = ride_id AND r.driver_id = auth.uid()
  ));

-- ride_tips
DROP POLICY IF EXISTS "ride_tips_own" ON ride_tips;
CREATE POLICY "ride_tips_own" ON ride_tips FOR ALL
  USING (passenger_id = auth.uid() OR driver_id = auth.uid());

-- user_devices
DROP POLICY IF EXISTS "user_devices_own" ON user_devices;
CREATE POLICY "user_devices_own" ON user_devices FOR ALL USING (user_id = auth.uid());

-- user_preferences
DROP POLICY IF EXISTS "user_preferences_own" ON user_preferences;
CREATE POLICY "user_preferences_own" ON user_preferences FOR ALL USING (user_id = auth.uid());

-- user_sessions
DROP POLICY IF EXISTS "user_sessions_own" ON user_sessions;
CREATE POLICY "user_sessions_own" ON user_sessions FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- PARTE 3: CRIAR TABELAS FALTANTES (com IF NOT EXISTS)
-- ============================================================

-- ----------------------------------------------------------
-- GRUPO: REVIEWS AVANCADAS (4 tabelas - BUG no codigo)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS enhanced_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reviewed_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  overall_rating integer CHECK (overall_rating BETWEEN 1 AND 5),
  categories jsonb DEFAULT '{}',
  tags text[],
  comment text,
  is_public boolean DEFAULT true,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text NOT NULL,
  icon text,
  user_type text CHECK (user_type IN ('passenger','driver','both')) DEFAULT 'both',
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text NOT NULL,
  category text,
  user_type text DEFAULT 'both',
  is_positive boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bidirectional_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id uuid REFERENCES profiles(id),
  driver_id uuid REFERENCES profiles(id),
  passenger_rating integer CHECK (passenger_rating BETWEEN 1 AND 5),
  driver_rating integer CHECK (driver_rating BETWEEN 1 AND 5),
  passenger_comment text,
  driver_comment text,
  passenger_tags text[],
  driver_tags text[],
  passenger_reviewed_at timestamptz,
  driver_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: WEBHOOKS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] DEFAULT '{}',
  secret text,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: SOCIAL (aliases/complementos)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS social_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS social_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES social_comments(id),
  likes_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- ----------------------------------------------------------
-- GRUPO: VIAGENS INTERMUNICIPAIS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS intercity_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_city text NOT NULL,
  destination_city text NOT NULL,
  origin_state text,
  destination_state text,
  distance_km numeric,
  estimated_duration_minutes integer,
  base_price numeric(10,2),
  price_per_km numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS intercity_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  route_id uuid REFERENCES intercity_routes(id),
  origin_city text NOT NULL,
  destination_city text NOT NULL,
  departure_time timestamptz,
  arrival_time timestamptz,
  passenger_count integer DEFAULT 1,
  luggage_count integer DEFAULT 0,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS intercity_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id),
  user_id uuid REFERENCES profiles(id),
  route_id uuid REFERENCES intercity_routes(id),
  departure_date date,
  seats integer DEFAULT 1,
  price numeric(10,2),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: PLANOS E ASSINATURAS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  price_monthly numeric(10,2),
  price_yearly numeric(10,2),
  features jsonb DEFAULT '[]',
  max_rides_per_month integer,
  discount_percentage numeric(5,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: PAGAMENTOS AVANCADOS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('credit_card','debit_card','pix','wallet')),
  last_four text,
  brand text,
  holder_name text,
  expiry_month integer,
  expiry_year integer,
  pix_key text,
  is_default boolean DEFAULT false,
  gateway_token text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pix_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  amount numeric(10,2) NOT NULL,
  pix_key text,
  pix_key_type text,
  qr_code text,
  qr_code_base64 text,
  copy_paste text,
  transaction_id text UNIQUE,
  status text DEFAULT 'pending',
  expires_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_gateway_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id),
  gateway text,
  event_type text,
  request_body jsonb,
  response_body jsonb,
  status_code integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id),
  user_id uuid REFERENCES profiles(id),
  type text,
  description text,
  status text DEFAULT 'open',
  resolution text,
  resolved_by uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheduled_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  amount numeric(10,2),
  payment_method_id uuid,
  description text,
  scheduled_at timestamptz,
  status text DEFAULT 'pending',
  executed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id),
  fee_type text,
  amount numeric(10,2),
  percentage numeric(5,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  period_start date,
  period_end date,
  total_amount numeric(12,2),
  status text DEFAULT 'pending',
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text,
  ride_id uuid REFERENCES rides(id),
  amount numeric(10,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tax_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id),
  year integer,
  month integer,
  gross_income numeric(12,2),
  platform_fees numeric(12,2),
  net_income numeric(12,2),
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cashback_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cashback_percentage numeric(5,2),
  min_ride_value numeric(10,2),
  max_cashback numeric(10,2),
  user_type text DEFAULT 'passenger',
  is_active boolean DEFAULT true,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cashback_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  rule_id uuid REFERENCES cashback_rules(id),
  amount numeric(10,2),
  status text DEFAULT 'pending',
  credited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: FAMILIA E GRUPOS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  max_members integer DEFAULT 5,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS family_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  added_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- ----------------------------------------------------------
-- GRUPO: LUGARES FAVORITOS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorite_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  latitude float8,
  longitude float8,
  type text DEFAULT 'other',
  icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: EMERGÊNCIA AVANCADA
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  type text CHECK (type IN ('sos','panic','route_deviation','accident')),
  latitude float8,
  longitude float8,
  description text,
  status text DEFAULT 'active',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sos_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  latitude float8,
  longitude float8,
  message text,
  status text DEFAULT 'active',
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS safety_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id),
  user_id uuid REFERENCES profiles(id),
  type text,
  status text DEFAULT 'pending',
  check_data jsonb,
  passed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: ADMIN E OPERACIONAL
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES admin_roles(id),
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  resource text,
  action text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES admin_roles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES admin_permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  resource text,
  resource_id uuid,
  changes jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text,
  type text DEFAULT 'info',
  priority text DEFAULT 'normal',
  is_read boolean DEFAULT false,
  target_admin_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  table_name text,
  record_id uuid,
  operation text CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  error_type text,
  error_message text,
  stack_trace text,
  context jsonb,
  severity text DEFAULT 'error',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text UNIQUE NOT NULL,
  permissions text[] DEFAULT '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id),
  user_id uuid REFERENCES profiles(id),
  endpoint text,
  method text,
  status_code integer,
  response_time_ms integer,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintenance_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  affected_services text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_enabled boolean DEFAULT false,
  rollout_percentage integer DEFAULT 0,
  target_users uuid[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric,
  dimensions jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  endpoint text,
  ip_address text,
  requests_count integer DEFAULT 1,
  window_start timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ip_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text UNIQUE NOT NULL,
  reason text,
  blocked_by uuid REFERENCES profiles(id),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fraud_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  flag_type text NOT NULL,
  description text,
  severity text DEFAULT 'medium',
  status text DEFAULT 'open',
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: GAMIFICAÇÃO AVANCADA
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  icon_url text,
  category text,
  criteria jsonb,
  points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badge_definitions(id),
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS driver_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id),
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS passenger_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id),
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text NOT NULL,
  min_points integer DEFAULT 0,
  max_points integer,
  benefits jsonb DEFAULT '[]',
  color text,
  icon text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_points integer DEFAULT 0,
  available_points integer DEFAULT 0,
  tier_id uuid REFERENCES loyalty_tiers(id),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  points integer NOT NULL,
  type text CHECK (type IN ('earn','redeem','expire','bonus')),
  description text,
  ride_id uuid REFERENCES rides(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_level_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer UNIQUE NOT NULL,
  name text NOT NULL,
  min_rides integer DEFAULT 0,
  min_rating numeric(3,2) DEFAULT 4.0,
  benefits jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS passenger_level_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer UNIQUE NOT NULL,
  name text NOT NULL,
  min_rides integer DEFAULT 0,
  benefits jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: MOTORISTAS - COMPLEMENTAR
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  plate text UNIQUE NOT NULL,
  color text,
  year integer,
  type text DEFAULT 'economy',
  photo_url text,
  is_primary boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  label text,
  icon text,
  description text,
  base_fare numeric(10,2),
  per_km_rate numeric(10,2),
  per_minute_rate numeric(10,2),
  min_fare numeric(10,2),
  max_passengers integer DEFAULT 4,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id),
  driver_id uuid REFERENCES profiles(id),
  inspector_id uuid REFERENCES profiles(id),
  status text DEFAULT 'pending',
  checklist jsonb DEFAULT '{}',
  notes text,
  inspected_at timestamptz,
  next_inspection_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id),
  driver_id uuid REFERENCES profiles(id),
  type text,
  description text,
  cost numeric(10,2),
  mileage integer,
  performed_at timestamptz,
  next_maintenance_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_rides integer DEFAULT 0,
  total_earnings numeric(12,2) DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0,
  acceptance_rate numeric(5,2) DEFAULT 0,
  completion_rate numeric(5,2) DEFAULT 0,
  online_hours numeric(10,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id),
  period_start date,
  period_end date,
  total_rides integer DEFAULT 0,
  accepted_rides integer DEFAULT 0,
  completed_rides integer DEFAULT 0,
  cancelled_rides integer DEFAULT 0,
  avg_rating numeric(3,2),
  total_earnings numeric(12,2),
  online_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id),
  type text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  reward_amount numeric(10,2),
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  is_online boolean DEFAULT false,
  is_available boolean DEFAULT false,
  last_online_at timestamptz,
  current_ride_id uuid REFERENCES rides(id),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text DEFAULT 'pending',
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz,
  rejection_reason text,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_selfie_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id),
  photo_url text,
  status text DEFAULT 'pending',
  verified_at timestamptz,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_idle_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_minutes integer,
  location jsonb
);

CREATE TABLE IF NOT EXISTS driver_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES city_zones(id),
  is_preferred boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, zone_id)
);

CREATE TABLE IF NOT EXISTS peak_hour_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id),
  bonus_multiplier numeric(3,2) DEFAULT 1.5,
  start_time time,
  end_time time,
  day_of_week integer[],
  amount numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_trips_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  period text NOT NULL,
  period_date date NOT NULL,
  total_rides integer DEFAULT 0,
  total_earnings numeric(12,2) DEFAULT 0,
  total_distance_km numeric(10,2) DEFAULT 0,
  avg_rating numeric(3,2),
  online_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, period, period_date)
);

CREATE TABLE IF NOT EXISTS driver_rating_breakdown (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_ratings integer DEFAULT 0,
  five_star integer DEFAULT 0,
  four_star integer DEFAULT 0,
  three_star integer DEFAULT 0,
  two_star integer DEFAULT 0,
  one_star integer DEFAULT 0,
  category_scores jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_popular_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  origin_address text,
  origin_lat float8,
  origin_lng float8,
  destination_address text,
  destination_lat float8,
  destination_lng float8,
  trip_count integer DEFAULT 1,
  avg_earnings numeric(10,2),
  last_trip_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_route_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  start_lat float8,
  start_lng float8,
  end_lat float8,
  end_lng float8,
  distance_m numeric,
  duration_s integer,
  avg_speed_kmh numeric,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: PASSAGEIROS - COMPLEMENTAR
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_rides integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  total_saved numeric(12,2) DEFAULT 0,
  avg_rating numeric(3,2) DEFAULT 0,
  favorite_vehicle_type text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS passenger_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_rides integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  total_cancelled integer DEFAULT 0,
  avg_rating_given numeric(3,2),
  favorite_drivers uuid[],
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  step text DEFAULT 'profile',
  completed_steps text[] DEFAULT '{}',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text DEFAULT 'pending',
  verified_at timestamptz,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_social_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  likes_received integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  ip_address text,
  device_info jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS user_2fa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  is_enabled boolean DEFAULT false,
  secret text,
  backup_codes text[],
  enabled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  phone text NOT NULL,
  code text NOT NULL,
  verified boolean DEFAULT false,
  expires_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  email text NOT NULL,
  code text NOT NULL,
  verified boolean DEFAULT false,
  expires_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: CORRIDAS - COMPLEMENTAR
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ride_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  data jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ride_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  feedback_type text,
  content text,
  rating integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ride_waypoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  sequence integer,
  address text,
  latitude float8,
  longitude float8,
  arrived_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ride_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  checkpoint_type text,
  latitude float8,
  longitude float8,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES profiles(id),
  status text DEFAULT 'pending',
  sent_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  response text
);

CREATE TABLE IF NOT EXISTS ride_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES profiles(id),
  amount numeric(10,2),
  message text,
  status text DEFAULT 'pending',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ride_history_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  user_type text CHECK (user_type IN ('passenger','driver')),
  period text,
  period_date date,
  total_rides integer DEFAULT 0,
  total_value numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, user_type, period, period_date)
);

CREATE TABLE IF NOT EXISTS ride_eta_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  estimated_pickup_at timestamptz,
  actual_pickup_at timestamptz,
  estimated_arrival_at timestamptz,
  actual_arrival_at timestamptz,
  eta_accuracy_seconds integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ride_offers_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES profiles(id),
  notified_at timestamptz DEFAULT now(),
  viewed_at timestamptz,
  responded_at timestamptz,
  response text
);

-- ----------------------------------------------------------
-- GRUPO: COMUNICACAO AVANCADA
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  target_type text DEFAULT 'all',
  target_criteria jsonb,
  sent_at timestamptz,
  scheduled_at timestamptz,
  status text DEFAULT 'draft',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  total_count integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  status text DEFAULT 'pending',
  created_by uuid REFERENCES profiles(id),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  event_type text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_body text,
  text_body text,
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  body text NOT NULL,
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id),
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  category text,
  tags text[],
  is_published boolean DEFAULT true,
  views_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: PRECOS E ZONAS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS surge_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES city_zones(id),
  multiplier numeric(4,2) DEFAULT 1.0,
  reason text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surge_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES city_zones(id),
  vehicle_type text,
  multiplier numeric(4,2) DEFAULT 1.0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zone_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES city_zones(id),
  vehicle_type text,
  base_fare numeric(10,2),
  per_km_rate numeric(10,2),
  per_minute_rate numeric(10,2),
  min_fare numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS zone_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES city_zones(id),
  driver_count integer DEFAULT 0,
  demand_level text DEFAULT 'normal',
  eta_minutes integer,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  coordinates jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS popular_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_address text,
  origin_lat float8,
  origin_lng float8,
  destination_address text,
  destination_lat float8,
  destination_lng float8,
  trip_count integer DEFAULT 1,
  city text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS city_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text UNIQUE NOT NULL,
  state text,
  country text DEFAULT 'BR',
  is_active boolean DEFAULT true,
  min_fare numeric(10,2),
  base_fare numeric(10,2),
  per_km_rate numeric(10,2),
  currency text DEFAULT 'BRL',
  timezone text DEFAULT 'America/Sao_Paulo',
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: MARKETING
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text,
  target_audience jsonb,
  budget numeric(12,2),
  start_date date,
  end_date date,
  status text DEFAULT 'draft',
  metrics jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  discount_type text,
  discount_value numeric(10,2),
  conditions jsonb DEFAULT '{}',
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  promotion_id uuid REFERENCES promotions(id),
  used boolean DEFAULT false,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  action_url text,
  target_type text DEFAULT 'all',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_url text,
  target_screen text,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  referrer_reward numeric(10,2),
  referee_reward numeric(10,2),
  max_referrals integer,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  code text UNIQUE NOT NULL,
  campaign_id uuid REFERENCES referral_campaigns(id),
  uses_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid REFERENCES referral_codes(id),
  referee_id uuid REFERENCES profiles(id),
  referrer_rewarded boolean DEFAULT false,
  referee_rewarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  variants jsonb DEFAULT '[]',
  traffic_split jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ab_test_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES ab_tests(id),
  user_id uuid REFERENCES profiles(id),
  variant text,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(test_id, user_id)
);

-- ----------------------------------------------------------
-- GRUPO: SEGURO E VIAGEM
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_insurance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id),
  user_id uuid REFERENCES profiles(id),
  plan_type text DEFAULT 'basic',
  coverage_amount numeric(12,2),
  premium numeric(10,2),
  status text DEFAULT 'active',
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_id uuid REFERENCES trip_insurance(id),
  claimant_id uuid REFERENCES profiles(id),
  claim_type text,
  description text,
  amount_claimed numeric(10,2),
  amount_approved numeric(10,2),
  status text DEFAULT 'submitted',
  documents jsonb DEFAULT '[]',
  submitted_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- ----------------------------------------------------------
-- GRUPO: HISTORICO E ANALYTICS
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS location_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  latitude float8,
  longitude float8,
  accuracy float8,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS address_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  address text NOT NULL,
  latitude float8,
  longitude float8,
  use_count integer DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS address_search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  query text NOT NULL,
  result_address text,
  latitude float8,
  longitude float8,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS destination_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  address text NOT NULL,
  latitude float8,
  longitude float8,
  visit_count integer DEFAULT 1,
  last_visited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS place_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  latitude float8,
  longitude float8,
  category text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS route_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  origin_address text,
  origin_lat float8,
  origin_lng float8,
  destination_address text,
  destination_lat float8,
  destination_lng float8,
  use_count integer DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id),
  reported_by uuid REFERENCES profiles(id),
  report_type text,
  description text,
  status text DEFAULT 'open',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id),
  reported_user_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  type text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  resolved_by uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id),
  content_type text,
  content_id uuid,
  reason text,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: GRAVACOES E SEGURANCA
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS recording_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id uuid REFERENCES rides(id),
  consented boolean DEFAULT false,
  consent_version text,
  consented_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------------------------------------
-- GRUPO: APP E SISTEMA
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS live_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id uuid REFERENCES rides(id),
  activity_token text,
  platform text DEFAULT 'ios',
  status text DEFAULT 'active',
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  trigger_event text,
  shown_at timestamptz DEFAULT now(),
  was_rated boolean DEFAULT false,
  platform text DEFAULT 'ios',
  app_version text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  type text,
  description text,
  location jsonb,
  status text DEFAULT 'open',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- PARTE 4: HABILITAR RLS EM TODAS AS NOVAS TABELAS
-- ============================================================

-- Reviews avancadas
ALTER TABLE IF EXISTS enhanced_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bidirectional_reviews ENABLE ROW LEVEL SECURITY;

-- Webhooks
ALTER TABLE IF EXISTS webhooks ENABLE ROW LEVEL SECURITY;

-- Social
ALTER TABLE IF EXISTS social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS social_follows ENABLE ROW LEVEL SECURITY;

-- Intercity
ALTER TABLE IF EXISTS intercity_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS intercity_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS intercity_bookings ENABLE ROW LEVEL SECURITY;

-- Assinaturas
ALTER TABLE IF EXISTS subscription_plans ENABLE ROW LEVEL SECURITY;

-- Pagamentos avancados
ALTER TABLE IF EXISTS user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_gateway_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scheduled_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cashback_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cashback_transactions ENABLE ROW LEVEL SECURITY;

-- Familia
ALTER TABLE IF EXISTS family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS family_group_members ENABLE ROW LEVEL SECURITY;

-- Lugares
ALTER TABLE IF EXISTS favorite_places ENABLE ROW LEVEL SECURITY;

-- Emergencia
ALTER TABLE IF EXISTS emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS safety_checks ENABLE ROW LEVEL SECURITY;

-- Admin
ALTER TABLE IF EXISTS admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maintenance_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rate_limit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ip_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fraud_flags ENABLE ROW LEVEL SECURITY;

-- Gamificacao
ALTER TABLE IF EXISTS badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS passenger_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_level_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS passenger_level_config ENABLE ROW LEVEL SECURITY;

-- Veiculos
ALTER TABLE IF EXISTS vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicle_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicle_maintenance ENABLE ROW LEVEL SECURITY;

-- Motoristas complementar
ALTER TABLE IF EXISTS driver_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_selfie_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_idle_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS peak_hour_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_trips_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_rating_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_popular_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_route_segments ENABLE ROW LEVEL SECURITY;

-- Passageiros
ALTER TABLE IF EXISTS user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS passenger_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_social_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_otps ENABLE ROW LEVEL SECURITY;

-- Corridas complementar
ALTER TABLE IF EXISTS ride_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_history_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_eta_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_offers_log ENABLE ROW LEVEL SECURITY;

-- Comunicacao
ALTER TABLE IF EXISTS broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS push_notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS knowledge_base_articles ENABLE ROW LEVEL SECURITY;

-- Precos e Zonas
ALTER TABLE IF EXISTS surge_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS surge_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS zone_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS zone_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS popular_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS city_configurations ENABLE ROW LEVEL SECURITY;

-- Marketing
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referral_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ab_test_participants ENABLE ROW LEVEL SECURITY;

-- Seguro
ALTER TABLE IF EXISTS trip_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insurance_claims ENABLE ROW LEVEL SECURITY;

-- Historico e Analytics
ALTER TABLE IF EXISTS location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS address_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS address_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS destination_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS place_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS route_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS trip_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_reports ENABLE ROW LEVEL SECURITY;

-- App e Sistema
ALTER TABLE IF EXISTS recording_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS live_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_records ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PARTE 5: POLICIES RLS PARA NOVAS TABELAS
-- ============================================================

-- enhanced_reviews
DROP POLICY IF EXISTS "enhanced_reviews_own" ON enhanced_reviews;
CREATE POLICY "enhanced_reviews_own" ON enhanced_reviews FOR ALL USING (reviewer_id = auth.uid());
DROP POLICY IF EXISTS "enhanced_reviews_read_public" ON enhanced_reviews;
CREATE POLICY "enhanced_reviews_read_public" ON enhanced_reviews FOR SELECT USING (is_public = true);

-- review_categories / review_tags (public read)
DROP POLICY IF EXISTS "review_categories_public_read" ON review_categories;
CREATE POLICY "review_categories_public_read" ON review_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "review_tags_public_read" ON review_tags;
CREATE POLICY "review_tags_public_read" ON review_tags FOR SELECT USING (true);

-- bidirectional_reviews
DROP POLICY IF EXISTS "bidirectional_reviews_own" ON bidirectional_reviews;
CREATE POLICY "bidirectional_reviews_own" ON bidirectional_reviews FOR ALL
  USING (passenger_id = auth.uid() OR driver_id = auth.uid());

-- webhooks
DROP POLICY IF EXISTS "webhooks_own" ON webhooks;
CREATE POLICY "webhooks_own" ON webhooks FOR ALL USING (user_id = auth.uid());

-- social_likes
DROP POLICY IF EXISTS "social_likes_own" ON social_likes;
CREATE POLICY "social_likes_own" ON social_likes FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "social_likes_read" ON social_likes;
CREATE POLICY "social_likes_read" ON social_likes FOR SELECT USING (true);

-- social_comments
DROP POLICY IF EXISTS "social_comments_own" ON social_comments;
CREATE POLICY "social_comments_own" ON social_comments FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "social_comments_read_public" ON social_comments;
CREATE POLICY "social_comments_read_public" ON social_comments FOR SELECT USING (true);

-- social_follows
DROP POLICY IF EXISTS "social_follows_own" ON social_follows;
CREATE POLICY "social_follows_own" ON social_follows FOR ALL USING (follower_id = auth.uid());
DROP POLICY IF EXISTS "social_follows_read" ON social_follows;
CREATE POLICY "social_follows_read" ON social_follows FOR SELECT USING (true);

-- intercity_routes (public read)
DROP POLICY IF EXISTS "intercity_routes_public_read" ON intercity_routes;
CREATE POLICY "intercity_routes_public_read" ON intercity_routes FOR SELECT USING (true);

-- intercity_rides / intercity_bookings
DROP POLICY IF EXISTS "intercity_rides_participant" ON intercity_rides;
CREATE POLICY "intercity_rides_participant" ON intercity_rides FOR SELECT
  USING (EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())));
DROP POLICY IF EXISTS "intercity_bookings_own" ON intercity_bookings;
CREATE POLICY "intercity_bookings_own" ON intercity_bookings FOR ALL USING (user_id = auth.uid());

-- subscription_plans (public read)
DROP POLICY IF EXISTS "subscription_plans_public_read" ON subscription_plans;
CREATE POLICY "subscription_plans_public_read" ON subscription_plans FOR SELECT USING (true);

-- user_payment_methods
DROP POLICY IF EXISTS "user_payment_methods_own" ON user_payment_methods;
CREATE POLICY "user_payment_methods_own" ON user_payment_methods FOR ALL USING (user_id = auth.uid());

-- pix_transactions
DROP POLICY IF EXISTS "pix_transactions_own" ON pix_transactions;
CREATE POLICY "pix_transactions_own" ON pix_transactions FOR ALL USING (user_id = auth.uid());

-- payment_disputes
DROP POLICY IF EXISTS "payment_disputes_own" ON payment_disputes;
CREATE POLICY "payment_disputes_own" ON payment_disputes FOR ALL USING (user_id = auth.uid());

-- scheduled_payments
DROP POLICY IF EXISTS "scheduled_payments_own" ON scheduled_payments;
CREATE POLICY "scheduled_payments_own" ON scheduled_payments FOR ALL USING (user_id = auth.uid());

-- invoices / invoice_items
DROP POLICY IF EXISTS "invoices_own" ON invoices;
CREATE POLICY "invoices_own" ON invoices FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "invoice_items_own" ON invoice_items;
CREATE POLICY "invoice_items_own" ON invoice_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM invoices i WHERE i.id = invoice_id AND i.user_id = auth.uid()));

-- tax_records
DROP POLICY IF EXISTS "tax_records_own" ON tax_records;
CREATE POLICY "tax_records_own" ON tax_records FOR SELECT USING (driver_id = auth.uid());

-- cashback_transactions
DROP POLICY IF EXISTS "cashback_transactions_own" ON cashback_transactions;
CREATE POLICY "cashback_transactions_own" ON cashback_transactions FOR SELECT USING (user_id = auth.uid());

-- family_groups
DROP POLICY IF EXISTS "family_groups_owner" ON family_groups;
CREATE POLICY "family_groups_owner" ON family_groups FOR ALL USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "family_groups_member_read" ON family_groups;
CREATE POLICY "family_groups_member_read" ON family_groups FOR SELECT
  USING (EXISTS (SELECT 1 FROM family_group_members m WHERE m.group_id = id AND m.user_id = auth.uid()));

-- family_group_members
DROP POLICY IF EXISTS "family_group_members_own" ON family_group_members;
CREATE POLICY "family_group_members_own" ON family_group_members FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "family_group_members_owner_manage" ON family_group_members;
CREATE POLICY "family_group_members_owner_manage" ON family_group_members FOR ALL
  USING (EXISTS (SELECT 1 FROM family_groups g WHERE g.id = group_id AND g.owner_id = auth.uid()));

-- favorite_places
DROP POLICY IF EXISTS "favorite_places_own" ON favorite_places;
CREATE POLICY "favorite_places_own" ON favorite_places FOR ALL USING (user_id = auth.uid());

-- emergency_events
DROP POLICY IF EXISTS "emergency_events_own" ON emergency_events;
CREATE POLICY "emergency_events_own" ON emergency_events FOR ALL USING (user_id = auth.uid());

-- sos_alerts
DROP POLICY IF EXISTS "sos_alerts_own" ON sos_alerts;
CREATE POLICY "sos_alerts_own" ON sos_alerts FOR ALL USING (user_id = auth.uid());

-- safety_checks
DROP POLICY IF EXISTS "safety_checks_participant" ON safety_checks;
CREATE POLICY "safety_checks_participant" ON safety_checks FOR SELECT USING (user_id = auth.uid());

-- admin_roles / admin_permissions (admin only)
DROP POLICY IF EXISTS "admin_roles_admin_read" ON admin_roles;
CREATE POLICY "admin_roles_admin_read" ON admin_roles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));
DROP POLICY IF EXISTS "admin_logs_own" ON admin_logs;
CREATE POLICY "admin_logs_own" ON admin_logs FOR SELECT USING (admin_id = auth.uid());

-- badge_definitions (public read)
DROP POLICY IF EXISTS "badge_definitions_public_read" ON badge_definitions;
CREATE POLICY "badge_definitions_public_read" ON badge_definitions FOR SELECT USING (true);

-- user_badges
DROP POLICY IF EXISTS "user_badges_own" ON user_badges;
CREATE POLICY "user_badges_own" ON user_badges FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_badges_public_read" ON user_badges;
CREATE POLICY "user_badges_public_read" ON user_badges FOR SELECT USING (true);

-- driver_achievements / passenger_achievements
DROP POLICY IF EXISTS "driver_achievements_own" ON driver_achievements;
CREATE POLICY "driver_achievements_own" ON driver_achievements FOR ALL USING (driver_id = auth.uid());
DROP POLICY IF EXISTS "passenger_achievements_own" ON passenger_achievements;
CREATE POLICY "passenger_achievements_own" ON passenger_achievements FOR ALL USING (user_id = auth.uid());

-- loyalty_tiers (public read)
DROP POLICY IF EXISTS "loyalty_tiers_public_read" ON loyalty_tiers;
CREATE POLICY "loyalty_tiers_public_read" ON loyalty_tiers FOR SELECT USING (true);

-- loyalty_points / transactions
DROP POLICY IF EXISTS "loyalty_points_own" ON loyalty_points;
CREATE POLICY "loyalty_points_own" ON loyalty_points FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "loyalty_transactions_own" ON loyalty_transactions;
CREATE POLICY "loyalty_transactions_own" ON loyalty_transactions FOR SELECT USING (user_id = auth.uid());

-- vehicles
DROP POLICY IF EXISTS "vehicles_own" ON vehicles;
CREATE POLICY "vehicles_own" ON vehicles FOR ALL USING (driver_id = auth.uid());
DROP POLICY IF EXISTS "vehicles_public_read" ON vehicles;
CREATE POLICY "vehicles_public_read" ON vehicles FOR SELECT USING (is_active = true);

-- vehicle_categories (public read)
DROP POLICY IF EXISTS "vehicle_categories_public_read" ON vehicle_categories;
CREATE POLICY "vehicle_categories_public_read" ON vehicle_categories FOR SELECT USING (true);

-- driver_stats / driver_performance
DROP POLICY IF EXISTS "driver_stats_own" ON driver_stats;
CREATE POLICY "driver_stats_own" ON driver_stats FOR ALL USING (driver_id = auth.uid());
DROP POLICY IF EXISTS "driver_stats_public_read" ON driver_stats;
CREATE POLICY "driver_stats_public_read" ON driver_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "driver_performance_own" ON driver_performance;
CREATE POLICY "driver_performance_own" ON driver_performance FOR SELECT USING (driver_id = auth.uid());

-- driver_availability
DROP POLICY IF EXISTS "driver_availability_own" ON driver_availability;
CREATE POLICY "driver_availability_own" ON driver_availability FOR ALL USING (driver_id = auth.uid());
DROP POLICY IF EXISTS "driver_availability_public_read" ON driver_availability;
CREATE POLICY "driver_availability_public_read" ON driver_availability FOR SELECT USING (is_available = true);

-- driver_trips_summary
DROP POLICY IF EXISTS "driver_trips_summary_own" ON driver_trips_summary;
CREATE POLICY "driver_trips_summary_own" ON driver_trips_summary FOR ALL USING (driver_id = auth.uid());

-- driver_rating_breakdown
DROP POLICY IF EXISTS "driver_rating_breakdown_public_read" ON driver_rating_breakdown;
CREATE POLICY "driver_rating_breakdown_public_read" ON driver_rating_breakdown FOR SELECT USING (true);

-- driver_popular_routes
DROP POLICY IF EXISTS "driver_popular_routes_own" ON driver_popular_routes;
CREATE POLICY "driver_popular_routes_own" ON driver_popular_routes FOR ALL USING (driver_id = auth.uid());

-- driver_route_segments
DROP POLICY IF EXISTS "driver_route_segments_own" ON driver_route_segments;
CREATE POLICY "driver_route_segments_own" ON driver_route_segments FOR SELECT USING (driver_id = auth.uid());

-- user_stats / passenger_stats
DROP POLICY IF EXISTS "user_stats_own" ON user_stats;
CREATE POLICY "user_stats_own" ON user_stats FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "passenger_stats_own" ON passenger_stats;
CREATE POLICY "passenger_stats_own" ON passenger_stats FOR ALL USING (user_id = auth.uid());

-- user_onboarding
DROP POLICY IF EXISTS "user_onboarding_own" ON user_onboarding;
CREATE POLICY "user_onboarding_own" ON user_onboarding FOR ALL USING (user_id = auth.uid());

-- user_verifications
DROP POLICY IF EXISTS "user_verifications_own" ON user_verifications;
CREATE POLICY "user_verifications_own" ON user_verifications FOR SELECT USING (user_id = auth.uid());

-- user_social_stats
DROP POLICY IF EXISTS "user_social_stats_public_read" ON user_social_stats;
CREATE POLICY "user_social_stats_public_read" ON user_social_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "user_social_stats_own" ON user_social_stats;
CREATE POLICY "user_social_stats_own" ON user_social_stats FOR ALL USING (user_id = auth.uid());

-- user_activity_log
DROP POLICY IF EXISTS "user_activity_log_own" ON user_activity_log;
CREATE POLICY "user_activity_log_own" ON user_activity_log FOR SELECT USING (user_id = auth.uid());

-- blocked_users
DROP POLICY IF EXISTS "blocked_users_own" ON blocked_users;
CREATE POLICY "blocked_users_own" ON blocked_users FOR ALL USING (blocker_id = auth.uid());

-- user_2fa
DROP POLICY IF EXISTS "user_2fa_own" ON user_2fa;
CREATE POLICY "user_2fa_own" ON user_2fa FOR ALL USING (user_id = auth.uid());

-- phone_verifications / email_otps
DROP POLICY IF EXISTS "phone_verifications_own" ON phone_verifications;
CREATE POLICY "phone_verifications_own" ON phone_verifications FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "email_otps_own" ON email_otps;
CREATE POLICY "email_otps_own" ON email_otps FOR ALL USING (user_id = auth.uid());

-- ride_events
DROP POLICY IF EXISTS "ride_events_participant" ON ride_events;
CREATE POLICY "ride_events_participant" ON ride_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())));

-- ride_feedback
DROP POLICY IF EXISTS "ride_feedback_own" ON ride_feedback;
CREATE POLICY "ride_feedback_own" ON ride_feedback FOR ALL USING (user_id = auth.uid());

-- ride_waypoints / ride_checkpoints
DROP POLICY IF EXISTS "ride_waypoints_participant" ON ride_waypoints;
CREATE POLICY "ride_waypoints_participant" ON ride_waypoints FOR SELECT
  USING (EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())));
DROP POLICY IF EXISTS "ride_checkpoints_participant" ON ride_checkpoints;
CREATE POLICY "ride_checkpoints_participant" ON ride_checkpoints FOR SELECT
  USING (EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())));

-- ride_requests / ride_bids
DROP POLICY IF EXISTS "ride_requests_driver" ON ride_requests;
CREATE POLICY "ride_requests_driver" ON ride_requests FOR ALL USING (driver_id = auth.uid());
DROP POLICY IF EXISTS "ride_bids_driver" ON ride_bids;
CREATE POLICY "ride_bids_driver" ON ride_bids FOR ALL USING (driver_id = auth.uid());
DROP POLICY IF EXISTS "ride_bids_passenger_read" ON ride_bids;
CREATE POLICY "ride_bids_passenger_read" ON ride_bids FOR SELECT
  USING (EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND r.passenger_id = auth.uid()));

-- ride_history_summary
DROP POLICY IF EXISTS "ride_history_summary_own" ON ride_history_summary;
CREATE POLICY "ride_history_summary_own" ON ride_history_summary FOR ALL USING (user_id = auth.uid());

-- ride_eta_log
DROP POLICY IF EXISTS "ride_eta_log_participant" ON ride_eta_log;
CREATE POLICY "ride_eta_log_participant" ON ride_eta_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM rides r WHERE r.id = ride_id AND (r.passenger_id = auth.uid() OR r.driver_id = auth.uid())));

-- ride_offers_log
DROP POLICY IF EXISTS "ride_offers_log_driver" ON ride_offers_log;
CREATE POLICY "ride_offers_log_driver" ON ride_offers_log FOR SELECT USING (driver_id = auth.uid());

-- knowledge_base_articles (public read)
DROP POLICY IF EXISTS "knowledge_base_public_read" ON knowledge_base_articles;
CREATE POLICY "knowledge_base_public_read" ON knowledge_base_articles FOR SELECT USING (is_published = true);

-- surge_events / surge_pricing / zone_pricing / zone_availability (public read)
DROP POLICY IF EXISTS "surge_events_public_read" ON surge_events;
CREATE POLICY "surge_events_public_read" ON surge_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "surge_pricing_public_read" ON surge_pricing;
CREATE POLICY "surge_pricing_public_read" ON surge_pricing FOR SELECT USING (true);
DROP POLICY IF EXISTS "zone_pricing_public_read" ON zone_pricing;
CREATE POLICY "zone_pricing_public_read" ON zone_pricing FOR SELECT USING (true);
DROP POLICY IF EXISTS "zone_availability_public_read" ON zone_availability;
CREATE POLICY "zone_availability_public_read" ON zone_availability FOR SELECT USING (true);
DROP POLICY IF EXISTS "service_areas_public_read" ON service_areas;
CREATE POLICY "service_areas_public_read" ON service_areas FOR SELECT USING (true);
DROP POLICY IF EXISTS "popular_routes_public_read" ON popular_routes;
CREATE POLICY "popular_routes_public_read" ON popular_routes FOR SELECT USING (true);
DROP POLICY IF EXISTS "city_configurations_public_read" ON city_configurations;
CREATE POLICY "city_configurations_public_read" ON city_configurations FOR SELECT USING (true);

-- user_promotions
DROP POLICY IF EXISTS "user_promotions_own" ON user_promotions;
CREATE POLICY "user_promotions_own" ON user_promotions FOR ALL USING (user_id = auth.uid());

-- promotions / promo_banners / app_banners (public read)
DROP POLICY IF EXISTS "promotions_public_read" ON promotions;
CREATE POLICY "promotions_public_read" ON promotions FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "promo_banners_public_read" ON promo_banners;
CREATE POLICY "promo_banners_public_read" ON promo_banners FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "app_banners_public_read" ON app_banners;
CREATE POLICY "app_banners_public_read" ON app_banners FOR SELECT USING (is_active = true);

-- referral_codes
DROP POLICY IF EXISTS "referral_codes_own" ON referral_codes;
CREATE POLICY "referral_codes_own" ON referral_codes FOR ALL USING (user_id = auth.uid());

-- referral_uses
DROP POLICY IF EXISTS "referral_uses_referee" ON referral_uses;
CREATE POLICY "referral_uses_referee" ON referral_uses FOR SELECT USING (referee_id = auth.uid());

-- ab_test_participants
DROP POLICY IF EXISTS "ab_test_participants_own" ON ab_test_participants;
CREATE POLICY "ab_test_participants_own" ON ab_test_participants FOR SELECT USING (user_id = auth.uid());

-- trip_insurance
DROP POLICY IF EXISTS "trip_insurance_own" ON trip_insurance;
CREATE POLICY "trip_insurance_own" ON trip_insurance FOR ALL USING (user_id = auth.uid());

-- insurance_claims
DROP POLICY IF EXISTS "insurance_claims_own" ON insurance_claims;
CREATE POLICY "insurance_claims_own" ON insurance_claims FOR ALL USING (claimant_id = auth.uid());

-- location_history
DROP POLICY IF EXISTS "location_history_own" ON location_history;
CREATE POLICY "location_history_own" ON location_history FOR ALL USING (user_id = auth.uid());

-- address_history / address_search_history / destination_suggestions / route_history
DROP POLICY IF EXISTS "address_history_own" ON address_history;
CREATE POLICY "address_history_own" ON address_history FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "address_search_history_own" ON address_search_history;
CREATE POLICY "address_search_history_own" ON address_search_history FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "destination_suggestions_own" ON destination_suggestions;
CREATE POLICY "destination_suggestions_own" ON destination_suggestions FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "route_history_own" ON route_history;
CREATE POLICY "route_history_own" ON route_history FOR ALL USING (user_id = auth.uid());

-- trip_reports / reports
DROP POLICY IF EXISTS "trip_reports_reporter" ON trip_reports;
CREATE POLICY "trip_reports_reporter" ON trip_reports FOR ALL USING (reported_by = auth.uid());
DROP POLICY IF EXISTS "reports_reporter" ON reports;
CREATE POLICY "reports_reporter" ON reports FOR ALL USING (reporter_id = auth.uid());
DROP POLICY IF EXISTS "content_reports_reporter" ON content_reports;
CREATE POLICY "content_reports_reporter" ON content_reports FOR ALL USING (reporter_id = auth.uid());

-- recording_consents
DROP POLICY IF EXISTS "recording_consents_own" ON recording_consents;
CREATE POLICY "recording_consents_own" ON recording_consents FOR ALL USING (user_id = auth.uid());

-- live_activities
DROP POLICY IF EXISTS "live_activities_own" ON live_activities;
CREATE POLICY "live_activities_own" ON live_activities FOR ALL USING (user_id = auth.uid());

-- app_review_requests
DROP POLICY IF EXISTS "app_review_requests_own" ON app_review_requests;
CREATE POLICY "app_review_requests_own" ON app_review_requests FOR ALL USING (user_id = auth.uid());

-- emergency_records
DROP POLICY IF EXISTS "emergency_records_own" ON emergency_records;
CREATE POLICY "emergency_records_own" ON emergency_records FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- PARTE 6: REALTIME EM TODAS AS TABELAS
-- ============================================================

-- Tabelas existentes sem realtime ainda
ALTER TABLE IF EXISTS ride_cancellations REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS ride_disputes REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS ride_tips REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS driver_bonuses REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS driver_documents REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS driver_earnings REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS user_devices REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS user_preferences REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS user_sessions REPLICA IDENTITY FULL;

-- Novas tabelas criadas
ALTER TABLE IF EXISTS enhanced_reviews REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS bidirectional_reviews REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS social_likes REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS social_comments REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS social_follows REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS pix_transactions REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS family_groups REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS family_group_members REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS emergency_events REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS sos_alerts REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS driver_availability REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS driver_trips_summary REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS driver_rating_breakdown REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS live_activities REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS ride_events REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS ride_bids REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS loyalty_points REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS user_stats REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS user_social_stats REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS zone_availability REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS surge_events REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS notification_batches REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS admin_notifications REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS support_ticket_messages REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS user_onboarding REPLICA IDENTITY FULL;

-- Adicionar todas na publicacao do Realtime
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'ride_cancellations','ride_disputes','ride_tips','driver_bonuses','driver_documents',
    'driver_earnings','user_devices','user_preferences','user_sessions',
    'enhanced_reviews','bidirectional_reviews','social_likes','social_comments','social_follows',
    'pix_transactions','family_groups','family_group_members','emergency_events','sos_alerts',
    'driver_availability','driver_trips_summary','driver_rating_breakdown','live_activities',
    'ride_events','ride_bids','loyalty_points','user_stats','user_social_stats',
    'zone_availability','surge_events','notification_batches','admin_notifications',
    'support_ticket_messages','user_onboarding','intercity_rides','intercity_bookings',
    'payment_disputes','cashback_transactions','vehicles','driver_stats','driver_performance',
    'user_verifications','ride_feedback','ride_waypoints','ride_history_summary',
    'ride_eta_log','trip_insurance','insurance_claims','location_history','route_history',
    'reports','trip_reports','recording_consents','app_review_requests','emergency_records',
    'user_2fa','blocked_users','user_badges','driver_achievements','passenger_achievements',
    'loyalty_transactions','fraud_flags','driver_incentives','referral_uses','user_promotions',
    'ride_requests','ride_offers_log','address_history','destination_suggestions'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    END IF;
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignora se ja existir
END $$;

-- ============================================================
-- PARTE 7: SEED DE DADOS INICIAIS
-- ============================================================

-- Subscription Plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, max_rides_per_month, discount_percentage, is_active)
VALUES 
  ('Basico', 'basico', 'Plano gratuito para passageiros', 0, 0, '["Corridas ilimitadas","Suporte basico"]', NULL, 0, true),
  ('Plus', 'plus', 'Plano premium com descontos', 19.90, 199.90, '["5% desconto em corridas","Suporte prioritario","Sem taxa de cancelamento"]', NULL, 5, true),
  ('Pro', 'pro', 'Plano profissional para motoristas', 39.90, 399.90, '["10% bonus em corridas","Suporte 24h","Dashboard avancado","Relatorio fiscal"]', NULL, 10, true)
ON CONFLICT (slug) DO NOTHING;

-- Review Categories
INSERT INTO review_categories (name, label, icon, user_type, is_active, order_index)
VALUES
  ('punctuality', 'Pontualidade', 'clock', 'driver', true, 1),
  ('cleanliness', 'Limpeza', 'sparkles', 'driver', true, 2),
  ('safety', 'Seguranca', 'shield', 'driver', true, 3),
  ('friendliness', 'Simpatia', 'smile', 'both', true, 4),
  ('communication', 'Comunicacao', 'message', 'both', true, 5),
  ('navigation', 'Rota', 'map', 'driver', true, 6),
  ('behavior', 'Comportamento', 'user', 'passenger', true, 7),
  ('payment', 'Pagamento', 'credit-card', 'passenger', true, 8)
ON CONFLICT DO NOTHING;

-- Loyalty Tiers
INSERT INTO loyalty_tiers (name, label, min_points, benefits, color)
VALUES
  ('bronze', 'Bronze', 0, '["5% desconto"]', '#CD7F32'),
  ('silver', 'Prata', 500, '["8% desconto","Suporte prioritario"]', '#C0C0C0'),
  ('gold', 'Ouro', 1500, '["12% desconto","Suporte 24h","Corridas gratuitas mensais"]', '#FFD700'),
  ('platinum', 'Platina', 5000, '["15% desconto","Suporte VIP","Motorista dedicado"]', '#E5E4E2')
ON CONFLICT DO NOTHING;

-- Driver Level Config
INSERT INTO driver_level_config (level, name, min_rides, min_rating, benefits)
VALUES
  (1, 'Iniciante', 0, 0, '["Acesso basico"]'),
  (2, 'Bronze', 50, 4.0, '["Bonus de 2%"]'),
  (3, 'Prata', 150, 4.3, '["Bonus de 4%","Prioridade em corridas"]'),
  (4, 'Ouro', 400, 4.6, '["Bonus de 6%","Suporte prioritario"]'),
  (5, 'Platina', 1000, 4.8, '["Bonus de 10%","Motorista destaque"]')
ON CONFLICT (level) DO NOTHING;

-- Vehicle Categories
INSERT INTO vehicle_categories (name, label, base_fare, per_km_rate, per_minute_rate, min_fare, max_passengers, is_active)
VALUES
  ('economy', 'Economy', 3.00, 1.80, 0.30, 7.00, 4, true),
  ('premium', 'Premium', 6.00, 2.80, 0.50, 12.00, 4, true),
  ('suv', 'SUV', 8.00, 3.50, 0.60, 15.00, 6, true),
  ('moto', 'Moto', 2.00, 1.20, 0.20, 5.00, 1, true),
  ('van', 'Van', 10.00, 4.00, 0.70, 20.00, 8, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- PARTE 8: INDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_enhanced_reviews_reviewer ON enhanced_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_reviews_reviewed ON enhanced_reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_reviews_ride ON enhanced_reviews(ride_id);
CREATE INDEX IF NOT EXISTS idx_bidirectional_reviews_ride ON bidirectional_reviews(ride_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_post ON social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_follower ON social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_following ON social_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_user ON pix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_status ON pix_transactions(status);
CREATE INDEX IF NOT EXISTS idx_family_group_members_group ON family_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_user ON family_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user ON emergency_events(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_status ON emergency_events(status);
CREATE INDEX IF NOT EXISTS idx_driver_availability_available ON driver_availability(is_available);
CREATE INDEX IF NOT EXISTS idx_driver_trips_summary_driver ON driver_trips_summary(driver_id, period_date);
CREATE INDEX IF NOT EXISTS idx_live_activities_user ON live_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_live_activities_ride ON live_activities(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_events_ride ON ride_events(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_bids_ride ON ride_bids(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_bids_driver ON ride_bids(driver_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_user ON location_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_history_user ON route_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_history_summary_user ON ride_history_summary(user_id, period_date);
CREATE INDEX IF NOT EXISTS idx_address_history_user ON address_history(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_driver ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_stats_driver ON driver_stats(driver_id);
CREATE INDEX IF NOT EXISTS idx_surge_events_active ON surge_events(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_user_promotions_user ON user_promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_ab_test_participants_user ON ab_test_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_user ON fraud_flags(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_key ON api_usage_logs(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_destination_suggestions_user ON destination_suggestions(user_id);

-- ============================================================
-- VERIFICACAO FINAL
-- ============================================================

SELECT 
  COUNT(*) as total_tabelas,
  SUM(CASE WHEN rowsecurity = true THEN 1 ELSE 0 END) as com_rls,
  SUM(CASE WHEN rowsecurity = false THEN 1 ELSE 0 END) as sem_rls
FROM pg_tables
WHERE schemaname = 'public';
