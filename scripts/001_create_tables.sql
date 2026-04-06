-- =============================================================================
-- XUPETINHA — CRIAÇÃO DE TABELAS BASE
-- =============================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Função updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função generate_referral_code
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

-- =============================================================================
-- TABELAS BASE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- =============================================================================
-- TABELAS COM DEPENDÊNCIAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cnh_number text,
  cnh_category text,
  cnh_expiry date,
  cnh_front_url text,
  cnh_back_url text,
  selfie_url text,
  criminal_record_url text,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid,
  rejection_reason text,
  status text DEFAULT 'pending',
  documents_status jsonb DEFAULT '{}',
  rating numeric DEFAULT 5.0,
  total_trips integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  is_online boolean DEFAULT false,
  current_location geography(Point, 4326),
  last_location_update timestamptz,
  acceptance_rate numeric DEFAULT 100,
  cancellation_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.vehicle_categories(id),
  type_id uuid REFERENCES public.vehicle_types(id),
  plate text NOT NULL,
  brand text,
  model text,
  year integer,
  color text,
  renavam text,
  document_url text,
  photo_url text,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vehicle_accessibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.accessibility_features(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vehicle_id, feature_id)
);

CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  place_id text,
  is_default boolean DEFAULT false,
  icon text DEFAULT 'map-pin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id uuid NOT NULL REFERENCES public.profiles(id),
  driver_id uuid REFERENCES public.driver_profiles(id),
  vehicle_id uuid REFERENCES public.vehicles(id),
  category_id uuid REFERENCES public.vehicle_categories(id),
  origin_address text NOT NULL,
  origin_latitude numeric NOT NULL,
  origin_longitude numeric NOT NULL,
  destination_address text NOT NULL,
  destination_latitude numeric NOT NULL,
  destination_longitude numeric NOT NULL,
  distance_km numeric,
  duration_minutes numeric,
  estimated_price numeric,
  final_price numeric,
  surge_multiplier numeric DEFAULT 1.0,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'cash',
  payment_status text DEFAULT 'pending',
  passenger_rating numeric,
  driver_rating numeric,
  passenger_comment text,
  driver_comment text,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by text,
  cancellation_reason text,
  route_polyline text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.driver_profiles(id),
  status text DEFAULT 'pending',
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(ride_id, driver_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES public.rides(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  method text NOT NULL,
  status text DEFAULT 'pending',
  transaction_id text,
  gateway_response jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  balance_after numeric,
  description text,
  reference_type text,
  reference_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.driver_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0,
  pending_balance numeric DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  total_withdrawn numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(driver_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text DEFAULT 'general',
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  ride_id uuid REFERENCES public.rides(id),
  subject text NOT NULL,
  description text,
  category text DEFAULT 'general',
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  assigned_to uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  message text NOT NULL,
  attachments jsonb DEFAULT '[]',
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id),
  message text NOT NULL,
  type text DEFAULT 'text',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress numeric DEFAULT 0,
  completed_at timestamptz,
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE IF NOT EXISTS public.user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES public.rewards(id),
  redeemed_at timestamptz DEFAULT now(),
  used_at timestamptz,
  expires_at timestamptz,
  code text UNIQUE
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id),
  referred_id uuid NOT NULL REFERENCES public.profiles(id),
  bonus_given boolean DEFAULT false,
  bonus_amount numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_id)
);

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  min_ride_value numeric,
  max_discount numeric,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  used_at timestamptz DEFAULT now(),
  ride_id uuid REFERENCES public.rides(id),
  UNIQUE(user_id, promo_code_id)
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.admin_roles(id),
  permissions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.admin_users(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.surge_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  polygon geography(Polygon, 4326),
  multiplier numeric DEFAULT 1.0,
  is_active boolean DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ride_safety_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  type text NOT NULL,
  triggered_by uuid REFERENCES public.profiles(id),
  status text DEFAULT 'pending',
  resolved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);
