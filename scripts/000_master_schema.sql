-- =============================================================================
-- XUPETINHA — SQL MASTER CONSOLIDADO
-- Gerado em: 2026-03-17
-- Versão do banco: migrations 001–015 aplicadas
-- Este arquivo recria o schema completo do zero em qualquer instância Postgres/Supabase
-- =============================================================================
-- Execute na ordem:
--   1. Extensões
--   2. Funções auxiliares
--   3. Tabelas (sem FK)
--   4. Tabelas dependentes
--   5. Constraints / FKs
--   6. Índices de performance
--   7. Índices de FK (performance)
--   8. Triggers
--   9. RLS (enable + policies)
--  10. Realtime publications
--  11. Trigger auth.users → handle_new_user
-- =============================================================================

-- =============================================================================
-- PARTE 1 — EXTENSÕES
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- PARTE 2 — FUNÇÕES AUXILIARES (sem dependência de tabelas)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substring(md5(NEW.id::text || now()::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_driver()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT is_verified FROM driver_profiles WHERE user_id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.log_failed_login()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- =============================================================================
-- PARTE 3 — TABELAS BASE (sem dependência de outras tabelas do schema)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  cpf text,
  birth_date date,
  bio text,
  user_type text DEFAULT 'passenger',
  current_mode text DEFAULT 'passenger',
  rating numeric DEFAULT 5.0,
  total_rides integer DEFAULT 0,
  total_saved numeric DEFAULT 0,
  referral_code text UNIQUE,
  referred_by text,
  fcm_token text,
  preferences jsonb DEFAULT '{}',
  status text DEFAULT 'active',
  is_admin boolean DEFAULT false,
  is_banned boolean DEFAULT false,
  banned_at timestamptz,
  ban_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text,
  description text,
  icon text,
  base_price numeric DEFAULT 5.0,
  price_per_km numeric DEFAULT 1.5,
  price_per_minute numeric DEFAULT 0.3,
  min_price numeric DEFAULT 8.0,
  max_passengers integer DEFAULT 4,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text,
  description text,
  icon text,
  multiplier numeric DEFAULT 1.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accessibility_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text,
  category text,
  criteria jsonb DEFAULT '{}',
  points integer DEFAULT 0,
  reward_type text,
  reward_value numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  category text,
  criteria jsonb DEFAULT '{}',
  points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text DEFAULT 'rides',
  target_value numeric NOT NULL,
  reward_type text DEFAULT 'points',
  reward_value numeric NOT NULL,
  icon text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text DEFAULT 'discount',
  value numeric,
  points_cost integer NOT NULL,
  image_url text,
  stock integer,
  redeemed_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  max_discount numeric,
  min_ride_value numeric,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text DEFAULT 'discount',
  discount_type text DEFAULT 'percentage',
  discount_value numeric,
  max_discount numeric,
  min_ride_value numeric,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  target_users text DEFAULT 'all',
  target_conditions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  billing_period text DEFAULT 'monthly',
  features jsonb DEFAULT '[]',
  discount_percentage numeric DEFAULT 0,
  max_rides integer,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.corporate_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  cnpj text UNIQUE,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  logo_url text,
  monthly_budget numeric,
  monthly_spent numeric DEFAULT 0,
  discount_percentage numeric DEFAULT 0,
  payment_terms text DEFAULT 'monthly',
  status text DEFAULT 'active',
  contract_start date,
  contract_end date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'business',
  contact_name text,
  contact_email text,
  contact_phone text,
  logo_url text,
  description text,
  website text,
  commission_rate numeric DEFAULT 0,
  status text DEFAULT 'active',
  contract_start date,
  contract_end date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.city_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text,
  config jsonb DEFAULT '{}',
  base_price numeric DEFAULT 5.0,
  price_per_km numeric DEFAULT 1.5,
  price_per_minute numeric DEFAULT 0.3,
  min_price numeric DEFAULT 8.0,
  max_radius_km numeric DEFAULT 50,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.city_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text,
  boundaries jsonb DEFAULT '{}',
  surge_multiplier numeric DEFAULT 1.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.geographic_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text,
  boundaries jsonb DEFAULT '{}',
  center_lat numeric,
  center_lng numeric,
  radius_km numeric,
  rules jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hot_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  radius_meters numeric DEFAULT 1000,
  intensity numeric DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.geo_fences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'restricted',
  boundaries jsonb NOT NULL,
  rules jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  state text,
  country text DEFAULT 'BR',
  center_lat numeric,
  center_lng numeric,
  radius_km numeric DEFAULT 50,
  is_active boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  city text,
  state text,
  latitude numeric,
  longitude numeric,
  pickup_instructions text,
  special_rules jsonb DEFAULT '{}',
  surcharge numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text,
  latitude numeric,
  longitude numeric,
  event_date timestamptz,
  expected_demand text DEFAULT 'normal',
  surge_config jsonb DEFAULT '{}',
  pickup_instructions text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  provider text,
  coverage_type text,
  coverage_amount numeric,
  premium_amount numeric,
  deductible_amount numeric,
  terms_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_level_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_name text NOT NULL,
  min_rides integer DEFAULT 0,
  min_rating numeric DEFAULT 0,
  commission_rate numeric DEFAULT 0.20,
  benefits jsonb DEFAULT '[]',
  icon text,
  color text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  rule_type text,
  conditions jsonb DEFAULT '{}',
  multiplier numeric DEFAULT 1.0,
  fixed_amount numeric,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.taxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rate numeric NOT NULL,
  type text DEFAULT 'percentage',
  applies_to text DEFAULT 'all',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cashback_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  percentage numeric DEFAULT 0,
  max_amount numeric,
  min_ride_value numeric,
  ride_type text,
  payment_method text,
  is_active boolean DEFAULT true,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_enabled boolean DEFAULT false,
  rollout_percentage numeric DEFAULT 0,
  conditions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  category text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  type text DEFAULT 'string',
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  version text NOT NULL,
  build_number integer,
  min_required_version text,
  force_update boolean DEFAULT false,
  release_notes text,
  download_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  target_audience text DEFAULT 'all',
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.maintenance_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  affected_services text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  version text NOT NULL,
  is_current boolean DEFAULT true,
  effective_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.terms_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  version text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_current boolean DEFAULT false,
  effective_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  sort_order integer DEFAULT 0,
  user_type text DEFAULT 'all',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  action_url text,
  action_type text,
  target_screen text,
  position text DEFAULT 'home',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.in_app_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'banner',
  action_text text,
  action_url text,
  image_url text,
  target_audience text DEFAULT 'all',
  priority integer DEFAULT 0,
  max_impressions integer DEFAULT 1,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title_template text NOT NULL,
  body_template text NOT NULL,
  type text,
  channel text DEFAULT 'push',
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  body text NOT NULL,
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.predefined_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  type text DEFAULT 'passenger',
  category text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_base_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text,
  tags text[] DEFAULT '{}',
  views_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  is_published boolean DEFAULT true,
  author_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feedback_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ip_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  reason text,
  blocked_by uuid,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  failure_reason text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 0,
  window_start timestamptz DEFAULT now(),
  window_size_seconds integer DEFAULT 60,
  max_requests integer DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.popular_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_address text NOT NULL,
  start_latitude numeric,
  start_longitude numeric,
  end_address text NOT NULL,
  end_latitude numeric,
  end_longitude numeric,
  avg_price numeric,
  avg_duration numeric,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_rides integer DEFAULT 0,
  completed_rides integer DEFAULT 0,
  cancelled_rides integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  total_commission numeric DEFAULT 0,
  avg_ride_price numeric DEFAULT 0,
  avg_ride_distance numeric DEFAULT 0,
  avg_ride_duration numeric DEFAULT 0,
  new_passengers integer DEFAULT 0,
  new_drivers integer DEFAULT 0,
  active_passengers integer DEFAULT 0,
  active_drivers integer DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  surge_rides integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_hourly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  hour integer NOT NULL,
  total_rides integer DEFAULT 0,
  active_drivers integer DEFAULT 0,
  active_passengers integer DEFAULT 0,
  avg_wait_time numeric DEFAULT 0,
  avg_surge numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, hour)
);

CREATE TABLE IF NOT EXISTS public.financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type text DEFAULT 'monthly',
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_revenue numeric DEFAULT 0,
  total_commission numeric DEFAULT 0,
  total_payouts numeric DEFAULT 0,
  total_refunds numeric DEFAULT 0,
  total_cashback numeric DEFAULT 0,
  net_revenue numeric DEFAULT 0,
  total_rides integer DEFAULT 0,
  data jsonb DEFAULT '{}',
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  hypothesis text,
  type text DEFAULT 'ab_test',
  variants jsonb DEFAULT '[]',
  traffic_percentage numeric DEFAULT 100,
  status text DEFAULT 'draft',
  started_at timestamptz,
  ended_at timestamptz,
  results jsonb,
  winner_variant text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text,
  target_audience jsonb DEFAULT '{}',
  content jsonb DEFAULT '{}',
  status text DEFAULT 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  budget numeric,
  spent numeric DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text,
  path text,
  status_code integer,
  user_id uuid,
  ip_address text,
  user_agent text,
  request_body jsonb,
  response_time_ms numeric,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  error_type text,
  message text,
  stack text,
  context jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text DEFAULT 'info',
  message text NOT NULL,
  source text,
  metadata jsonb DEFAULT '{}',
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text,
  payload jsonb,
  status text DEFAULT 'received',
  response_code integer,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- PARTE 4 — TABELAS DEPENDENTES DE PROFILES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0,
  pending_balance numeric DEFAULT 0,
  total_earned numeric DEFAULT 0,
  total_spent numeric DEFAULT 0,
  total_withdrawn numeric DEFAULT 0,
  currency text DEFAULT 'BRL',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  language text DEFAULT 'pt-BR',
  theme text DEFAULT 'light',
  push_notifications boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  ride_alerts boolean DEFAULT true,
  promo_notifications boolean DEFAULT true,
  sound_enabled boolean DEFAULT true,
  vibration_enabled boolean DEFAULT true,
  location_sharing boolean DEFAULT true,
  share_eta boolean DEFAULT true,
  auto_tip boolean DEFAULT false,
  default_tip_percentage numeric DEFAULT 0,
  preferred_payment text DEFAULT 'pix',
  accessibility_mode boolean DEFAULT false,
  font_size text DEFAULT 'medium',
  high_contrast boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  current_points integer DEFAULT 0,
  level text DEFAULT 'bronze',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_updates boolean DEFAULT true,
  promotions boolean DEFAULT true,
  social boolean DEFAULT true,
  safety boolean DEFAULT true,
  payments boolean DEFAULT true,
  system boolean DEFAULT true,
  marketing boolean DEFAULT false,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  push_enabled boolean DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number text,
  license_expiry date,
  license_category text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_color text,
  vehicle_plate text,
  vehicle_type text DEFAULT 'standard',
  vehicle_category text DEFAULT 'economy',
  cnh_url text,
  crlv_url text,
  vehicle_photo_url text,
  insurance_url text,
  background_check_url text,
  is_verified boolean DEFAULT false,
  is_online boolean DEFAULT false,
  is_available boolean DEFAULT false,
  current_lat numeric,
  current_lng numeric,
  current_heading numeric,
  last_location_update timestamptz,
  acceptance_rate numeric DEFAULT 100,
  cancellation_rate numeric DEFAULT 0,
  total_trips integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  level text DEFAULT 'bronze',
  commission_rate numeric DEFAULT 0.20,
  documents_status text DEFAULT 'pending',
  status text DEFAULT 'pending',
  approved_at timestamptz,
  approved_by uuid,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_rides integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  avg_rating numeric DEFAULT 5.0,
  acceptance_rate numeric DEFAULT 100,
  cancellation_rate numeric DEFAULT 0,
  online_hours numeric DEFAULT 0,
  completion_rate numeric DEFAULT 100,
  period text DEFAULT 'all_time',
  last_calculated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  heading numeric,
  speed numeric,
  accuracy numeric,
  is_online boolean DEFAULT false,
  is_available boolean DEFAULT false,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_fiscal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  cpf text,
  cnpj text,
  mei_registered boolean DEFAULT false,
  tax_regime text DEFAULT 'mei',
  monthly_income_limit numeric DEFAULT 81000,
  annual_income numeric DEFAULT 0,
  monthly_income numeric DEFAULT 0,
  nfse_enabled boolean DEFAULT false,
  last_nfse_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_payout_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  auto_payout boolean DEFAULT false,
  payout_frequency text DEFAULT 'weekly',
  min_payout_amount numeric DEFAULT 50,
  pix_key text,
  pix_key_type text,
  bank_name text,
  bank_agency text,
  bank_account text,
  bank_account_type text DEFAULT 'checking',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.admin_roles(id),
  role text DEFAULT 'viewer',
  permissions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  invited_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_2fa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT false,
  method text DEFAULT 'email',
  secret_encrypted text,
  backup_codes_encrypted text,
  last_verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_info jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id text,
  device_name text,
  platform text,
  os_version text,
  app_version text,
  fcm_token text,
  is_active boolean DEFAULT true,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text DEFAULT 'pending',
  document_url text,
  selfie_url text,
  verified_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id),
  rejection_reason text,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  document_url text NOT NULL,
  status text DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id),
  rejection_reason text,
  expires_at date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  complement text,
  reference text,
  is_favorite boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  token text NOT NULL,
  device_type text,
  device_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  label text,
  is_default boolean DEFAULT false,
  pix_key text,
  pix_key_type text,
  card_last_four text,
  card_brand text,
  card_token text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pix_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_type text NOT NULL,
  key_value text NOT NULL,
  is_primary boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.email_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp text NOT NULL,
  used boolean DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text,
  is_primary boolean DEFAULT false,
  notify_on_ride boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

CREATE TABLE IF NOT EXISTS public.favorite_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  icon text DEFAULT 'star',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  pickup_address text,
  pickup_lat numeric,
  pickup_lng numeric,
  dropoff_address text,
  dropoff_lat numeric,
  dropoff_lng numeric,
  waypoints jsonb DEFAULT '[]',
  is_favorite boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text,
  media_urls text[] DEFAULT '{}',
  media_type text DEFAULT 'text',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  visibility text DEFAULT 'public',
  is_pinned boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress numeric DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress numeric DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id uuid REFERENCES public.rewards(id),
  points_spent integer NOT NULL,
  status text DEFAULT 'redeemed',
  code text UNIQUE,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE,
  is_used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, coupon_id)
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.subscription_plans(id),
  status text DEFAULT 'active',
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  cancelled_at timestamptz,
  rides_used integer DEFAULT 0,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text DEFAULT 'weekly',
  period text,
  score numeric DEFAULT 0,
  rank integer,
  rides_count integer DEFAULT 0,
  savings_amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  current_streak integer DEFAULT 0,
  max_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, type)
);

CREATE TABLE IF NOT EXISTS public.points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL,
  description text,
  reference_id uuid,
  reference_type text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  reward_amount numeric DEFAULT 0,
  reward_paid boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  monthly_budget numeric,
  monthly_spent numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  spending_limit numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.corporate_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id uuid REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id text,
  department text,
  ride_limit numeric,
  rides_used integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(corporate_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.corporate_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id uuid REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  rules jsonb DEFAULT '{}',
  max_price_per_ride numeric,
  allowed_hours jsonb,
  allowed_days integer[] DEFAULT '{1,2,3,4,5}',
  require_justification boolean DEFAULT false,
  require_approval boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.corporate_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id uuid REFERENCES public.corporate_accounts(id) ON DELETE CASCADE,
  invoice_number text UNIQUE,
  period_start date,
  period_end date,
  total_rides integer DEFAULT 0,
  total_amount numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  final_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  due_date date,
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partner_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid REFERENCES public.partners(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  discount_type text DEFAULT 'percentage',
  discount_value numeric,
  coupon_code text,
  image_url text,
  terms text,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  redemptions_count integer DEFAULT 0,
  max_redemptions integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ride_id uuid,
  subject text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'general',
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES public.profiles(id),
  resolution text,
  resolved_at timestamptz,
  satisfaction_rating numeric,
  satisfaction_comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id),
  message text NOT NULL,
  type text DEFAULT 'text',
  media_url text,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.feedback_categories(id),
  type text DEFAULT 'general',
  subject text,
  message text NOT NULL,
  rating numeric,
  status text DEFAULT 'pending',
  response text,
  responded_by uuid REFERENCES public.profiles(id),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  screen text,
  type text DEFAULT 'bug',
  message text NOT NULL,
  app_version text,
  device_info jsonb DEFAULT '{}',
  screenshot_url text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  format text DEFAULT 'json',
  download_url text,
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason text,
  status text DEFAULT 'pending',
  scheduled_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  terms_id uuid REFERENCES public.terms_versions(id),
  accepted_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  UNIQUE(user_id, terms_id)
);

CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text DEFAULT 'general',
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.push_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text,
  body text,
  data jsonb DEFAULT '{}',
  status text DEFAULT 'sent',
  error_message text,
  fcm_response jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL,
  description text,
  severity text DEFAULT 'medium',
  evidence jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  action_taken text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  type text DEFAULT 'general',
  target_audience text DEFAULT 'all',
  target_conditions jsonb DEFAULT '{}',
  data jsonb DEFAULT '{}',
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'scheduled',
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.in_app_message_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.in_app_messages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_taken boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  viewed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.experiment_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES public.experiments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  variant text NOT NULL,
  converted boolean DEFAULT false,
  conversion_data jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(experiment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id uuid,
  reason text NOT NULL,
  description text,
  evidence_urls text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  action_taken text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id uuid,
  type text NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'medium',
  evidence_urls text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  investigation_notes text,
  action_taken text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  document_url text NOT NULL,
  status text DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id),
  rejection_reason text,
  expires_at date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_compliance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text DEFAULT 'pending',
  document_url text,
  verified_at timestamptz,
  expires_at date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  make text NOT NULL,
  model text NOT NULL,
  year integer,
  color text,
  plate text NOT NULL,
  category_id uuid REFERENCES public.vehicle_categories(id),
  type_id uuid REFERENCES public.vehicle_types(id),
  photo_url text,
  crlv_url text,
  insurance_url text,
  is_primary boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week integer,
  start_time time,
  end_time time,
  zone_id uuid REFERENCES public.city_zones(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES public.city_zones(id),
  is_preferred boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, zone_id)
);

CREATE TABLE IF NOT EXISTS public.driver_accessibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_id uuid REFERENCES public.accessibility_features(id) ON DELETE CASCADE,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, feature_id)
);

CREATE TABLE IF NOT EXISTS public.driver_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_breaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_minutes numeric,
  type text DEFAULT 'voluntary',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  reason text NOT NULL,
  severity text DEFAULT 'warning',
  points_deducted integer DEFAULT 0,
  suspension_until timestamptz,
  is_active boolean DEFAULT true,
  applied_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  period text DEFAULT 'weekly',
  period_date date,
  rank integer,
  score numeric DEFAULT 0,
  rides_count integer DEFAULT 0,
  earnings numeric DEFAULT 0,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, period, period_date)
);

CREATE TABLE IF NOT EXISTS public.driver_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  passenger_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id uuid,
  rating numeric NOT NULL,
  comment text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  passenger_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id uuid,
  rating numeric NOT NULL,
  comment text,
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric DEFAULT 0,
  period text DEFAULT 'daily',
  period_date date,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  reward_amount numeric,
  status text DEFAULT 'active',
  starts_at timestamptz,
  ends_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content_url text,
  type text DEFAULT 'video',
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  score numeric,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_performance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_type text DEFAULT 'weekly',
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_rides integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  acceptance_rate numeric DEFAULT 0,
  cancellation_rate numeric DEFAULT 0,
  online_hours numeric DEFAULT 0,
  peak_hours_rides integer DEFAULT 0,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.favorite_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, driver_id)
);

-- =============================================================================
-- PARTE 5 — TABELAS DE CORRIDAS E FINANCEIRO
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid REFERENCES public.profiles(id),
  driver_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending',
  ride_type text DEFAULT 'standard',
  vehicle_category text DEFAULT 'economy',
  pickup_address text,
  pickup_latitude numeric,
  pickup_longitude numeric,
  dropoff_address text,
  dropoff_latitude numeric,
  dropoff_longitude numeric,
  waypoints jsonb DEFAULT '[]',
  distance_km numeric,
  duration_minutes numeric,
  estimated_price numeric,
  final_price numeric,
  passenger_price numeric,
  driver_price numeric,
  surge_multiplier numeric DEFAULT 1.0,
  commission_rate numeric DEFAULT 0.20,
  commission_amount numeric DEFAULT 0,
  payment_method text DEFAULT 'pix',
  payment_status text DEFAULT 'pending',
  coupon_id uuid REFERENCES public.coupons(id),
  coupon_discount numeric DEFAULT 0,
  rating_passenger numeric,
  rating_driver numeric,
  comment_passenger text,
  comment_driver text,
  cancel_reason text,
  cancelled_by text,
  cancelled_at timestamptz,
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  route_polyline text,
  actual_route_polyline text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id),
  payer_id uuid REFERENCES public.profiles(id),
  payee_id uuid REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  currency text DEFAULT 'BRL',
  method text DEFAULT 'pix',
  status text DEFAULT 'pending',
  gateway text DEFAULT 'pix_paradise',
  gateway_id text,
  gateway_response jsonb,
  pix_code text,
  pix_qr_code text,
  pix_expiry timestamptz,
  description text,
  metadata jsonb DEFAULT '{}',
  paid_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  refund_amount numeric,
  refund_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  type text DEFAULT 'ride',
  description text,
  ride_id uuid REFERENCES public.rides(id),
  period_start timestamptz,
  period_end timestamptz,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  type text NOT NULL,
  amount numeric NOT NULL,
  balance_before numeric,
  balance_after numeric,
  description text,
  reference_id uuid,
  reference_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  wallet_id uuid REFERENCES public.wallets(id),
  amount numeric NOT NULL,
  fee numeric DEFAULT 0,
  net_amount numeric NOT NULL,
  method text DEFAULT 'pix',
  pix_key text,
  pix_key_type text,
  bank_name text,
  bank_agency text,
  bank_account text,
  status text DEFAULT 'pending',
  processed_at timestamptz,
  failed_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES public.payments(id),
  ride_id uuid REFERENCES public.rides(id),
  user_id uuid REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  processed_at timestamptz,
  processed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  payment_id uuid REFERENCES public.payments(id),
  invoice_number text UNIQUE,
  amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status text DEFAULT 'issued',
  issued_at timestamptz DEFAULT now(),
  due_at timestamptz,
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES public.payments(id),
  user_id uuid REFERENCES public.profiles(id),
  reason text NOT NULL,
  description text,
  evidence_urls text[] DEFAULT '{}',
  amount numeric,
  status text DEFAULT 'open',
  resolution text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_type text,
  payment_id uuid REFERENCES public.payments(id),
  payload jsonb NOT NULL,
  status text DEFAULT 'received',
  processed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id),
  amount numeric NOT NULL,
  type text DEFAULT 'commission',
  description text,
  period_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  gross_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  net_amount numeric NOT NULL,
  period_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cashback_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  rule_id uuid REFERENCES public.cashback_rules(id),
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  credited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promotion_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id uuid REFERENCES public.promotions(id),
  user_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  discount_amount numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id),
  passenger_id uuid REFERENCES public.profiles(id),
  driver_id uuid REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_nfse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  nfse_number text,
  amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  xml_url text,
  pdf_url text,
  issued_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabelas de corrida (detalhe)
CREATE TABLE IF NOT EXISTS public.ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending',
  response_time numeric,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.profiles(id),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  heading numeric,
  speed numeric,
  accuracy numeric,
  event_type text DEFAULT 'location',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  rater_id uuid REFERENCES public.profiles(id),
  rated_id uuid REFERENCES public.profiles(id),
  rating numeric NOT NULL,
  comment text,
  tags text[] DEFAULT '{}',
  type text DEFAULT 'passenger_to_driver',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.passenger_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid REFERENCES public.profiles(id),
  driver_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  rating numeric NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_cancellations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  cancelled_by uuid REFERENCES public.profiles(id),
  reason text,
  reason_category text,
  fee_amount numeric DEFAULT 0,
  fee_charged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES public.profiles(id),
  type text NOT NULL,
  description text,
  severity text DEFAULT 'low',
  status text DEFAULT 'open',
  resolution text,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  type text NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'medium',
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES public.profiles(id),
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  sort_order integer DEFAULT 0,
  arrived_at timestamptz,
  departed_at timestamptz,
  wait_time_minutes numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_waypoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  sort_order integer DEFAULT 0,
  arrived_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid UNIQUE REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id uuid REFERENCES public.profiles(id),
  receipt_number text UNIQUE,
  base_fare numeric,
  distance_fare numeric,
  time_fare numeric,
  surge_fare numeric DEFAULT 0,
  toll_fare numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  tip numeric DEFAULT 0,
  total numeric NOT NULL,
  payment_method text,
  pdf_url text,
  sent_email boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id),
  message text NOT NULL,
  type text DEFAULT 'text',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  share_code text NOT NULL UNIQUE,
  recipient_name text,
  recipient_phone text,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  views_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  recorded_by uuid REFERENCES public.profiles(id),
  audio_url text,
  duration_seconds numeric,
  is_emergency boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_tolls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  toll_name text,
  amount numeric NOT NULL,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.safety_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'safe',
  latitude numeric,
  longitude numeric,
  message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  type text DEFAULT 'sos',
  latitude numeric,
  longitude numeric,
  status text DEFAULT 'active',
  message text,
  contacted_authorities boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_accessibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  feature_id uuid REFERENCES public.accessibility_features(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  pickup_address text,
  pickup_lat numeric,
  pickup_lng numeric,
  dropoff_address text,
  dropoff_lat numeric,
  dropoff_lng numeric,
  distance_km numeric,
  duration_minutes numeric,
  estimated_price numeric,
  surge_multiplier numeric DEFAULT 1.0,
  vehicle_category text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_insurance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  policy_id uuid REFERENCES public.insurance_policies(id),
  status text DEFAULT 'active',
  premium_charged numeric,
  claim_amount numeric,
  claim_status text,
  claim_description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_history_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  period text DEFAULT 'monthly',
  period_date date NOT NULL,
  total_rides integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  total_saved numeric DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  favorite_route text,
  most_used_category text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period, period_date)
);

CREATE TABLE IF NOT EXISTS public.price_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.profiles(id),
  offered_price numeric NOT NULL,
  status text DEFAULT 'pending',
  counter_price numeric,
  message text,
  eta_minutes numeric,
  distance_km numeric,
  responded_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.price_negotiations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id uuid REFERENCES public.profiles(id),
  driver_id uuid REFERENCES public.profiles(id),
  initial_price numeric,
  passenger_price numeric,
  driver_price numeric,
  final_price numeric,
  status text DEFAULT 'negotiating',
  rounds integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delivery_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id),
  recipient_name text,
  recipient_phone text,
  package_description text,
  package_size text DEFAULT 'small',
  package_weight numeric,
  requires_signature boolean DEFAULT false,
  delivery_instructions text,
  pickup_photo_url text,
  delivery_photo_url text,
  signature_url text,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scheduled_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid REFERENCES public.profiles(id),
  pickup_address text NOT NULL,
  pickup_latitude numeric,
  pickup_longitude numeric,
  dropoff_address text NOT NULL,
  dropoff_latitude numeric,
  dropoff_longitude numeric,
  scheduled_at timestamptz NOT NULL,
  vehicle_category text DEFAULT 'economy',
  estimated_price numeric,
  max_price numeric,
  status text DEFAULT 'scheduled',
  ride_id uuid REFERENCES public.rides(id),
  notes text,
  is_recurring boolean DEFAULT false,
  recurrence_pattern jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'open',
  max_passengers integer DEFAULT 3,
  current_passengers integer DEFAULT 0,
  route_polyline text,
  estimated_savings_percent numeric DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_pool_passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES public.ride_pools(id) ON DELETE CASCADE,
  passenger_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  pickup_address text,
  pickup_lat numeric,
  pickup_lng numeric,
  dropoff_address text,
  dropoff_lat numeric,
  dropoff_lng numeric,
  price numeric,
  status text DEFAULT 'active',
  pickup_order integer,
  dropoff_order integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.profiles(id),
  receiver_id uuid REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  content text,
  type text DEFAULT 'text',
  media_url text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id uuid REFERENCES public.profiles(id),
  driver_id uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id),
  content text NOT NULL,
  type text DEFAULT 'text',
  media_url text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Social
CREATE TABLE IF NOT EXISTS public.social_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.social_comments(id),
  content text NOT NULL,
  likes_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.social_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE,
  platform text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.social_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.social_comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  resolution text,
  created_at timestamptz DEFAULT now()
);

-- Zonas / surge
CREATE TABLE IF NOT EXISTS public.surge_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.city_zones(id),
  multiplier numeric DEFAULT 1.0,
  demand_level text DEFAULT 'normal',
  active_drivers integer DEFAULT 0,
  pending_rides integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.surge_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.city_zones(id),
  multiplier numeric,
  demand_level text,
  active_drivers integer,
  pending_rides integer,
  recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.traffic_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.city_zones(id),
  congestion_level text DEFAULT 'normal',
  avg_speed_kmh numeric,
  delay_minutes numeric DEFAULT 0,
  affected_routes jsonb DEFAULT '[]',
  recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.weather_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.city_zones(id),
  condition text NOT NULL,
  temperature numeric,
  precipitation numeric,
  visibility numeric,
  surge_adjustment numeric DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.city_zones(id),
  date date NOT NULL,
  total_rides integer DEFAULT 0,
  avg_price numeric DEFAULT 0,
  avg_wait_time numeric DEFAULT 0,
  supply_demand_ratio numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(zone_id, date)
);

-- Corporate
CREATE TABLE IF NOT EXISTS public.corporate_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id uuid REFERENCES public.corporate_accounts(id),
  ride_id uuid REFERENCES public.rides(id),
  employee_id uuid REFERENCES public.profiles(id),
  department text,
  cost_center text,
  justification text,
  approved boolean DEFAULT true,
  approved_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Vehicle inspections
CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.driver_vehicles(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.profiles(id),
  inspector_id uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending',
  inspection_date date,
  expiry_date date,
  checklist jsonb DEFAULT '{}',
  notes text,
  photos text[] DEFAULT '{}',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- PARTE 6 — ÍNDICES DE PERFORMANCE (tabelas críticas)
-- =============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;

-- driver_profiles
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON public.driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_status ON public.driver_profiles(status);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_vehicle_category ON public.driver_profiles(vehicle_category);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_is_online ON public.driver_profiles(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_driver_profiles_is_available ON public.driver_profiles(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_driver_profiles_level ON public.driver_profiles(level);

-- driver_locations
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON public.driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_online ON public.driver_locations(is_online, is_available);
CREATE INDEX IF NOT EXISTS idx_driver_locations_coords ON public.driver_locations(latitude, longitude);

-- rides
CREATE INDEX IF NOT EXISTS idx_rides_passenger_id ON public.rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON public.rides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_vehicle_category ON public.rides(vehicle_category);
CREATE INDEX IF NOT EXISTS idx_rides_payment_status ON public.rides(payment_status);
CREATE INDEX IF NOT EXISTS idx_rides_pickup_coords ON public.rides(pickup_latitude, pickup_longitude);
CREATE INDEX IF NOT EXISTS idx_rides_dropoff_coords ON public.rides(dropoff_latitude, dropoff_longitude);
CREATE INDEX IF NOT EXISTS idx_rides_passenger_status ON public.rides(passenger_id, status);
CREATE INDEX IF NOT EXISTS idx_rides_driver_status ON public.rides(driver_id, status);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON public.payments(ride_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON public.payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payee_id ON public.payments(payee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_id ON public.payments(gateway_id);

-- wallets / wallet_transactions
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at DESC);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- driver_earnings
CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver_id ON public.driver_earnings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_status ON public.driver_earnings(status);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_created_at ON public.driver_earnings(created_at DESC);

-- messages / chat
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_ride_id ON public.messages(ride_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_ride_id ON public.chat_rooms(ride_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_passenger_id ON public.chat_rooms(passenger_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_driver_id ON public.chat_rooms(driver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- analytics
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON public.analytics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_date_hour ON public.analytics_hourly(date DESC, hour);

-- emergency / safety
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON public.emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_ride_id ON public.emergency_alerts(ride_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON public.emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON public.emergency_alerts(created_at DESC);

-- social
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON public.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON public.social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_visibility ON public.social_posts(visibility, is_active);
CREATE INDEX IF NOT EXISTS idx_social_comments_post_id ON public.social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_user_id ON public.social_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_post_id ON public.social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_comment_id ON public.social_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_user_post ON public.social_likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_follower ON public.social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_following ON public.social_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_user_id ON public.social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_post_id ON public.social_shares(post_id);

-- support
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ride_id ON public.support_tickets(ride_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON public.support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_sender_id ON public.support_messages(sender_id);

-- login / security
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON public.login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);

-- surge / zones
CREATE INDEX IF NOT EXISTS idx_surge_pricing_zone_id ON public.surge_pricing(zone_id);
CREATE INDEX IF NOT EXISTS idx_surge_pricing_active ON public.surge_pricing(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_surge_history_zone_id ON public.surge_history(zone_id);
CREATE INDEX IF NOT EXISTS idx_traffic_conditions_zone_id ON public.traffic_conditions(zone_id);
CREATE INDEX IF NOT EXISTS idx_weather_conditions_zone_id ON public.weather_conditions(zone_id);

-- user related
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id) WHERE FALSE; -- já UNIQUE
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total ON public.user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON public.user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- =============================================================================
-- PARTE 7 — ÍNDICES FK (missing FK indexes — migration 015)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON public.account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource ON public.admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_members_role_id ON public.admin_members(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_admin_id ON public.admin_notifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_app_feedback_user_id ON public.app_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_user_id ON public.cashback_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_ride_id ON public.cashback_transactions(ride_id);
CREATE INDEX IF NOT EXISTS idx_cashback_transactions_rule_id ON public.cashback_transactions(rule_id);
CREATE INDEX IF NOT EXISTS idx_corporate_employees_corporate_id ON public.corporate_employees(corporate_id);
CREATE INDEX IF NOT EXISTS idx_corporate_employees_user_id ON public.corporate_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_invoices_corporate_id ON public.corporate_invoices(corporate_id);
CREATE INDEX IF NOT EXISTS idx_corporate_policies_corporate_id ON public.corporate_policies(corporate_id);
CREATE INDEX IF NOT EXISTS idx_corporate_rides_corporate_id ON public.corporate_rides(corporate_id);
CREATE INDEX IF NOT EXISTS idx_corporate_rides_ride_id ON public.corporate_rides(ride_id);
CREATE INDEX IF NOT EXISTS idx_corporate_rides_employee_id ON public.corporate_rides(employee_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_rides_ride_id ON public.delivery_rides(ride_id);
CREATE INDEX IF NOT EXISTS idx_delivery_rides_sender_id ON public.delivery_rides(sender_id);
CREATE INDEX IF NOT EXISTS idx_driver_availability_driver_id ON public.driver_availability(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_availability_zone_id ON public.driver_availability(zone_id);
CREATE INDEX IF NOT EXISTS idx_driver_bonuses_driver_id ON public.driver_bonuses(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_breaks_driver_id ON public.driver_breaks(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_commissions_driver_id ON public.driver_commissions(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_commissions_ride_id ON public.driver_commissions(ride_id);
CREATE INDEX IF NOT EXISTS idx_driver_compliance_driver_id ON public.driver_compliance(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON public.driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_goals_driver_id ON public.driver_goals(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_incentives_driver_id2 ON public.driver_incentives(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_nfse_driver_id ON public.driver_nfse(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_nfse_ride_id ON public.driver_nfse(ride_id);
CREATE INDEX IF NOT EXISTS idx_driver_penalties_driver_id ON public.driver_penalties(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_performance_reports_driver_id ON public.driver_performance_reports(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_ratings_driver_id ON public.driver_ratings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_ratings_passenger_id ON public.driver_ratings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_driver_ratings_created_at ON public.driver_ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_reviews_driver_id ON public.driver_reviews(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_reviews_passenger_id ON public.driver_reviews(passenger_id);
CREATE INDEX IF NOT EXISTS idx_driver_reviews_ride_id ON public.driver_reviews(ride_id);
CREATE INDEX IF NOT EXISTS idx_driver_schedule_driver_id ON public.driver_schedule(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_training_driver_id ON public.driver_training(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_driver_id ON public.driver_vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_category_id ON public.driver_vehicles(category_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_type_id ON public.driver_vehicles(type_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_plate ON public.driver_vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_participants_user_id ON public.experiment_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_family_groups_owner_id ON public.family_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_favorite_locations_user_id ON public.favorite_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON public.fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_active ON public.fcm_tokens(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_category_id ON public.feedback(category_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_in_app_message_views_message_id ON public.in_app_message_views(message_id);
CREATE INDEX IF NOT EXISTS idx_in_app_message_views_user_id ON public.in_app_message_views(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_ride_id ON public.invoices(ride_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON public.invoices(payment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_id ON public.leaderboards(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_period ON public.leaderboards(type, period);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON public.leaderboards(rank);
CREATE INDEX IF NOT EXISTS idx_partner_offers_partner_id ON public.partner_offers(partner_id);
CREATE INDEX IF NOT EXISTS idx_passenger_ratings_passenger_id ON public.passenger_ratings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_passenger_ratings_driver_id ON public.passenger_ratings(driver_id);
CREATE INDEX IF NOT EXISTS idx_passenger_ratings_ride_id ON public.passenger_ratings(ride_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_payment_id ON public.payment_disputes(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_user_id ON public.payment_disputes(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_payment_id ON public.payment_webhooks(payment_id);
CREATE INDEX IF NOT EXISTS idx_pix_keys_user_id ON public.pix_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_ride_id ON public.platform_revenue(ride_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_price_negotiations_ride_id ON public.price_negotiations(ride_id);
CREATE INDEX IF NOT EXISTS idx_price_negotiations_passenger_id ON public.price_negotiations(passenger_id);
CREATE INDEX IF NOT EXISTS idx_price_negotiations_driver_id ON public.price_negotiations(driver_id);
CREATE INDEX IF NOT EXISTS idx_price_negotiations_status ON public.price_negotiations(status);
CREATE INDEX IF NOT EXISTS idx_price_offers_ride_id ON public.price_offers(ride_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_driver_id ON public.price_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_status ON public.price_offers(status);
CREATE INDEX IF NOT EXISTS idx_price_offers_created_at ON public.price_offers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_promotion_id ON public.promotion_usage(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_user_id ON public.promotion_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_ride_id ON public.promotion_usage(ride_id);
CREATE INDEX IF NOT EXISTS idx_push_logs_user_id ON public.push_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_push_logs_created_at ON public.push_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_ride_id ON public.refunds(ride_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON public.refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON public.reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward_id ON public.reward_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_ride_accessibility_ride_id ON public.ride_accessibility(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_accessibility_feature_id ON public.ride_accessibility(feature_id);
CREATE INDEX IF NOT EXISTS idx_ride_cancellations_ride_id ON public.ride_cancellations(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_cancellations_cancelled_by ON public.ride_cancellations(cancelled_by);
CREATE INDEX IF NOT EXISTS idx_ride_chat_ride_id ON public.ride_chat(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_chat_sender_id ON public.ride_chat(sender_id);
CREATE INDEX IF NOT EXISTS idx_ride_chat_created_at ON public.ride_chat(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ride_complaints_ride_id ON public.ride_complaints(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_complaints_user_id ON public.ride_complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_complaints_status ON public.ride_complaints(status);
CREATE INDEX IF NOT EXISTS idx_ride_estimates_user_id ON public.ride_estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_incidents_ride_id ON public.ride_incidents(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_incidents_reported_by ON public.ride_incidents(reported_by);
CREATE INDEX IF NOT EXISTS idx_ride_insurance_ride_id ON public.ride_insurance(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_insurance_policy_id ON public.ride_insurance(policy_id);
CREATE INDEX IF NOT EXISTS idx_ride_pool_passengers_pool_id ON public.ride_pool_passengers(pool_id);
CREATE INDEX IF NOT EXISTS idx_ride_pool_passengers_passenger_id ON public.ride_pool_passengers(passenger_id);
CREATE INDEX IF NOT EXISTS idx_ride_pool_passengers_ride_id ON public.ride_pool_passengers(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_pools_driver_id ON public.ride_pools(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_pools_status ON public.ride_pools(status);
CREATE INDEX IF NOT EXISTS idx_ride_ratings_ride_id ON public.ride_ratings(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_ratings_rater_id ON public.ride_ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ride_ratings_rated_id ON public.ride_ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_ride_receipts_passenger_id ON public.ride_receipts(passenger_id);
CREATE INDEX IF NOT EXISTS idx_ride_recordings_ride_id ON public.ride_recordings(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_recordings_recorded_by ON public.ride_recordings(recorded_by);
CREATE INDEX IF NOT EXISTS idx_ride_requests_ride_id ON public.ride_requests(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_driver_id ON public.ride_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON public.ride_requests(status);
CREATE INDEX IF NOT EXISTS idx_ride_share_links_ride_id ON public.ride_share_links(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_share_links_user_id ON public.ride_share_links(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_stops_ride_id ON public.ride_stops(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_tolls_ride_id ON public.ride_tolls(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_tracking_ride_id ON public.ride_tracking(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_tracking_driver_id ON public.ride_tracking(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_tracking_created_at ON public.ride_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ride_waypoints_ride_id ON public.ride_waypoints(ride_id);
CREATE INDEX IF NOT EXISTS idx_safety_checkins_ride_id ON public.safety_checkins(ride_id);
CREATE INDEX IF NOT EXISTS idx_safety_checkins_user_id ON public.safety_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_reporter_id ON public.safety_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_reported_id ON public.safety_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_ride_id ON public.safety_reports(ride_id);
CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON public.saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_passenger_id ON public.scheduled_rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_scheduled_at ON public.scheduled_rides(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_status ON public.scheduled_rides(status);
CREATE INDEX IF NOT EXISTS idx_social_reports_reporter_id ON public.social_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_reported_user_id ON public.social_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_post_id ON public.social_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_comment_id ON public.social_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_tips_ride_id ON public.tips(ride_id);
CREATE INDEX IF NOT EXISTS idx_tips_passenger_id ON public.tips(passenger_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver_id ON public.tips(driver_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON public.user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_id ON public.user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_ride_id ON public.user_reports(ride_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_vehicle_id ON public.vehicle_inspections(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_driver_id ON public.vehicle_inspections(driver_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_wallet_id ON public.withdrawals(wallet_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON public.withdrawals(created_at DESC);

-- =============================================================================
-- PARTE 8 — FUNÇÕES QUE DEPENDEM DE TABELAS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  ref_code text;
BEGIN
  ref_code := upper(substring(md5(NEW.id::text || now()::text) FROM 1 FOR 8));

  INSERT INTO profiles (id, email, full_name, avatar_url, referral_code, user_type, status, created_at, updated_at)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    ref_code,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'passenger'),
    'active', now(), now()
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO wallets (user_id, balance, currency, created_at, updated_at)
  VALUES (NEW.id, 0, 'BRL', now(), now()) ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_settings (user_id, created_at, updated_at)
  VALUES (NEW.id, now(), now()) ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_points (user_id, total_points, current_points, created_at, updated_at)
  VALUES (NEW.id, 0, 0, now(), now()) ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO notification_preferences (user_id, created_at, updated_at)
  VALUES (NEW.id, now(), now()) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_driver()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO driver_stats (driver_id, created_at, updated_at)
  VALUES (NEW.user_id, now(), now()) ON CONFLICT (driver_id) DO NOTHING;

  INSERT INTO driver_locations (driver_id, latitude, longitude, is_online, is_available, last_updated)
  VALUES (NEW.user_id, 0, 0, false, false, now()) ON CONFLICT (driver_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_ride_completed()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles SET total_rides = total_rides + 1, updated_at = now() WHERE id = NEW.passenger_id;
    UPDATE driver_profiles SET total_trips = total_trips + 1, updated_at = now() WHERE user_id = NEW.driver_id;

    INSERT INTO driver_stats (driver_id, total_rides, total_earnings, updated_at, created_at)
    VALUES (NEW.driver_id, 1, COALESCE(NEW.driver_price, 0), now(), now())
    ON CONFLICT (driver_id) DO UPDATE SET
      total_rides = driver_stats.total_rides + 1,
      total_earnings = driver_stats.total_earnings + COALESCE(NEW.driver_price, 0),
      updated_at = now();

    IF NEW.driver_id IS NOT NULL AND NEW.driver_price > 0 THEN
      INSERT INTO driver_earnings (driver_id, ride_id, amount, type, description, status, created_at)
      VALUES (NEW.driver_id, NEW.id, NEW.driver_price, 'ride', 'Corrida concluida', 'paid', now());

      INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, description, reference_id, reference_type, created_at)
      SELECT w.id, NEW.driver_id, 'earning', NEW.driver_price, 'Ganho de corrida', NEW.id, 'ride', now()
      FROM wallets w WHERE w.user_id = NEW.driver_id;
    END IF;

    IF NEW.commission_amount > 0 THEN
      INSERT INTO platform_revenue (ride_id, amount, type, description, period_date, created_at)
      VALUES (NEW.id, NEW.commission_amount, 'commission', 'Comissao de corrida', CURRENT_DATE, now());
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_driver_rating()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  UPDATE profiles SET rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM driver_ratings WHERE driver_id = NEW.driver_id), updated_at = now() WHERE id = NEW.driver_id;
  UPDATE driver_stats SET
    avg_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM driver_ratings WHERE driver_id = NEW.driver_id),
    total_rides = (SELECT COUNT(*) FROM rides WHERE driver_id = NEW.driver_id AND status = 'completed'),
    last_calculated = now(), updated_at = now()
  WHERE driver_id = NEW.driver_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_driver_level()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE new_level text; new_commission numeric;
BEGIN
  SELECT level_name, commission_rate INTO new_level, new_commission
  FROM driver_level_config
  WHERE min_rides <= NEW.total_trips
    AND min_rating <= COALESCE((SELECT rating FROM profiles WHERE id = NEW.user_id), 5.0)
    AND is_active = true
  ORDER BY min_rides DESC LIMIT 1;

  IF new_level IS NOT NULL AND new_level != COALESCE(OLD.level, '') THEN
    UPDATE driver_profiles SET level = new_level, commission_rate = new_commission, updated_at = now() WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_coupon_usage()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_used = true AND (OLD IS NULL OR OLD.is_used = false) THEN
    UPDATE coupons SET usage_count = usage_count + 1 WHERE id = NEW.coupon_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_daily_analytics()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE today date := CURRENT_DATE;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO analytics_daily (date, total_rides, completed_rides, total_revenue, total_commission)
    VALUES (today, 1, 1, COALESCE(NEW.final_price, 0), COALESCE(NEW.commission_amount, 0))
    ON CONFLICT (date) DO UPDATE SET
      total_rides = analytics_daily.total_rides + 1,
      completed_rides = analytics_daily.completed_rides + 1,
      total_revenue = analytics_daily.total_revenue + COALESCE(NEW.final_price, 0),
      total_commission = analytics_daily.total_commission + COALESCE(NEW.commission_amount, 0);
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    INSERT INTO analytics_daily (date, total_rides, cancelled_rides) VALUES (today, 1, 1)
    ON CONFLICT (date) DO UPDATE SET
      total_rides = analytics_daily.total_rides + 1,
      cancelled_rides = analytics_daily.cancelled_rides + 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_social_counts()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  IF TG_TABLE_NAME = 'social_likes' THEN
    IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
      UPDATE social_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
      UPDATE social_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'social_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE social_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  UPDATE wallets SET
    balance = (
      SELECT COALESCE(SUM(CASE WHEN type IN ('credit','cashback','refund','bonus','earning') THEN amount ELSE -amount END), 0)
      FROM wallet_transactions WHERE wallet_id = NEW.wallet_id
    ),
    updated_at = now()
  WHERE id = NEW.wallet_id;
  RETURN NEW;
END;
$$;

-- =============================================================================
-- PARTE 9 — TRIGGERS
-- =============================================================================

-- updated_at automático
DO $$ DECLARE
  t text;
  tables text[] := ARRAY[
    'announcements','app_config','campaigns','cashback_rules','chat_rooms',
    'city_configurations','city_zones','corporate_accounts','corporate_policies',
    'driver_compliance','driver_fiscal','driver_incentives','driver_level_config',
    'driver_locations','driver_payout_config','driver_profiles','driver_stats',
    'driver_vehicles','driver_zones','email_templates','emergency_alerts',
    'emergency_contacts','experiments','family_groups','faqs','feature_flags',
    'geographic_zones','hot_zones','knowledge_base_articles','notification_preferences',
    'payment_disputes','payments','popular_routes','pricing_rules','profiles',
    'promotions','ride_history_summary','ride_incidents','ride_pools','rides',
    'safety_reports','service_areas','social_posts','support_tickets','surge_pricing',
    'system_config','system_settings','user_2fa','user_addresses','user_documents',
    'user_settings','user_subscriptions','user_verifications','vehicle_categories',
    'wallet_transactions','wallets','withdrawals'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%1$s_updated_at
       BEFORE UPDATE ON public.%1$s
       FOR EACH ROW EXECUTE FUNCTION handle_updated_at()',
      t
    );
  END LOOP;
END $$;

-- Triggers especiais
CREATE OR REPLACE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

CREATE OR REPLACE TRIGGER trg_new_driver
  AFTER INSERT ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_driver();

CREATE OR REPLACE TRIGGER trg_update_driver_level
  AFTER UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION update_driver_level();

CREATE OR REPLACE TRIGGER trg_update_driver_rating
  AFTER INSERT OR UPDATE ON public.driver_ratings
  FOR EACH ROW EXECUTE FUNCTION update_driver_rating();

CREATE OR REPLACE TRIGGER trg_ride_completed
  AFTER UPDATE ON public.rides
  FOR EACH ROW EXECUTE FUNCTION handle_ride_completed();

CREATE OR REPLACE TRIGGER trg_update_daily_analytics
  AFTER UPDATE ON public.rides
  FOR EACH ROW EXECUTE FUNCTION update_daily_analytics();

CREATE OR REPLACE TRIGGER trg_update_wallet_balance
  AFTER INSERT ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

CREATE OR REPLACE TRIGGER trg_coupon_usage
  AFTER INSERT OR UPDATE ON public.user_coupons
  FOR EACH ROW EXECUTE FUNCTION update_coupon_usage();

CREATE OR REPLACE TRIGGER trg_social_likes_count
  AFTER INSERT OR DELETE ON public.social_likes
  FOR EACH ROW EXECUTE FUNCTION update_social_counts();

CREATE OR REPLACE TRIGGER trg_social_comments_count
  AFTER INSERT OR DELETE ON public.social_comments
  FOR EACH ROW EXECUTE FUNCTION update_social_counts();

-- =============================================================================
-- PARTE 10 — RLS (Row Level Security)
-- =============================================================================

-- Habilitar RLS em todas as tabelas do schema public
DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- PROFILES
CREATE POLICY profiles_public_read ON public.profiles FOR SELECT USING (status = 'active');
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (id = auth.uid() OR is_admin());
CREATE POLICY profiles_delete_admin ON public.profiles FOR DELETE USING (is_admin());

-- RIDES
CREATE POLICY rides_insert_passenger ON public.rides FOR INSERT WITH CHECK (passenger_id = auth.uid());
CREATE POLICY rides_participants ON public.rides FOR SELECT USING (passenger_id = auth.uid() OR driver_id = auth.uid() OR is_admin());
CREATE POLICY rides_update_participants ON public.rides FOR UPDATE USING (passenger_id = auth.uid() OR driver_id = auth.uid() OR is_admin());

-- PAYMENTS
CREATE POLICY payments_own ON public.payments FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid() OR is_admin());
CREATE POLICY payments_insert ON public.payments FOR INSERT WITH CHECK (payer_id = auth.uid());
CREATE POLICY payments_admin ON public.payments FOR UPDATE USING (is_admin());

-- WALLETS
CREATE POLICY wallets_own ON public.wallets FOR ALL USING (user_id = auth.uid() OR is_admin());

-- WALLET_TRANSACTIONS
CREATE POLICY wallet_transactions_own ON public.wallet_transactions FOR SELECT USING (user_id = auth.uid() OR is_admin());

-- WITHDRAWALS
CREATE POLICY withdrawals_own ON public.withdrawals FOR ALL USING (user_id = auth.uid() OR is_admin());

-- DRIVER_PROFILES
CREATE POLICY driver_profiles_select ON public.driver_profiles FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY driver_profiles_insert ON public.driver_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY driver_profiles_update ON public.driver_profiles FOR UPDATE USING (user_id = auth.uid() OR is_admin());

-- DRIVER_LOCATIONS
CREATE POLICY driver_locations_own ON public.driver_locations FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_locations_public_read ON public.driver_locations FOR SELECT USING (is_online = true);

-- NOTIFICATIONS
CREATE POLICY notifications_own ON public.notifications FOR ALL USING (user_id = auth.uid() OR is_admin());

-- USER_SETTINGS / USER_POINTS / NOTIFICATION_PREFERENCES
CREATE POLICY user_settings_own ON public.user_settings FOR ALL USING (user_id = auth.uid());
CREATE POLICY user_points_own ON public.user_points FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY notification_preferences_own ON public.notification_preferences FOR ALL USING (user_id = auth.uid());

-- Demais políticas (admin-only e publicas para tabelas de configuração)
-- Tabelas somente admin
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'admin_audit_logs','admin_members','admin_roles','analytics_daily','analytics_hourly',
    'analytics_zones','api_logs','app_config','app_versions','campaigns','cashback_rules',
    'city_configurations','city_zones','driver_level_config','driver_penalties',
    'email_templates','error_logs','experiments','feature_flags','financial_reports',
    'fraud_alerts','geo_fences','geographic_zones','in_app_messages','insurance_policies',
    'ip_blocklist','legal_documents','login_attempts','maintenance_windows',
    'notification_templates','onboarding_steps','partner_offers','partners',
    'platform_revenue','pricing_rules','promo_banners','promotions','push_logs',
    'rate_limits','scheduled_notifications','service_areas','sms_templates',
    'subscription_plans','surge_history','surge_pricing','system_config','system_logs',
    'system_settings','taxes','terms_versions','vehicle_categories','vehicle_types',
    'webhook_logs'
  ] LOOP
    EXECUTE format('CREATE POLICY %1$I_admin ON public.%1$I FOR ALL USING (is_admin())', tbl);
  END LOOP;
END $$;

-- PUBLIC SELECT para tabelas de configuração pública
DO $$
DECLARE tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'accessibility_features','achievements','airports','announcements','app_versions',
    'badge_definitions','challenges','city_zones','driver_level_config','driver_rankings',
    'event_locations','faqs','feedback_categories','geo_fences','geographic_zones',
    'hot_zones','in_app_messages','insurance_policies','knowledge_base_articles',
    'leaderboards','legal_documents','maintenance_windows','onboarding_steps',
    'partner_offers','predefined_messages','promo_banners','promotions','rewards',
    'service_areas','subscription_plans','surge_pricing','taxes','terms_versions',
    'traffic_conditions','vehicle_categories','vehicle_types','weather_conditions'
  ] LOOP
    EXECUTE format('CREATE POLICY %1$I_public ON public.%1$I FOR SELECT USING (true)', tbl);
  END LOOP;
END $$;

-- Políticas individuais para tabelas com lógica específica
CREATE POLICY driver_stats_own ON public.driver_stats FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_earnings_own ON public.driver_earnings FOR SELECT USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_commissions_own ON public.driver_commissions FOR SELECT USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_bonuses_own ON public.driver_bonuses FOR SELECT USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_breaks_own ON public.driver_breaks FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_documents_own ON public.driver_documents FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_vehicles_own ON public.driver_vehicles FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_availability_own ON public.driver_availability FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_zones_own ON public.driver_zones FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_accessibility_own ON public.driver_accessibility FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_schedule_own ON public.driver_schedule FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_fiscal_own ON public.driver_fiscal FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_payout_config_own ON public.driver_payout_config FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_goals_own ON public.driver_goals FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_incentives_own ON public.driver_incentives FOR SELECT USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_training_own ON public.driver_training FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_performance_reports_own ON public.driver_performance_reports FOR SELECT USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_nfse_own ON public.driver_nfse FOR SELECT USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_compliance_own ON public.driver_compliance FOR SELECT USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY driver_compliance_admin ON public.driver_compliance FOR ALL USING (is_admin());
CREATE POLICY driver_reviews_own ON public.driver_reviews FOR ALL USING (driver_id = auth.uid() OR passenger_id = auth.uid() OR is_admin());
CREATE POLICY driver_reviews_public ON public.driver_reviews FOR SELECT USING (is_public = true);
CREATE POLICY driver_ratings_own ON public.driver_ratings FOR SELECT USING (driver_id = auth.uid() OR passenger_id = auth.uid() OR is_admin());
CREATE POLICY driver_ratings_insert ON public.driver_ratings FOR INSERT WITH CHECK (passenger_id = auth.uid());

CREATE POLICY support_tickets_own ON public.support_tickets FOR ALL USING (user_id = auth.uid() OR assigned_to = auth.uid() OR is_admin());
CREATE POLICY support_messages_ticket ON public.support_messages FOR ALL USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM support_tickets WHERE id = support_messages.ticket_id AND (user_id = auth.uid() OR assigned_to = auth.uid())) OR
  is_admin()
);

CREATE POLICY messages_participants ON public.messages FOR ALL USING (sender_id = auth.uid() OR receiver_id = auth.uid() OR is_admin());
CREATE POLICY chat_rooms_participants ON public.chat_rooms FOR ALL USING (passenger_id = auth.uid() OR driver_id = auth.uid() OR is_admin());
CREATE POLICY chat_messages_participants ON public.chat_messages FOR ALL USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM chat_rooms WHERE id = chat_messages.room_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR
  is_admin()
);

CREATE POLICY ride_chat_participants ON public.ride_chat FOR ALL USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM rides WHERE id = ride_chat.ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR
  is_admin()
);

CREATE POLICY social_posts_own ON public.social_posts FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY social_posts_public_read ON public.social_posts FOR SELECT USING (visibility = 'public' AND is_active = true);
CREATE POLICY social_comments_own ON public.social_comments FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY social_comments_public_read ON public.social_comments FOR SELECT USING (is_active = true);
CREATE POLICY social_likes_own ON public.social_likes FOR ALL USING (user_id = auth.uid());
CREATE POLICY social_likes_public_read ON public.social_likes FOR SELECT USING (true);
CREATE POLICY social_follows_own ON public.social_follows FOR ALL USING (follower_id = auth.uid() OR is_admin());
CREATE POLICY social_follows_public_read ON public.social_follows FOR SELECT USING (true);
CREATE POLICY social_shares_own ON public.social_shares FOR ALL USING (user_id = auth.uid());
CREATE POLICY social_reports_own ON public.social_reports FOR ALL USING (reporter_id = auth.uid() OR is_admin());

CREATE POLICY payment_methods_own ON public.payment_methods FOR ALL USING (user_id = auth.uid());
CREATE POLICY pix_keys_own ON public.pix_keys FOR ALL USING (user_id = auth.uid());
CREATE POLICY payment_disputes_own ON public.payment_disputes FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY payment_webhooks_admin ON public.payment_webhooks FOR ALL USING (is_admin());
CREATE POLICY invoices_own ON public.invoices FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY refunds_own ON public.refunds FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY refunds_admin ON public.refunds FOR ALL USING (is_admin());
CREATE POLICY cashback_transactions_own ON public.cashback_transactions FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY tips_own ON public.tips FOR SELECT USING (passenger_id = auth.uid() OR driver_id = auth.uid() OR is_admin());
CREATE POLICY tips_insert ON public.tips FOR INSERT WITH CHECK (passenger_id = auth.uid());

CREATE POLICY emergency_contacts_own ON public.emergency_contacts FOR ALL USING (user_id = auth.uid());
CREATE POLICY emergency_alerts_own ON public.emergency_alerts FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY safety_checkins_own ON public.safety_checkins FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY safety_reports_own ON public.safety_reports FOR ALL USING (reporter_id = auth.uid() OR is_admin());

CREATE POLICY user_reports_own ON public.user_reports FOR ALL USING (reporter_id = auth.uid() OR is_admin());
CREATE POLICY blocked_users_own ON public.blocked_users FOR ALL USING (user_id = auth.uid());
CREATE POLICY favorite_locations_own ON public.favorite_locations FOR ALL USING (user_id = auth.uid());
CREATE POLICY favorite_drivers_own ON public.favorite_drivers FOR ALL USING (user_id = auth.uid());
CREATE POLICY saved_routes_own ON public.saved_routes FOR ALL USING (user_id = auth.uid());
CREATE POLICY user_addresses_own ON public.user_addresses FOR ALL USING (user_id = auth.uid());
CREATE POLICY user_devices_own ON public.user_devices FOR ALL USING (user_id = auth.uid());
CREATE POLICY fcm_tokens_own ON public.fcm_tokens FOR ALL USING (user_id = auth.uid());
CREATE POLICY user_2fa_own ON public.user_2fa FOR ALL USING (user_id = auth.uid());
CREATE POLICY user_sessions_own ON public.user_sessions FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY user_activity_own ON public.user_activity_log FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY user_activity_insert ON public.user_activity_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_verifications_own ON public.user_verifications FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY user_verifications_insert ON public.user_verifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_verifications_admin ON public.user_verifications FOR UPDATE USING (is_admin());
CREATE POLICY user_documents_own ON public.user_documents FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY user_badges_own ON public.user_badges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY user_badges_admin ON public.user_badges FOR ALL USING (is_admin());
CREATE POLICY user_achievements_own ON public.user_achievements FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY user_challenges_own ON public.user_challenges FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY user_coupons_own ON public.user_coupons FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY user_subscriptions_own ON public.user_subscriptions FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY reward_redemptions_own ON public.reward_redemptions FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY streaks_own ON public.streaks FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY points_transactions_own ON public.points_transactions FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY referrals_own ON public.referrals FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid() OR is_admin());
CREATE POLICY referrals_insert ON public.referrals FOR INSERT WITH CHECK (referrer_id = auth.uid());
CREATE POLICY family_groups_own ON public.family_groups FOR ALL USING (owner_id = auth.uid() OR is_admin());
CREATE POLICY family_members_own ON public.family_members FOR ALL USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM family_groups WHERE id = family_members.group_id AND owner_id = auth.uid()) OR
  is_admin()
);
CREATE POLICY corporate_employees_own ON public.corporate_employees FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY corporate_rides_own ON public.corporate_rides FOR SELECT USING (employee_id = auth.uid() OR is_admin());
CREATE POLICY corporate_invoices_admin ON public.corporate_invoices FOR ALL USING (is_admin());
CREATE POLICY corporate_policies_members ON public.corporate_policies FOR SELECT USING (
  EXISTS (SELECT 1 FROM corporate_employees WHERE user_id = auth.uid()) OR is_admin()
);
CREATE POLICY corporate_accounts_admin ON public.corporate_accounts FOR ALL USING (is_admin());
CREATE POLICY corporate_accounts_members ON public.corporate_accounts FOR SELECT USING (
  EXISTS (SELECT 1 FROM corporate_employees WHERE user_id = auth.uid()) OR is_admin()
);

CREATE POLICY ride_requests_driver ON public.ride_requests FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY ride_requests_passenger ON public.ride_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM rides WHERE id = ride_requests.ride_id AND passenger_id = auth.uid())
);
CREATE POLICY ride_tracking_participants ON public.ride_tracking FOR SELECT USING (
  driver_id = auth.uid() OR
  EXISTS (SELECT 1 FROM rides WHERE id = ride_tracking.ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR
  is_admin()
);
CREATE POLICY ride_tracking_driver_insert ON public.ride_tracking FOR INSERT WITH CHECK (driver_id = auth.uid());
CREATE POLICY ride_ratings_participants ON public.ride_ratings FOR SELECT USING (rater_id = auth.uid() OR rated_id = auth.uid() OR is_admin());
CREATE POLICY ride_ratings_insert ON public.ride_ratings FOR INSERT WITH CHECK (rater_id = auth.uid());
CREATE POLICY passenger_ratings_own ON public.passenger_ratings FOR ALL USING (passenger_id = auth.uid() OR driver_id = auth.uid() OR is_admin());
CREATE POLICY ride_cancellations_own ON public.ride_cancellations FOR SELECT USING (
  cancelled_by = auth.uid() OR
  EXISTS (SELECT 1 FROM rides WHERE id = ride_cancellations.ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR
  is_admin()
);
CREATE POLICY ride_cancellations_insert ON public.ride_cancellations FOR INSERT WITH CHECK (cancelled_by = auth.uid());
CREATE POLICY ride_incidents_own ON public.ride_incidents FOR SELECT USING (reported_by = auth.uid() OR is_admin());
CREATE POLICY ride_incidents_insert ON public.ride_incidents FOR INSERT WITH CHECK (reported_by = auth.uid());
CREATE POLICY ride_incidents_admin ON public.ride_incidents FOR UPDATE USING (is_admin());
CREATE POLICY ride_complaints_own ON public.ride_complaints FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY ride_receipts_own ON public.ride_receipts FOR SELECT USING (passenger_id = auth.uid() OR is_admin());
CREATE POLICY ride_recordings_own ON public.ride_recordings FOR SELECT USING (recorded_by = auth.uid() OR is_admin());
CREATE POLICY ride_recordings_insert ON public.ride_recordings FOR INSERT WITH CHECK (recorded_by = auth.uid());
CREATE POLICY ride_share_links_own ON public.ride_share_links FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY ride_share_links_public_read ON public.ride_share_links FOR SELECT USING (is_active = true);
CREATE POLICY ride_stops_participants ON public.ride_stops FOR ALL USING (
  EXISTS (SELECT 1 FROM rides WHERE id = ride_stops.ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR is_admin()
);
CREATE POLICY ride_waypoints_participants ON public.ride_waypoints FOR ALL USING (
  EXISTS (SELECT 1 FROM rides WHERE id = ride_waypoints.ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR is_admin()
);
CREATE POLICY ride_tolls_participants ON public.ride_tolls FOR ALL USING (
  EXISTS (SELECT 1 FROM rides WHERE id = ride_tolls.ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR is_admin()
);
CREATE POLICY ride_insurance_participants ON public.ride_insurance FOR SELECT USING (
  EXISTS (SELECT 1 FROM rides WHERE id = ride_insurance.ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR is_admin()
);
CREATE POLICY ride_accessibility_participants ON public.ride_accessibility FOR SELECT USING (
  EXISTS (SELECT 1 FROM rides WHERE id = ride_accessibility.ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())) OR is_admin()
);
CREATE POLICY ride_estimates_own ON public.ride_estimates FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY ride_history_summary_own ON public.ride_history_summary FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY price_offers_driver ON public.price_offers FOR ALL USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY price_offers_passenger_read ON public.price_offers FOR SELECT USING (
  EXISTS (SELECT 1 FROM rides WHERE id = price_offers.ride_id AND passenger_id = auth.uid())
);
CREATE POLICY price_negotiations_participants ON public.price_negotiations FOR ALL USING (
  passenger_id = auth.uid() OR driver_id = auth.uid() OR is_admin()
);
CREATE POLICY delivery_rides_own ON public.delivery_rides FOR SELECT USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM rides WHERE id = delivery_rides.ride_id AND driver_id = auth.uid()) OR
  is_admin()
);
CREATE POLICY scheduled_rides_own ON public.scheduled_rides FOR ALL USING (passenger_id = auth.uid() OR is_admin());
CREATE POLICY ride_pools_public ON public.ride_pools FOR SELECT USING (status = 'open');
CREATE POLICY ride_pools_admin ON public.ride_pools FOR ALL USING (is_admin());
CREATE POLICY ride_pool_passengers_own ON public.ride_pool_passengers FOR ALL USING (passenger_id = auth.uid() OR is_admin());

CREATE POLICY coupons_auth ON public.coupons FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);
CREATE POLICY data_export_requests_own ON public.data_export_requests FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY account_deletion_requests_own ON public.account_deletion_requests FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY terms_acceptances_own ON public.terms_acceptances FOR ALL USING (user_id = auth.uid());
CREATE POLICY app_feedback_own ON public.app_feedback FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY feedback_own ON public.feedback FOR ALL USING (user_id = auth.uid() OR is_admin());
CREATE POLICY in_app_message_views_own ON public.in_app_message_views FOR ALL USING (user_id = auth.uid());
CREATE POLICY experiment_participants_own ON public.experiment_participants FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY admin_members_admin_only ON public.admin_members FOR ALL USING (is_admin());
CREATE POLICY admin_notifications_own ON public.admin_notifications FOR ALL USING (admin_id = auth.uid() OR is_admin());
CREATE POLICY admin_audit_logs_admin ON public.admin_audit_logs FOR ALL USING (is_admin());
CREATE POLICY vehicle_inspections_own ON public.vehicle_inspections FOR SELECT USING (driver_id = auth.uid() OR is_admin());
CREATE POLICY vehicle_inspections_admin ON public.vehicle_inspections FOR ALL USING (is_admin());
CREATE POLICY email_otps_own ON public.email_otps FOR SELECT USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));
CREATE POLICY promotion_usage_own ON public.promotion_usage FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY popular_routes_public ON public.popular_routes FOR SELECT USING (true);
CREATE POLICY app_config_public_read ON public.app_config FOR SELECT USING (is_public = true);
CREATE POLICY feature_flags_auth ON public.feature_flags FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY push_logs_own_read ON public.push_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY error_logs_own ON public.error_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY fraud_alerts_admin ON public.fraud_alerts FOR ALL USING (is_admin());
CREATE POLICY surge_pricing_public ON public.surge_pricing FOR SELECT USING (is_active = true);
CREATE POLICY traffic_conditions_public ON public.traffic_conditions FOR SELECT USING (true);
CREATE POLICY weather_conditions_public ON public.weather_conditions FOR SELECT USING (true);
CREATE POLICY driver_rankings_public ON public.driver_rankings FOR SELECT USING (true);

-- =============================================================================
-- PARTE 11 — REALTIME PUBLICATIONS
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.surge_pricing;

-- =============================================================================
-- PARTE 12 — TRIGGER AUTH (Supabase)
-- =============================================================================

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- FIM DO MASTER SCHEMA
-- =============================================================================
