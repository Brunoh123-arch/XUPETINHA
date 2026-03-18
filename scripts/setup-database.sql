-- =============================================================================
-- XUPETINHA — SETUP DATABASE (ORDEM CORRETA)
-- =============================================================================

-- PARTE 1: EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PARTE 2: FUNÇÕES SEM DEPENDÊNCIAS
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

CREATE OR REPLACE FUNCTION public.log_failed_login()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- PARTE 3: TABELAS BASE
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
  surge_multiplier numeric DEFAULT 1.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.surge_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  geofence jsonb,
  multiplier numeric DEFAULT 1.0,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb,
  description text,
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'push',
  title_template text,
  body_template text,
  variables jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- PARTE 4: TABELAS DEPENDENTES DE PROFILES
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number text,
  license_category text,
  license_expiry date,
  license_image_url text,
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid,
  is_online boolean DEFAULT false,
  is_available boolean DEFAULT true,
  current_latitude numeric,
  current_longitude numeric,
  current_heading numeric,
  last_location_update timestamptz,
  rating numeric DEFAULT 5.0,
  total_trips integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  acceptance_rate numeric DEFAULT 100,
  cancellation_rate numeric DEFAULT 0,
  bank_name text,
  bank_agency text,
  bank_account text,
  bank_account_type text,
  pix_key text,
  pix_key_type text,
  commission_rate numeric DEFAULT 20,
  background_check_status text DEFAULT 'pending',
  background_check_date date,
  documents_status text DEFAULT 'pending',
  training_completed boolean DEFAULT false,
  training_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES vehicle_categories(id),
  type_id uuid REFERENCES vehicle_types(id),
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text NOT NULL,
  plate text NOT NULL UNIQUE,
  renavam text,
  chassis text,
  document_url text,
  photo_url text,
  is_verified boolean DEFAULT false,
  verification_status text DEFAULT 'pending',
  is_active boolean DEFAULT true,
  is_primary boolean DEFAULT false,
  max_passengers integer DEFAULT 4,
  has_air_conditioning boolean DEFAULT true,
  has_wifi boolean DEFAULT false,
  has_charger boolean DEFAULT false,
  accessibility_features jsonb DEFAULT '[]',
  insurance_company text,
  insurance_policy text,
  insurance_expiry date,
  last_inspection_date date,
  next_inspection_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid NOT NULL REFERENCES profiles(id),
  driver_id uuid REFERENCES driver_profiles(id),
  vehicle_id uuid REFERENCES vehicles(id),
  category_id uuid REFERENCES vehicle_categories(id),
  status text DEFAULT 'pending',
  pickup_address text NOT NULL,
  pickup_latitude numeric NOT NULL,
  pickup_longitude numeric NOT NULL,
  dropoff_address text NOT NULL,
  dropoff_latitude numeric NOT NULL,
  dropoff_longitude numeric NOT NULL,
  waypoints jsonb DEFAULT '[]',
  estimated_distance numeric,
  estimated_duration integer,
  actual_distance numeric,
  actual_duration integer,
  estimated_price numeric,
  final_price numeric,
  surge_multiplier numeric DEFAULT 1.0,
  discount_amount numeric DEFAULT 0,
  coupon_id uuid REFERENCES coupons(id),
  promotion_id uuid REFERENCES promotions(id),
  payment_method text DEFAULT 'cash',
  payment_status text DEFAULT 'pending',
  payment_id text,
  passenger_rating numeric,
  driver_rating numeric,
  passenger_comment text,
  driver_comment text,
  route_polyline text,
  cancellation_reason text,
  cancelled_by text,
  cancelled_at timestamptz,
  requested_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  arrived_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  scheduled_for timestamptz,
  is_scheduled boolean DEFAULT false,
  is_shared boolean DEFAULT false,
  shared_ride_id uuid,
  accessibility_needs jsonb DEFAULT '[]',
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES driver_profiles(id),
  status text DEFAULT 'pending',
  offered_price numeric,
  response_time integer,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.ride_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  speed numeric,
  heading numeric,
  accuracy numeric,
  recorded_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.favorite_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  icon text DEFAULT 'star',
  is_home boolean DEFAULT false,
  is_work boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.favorite_drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, driver_id)
);

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

CREATE TABLE IF NOT EXISTS public.user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  document_url text NOT NULL,
  status text DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid,
  rejection_reason text,
  expires_at date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text,
  last_four text,
  brand text,
  holder_name text,
  expiry_month integer,
  expiry_year integer,
  token text,
  is_default boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  type text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'BRL',
  status text DEFAULT 'pending',
  payment_method_id uuid REFERENCES payment_methods(id),
  gateway_transaction_id text,
  gateway_response jsonb,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  balance numeric DEFAULT 0,
  bonus_balance numeric DEFAULT 0,
  lifetime_earnings numeric DEFAULT 0,
  lifetime_spent numeric DEFAULT 0,
  pending_withdrawals numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallet(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  balance_after numeric NOT NULL,
  description text,
  reference_type text,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  ride_id uuid REFERENCES rides(id),
  gross_amount numeric NOT NULL,
  commission_amount numeric NOT NULL,
  bonus_amount numeric DEFAULT 0,
  tip_amount numeric DEFAULT 0,
  net_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  paid_at timestamptz,
  payout_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  method text DEFAULT 'pix',
  status text DEFAULT 'pending',
  bank_name text,
  bank_agency text,
  bank_account text,
  pix_key text,
  transaction_id text,
  processed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  receiver_id uuid NOT NULL REFERENCES profiles(id),
  content text NOT NULL,
  type text DEFAULT 'text',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  category text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES profiles(id),
  resolved_at timestamptz,
  resolution text,
  satisfaction_rating integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  content text NOT NULL,
  attachments jsonb DEFAULT '[]',
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES faq_categories(id),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES profiles(id),
  rated_id uuid NOT NULL REFERENCES profiles(id),
  rating numeric NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  tags jsonb DEFAULT '[]',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  status text DEFAULT 'active',
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  payment_method_id uuid REFERENCES payment_methods(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id),
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badge_definitions(id),
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id),
  current_value numeric DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS public.user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES rewards(id),
  status text DEFAULT 'active',
  redeemed_at timestamptz DEFAULT now(),
  used_at timestamptz,
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.user_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coupon_id uuid NOT NULL REFERENCES coupons(id),
  used boolean DEFAULT false,
  used_at timestamptz,
  ride_id uuid REFERENCES rides(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, coupon_id)
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id),
  referred_id uuid NOT NULL REFERENCES profiles(id),
  status text DEFAULT 'pending',
  referrer_reward numeric,
  referred_reward numeric,
  referrer_rewarded_at timestamptz,
  referred_rewarded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_id)
);

CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  lifetime_points integer DEFAULT 0,
  tier text DEFAULT 'bronze',
  tier_updated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  points integer NOT NULL,
  balance_after integer NOT NULL,
  description text,
  reference_type text,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.corporate_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id uuid NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id text,
  department text,
  cost_center text,
  monthly_limit numeric,
  monthly_used numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(corporate_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.corporate_rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id uuid NOT NULL REFERENCES corporate_accounts(id),
  employee_id uuid NOT NULL REFERENCES corporate_employees(id),
  ride_id uuid NOT NULL REFERENCES rides(id),
  cost_center text,
  project_code text,
  justification text,
  approved boolean DEFAULT true,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partner_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partner_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  promotion_id uuid NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, promotion_id)
);

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  type text NOT NULL,
  latitude numeric,
  longitude numeric,
  status text DEFAULT 'active',
  resolved_at timestamptz,
  resolved_by uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  document_url text NOT NULL,
  status text DEFAULT 'pending',
  verified_at timestamptz,
  verified_by uuid,
  rejection_reason text,
  expires_at date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  zone_name text NOT NULL,
  geofence jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text DEFAULT 'bonus',
  criteria jsonb NOT NULL,
  reward_amount numeric NOT NULL,
  max_participants integer,
  current_participants integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_incentive_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  incentive_id uuid NOT NULL REFERENCES driver_incentives(id) ON DELETE CASCADE,
  current_value numeric DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  reward_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(driver_id, incentive_id)
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  role_id uuid REFERENCES admin_roles(id),
  department text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admin_users(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id),
  reported_id uuid REFERENCES profiles(id),
  ride_id uuid REFERENCES rides(id),
  type text NOT NULL,
  reason text NOT NULL,
  description text,
  evidence_urls jsonb DEFAULT '[]',
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES admin_users(id),
  reviewed_at timestamptz,
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  inspector_id uuid REFERENCES admin_users(id),
  type text DEFAULT 'regular',
  status text DEFAULT 'pending',
  checklist jsonb DEFAULT '{}',
  notes text,
  photos jsonb DEFAULT '[]',
  passed boolean,
  inspected_at timestamptz,
  next_inspection_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type text NOT NULL,
  description text,
  cost numeric,
  odometer integer,
  service_provider text,
  receipt_url text,
  scheduled_date date,
  completed_date date,
  next_service_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  device_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_rides integer DEFAULT 0,
  completed_rides integer DEFAULT 0,
  cancelled_rides integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  total_commission numeric DEFAULT 0,
  new_users integer DEFAULT 0,
  new_drivers integer DEFAULT 0,
  active_users integer DEFAULT 0,
  active_drivers integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  average_wait_time integer DEFAULT 0,
  average_ride_duration integer DEFAULT 0,
  average_ride_distance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  platform text NOT NULL,
  device_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  target_audience text DEFAULT 'all',
  target_conditions jsonb DEFAULT '{}',
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  scheduled_for timestamptz NOT NULL,
  sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  version text NOT NULL,
  build_number integer NOT NULL,
  min_supported_version text,
  is_force_update boolean DEFAULT false,
  release_notes text,
  download_url text,
  released_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_enabled boolean DEFAULT false,
  target_percentage integer DEFAULT 100,
  target_users jsonb DEFAULT '[]',
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PARTE 5: FUNÇÕES COM DEPENDÊNCIAS DE TABELAS
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

-- PARTE 6: FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  INSERT INTO public.wallet (user_id, balance, bonus_balance)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.loyalty_points (user_id, points, tier)
  VALUES (NEW.id, 0, 'bronze')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- PARTE 7: TRIGGER PARA NOVOS USUÁRIOS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PARTE 8: TRIGGERS DE UPDATED_AT
CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER update_wallet_updated_at BEFORE UPDATE ON wallet FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- PARTE 9: TRIGGER PARA GERAR CÓDIGO DE REFERÊNCIA
CREATE OR REPLACE TRIGGER generate_profile_referral_code BEFORE INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- PARTE 10: RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- POLICIES PARA PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Service role full access profiles" ON profiles USING (auth.role() = 'service_role');

-- POLICIES PARA DRIVER_PROFILES
CREATE POLICY "Drivers can view own driver profile" ON driver_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can update own driver profile" ON driver_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view verified drivers" ON driver_profiles FOR SELECT USING (is_verified = true);
CREATE POLICY "Admins full access driver_profiles" ON driver_profiles USING (is_admin());

-- POLICIES PARA RIDES
CREATE POLICY "Passengers can view own rides" ON rides FOR SELECT USING (auth.uid() = passenger_id);
CREATE POLICY "Drivers can view assigned rides" ON rides FOR SELECT USING (auth.uid() IN (SELECT user_id FROM driver_profiles WHERE id = rides.driver_id));
CREATE POLICY "Passengers can create rides" ON rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Admins full access rides" ON rides USING (is_admin());

-- POLICIES PARA WALLET
CREATE POLICY "Users can view own wallet" ON wallet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins full access wallet" ON wallet USING (is_admin());

-- POLICIES PARA NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- POLICIES PARA MESSAGES
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- POLICIES PARA PAYMENT_METHODS
CREATE POLICY "Users can manage own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);

-- POLICIES PARA FAVORITE_LOCATIONS
CREATE POLICY "Users can manage own favorites" ON favorite_locations FOR ALL USING (auth.uid() = user_id);

-- POLICIES PARA SUPPORT_TICKETS
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access tickets" ON support_tickets USING (is_admin());

-- PARTE 11: ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_is_online ON driver_profiles(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_driver_profiles_location ON driver_profiles(current_latitude, current_longitude) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_ride_id ON messages(ride_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(user_id);

-- PARTE 12: DADOS INICIAIS
INSERT INTO vehicle_categories (name, display_name, description, icon, base_price, price_per_km, price_per_minute, min_price, max_passengers, sort_order) VALUES
('economy', 'Econômico', 'Viagens econômicas para o dia a dia', 'car', 5.00, 1.50, 0.30, 8.00, 4, 1),
('comfort', 'Conforto', 'Carros mais espaçosos e confortáveis', 'car-front', 7.00, 2.00, 0.40, 12.00, 4, 2),
('premium', 'Premium', 'Experiência premium com veículos de luxo', 'crown', 12.00, 3.50, 0.60, 20.00, 4, 3),
('suv', 'SUV', 'SUVs espaçosos para grupos ou bagagens', 'truck', 10.00, 2.50, 0.50, 15.00, 6, 4),
('moto', 'Moto', 'Entregas rápidas e viagens ágeis', 'bike', 3.00, 1.00, 0.20, 5.00, 1, 5)
ON CONFLICT DO NOTHING;

INSERT INTO admin_roles (name, description, permissions) VALUES
('super_admin', 'Administrador com acesso total', '["all"]'),
('admin', 'Administrador padrão', '["users", "rides", "drivers", "support", "reports"]'),
('support', 'Agente de suporte', '["support", "users_view", "rides_view"]'),
('finance', 'Equipe financeira', '["finance", "reports", "payouts"]'),
('operations', 'Equipe de operações', '["rides", "drivers", "zones", "incentives"]')
ON CONFLICT DO NOTHING;

INSERT INTO faq_categories (name, icon, sort_order) VALUES
('Geral', 'help-circle', 1),
('Pagamentos', 'credit-card', 2),
('Viagens', 'map-pin', 3),
('Motoristas', 'user', 4),
('Segurança', 'shield', 5)
ON CONFLICT DO NOTHING;

INSERT INTO system_settings (key, value, description) VALUES
('maintenance_mode', 'false', 'Modo de manutenção do sistema'),
('min_app_version_ios', '"1.0.0"', 'Versão mínima do app iOS'),
('min_app_version_android', '"1.0.0"', 'Versão mínima do app Android'),
('default_search_radius_km', '10', 'Raio padrão de busca de motoristas em km'),
('max_scheduled_rides_per_user', '5', 'Máximo de corridas agendadas por usuário'),
('ride_cancellation_fee_percentage', '10', 'Porcentagem da taxa de cancelamento'),
('driver_commission_percentage', '20', 'Porcentagem de comissão do motorista'),
('referral_bonus_referrer', '10', 'Bônus para quem indica'),
('referral_bonus_referred', '15', 'Bônus para quem é indicado')
ON CONFLICT DO NOTHING;

-- FINALIZADO
