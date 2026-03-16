-- =====================================================
-- UPPI - PARTE 14: RPCs PRINCIPAIS
-- =====================================================

-- RPC: Buscar motoristas proximos
CREATE OR REPLACE FUNCTION find_nearby_drivers(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius_km DECIMAL DEFAULT 5,
  p_vehicle_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  driver_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  rating DECIMAL,
  distance_km DECIMAL,
  vehicle_type TEXT,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  vehicle_plate TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dl.driver_id,
    p.full_name,
    p.avatar_url,
    dp.rating,
    (ST_Distance(
      ST_SetSRID(ST_MakePoint(dl.longitude, dl.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) / 1000)::DECIMAL AS distance_km,
    v.vehicle_type,
    v.brand AS vehicle_brand,
    v.model AS vehicle_model,
    v.color AS vehicle_color,
    v.plate AS vehicle_plate
  FROM driver_locations dl
  JOIN profiles p ON p.id = dl.driver_id
  JOIN driver_profiles dp ON dp.user_id = dl.driver_id
  LEFT JOIN vehicles v ON v.driver_id = dp.id AND v.is_active = true
  WHERE dl.is_online = true
    AND dp.status = 'approved'
    AND dp.is_available = true
    AND (p_vehicle_type IS NULL OR v.vehicle_type = p_vehicle_type)
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(dl.longitude, dl.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- RPC: Aceitar corrida
CREATE OR REPLACE FUNCTION accept_ride(
  p_ride_id UUID,
  p_driver_id UUID,
  p_offer_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_ride rides;
  v_price DECIMAL;
BEGIN
  SELECT * INTO v_ride FROM rides WHERE id = p_ride_id FOR UPDATE;
  
  IF v_ride IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Corrida nao encontrada');
  END IF;
  
  IF v_ride.status NOT IN ('searching', 'pending_offers') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Corrida ja foi aceita ou cancelada');
  END IF;
  
  IF p_offer_id IS NOT NULL THEN
    SELECT offered_price INTO v_price FROM price_offers WHERE id = p_offer_id;
  ELSE
    v_price := v_ride.estimated_price;
  END IF;
  
  UPDATE rides SET
    driver_id = p_driver_id,
    status = 'accepted',
    final_price = COALESCE(v_price, estimated_price),
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_ride_id;
  
  IF p_offer_id IS NOT NULL THEN
    UPDATE price_offers SET status = 'accepted', accepted_at = NOW() WHERE id = p_offer_id;
    UPDATE price_offers SET status = 'rejected' WHERE ride_id = p_ride_id AND id != p_offer_id AND status = 'pending';
  END IF;
  
  UPDATE driver_profiles SET is_available = false WHERE user_id = p_driver_id;
  
  RETURN jsonb_build_object('success', true, 'ride_id', p_ride_id);
END;
$$ LANGUAGE plpgsql;

-- RPC: Completar corrida
CREATE OR REPLACE FUNCTION complete_ride(p_ride_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_ride rides;
  v_driver_wallet_id UUID;
  v_platform_fee DECIMAL;
BEGIN
  SELECT * INTO v_ride FROM rides WHERE id = p_ride_id;
  
  IF v_ride IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Corrida nao encontrada');
  END IF;
  
  IF v_ride.status != 'in_progress' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Corrida nao esta em andamento');
  END IF;
  
  UPDATE rides SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_ride_id;
  
  v_platform_fee := v_ride.final_price * 0.20;
  
  SELECT id INTO v_driver_wallet_id FROM user_wallets WHERE user_id = v_ride.driver_id;
  
  UPDATE user_wallets SET
    balance = balance + (v_ride.final_price - v_platform_fee),
    total_earned = total_earned + (v_ride.final_price - v_platform_fee),
    updated_at = NOW()
  WHERE user_id = v_ride.driver_id;
  
  INSERT INTO wallet_transactions (user_id, wallet_id, type, amount, description, ride_id)
  VALUES (v_ride.driver_id, v_driver_wallet_id, 'ride', v_ride.final_price - v_platform_fee, 'Corrida completada', p_ride_id);
  
  UPDATE driver_profiles SET is_available = true WHERE user_id = v_ride.driver_id;
  UPDATE driver_locations SET last_ride_id = NULL WHERE driver_id = v_ride.driver_id;
  
  RETURN jsonb_build_object('success', true, 'final_price', v_ride.final_price);
END;
$$ LANGUAGE plpgsql;

-- RPC: Atualizar localizacao do motorista
CREATE OR REPLACE FUNCTION upsert_driver_location(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_heading DECIMAL DEFAULT 0,
  p_speed DECIMAL DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO driver_locations (driver_id, latitude, longitude, heading, speed, is_online, updated_at)
  VALUES (auth.uid(), p_lat, p_lng, p_heading, p_speed, true, NOW())
  ON CONFLICT (driver_id) DO UPDATE SET
    latitude = p_lat,
    longitude = p_lng,
    heading = p_heading,
    speed = p_speed,
    is_online = true,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Solicitar saque
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_amount DECIMAL,
  p_pix_key TEXT,
  p_pix_key_type TEXT DEFAULT 'cpf'
)
RETURNS JSONB AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  SELECT balance INTO v_balance FROM user_wallets WHERE user_id = auth.uid();
  
  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente');
  END IF;
  
  UPDATE user_wallets SET
    balance = balance - p_amount,
    pending_balance = pending_balance + p_amount,
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  INSERT INTO driver_withdrawals (driver_id, amount, pix_key, pix_key_type, status)
  VALUES (auth.uid(), p_amount, p_pix_key, p_pix_key_type, 'pending');
  
  RETURN jsonb_build_object('success', true, 'amount', p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Obter saldo da carteira
CREATE OR REPLACE FUNCTION get_wallet_balance()
RETURNS JSONB AS $$
DECLARE
  v_wallet user_wallets;
BEGIN
  SELECT * INTO v_wallet FROM user_wallets WHERE user_id = auth.uid();
  
  IF v_wallet IS NULL THEN
    RETURN jsonb_build_object('balance', 0, 'pending_balance', 0, 'total_earned', 0, 'total_spent', 0);
  END IF;
  
  RETURN jsonb_build_object(
    'balance', v_wallet.balance,
    'pending_balance', v_wallet.pending_balance,
    'total_earned', v_wallet.total_earned,
    'total_spent', v_wallet.total_spent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Calcular preco da corrida
CREATE OR REPLACE FUNCTION calculate_ride_price(
  p_distance_km DECIMAL,
  p_duration_minutes INTEGER,
  p_vehicle_type TEXT DEFAULT 'economy'
)
RETURNS DECIMAL AS $$
DECLARE
  v_pricing pricing_rules;
  v_price DECIMAL;
BEGIN
  SELECT * INTO v_pricing FROM pricing_rules WHERE vehicle_type = p_vehicle_type AND is_active = true LIMIT 1;
  
  IF v_pricing IS NULL THEN
    v_pricing.base_fare := 5;
    v_pricing.per_km_rate := 2;
    v_pricing.per_minute_rate := 0.5;
    v_pricing.minimum_fare := 8;
  END IF;
  
  v_price := v_pricing.base_fare + (p_distance_km * v_pricing.per_km_rate) + (p_duration_minutes * v_pricing.per_minute_rate);
  
  IF v_price < v_pricing.minimum_fare THEN
    v_price := v_pricing.minimum_fare;
  END IF;
  
  RETURN ROUND(v_price, 2);
END;
$$ LANGUAGE plpgsql;
