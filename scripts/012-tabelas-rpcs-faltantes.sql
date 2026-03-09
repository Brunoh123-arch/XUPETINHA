-- ==========================================================
-- MIGRATION 012 — Tabelas e RPCs faltantes (corrigida)
-- Colunas reais verificadas antes da execucao — 09/03/2026
-- ==========================================================

-- ----------------------------------------------------------
-- 1. webhooks
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.webhooks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  url               TEXT NOT NULL,
  events            TEXT[] NOT NULL DEFAULT '{}',
  secret            TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count     INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhooks_admin" ON public.webhooks
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- ----------------------------------------------------------
-- 2. social_likes + social_comments
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_likes_select" ON public.social_likes FOR SELECT USING (true);
CREATE POLICY "social_likes_insert" ON public.social_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "social_likes_delete" ON public.social_likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.social_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_comments_select" ON public.social_comments FOR SELECT USING (true);
CREATE POLICY "social_comments_insert" ON public.social_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "social_comments_delete" ON public.social_comments FOR DELETE USING (auth.uid() = user_id);

-- Trigger contadores de likes/comments em social_posts
CREATE OR REPLACE FUNCTION public.update_social_post_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_TABLE_NAME = 'social_likes' THEN
    UPDATE public.social_posts
    SET likes_count = (SELECT COUNT(*) FROM public.social_likes WHERE post_id = COALESCE(NEW.post_id, OLD.post_id))
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  ELSIF TG_TABLE_NAME = 'social_comments' THEN
    UPDATE public.social_posts
    SET comments_count = (SELECT COUNT(*) FROM public.social_comments WHERE post_id = COALESCE(NEW.post_id, OLD.post_id))
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_social_likes_count ON public.social_likes;
CREATE TRIGGER trg_social_likes_count
  AFTER INSERT OR DELETE ON public.social_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_social_post_counts();

DROP TRIGGER IF EXISTS trg_social_comments_count ON public.social_comments;
CREATE TRIGGER trg_social_comments_count
  AFTER INSERT OR DELETE ON public.social_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_social_post_counts();

-- ----------------------------------------------------------
-- 3. intercity_routes
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.intercity_routes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_city      TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  distance_km      NUMERIC(10,2) NOT NULL,
  base_price       NUMERIC(10,2) NOT NULL,
  estimated_hours  NUMERIC(4,1) NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intercity_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercity_routes_select" ON public.intercity_routes FOR SELECT USING (true);
CREATE POLICY "intercity_routes_admin" ON public.intercity_routes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- ----------------------------------------------------------
-- 4. user_promotions
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  promotion_id    UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  ride_id         UUID REFERENCES public.rides(id),
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  used_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, promotion_id)
);
ALTER TABLE public.user_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_promotions_select" ON public.user_promotions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_promotions_insert" ON public.user_promotions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 5. family_groups + family_group_members
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.family_groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'Minha Familia',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_groups_owner" ON public.family_groups USING (auth.uid() = owner_id);

CREATE TABLE IF NOT EXISTS public.family_group_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.family_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "family_members_select" ON public.family_group_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.family_groups WHERE id = group_id AND owner_id = auth.uid())
      OR auth.uid() = user_id);
CREATE POLICY "family_members_insert" ON public.family_group_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.family_groups WHERE id = group_id AND owner_id = auth.uid()));
CREATE POLICY "family_members_delete" ON public.family_group_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.family_groups WHERE id = group_id AND owner_id = auth.uid()));

-- ----------------------------------------------------------
-- 6. favorite_places
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.favorite_places (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  address    TEXT NOT NULL,
  latitude   NUMERIC(10,7) NOT NULL,
  longitude  NUMERIC(10,7) NOT NULL,
  icon       TEXT NOT NULL DEFAULT 'map-pin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.favorite_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorite_places_owner" ON public.favorite_places USING (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 7. emergency_events
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id     UUID REFERENCES public.rides(id),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL DEFAULT 'sos'
                CHECK (event_type IN ('sos','panic','route_deviation','contact_alert')),
  latitude    NUMERIC(10,7),
  longitude   NUMERIC(10,7),
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','resolved','false_alarm')),
  resolved_at TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "emergency_events_user" ON public.emergency_events USING (auth.uid() = user_id);
CREATE POLICY "emergency_events_admin" ON public.emergency_events FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- ----------------------------------------------------------
-- 8. achievements (catalogo) — user_achievements ja existe com TEXT achievement_id
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'star',
  category    TEXT NOT NULL DEFAULT 'general',
  points      INT NOT NULL DEFAULT 10,
  max_level   INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_select" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "achievements_admin" ON public.achievements FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- ----------------------------------------------------------
-- 9. subscription_plans
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key              TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  price_cents      INT NOT NULL,
  discount_rides   INT NOT NULL DEFAULT 0,
  priority_support BOOLEAN NOT NULL DEFAULT false,
  cashback_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  features         TEXT[] NOT NULL DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_plans_select" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "subscription_plans_admin" ON public.subscription_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));

INSERT INTO public.subscription_plans (key, name, price_cents, discount_rides, priority_support, cashback_percent, features) VALUES
  ('basic',   'Basic',   1990, 5,  false, 0,   ARRAY['5% desconto em corridas','Sem taxa de cancelamento','Suporte prioritario']),
  ('premium', 'Premium', 3990, 15, true,  2.5, ARRAY['15% desconto','Sem cancelamento','Suporte 24h','2.5% cashback','Corridas agendadas']),
  ('vip',     'VIP',     7990, 30, true,  5.0, ARRAY['30% desconto','Motorista dedicado','Suporte VIP','5% cashback','Agendadas ilimitadas'])
ON CONFLICT (key) DO NOTHING;

-- ----------------------------------------------------------
-- 10. user_payment_methods
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_payment_methods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'credit_card'
                  CHECK (type IN ('credit_card','debit_card','pix')),
  last_four     TEXT,
  brand         TEXT,
  holder_name   TEXT,
  is_default    BOOLEAN NOT NULL DEFAULT false,
  gateway_token TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_payment_methods_owner" ON public.user_payment_methods USING (auth.uid() = user_id);

-- ----------------------------------------------------------
-- 11. RPCs FALTANTES
-- ----------------------------------------------------------

-- 11a. get_trust_score — usa reviews.reviewed_id, profiles, driver_profiles
CREATE OR REPLACE FUNCTION public.get_trust_score(p_user_id UUID)
RETURNS TABLE(score NUMERIC, level TEXT, rides_count INT, avg_rating NUMERIC, verified BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_rides    INT;
  v_rating   NUMERIC;
  v_verified BOOLEAN;
  v_score    NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_rides FROM public.rides
  WHERE (passenger_id = p_user_id OR driver_id = p_user_id) AND status = 'completed';

  SELECT COALESCE(ROUND(AVG(rating), 1), 0) INTO v_rating
  FROM public.reviews WHERE reviewed_id = p_user_id;

  SELECT COALESCE(dp.cnh_verified, false) INTO v_verified
  FROM public.driver_profiles dp WHERE dp.user_id = p_user_id;

  v_score := GREATEST(0, LEAST(100,
    40.0
    + (LEAST(v_rides, 50)::NUMERIC / 50.0 * 20.0)
    + GREATEST(0, (COALESCE(v_rating, 3.0) - 3.0) * 10.0)
    + (CASE WHEN COALESCE(v_verified, false) THEN 10.0 ELSE 0.0 END)
    + 20.0 -- bonus por ter conta verificada (email + phone)
  ));

  RETURN QUERY SELECT
    ROUND(v_score, 1),
    CASE
      WHEN v_score >= 90 THEN 'platinum'
      WHEN v_score >= 70 THEN 'gold'
      WHEN v_score >= 50 THEN 'silver'
      ELSE 'bronze'
    END,
    v_rides,
    COALESCE(v_rating, 0.0),
    COALESCE(v_verified, false);
END;
$$;

-- 11b. get_ride_eta — usa rides (pickup/dropoff) e driver_locations
CREATE OR REPLACE FUNCTION public.get_ride_eta(p_ride_id UUID)
RETURNS TABLE(eta_minutes INT, driver_lat NUMERIC, driver_lng NUMERIC, distance_km NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_driver_id UUID;
  v_dlat NUMERIC; v_dlng NUMERIC;
  v_dest_lat NUMERIC; v_dest_lng NUMERIC;
  v_km NUMERIC;
BEGIN
  SELECT r.driver_id, r.dropoff_lat, r.dropoff_lng
  INTO v_driver_id, v_dest_lat, v_dest_lng
  FROM public.rides r WHERE r.id = p_ride_id;

  SELECT dl.latitude, dl.longitude
  INTO v_dlat, v_dlng
  FROM public.driver_locations dl WHERE dl.driver_id = v_driver_id;

  v_km := ROUND(
    SQRT(POWER(v_dest_lat - COALESCE(v_dlat, v_dest_lat), 2) +
         POWER(v_dest_lng - COALESCE(v_dlng, v_dest_lng), 2)) * 111.0
  , 2);

  RETURN QUERY SELECT
    GREATEST(1, ROUND(v_km / 40.0 * 60.0)::INT),
    COALESCE(v_dlat, 0.0),
    COALESCE(v_dlng, 0.0),
    v_km;
END;
$$;

-- 11c. calculate_fare — usa pickup/dropoff lat/lng e surge_pricing (zone_lat/zone_lng/radius_km)
CREATE OR REPLACE FUNCTION public.calculate_fare(
  p_origin_lat NUMERIC, p_origin_lng NUMERIC,
  p_dest_lat   NUMERIC, p_dest_lng   NUMERIC,
  p_ride_type  TEXT DEFAULT 'standard'
)
RETURNS TABLE(base_fare NUMERIC, surge_multiplier NUMERIC, total_fare NUMERIC, estimated_km NUMERIC, estimated_minutes INT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_km         NUMERIC;
  v_base       NUMERIC;
  v_surge      NUMERIC := 1.0;
  v_price_km   NUMERIC;
BEGIN
  v_km := ROUND(
    SQRT(POWER(p_dest_lat - p_origin_lat, 2) +
         POWER(p_dest_lng - p_origin_lng, 2)) * 111.0
  , 2);

  v_price_km := CASE p_ride_type
    WHEN 'economy'  THEN 1.80
    WHEN 'standard' THEN 2.50
    WHEN 'comfort'  THEN 3.50
    WHEN 'premium'  THEN 5.00
    WHEN 'moto'     THEN 1.20
    ELSE 2.50
  END;

  v_base := GREATEST(5.00, ROUND(v_km * v_price_km + 3.00, 2));

  SELECT COALESCE(
    (SELECT sp.multiplier FROM public.surge_pricing sp
     WHERE sp.is_active = true
     AND SQRT(POWER(sp.zone_lat - p_origin_lat, 2) + POWER(sp.zone_lng - p_origin_lng, 2)) * 111.0 < sp.radius_km
     ORDER BY sp.multiplier DESC LIMIT 1),
    1.0
  ) INTO v_surge;

  RETURN QUERY SELECT
    v_base,
    COALESCE(v_surge, 1.0),
    ROUND(v_base * COALESCE(v_surge, 1.0), 2),
    v_km,
    GREATEST(3, ROUND(v_km / 40.0 * 60.0)::INT);
END;
$$;

-- 11d. calculate_surge_price — usa surge_pricing (zone_lat/zone_lng/radius_km)
CREATE OR REPLACE FUNCTION public.calculate_surge_price(p_lat NUMERIC, p_lng NUMERIC)
RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_mult NUMERIC := 1.0;
BEGIN
  SELECT COALESCE(sp.multiplier, 1.0) INTO v_mult
  FROM public.surge_pricing sp
  WHERE sp.is_active = true
  ORDER BY SQRT(POWER(sp.zone_lat - p_lat, 2) + POWER(sp.zone_lng - p_lng, 2)) ASC
  LIMIT 1;
  RETURN COALESCE(v_mult, 1.0);
END;
$$;

-- 11e. get_hot_zones_for_driver — usa hot_zones (latitude/longitude)
CREATE OR REPLACE FUNCTION public.get_hot_zones_for_driver(p_driver_id UUID)
RETURNS TABLE(
  id UUID, name TEXT, center_lat NUMERIC, center_lng NUMERIC,
  radius_meters INT, intensity NUMERIC, active_rides_count INT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    hz.id, hz.name,
    hz.latitude::NUMERIC  AS center_lat,
    hz.longitude::NUMERIC AS center_lng,
    hz.radius_meters,
    hz.intensity::NUMERIC,
    (SELECT COUNT(*)::INT FROM public.rides r
     WHERE r.status IN ('searching','accepted')
     AND SQRT(POWER(r.pickup_lat - hz.latitude, 2) + POWER(r.pickup_lng - hz.longitude, 2)) * 111000 < hz.radius_meters
    ) AS active_rides_count
  FROM public.hot_zones hz
  WHERE hz.is_active = true
  ORDER BY hz.intensity DESC;
END;
$$;

-- 11f. get_user_achievements — usa user_achievements (achievement_id e TEXT)
CREATE OR REPLACE FUNCTION public.get_user_achievements(p_user_id UUID)
RETURNS TABLE(
  achievement_id TEXT, title TEXT, description TEXT, icon TEXT,
  points INT, earned_at TIMESTAMPTZ, credits_earned NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    ua.achievement_id,
    ua.title,
    ua.description,
    ua.icon,
    ua.points,
    ua.unlocked_at AS earned_at,
    ua.credits_earned
  FROM public.user_achievements ua
  WHERE ua.user_id = p_user_id
  ORDER BY ua.unlocked_at DESC;
END;
$$;

-- ----------------------------------------------------------
-- 12. Indices de performance
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_social_likes_post    ON public.social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_user    ON public.social_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post ON public.social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_family_members_group ON public.family_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user  ON public.family_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_places_user ON public.favorite_places(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user ON public.emergency_events(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_status ON public.emergency_events(status);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user ON public.user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_promotions_user ON public.user_promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_intercity_routes_cities ON public.intercity_routes(origin_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON public.webhooks(is_active);
