-- ============================================================
-- Uppi — Configuração inicial do banco de dados no Supabase
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Tabela: profiles (espelho público de auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  user_type     TEXT NOT NULL DEFAULT 'passenger' CHECK (user_type IN ('passenger', 'driver', 'admin')),
  status        TEXT NOT NULL DEFAULT 'active'    CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
  fcm_token     TEXT,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  referred_by   UUID REFERENCES public.profiles(id),
  wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.user_type = 'admin'
    )
  );

-- ============================================================
-- Trigger: cria perfil automaticamente ao cadastrar usuário
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
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture'),
    CASE
      WHEN NEW.raw_user_meta_data ->> 'role' = 'driver' THEN 'driver'
      ELSE 'passenger'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Tabela: driver_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                  TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  license_number          TEXT,
  license_category        TEXT,
  license_expiry          DATE,
  cpf                     TEXT,
  pix_key                 TEXT,
  bank_name               TEXT,
  bank_account            TEXT,
  bank_agency             TEXT,
  is_online               BOOLEAN NOT NULL DEFAULT false,
  current_lat             NUMERIC(10, 7),
  current_lng             NUMERIC(10, 7),
  rating                  NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  total_rides             INTEGER NOT NULL DEFAULT 0,
  total_earnings          NUMERIC(12, 2) NOT NULL DEFAULT 0,
  background_check_status TEXT NOT NULL DEFAULT 'pending',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "driver_profiles_select_own" ON public.driver_profiles;
DROP POLICY IF EXISTS "driver_profiles_update_own" ON public.driver_profiles;

CREATE POLICY "driver_profiles_select_own" ON public.driver_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "driver_profiles_update_own" ON public.driver_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Tabela: rides
-- ============================================================
CREATE TABLE IF NOT EXISTS public.rides (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id        UUID NOT NULL REFERENCES public.profiles(id),
  driver_id           UUID REFERENCES public.driver_profiles(id),
  status              TEXT NOT NULL DEFAULT 'searching',
  ride_type           TEXT NOT NULL DEFAULT 'individual',
  pickup_address      TEXT NOT NULL,
  pickup_lat          NUMERIC(10, 7) NOT NULL,
  pickup_lng          NUMERIC(10, 7) NOT NULL,
  dropoff_address     TEXT NOT NULL,
  dropoff_lat         NUMERIC(10, 7) NOT NULL,
  dropoff_lng         NUMERIC(10, 7) NOT NULL,
  distance_km         NUMERIC(8, 2),
  duration_minutes    INTEGER,
  estimated_price     NUMERIC(10, 2),
  final_price         NUMERIC(10, 2),
  payment_method      TEXT,
  payment_status      TEXT NOT NULL DEFAULT 'pending',
  discount_amount     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  promo_code          TEXT,
  notes               TEXT,
  scheduled_at        TIMESTAMPTZ,
  accepted_at         TIMESTAMPTZ,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by        UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rides_passenger_select" ON public.rides;
DROP POLICY IF EXISTS "rides_passenger_insert" ON public.rides;

CREATE POLICY "rides_passenger_select" ON public.rides
  FOR SELECT USING (auth.uid() = passenger_id OR
    auth.uid() = (SELECT user_id FROM public.driver_profiles WHERE id = driver_id));

CREATE POLICY "rides_passenger_insert" ON public.rides
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- ============================================================
-- Tabela: chat_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id    UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES public.profiles(id),
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'text',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select" ON public.chat_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT passenger_id FROM public.rides WHERE id = ride_id
      UNION
      SELECT dp.user_id FROM public.driver_profiles dp
        JOIN public.rides r ON r.driver_id = dp.id WHERE r.id = ride_id
    )
  );

-- ============================================================
-- Tabela: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT false,
  read_at    TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Tabela: favorites (endereços favoritos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  lat        NUMERIC(10, 7) NOT NULL,
  lng        NUMERIC(10, 7) NOT NULL,
  type       TEXT CHECK (type IN ('home', 'work', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_update_own" ON public.favorites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Tabela: admin_users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  permissions   JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select_own" ON public.admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Função: atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles', 'driver_profiles', 'rides', 'favorites', 'admin_users']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', t, t);
  END LOOP;
END;
$$;
