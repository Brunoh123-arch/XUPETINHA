-- ============================================================
-- XUPETINHA - Tabela profiles e driver_profiles
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABELA: profiles
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

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- TABELA: driver_profiles
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

DROP POLICY IF EXISTS "driver_profiles_select_own" ON public.driver_profiles;
DROP POLICY IF EXISTS "driver_profiles_insert_own" ON public.driver_profiles;
DROP POLICY IF EXISTS "driver_profiles_update_own" ON public.driver_profiles;

CREATE POLICY "driver_profiles_select_own" ON public.driver_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "driver_profiles_insert_own" ON public.driver_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "driver_profiles_update_own" ON public.driver_profiles FOR UPDATE USING (auth.uid() = id);

-- TABELA: driver_locations
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

DROP POLICY IF EXISTS "driver_locations_select_all" ON public.driver_locations;
DROP POLICY IF EXISTS "driver_locations_manage_own" ON public.driver_locations;

CREATE POLICY "driver_locations_select_all" ON public.driver_locations FOR SELECT USING (true);
CREATE POLICY "driver_locations_manage_own" ON public.driver_locations FOR ALL USING (auth.uid() = driver_id);

-- TRIGGER: auto-criar profile ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
