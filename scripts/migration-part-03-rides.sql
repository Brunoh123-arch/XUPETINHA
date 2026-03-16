-- =====================================================
-- UPPI - PARTE 3: TABELAS DE CORRIDAS
-- =====================================================

-- Rides
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  origin_address TEXT,
  origin_lat DECIMAL(10,7),
  origin_lng DECIMAL(10,7),
  destination_address TEXT,
  destination_lat DECIMAL(10,7),
  destination_lng DECIMAL(10,7),
  ride_type TEXT DEFAULT 'individual',
  vehicle_type TEXT DEFAULT 'economy',
  status TEXT DEFAULT 'searching' CHECK (status IN ('searching', 'pending_offers', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled', 'failed')),
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  payment_method TEXT DEFAULT 'pix',
  payment_status TEXT DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT,
  route_polyline TEXT,
  stops JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Offers (ofertas de motoristas)
CREATE TABLE IF NOT EXISTS price_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  offered_price DECIMAL(10,2) NOT NULL,
  estimated_arrival_minutes INTEGER,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ride_id, driver_id)
);

-- Ride Tracking
CREATE TABLE IF NOT EXISTS ride_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  heading DECIMAL(5,2),
  speed DECIMAL(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Rides
CREATE TABLE IF NOT EXISTS scheduled_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Rides
CREATE TABLE IF NOT EXISTS group_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  max_participants INTEGER DEFAULT 4,
  current_participants INTEGER DEFAULT 1,
  split_type TEXT DEFAULT 'equal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Ride Members
CREATE TABLE IF NOT EXISTS group_ride_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_ride_id UUID REFERENCES group_rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  pickup_address TEXT,
  pickup_lat DECIMAL(10,7),
  pickup_lng DECIMAL(10,7),
  share_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_ride_id, user_id)
);

-- Intercity Rides
CREATE TABLE IF NOT EXISTS intercity_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  origin_city TEXT,
  destination_city TEXT,
  departure_time TIMESTAMPTZ,
  available_seats INTEGER,
  price_per_seat DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intercity Bookings
CREATE TABLE IF NOT EXISTS intercity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intercity_ride_id UUID REFERENCES intercity_rides(id) ON DELETE CASCADE,
  passenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seats_booked INTEGER DEFAULT 1,
  total_price DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Orders
CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_name TEXT,
  receiver_phone TEXT,
  package_description TEXT,
  package_size TEXT,
  package_weight DECIMAL(5,2),
  delivery_instructions TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
