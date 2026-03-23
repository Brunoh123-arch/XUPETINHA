-- =============================================================================
-- FUNCOES AUXILIARES PARA O APP
-- =============================================================================

-- Funcao para buscar motoristas proximos
CREATE OR REPLACE FUNCTION find_nearby_drivers(
  p_lat numeric,
  p_lng numeric,
  p_radius_km numeric DEFAULT 5,
  p_vehicle_type text DEFAULT NULL
)
RETURNS TABLE (
  driver_id uuid,
  user_id uuid,
  distance_km numeric,
  rating numeric,
  full_name text,
  avatar_url text,
  vehicle_brand text,
  vehicle_model text,
  vehicle_color text,
  vehicle_plate text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id AS driver_id,
    dp.user_id,
    (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(dp.current_latitude)) *
        cos(radians(dp.current_longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(dp.current_latitude))
      )
    )::numeric AS distance_km,
    dp.rating,
    p.full_name,
    p.avatar_url,
    v.brand AS vehicle_brand,
    v.model AS vehicle_model,
    v.color AS vehicle_color,
    v.plate AS vehicle_plate
  FROM driver_profiles dp
  JOIN profiles p ON p.id = dp.user_id
  LEFT JOIN vehicles v ON v.driver_id = dp.id AND v.is_primary = true AND v.is_active = true
  WHERE dp.is_online = true
    AND dp.is_available = true
    AND dp.is_verified = true
    AND dp.current_latitude IS NOT NULL
    AND dp.current_longitude IS NOT NULL
    AND (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(dp.current_latitude)) *
        cos(radians(dp.current_longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(dp.current_latitude))
      )
    ) <= p_radius_km
  ORDER BY distance_km ASC
  LIMIT 50;
END;
$$;

-- Funcao para calcular preco da corrida
CREATE OR REPLACE FUNCTION calculate_ride_price(
  p_category_id uuid,
  p_distance_km numeric,
  p_duration_minutes integer,
  p_surge_multiplier numeric DEFAULT 1.0
)
RETURNS TABLE (
  base_price numeric,
  distance_price numeric,
  time_price numeric,
  surge_price numeric,
  total_price numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_category vehicle_categories%ROWTYPE;
  v_base numeric;
  v_distance numeric;
  v_time numeric;
  v_surge numeric;
  v_total numeric;
BEGIN
  -- Busca categoria
  SELECT * INTO v_category FROM vehicle_categories WHERE id = p_category_id;
  
  IF NOT FOUND THEN
    -- Valores padrao se categoria nao encontrada
    v_category.base_price := 5.00;
    v_category.price_per_km := 1.50;
    v_category.price_per_minute := 0.30;
    v_category.min_price := 8.00;
  END IF;

  -- Calcula componentes
  v_base := v_category.base_price;
  v_distance := p_distance_km * v_category.price_per_km;
  v_time := p_duration_minutes * v_category.price_per_minute;
  v_total := v_base + v_distance + v_time;
  
  -- Aplica surge
  v_surge := v_total * (p_surge_multiplier - 1);
  v_total := v_total * p_surge_multiplier;
  
  -- Aplica preco minimo
  IF v_total < v_category.min_price THEN
    v_total := v_category.min_price;
    v_surge := 0;
  END IF;

  RETURN QUERY SELECT
    v_base,
    v_distance,
    v_time,
    v_surge,
    ROUND(v_total, 2);
END;
$$;

-- Funcao para atualizar estatisticas do motorista
CREATE OR REPLACE FUNCTION update_driver_stats(p_driver_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_trips integer;
  v_avg_rating numeric;
  v_total_earnings numeric;
BEGIN
  -- Conta corridas completadas
  SELECT COUNT(*) INTO v_total_trips
  FROM rides
  WHERE driver_id = p_driver_id AND status = 'completed';

  -- Calcula media de avaliacao
  SELECT COALESCE(AVG(driver_rating), 5.0) INTO v_avg_rating
  FROM rides
  WHERE driver_id = p_driver_id 
    AND status = 'completed' 
    AND driver_rating IS NOT NULL;

  -- Calcula total de ganhos
  SELECT COALESCE(SUM(net_amount), 0) INTO v_total_earnings
  FROM driver_earnings
  WHERE driver_id = p_driver_id;

  -- Atualiza driver_profiles
  UPDATE driver_profiles
  SET 
    total_trips = v_total_trips,
    rating = ROUND(v_avg_rating, 1),
    total_earnings = v_total_earnings,
    updated_at = now()
  WHERE id = p_driver_id;
END;
$$;

-- Funcao para processar ganhos do motorista apos corrida
CREATE OR REPLACE FUNCTION process_driver_earning(
  p_ride_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_ride rides%ROWTYPE;
  v_driver driver_profiles%ROWTYPE;
  v_gross numeric;
  v_commission numeric;
  v_net numeric;
  v_earning_id uuid;
BEGIN
  -- Busca corrida
  SELECT * INTO v_ride FROM rides WHERE id = p_ride_id;
  IF NOT FOUND OR v_ride.status != 'completed' THEN
    RETURN NULL;
  END IF;

  -- Busca motorista
  SELECT * INTO v_driver FROM driver_profiles WHERE id = v_ride.driver_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Calcula valores
  v_gross := COALESCE(v_ride.final_price, v_ride.estimated_price, 0);
  v_commission := v_gross * (v_driver.commission_rate / 100);
  v_net := v_gross - v_commission;

  -- Cria registro de ganho
  INSERT INTO driver_earnings (
    driver_id,
    ride_id,
    gross_amount,
    commission_amount,
    net_amount,
    status
  ) VALUES (
    v_ride.driver_id,
    p_ride_id,
    v_gross,
    v_commission,
    v_net,
    'pending'
  ) RETURNING id INTO v_earning_id;

  -- Atualiza estatisticas do motorista
  PERFORM update_driver_stats(v_ride.driver_id);

  RETURN v_earning_id;
END;
$$;

-- Trigger para processar ganhos quando corrida e completada
CREATE OR REPLACE FUNCTION trigger_process_completed_ride()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM process_driver_earning(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_ride_completed ON rides;
CREATE TRIGGER on_ride_completed
  AFTER UPDATE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION trigger_process_completed_ride();

-- Funcao para obter estatisticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id uuid)
RETURNS TABLE (
  total_rides bigint,
  total_spent numeric,
  avg_rating numeric,
  favorite_category text,
  active_ride_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH ride_stats AS (
    SELECT 
      COUNT(*) AS total_rides,
      COALESCE(SUM(final_price), 0) AS total_spent,
      COALESCE(AVG(driver_rating), 0) AS avg_rating
    FROM rides
    WHERE passenger_id = p_user_id AND status = 'completed'
  ),
  fav_category AS (
    SELECT vc.display_name
    FROM rides r
    JOIN vehicle_categories vc ON vc.id = r.category_id
    WHERE r.passenger_id = p_user_id AND r.status = 'completed'
    GROUP BY vc.display_name
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ),
  active AS (
    SELECT id
    FROM rides
    WHERE passenger_id = p_user_id 
      AND status IN ('pending', 'accepted', 'arrived', 'in_progress')
    ORDER BY created_at DESC
    LIMIT 1
  )
  SELECT 
    rs.total_rides,
    rs.total_spent,
    ROUND(rs.avg_rating, 1),
    fc.display_name,
    a.id
  FROM ride_stats rs
  LEFT JOIN fav_category fc ON true
  LEFT JOIN active a ON true;
END;
$$;
