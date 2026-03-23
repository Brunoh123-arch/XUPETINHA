-- =================================================================
-- UPPI: Adicionar Tabelas Realmente Faltantes
-- =================================================================
-- Apenas tabelas que NAO existem no banco atual (71 tabelas)
-- =================================================================

-- ===== USUARIOS =====

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language VARCHAR(10) DEFAULT 'pt-BR',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  dark_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_settings_own" ON user_settings FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method VARCHAR(20) NOT NULL CHECK (method IN ('totp', 'sms', 'email')),
  secret_encrypted TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, method)
);
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_2fa_own" ON user_2fa FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_activity_own" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity_log(created_at);

CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(255),
  device_name VARCHAR(100),
  device_type VARCHAR(50),
  os VARCHAR(50),
  os_version VARCHAR(20),
  app_version VARCHAR(20),
  fcm_token TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_devices_own" ON user_devices FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_sessions_own" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE TABLE IF NOT EXISTS user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  device_id UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  success BOOLEAN DEFAULT TRUE,
  failure_reason VARCHAR(100)
);
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_login_own" ON user_login_history FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_user ON user_login_history(user_id);

CREATE TABLE IF NOT EXISTS trust_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  score DECIMAL(5, 2) DEFAULT 50.0 CHECK (score >= 0 AND score <= 100),
  total_rides INTEGER DEFAULT 0,
  completed_rides INTEGER DEFAULT 0,
  cancelled_rides INTEGER DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  reports_filed INTEGER DEFAULT 0,
  reports_received INTEGER DEFAULT 0,
  verified_phone BOOLEAN DEFAULT FALSE,
  verified_email BOOLEAN DEFAULT FALSE,
  verified_identity BOOLEAN DEFAULT FALSE,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trust_score_own" ON trust_scores FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  is_current BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avatars_own" ON avatars FOR ALL USING (auth.uid() = user_id);

-- ===== MOTORISTAS EXTRAS =====

CREATE TABLE IF NOT EXISTS driver_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'expired')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_verifications_own" ON driver_verifications FOR SELECT 
  USING (EXISTS (SELECT 1 FROM driver_profiles WHERE id = driver_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS driver_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  penalty_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  penalty_points INTEGER DEFAULT 0,
  fine_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'appealed', 'resolved', 'expired')),
  issued_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_penalties_own" ON driver_penalties FOR SELECT 
  USING (EXISTS (SELECT 1 FROM driver_profiles WHERE id = driver_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS driver_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  rides_completed INTEGER DEFAULT 0,
  rides_cancelled INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2),
  total_earnings DECIMAL(15, 2) DEFAULT 0,
  total_tips DECIMAL(15, 2) DEFAULT 0,
  total_bonuses DECIMAL(15, 2) DEFAULT 0,
  online_hours DECIMAL(10, 2) DEFAULT 0,
  busy_hours DECIMAL(10, 2) DEFAULT 0,
  acceptance_rate DECIMAL(5, 2),
  cancellation_rate DECIMAL(5, 2),
  response_time_avg INTEGER,
  on_time_rate DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_performance_own" ON driver_performance FOR SELECT 
  USING (EXISTS (SELECT 1 FROM driver_profiles WHERE id = driver_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS driver_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  min_rides INTEGER DEFAULT 0,
  min_rating DECIMAL(3, 2) DEFAULT 0,
  min_acceptance_rate DECIMAL(5, 2) DEFAULT 0,
  commission_rate DECIMAL(5, 2) NOT NULL,
  benefits JSONB DEFAULT '[]',
  badge_icon VARCHAR(255),
  badge_color VARCHAR(20),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_levels_public" ON driver_levels FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS driver_level_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  current_level_id UUID REFERENCES driver_levels(id),
  next_level_id UUID REFERENCES driver_levels(id),
  rides_to_next INTEGER,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_level_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_level_progress_own" ON driver_level_progress FOR SELECT 
  USING (EXISTS (SELECT 1 FROM driver_profiles WHERE id = driver_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS driver_shift_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  total_online_minutes INTEGER,
  total_busy_minutes INTEGER,
  rides_completed INTEGER DEFAULT 0,
  earnings DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_shift_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_shift_own" ON driver_shift_logs FOR ALL 
  USING (EXISTS (SELECT 1 FROM driver_profiles WHERE id = driver_id AND user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_driver_shift_driver ON driver_shift_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_shift_clock ON driver_shift_logs(clock_in);

CREATE TABLE IF NOT EXISTS driver_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  fee DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(15, 2) NOT NULL,
  method VARCHAR(50) NOT NULL CHECK (method IN ('pix', 'bank_transfer', 'debit_card')),
  pix_key VARCHAR(255),
  bank_name VARCHAR(100),
  bank_agency VARCHAR(20),
  bank_account VARCHAR(30),
  bank_account_type VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  failure_reason TEXT,
  transaction_id VARCHAR(255),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE driver_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_withdrawals_own" ON driver_withdrawals FOR ALL 
  USING (EXISTS (SELECT 1 FROM driver_profiles WHERE id = driver_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE UNIQUE,
  is_online BOOLEAN DEFAULT FALSE,
  is_busy BOOLEAN DEFAULT FALSE,
  current_ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  heading DECIMAL(6, 2),
  speed DECIMAL(6, 2),
  last_location_at TIMESTAMP WITH TIME ZONE,
  battery_level INTEGER,
  app_version VARCHAR(20),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE driver_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_availability_own" ON driver_availability FOR ALL 
  USING (EXISTS (SELECT 1 FROM driver_profiles WHERE id = driver_id AND user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_driver_availability_online ON driver_availability(is_online) WHERE is_online = TRUE;
CREATE INDEX IF NOT EXISTS idx_driver_availability_location ON driver_availability(latitude, longitude);

-- ===== CORRIDAS EXTRAS =====

CREATE TABLE IF NOT EXISTS ride_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  offered_price DECIMAL(15, 2),
  eta_minutes INTEGER,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(ride_id, driver_id)
);
ALTER TABLE ride_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_offers_passenger" ON ride_offers FOR SELECT 
  USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND passenger_id = auth.uid()));
CREATE POLICY "ride_offers_driver" ON ride_offers FOR ALL 
  USING (EXISTS (SELECT 1 FROM driver_profiles WHERE id = driver_id AND user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS ride_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  checkpoint_type VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  reached_at TIMESTAMP WITH TIME ZONE,
  sequence INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_checkpoints_public" ON ride_checkpoints FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS ride_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  actor_id UUID REFERENCES auth.users(id),
  actor_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_events_public" ON ride_events FOR SELECT USING (TRUE);
CREATE INDEX IF NOT EXISTS idx_ride_events_ride ON ride_events(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_events_type ON ride_events(event_type);

CREATE TABLE IF NOT EXISTS ride_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  photo_type VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_photos_public" ON ride_photos FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS ride_route_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  sequence INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ride_route_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ride_route_public" ON ride_route_points FOR SELECT USING (TRUE);
CREATE INDEX IF NOT EXISTS idx_ride_route_ride ON ride_route_points(ride_id);

CREATE TABLE IF NOT EXISTS price_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES auth.users(id),
  initiator_type VARCHAR(20) NOT NULL CHECK (initiator_type IN ('passenger', 'driver')),
  proposed_price DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired')),
  counter_price DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE price_negotiations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_neg_own" ON price_negotiations FOR ALL USING (auth.uid() = initiator_id);

-- ===== SERVICOS ESPECIAIS =====

CREATE TABLE IF NOT EXISTS intercity_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_city VARCHAR(100) NOT NULL,
  origin_state VARCHAR(50) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  destination_state VARCHAR(50) NOT NULL,
  distance_km DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,
  base_price DECIMAL(15, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE intercity_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercity_routes_public" ON intercity_routes FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS intercity_rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES intercity_routes(id) ON DELETE SET NULL,
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  departure_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_datetime TIMESTAMP WITH TIME ZONE,
  available_seats INTEGER NOT NULL CHECK (available_seats > 0),
  price_per_seat DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE intercity_rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercity_rides_public" ON intercity_rides FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS intercity_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intercity_ride_id UUID NOT NULL REFERENCES intercity_rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats_booked INTEGER DEFAULT 1 CHECK (seats_booked > 0),
  total_price DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  pickup_point TEXT,
  dropoff_point TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE intercity_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercity_bookings_own" ON intercity_bookings FOR ALL USING (auth.uid() = passenger_id);

-- ===== CORPORATIVO EXTRAS =====

CREATE TABLE IF NOT EXISTS corporate_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  rides_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  notes TEXT,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE corporate_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "corp_invoices_admin" ON corporate_invoices FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS corporate_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id UUID NOT NULL REFERENCES corporate_accounts(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50),
  manager_id UUID REFERENCES auth.users(id),
  monthly_budget DECIMAL(15, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(corporate_id, code)
);
ALTER TABLE corporate_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "corp_depts_public" ON corporate_departments FOR SELECT USING (TRUE);

-- ===== ADMIN EXTRAS =====

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(admin_id, permission)
);
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_perms_admin" ON admin_permissions FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  type VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_notifs_own" ON admin_notifications FOR ALL USING (TRUE);

-- ===== FUNCOES AUXILIARES =====

-- Funcao para buscar motoristas disponiveis proximos
CREATE OR REPLACE FUNCTION find_nearby_drivers(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius_km DECIMAL DEFAULT 5,
  p_category_id UUID DEFAULT NULL
)
RETURNS TABLE (
  driver_id UUID,
  user_id UUID,
  distance_km DECIMAL,
  rating DECIMAL,
  vehicle_id UUID,
  vehicle_category UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id AS driver_id,
    dp.user_id,
    (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(da.latitude)) *
        cos(radians(da.longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(da.latitude))
      )
    )::DECIMAL AS distance_km,
    dp.rating,
    v.id AS vehicle_id,
    v.category_id AS vehicle_category
  FROM driver_profiles dp
  JOIN driver_availability da ON da.driver_id = dp.id
  LEFT JOIN vehicles v ON v.driver_id = dp.id AND v.is_primary = TRUE AND v.is_active = TRUE
  WHERE dp.is_verified = TRUE
    AND dp.is_online = TRUE
    AND da.is_online = TRUE
    AND da.is_busy = FALSE
    AND (p_category_id IS NULL OR v.category_id = p_category_id)
    AND (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(da.latitude)) *
        cos(radians(da.longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(da.latitude))
      )
    ) <= p_radius_km
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$;

-- Funcao para calcular preco estimado
CREATE OR REPLACE FUNCTION calculate_ride_price(
  p_distance_km DECIMAL,
  p_duration_minutes INTEGER,
  p_category_id UUID,
  p_city VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_category RECORD;
  v_city_config RECORD;
  v_base_price DECIMAL;
  v_distance_price DECIMAL;
  v_time_price DECIMAL;
  v_total_price DECIMAL;
  v_min_price DECIMAL;
  v_surge DECIMAL := 1.0;
BEGIN
  -- Buscar categoria
  SELECT * INTO v_category FROM vehicle_categories WHERE id = p_category_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Categoria nao encontrada');
  END IF;

  -- Buscar config da cidade se informada
  IF p_city IS NOT NULL THEN
    SELECT * INTO v_city_config FROM city_configurations WHERE city = p_city AND is_active = TRUE;
    IF FOUND THEN
      v_surge := COALESCE(v_city_config.surge_multiplier, 1.0);
    END IF;
  END IF;

  -- Calcular precos
  v_base_price := v_category.base_price;
  v_distance_price := p_distance_km * v_category.price_per_km;
  v_time_price := p_duration_minutes * v_category.price_per_minute;
  v_total_price := (v_base_price + v_distance_price + v_time_price) * v_surge;
  v_min_price := v_category.min_price;

  -- Aplicar preco minimo
  IF v_total_price < v_min_price THEN
    v_total_price := v_min_price;
  END IF;

  RETURN jsonb_build_object(
    'base_price', v_base_price,
    'distance_price', v_distance_price,
    'time_price', v_time_price,
    'surge_multiplier', v_surge,
    'subtotal', v_base_price + v_distance_price + v_time_price,
    'total_price', ROUND(v_total_price, 2),
    'min_price', v_min_price,
    'currency', 'BRL'
  );
END;
$$;

-- Funcao para atualizar trust score
CREATE OR REPLACE FUNCTION update_trust_score(p_user_id UUID)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score DECIMAL := 50.0;
  v_rides_completed INTEGER;
  v_rides_cancelled INTEGER;
  v_avg_rating DECIMAL;
  v_reports_received INTEGER;
  v_verified_phone BOOLEAN;
  v_verified_email BOOLEAN;
BEGIN
  -- Buscar dados do usuario
  SELECT 
    COALESCE(total_rides, 0),
    COALESCE(rating, 0)
  INTO v_rides_completed, v_avg_rating
  FROM profiles WHERE id = p_user_id;

  SELECT COUNT(*) INTO v_rides_cancelled
  FROM rides WHERE passenger_id = p_user_id AND status = 'cancelled' AND cancelled_by = 'passenger';

  SELECT COUNT(*) INTO v_reports_received
  FROM reports WHERE reported_id = p_user_id AND status = 'confirmed';

  SELECT 
    phone IS NOT NULL,
    email IS NOT NULL
  INTO v_verified_phone, v_verified_email
  FROM profiles WHERE id = p_user_id;

  -- Calcular score
  v_score := 50.0;
  
  -- Bonus por corridas completadas (max +20)
  v_score := v_score + LEAST(v_rides_completed * 0.5, 20);
  
  -- Bonus por rating (max +15)
  IF v_avg_rating > 0 THEN
    v_score := v_score + (v_avg_rating - 3) * 5;
  END IF;
  
  -- Penalidade por cancelamentos (max -15)
  IF v_rides_completed > 0 THEN
    v_score := v_score - LEAST((v_rides_cancelled::DECIMAL / v_rides_completed) * 30, 15);
  END IF;
  
  -- Penalidade por reports (-5 cada)
  v_score := v_score - (v_reports_received * 5);
  
  -- Bonus por verificacoes
  IF v_verified_phone THEN v_score := v_score + 5; END IF;
  IF v_verified_email THEN v_score := v_score + 5; END IF;
  
  -- Limitar entre 0 e 100
  v_score := GREATEST(0, LEAST(100, v_score));

  -- Atualizar ou inserir
  INSERT INTO trust_scores (user_id, score, total_rides, completed_rides, cancelled_rides, average_rating, reports_received, verified_phone, verified_email, last_calculated)
  VALUES (p_user_id, v_score, v_rides_completed, v_rides_completed, v_rides_cancelled, v_avg_rating, v_reports_received, v_verified_phone, v_verified_email, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    score = EXCLUDED.score,
    total_rides = EXCLUDED.total_rides,
    completed_rides = EXCLUDED.completed_rides,
    cancelled_rides = EXCLUDED.cancelled_rides,
    average_rating = EXCLUDED.average_rating,
    reports_received = EXCLUDED.reports_received,
    verified_phone = EXCLUDED.verified_phone,
    verified_email = EXCLUDED.verified_email,
    last_calculated = NOW();

  RETURN v_score;
END;
$$;

-- Trigger para criar trust_score ao criar profile
CREATE OR REPLACE FUNCTION create_trust_score_on_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO trust_scores (user_id, score)
  VALUES (NEW.id, 50.0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_create_trust_score ON profiles;
CREATE TRIGGER trigger_create_trust_score
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_trust_score_on_profile();

-- ===== INDICES ADICIONAIS PARA PERFORMANCE =====

CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_passenger ON rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_created ON rides(created_at);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON driver_profiles(is_online) WHERE is_online = TRUE;
CREATE INDEX IF NOT EXISTS idx_driver_profiles_verified ON driver_profiles(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON vehicles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = FALSE;

-- ===== FIM =====
