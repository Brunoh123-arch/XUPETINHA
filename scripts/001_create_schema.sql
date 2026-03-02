-- ============================================================
-- XUPETINHA / UPPI - Schema completo do banco de dados
-- ============================================================

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELA: profiles
-- Estende auth.users com dados públicos do usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'passenger' CHECK (user_type IN ('passenger', 'driver', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  referred_by TEXT,
  fcm_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- ============================================================
-- TABELA: driver_profiles
-- Perfil estendido de motoristas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  cpf TEXT,
  rg TEXT,
  date_of_birth DATE,
  license_number TEXT,
  license_category TEXT,
  license_expiry DATE,
  license_photo_url TEXT,
  selfie_photo_url TEXT,
  vehicle_type TEXT DEFAULT 'standard',
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_color TEXT,
  vehicle_plate TEXT,
  vehicle_photo_url TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_agency TEXT,
  pix_key TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  total_earnings NUMERIC(10, 2) DEFAULT 0,
  background_check_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver_profiles_select_own" ON public.driver_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "driver_profiles_insert_own" ON public.driver_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "driver_profiles_update_own" ON public.driver_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "driver_profiles_select_admin" ON public.driver_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- ============================================================
-- TABELA: driver_locations
-- Localização em tempo real dos motoristas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  heading NUMERIC(5, 2),
  speed NUMERIC(6, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver_locations_select_all" ON public.driver_locations FOR SELECT USING (true);
CREATE POLICY "driver_locations_manage_own" ON public.driver_locations FOR ALL USING (auth.uid() = driver_id);

-- ============================================================
-- TABELA: rides
-- Corridas solicitadas pelos passageiros
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'searching' CHECK (status IN (
    'searching', 'pending_offers', 'accepted', 'driver_arrived',
    'in_progress', 'completed', 'cancelled', 'failed'
  )),
  ride_type TEXT DEFAULT 'individual' CHECK (ride_type IN (
    'individual', 'shared', 'scheduled', 'delivery', 'intercity'
  )),
  pickup_address TEXT NOT NULL,
  pickup_lat NUMERIC(10, 7) NOT NULL,
  pickup_lng NUMERIC(10, 7) NOT NULL,
  dropoff_address TEXT NOT NULL,
  dropoff_lat NUMERIC(10, 7) NOT NULL,
  dropoff_lng NUMERIC(10, 7) NOT NULL,
  distance_km NUMERIC(8, 2),
  duration_minutes INTEGER,
  estimated_price NUMERIC(10, 2),
  final_price NUMERIC(10, 2),
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  scheduled_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by UUID,
  notes TEXT,
  route_polyline TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  max_passengers INTEGER DEFAULT 1,
  current_passengers INTEGER DEFAULT 1,
  promo_code TEXT,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rides_select_participant" ON public.rides FOR SELECT USING (
  auth.uid() = passenger_id OR auth.uid() = driver_id
);
CREATE POLICY "rides_insert_passenger" ON public.rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "rides_update_participant" ON public.rides FOR UPDATE USING (
  auth.uid() = passenger_id OR auth.uid() = driver_id
);
CREATE POLICY "rides_select_admin" ON public.rides FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);
CREATE POLICY "rides_update_admin" ON public.rides FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- ============================================================
-- TABELA: ride_offers
-- Ofertas dos motoristas para uma corrida
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ride_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  offered_price NUMERIC(10, 2) NOT NULL,
  estimated_arrival_minutes INTEGER,
  message TEXT,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes',
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ride_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ride_offers_select" ON public.ride_offers FOR SELECT USING (
  auth.uid() = driver_id OR
  EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND passenger_id = auth.uid())
);
CREATE POLICY "ride_offers_insert_driver" ON public.ride_offers FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "ride_offers_update" ON public.ride_offers FOR UPDATE USING (
  auth.uid() = driver_id OR
  EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND passenger_id = auth.uid())
);

-- ============================================================
-- TABELA: messages
-- Chat entre passageiro e motorista
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_receiver" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================================
-- TABELA: reviews
-- Avaliações de corridas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  tags TEXT[] DEFAULT '{}',
  is_driver_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ============================================================
-- TABELA: wallet_transactions
-- Transações financeiras da carteira
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ride', 'refund', 'bonus', 'cashback', 'referral', 'subscription', 'withdrawal', 'deposit')),
  amount NUMERIC(10, 2) NOT NULL,
  balance_after NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_select_own" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallet_insert_own" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABELA: favorites
-- Locais favoritos do usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  type TEXT DEFAULT 'other' CHECK (type IN ('home', 'work', 'other')),
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_manage_own" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: coupons
-- Cupons de desconto
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL,
  min_ride_value NUMERIC(10, 2),
  max_discount NUMERIC(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  user_usage_limit INTEGER DEFAULT 1,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  applicable_to JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_select_active" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "coupons_manage_admin" ON public.coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- ============================================================
-- TABELA: coupon_uses
-- Registro de uso de cupons por usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS public.coupon_uses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES public.rides(id),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupon_uses_select_own" ON public.coupon_uses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "coupon_uses_insert_own" ON public.coupon_uses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABELA: notifications
-- Notificações do usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'system' CHECK (type IN ('ride', 'offer', 'message', 'achievement', 'promotion', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_manage_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: emergency_contacts
-- Contatos de emergência
-- ============================================================
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emergency_contacts_manage_own" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: achievements
-- Conquistas disponíveis no sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  type TEXT NOT NULL,
  requirement_value INTEGER,
  points INTEGER DEFAULT 0,
  badge_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select_all" ON public.achievements FOR SELECT USING (true);

-- ============================================================
-- TABELA: user_achievements
-- Conquistas desbloqueadas por usuários
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_manage_own" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: leaderboard
-- Ranking de usuários por período
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'all_time')),
  points INTEGER DEFAULT 0,
  rank INTEGER,
  total_rides INTEGER DEFAULT 0,
  total_distance_km NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaderboard_select_all" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "leaderboard_manage_admin" ON public.leaderboard FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- ============================================================
-- TABELA: social_posts
-- Posts na rede social interna
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_posts_select_all" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "social_posts_manage_own" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "social_posts_update_own" ON public.social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "social_posts_delete_own" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: subscriptions
-- Planos de assinatura dos usuários
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_price NUMERIC(10, 2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  benefits JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_manage_own" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: promotions
-- Promoções e campanhas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  promo_type TEXT NOT NULL CHECK (promo_type IN ('discount', 'cashback', 'bonus', 'free_rides')),
  value NUMERIC(10, 2),
  target_audience JSONB DEFAULT '{}',
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_usage INTEGER,
  current_usage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotions_select_active" ON public.promotions FOR SELECT USING (is_active = true);
CREATE POLICY "promotions_manage_admin" ON public.promotions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- ============================================================
-- TABELA: hot_zones
-- Zonas quentes para motoristas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hot_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lat NUMERIC(10, 7) NOT NULL,
  lng NUMERIC(10, 7) NOT NULL,
  radius_km NUMERIC(5, 2) DEFAULT 1.0,
  surge_multiplier NUMERIC(4, 2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  active_from TIMESTAMPTZ,
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hot_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hot_zones_select_all" ON public.hot_zones FOR SELECT USING (true);
CREATE POLICY "hot_zones_manage_admin" ON public.hot_zones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
);

-- ============================================================
-- TABELA: push_subscriptions
-- Assinaturas de push notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_subscriptions_manage_own" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- TABELA: admin_users
-- Usuários administradores do sistema
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'support')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select_admin" ON public.admin_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin') OR
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- ============================================================
-- FUNÇÃO: Auto-criar perfil ao registrar usuário
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'passenger')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNÇÃO: Calcular saldo da carteira
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_wallet_balance(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT COALESCE(SUM(
    CASE
      WHEN type IN ('deposit', 'refund', 'bonus', 'cashback', 'referral') THEN amount
      WHEN type IN ('ride', 'subscription', 'withdrawal') THEN -amount
      ELSE 0
    END
  ), 0)
  INTO v_balance
  FROM public.wallet_transactions
  WHERE user_id = p_user_id;

  RETURN v_balance;
END;
$$;

-- ============================================================
-- FUNÇÃO: Encontrar motoristas próximos
-- ============================================================
CREATE OR REPLACE FUNCTION public.find_nearby_drivers(
  pickup_lat NUMERIC,
  pickup_lng NUMERIC,
  radius_km NUMERIC DEFAULT 5,
  vehicle_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  driver_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  rating NUMERIC,
  total_rides INTEGER,
  vehicle_type TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  vehicle_plate TEXT,
  lat NUMERIC,
  lng NUMERIC,
  distance_km NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.id AS driver_id,
    p.full_name,
    p.avatar_url,
    dp.rating,
    dp.total_rides,
    dp.vehicle_type,
    dp.vehicle_brand,
    dp.vehicle_model,
    dp.vehicle_color,
    dp.vehicle_plate,
    dl.lat,
    dl.lng,
    ROUND(
      (6371 * acos(
        LEAST(1.0, cos(radians(pickup_lat)) * cos(radians(dl.lat)) *
        cos(radians(dl.lng) - radians(pickup_lng)) +
        sin(radians(pickup_lat)) * sin(radians(dl.lat)))
      ))::NUMERIC, 2
    ) AS distance_km
  FROM public.driver_profiles dp
  JOIN public.profiles p ON p.id = dp.id
  JOIN public.driver_locations dl ON dl.driver_id = dp.id
  WHERE
    dp.is_online = TRUE
    AND dp.status = 'approved'
    AND (vehicle_type_filter IS NULL OR dp.vehicle_type = vehicle_type_filter)
    AND (6371 * acos(
      LEAST(1.0, cos(radians(pickup_lat)) * cos(radians(dl.lat)) *
      cos(radians(dl.lng) - radians(pickup_lng)) +
      sin(radians(pickup_lat)) * sin(radians(dl.lat)))
    )) <= radius_km
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$;

-- ============================================================
-- FUNÇÃO: Calcular preço da corrida
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_ride_price(
  distance_km NUMERIC,
  duration_minutes INTEGER,
  vehicle_type_param TEXT DEFAULT 'standard'
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_fare NUMERIC := 5.00;
  per_km_rate NUMERIC := 2.50;
  per_minute_rate NUMERIC := 0.30;
  multiplier NUMERIC := 1.0;
  final_price NUMERIC;
BEGIN
  -- Ajusta multiplicador por tipo de veículo
  CASE vehicle_type_param
    WHEN 'premium' THEN multiplier := 2.0;
    WHEN 'comfort' THEN multiplier := 1.5;
    WHEN 'suv' THEN multiplier := 1.8;
    WHEN 'van' THEN multiplier := 2.2;
    WHEN 'moto' THEN multiplier := 0.7;
    ELSE multiplier := 1.0;
  END CASE;

  final_price := (base_fare + (distance_km * per_km_rate) + (duration_minutes * per_minute_rate)) * multiplier;

  -- Preço mínimo de R$5,00
  RETURN GREATEST(final_price, 5.00);
END;
$$;

-- ============================================================
-- Índices para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_rides_passenger_id ON public.rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON public.rides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ride_offers_ride_id ON public.ride_offers(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_offers_driver_id ON public.ride_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_messages_ride_id ON public.messages(ride_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON public.driver_locations(driver_id);
