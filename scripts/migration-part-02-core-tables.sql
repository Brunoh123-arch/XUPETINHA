-- =====================================================
-- UPPI - PARTE 2: TABELAS CORE
-- =====================================================

-- Profiles (conectado ao auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  cpf TEXT UNIQUE,
  birth_date DATE,
  user_type TEXT DEFAULT 'passenger' CHECK (user_type IN ('passenger', 'driver', 'admin')),
  is_admin BOOLEAN DEFAULT FALSE,
  is_driver BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Profiles
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  cnh TEXT,
  cnh_category TEXT,
  cnh_expiry DATE,
  cnh_photo_url TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_online BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 100,
  cancellation_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES driver_profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT DEFAULT 'economy',
  brand TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  plate TEXT UNIQUE,
  renavam TEXT,
  crlv_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  seats INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Locations (com PostGIS)
CREATE TABLE IF NOT EXISTS driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  heading DECIMAL(5,2) DEFAULT 0,
  speed DECIMAL(8,2) DEFAULT 0,
  accuracy DECIMAL(8,2),
  is_online BOOLEAN DEFAULT FALSE,
  last_ride_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice geoespacial
CREATE INDEX IF NOT EXISTS idx_driver_locations_geo 
ON driver_locations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
