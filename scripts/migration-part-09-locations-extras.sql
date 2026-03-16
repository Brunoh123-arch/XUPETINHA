-- =====================================================
-- UPPI - PARTE 9: LOCALIZACAO E EXTRAS
-- =====================================================

-- Hot Zones
CREATE TABLE IF NOT EXISTS hot_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),
  radius_km DECIMAL(5,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- City Zones
CREATE TABLE IF NOT EXISTS city_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  polygon JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorite Addresses
CREATE TABLE IF NOT EXISTS favorite_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorite Drivers
CREATE TABLE IF NOT EXISTS favorite_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, driver_id)
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Popular Routes
CREATE TABLE IF NOT EXISTS popular_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_name TEXT,
  origin_lat DECIMAL(10,7),
  origin_lng DECIMAL(10,7),
  destination_name TEXT,
  destination_lat DECIMAL(10,7),
  destination_lng DECIMAL(10,7),
  ride_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Address History
CREATE TABLE IF NOT EXISTS address_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  times_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Address Search History
CREATE TABLE IF NOT EXISTS address_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ride Route Points (pontos da rota)
CREATE TABLE IF NOT EXISTS ride_route_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Group Ride Participants
CREATE TABLE IF NOT EXISTS group_ride_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_ride_id UUID REFERENCES group_rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_ride_id, user_id)
);
