-- ================================================================
-- SCRIPT 054 — TODAS AS TABELAS FALTANTES (MASTER FINAL)
-- Baseado no BANCO-DE-DADOS.md (203 tabelas documentadas)
-- Aplica: tabelas dos scripts 012, 050, 07, e tabelas extras
-- Aplica: RLS em todas + Realtime em todas + policies corretas
-- Usa IF NOT EXISTS em tudo (idempotente/seguro)
-- ================================================================

-- ================================================================
-- BLOCO 1: TABELAS DO SCRIPT 012
-- ================================================================

-- 1. webhooks
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='webhooks' AND policyname='webhooks_admin') THEN
    CREATE POLICY "webhooks_admin" ON public.webhooks
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 2. social_likes
CREATE TABLE IF NOT EXISTS public.social_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_likes' AND policyname='social_likes_select') THEN
    CREATE POLICY "social_likes_select" ON public.social_likes FOR SELECT USING (true);
    CREATE POLICY "social_likes_insert" ON public.social_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "social_likes_delete" ON public.social_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. social_comments
CREATE TABLE IF NOT EXISTS public.social_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_comments' AND policyname='social_comments_select') THEN
    CREATE POLICY "social_comments_select" ON public.social_comments FOR SELECT USING (true);
    CREATE POLICY "social_comments_insert" ON public.social_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "social_comments_delete" ON public.social_comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 4. intercity_routes
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intercity_routes' AND policyname='intercity_routes_select') THEN
    CREATE POLICY "intercity_routes_select" ON public.intercity_routes FOR SELECT USING (true);
    CREATE POLICY "intercity_routes_admin"  ON public.intercity_routes FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 5. user_promotions
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_promotions' AND policyname='user_promotions_select') THEN
    CREATE POLICY "user_promotions_select" ON public.user_promotions FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "user_promotions_insert" ON public.user_promotions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. family_groups
CREATE TABLE IF NOT EXISTS public.family_groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'Minha Familia',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_groups' AND policyname='family_groups_owner') THEN
    CREATE POLICY "family_groups_owner" ON public.family_groups USING (auth.uid() = owner_id);
  END IF;
END $$;

-- 7. family_group_members
CREATE TABLE IF NOT EXISTS public.family_group_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id  UUID NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.family_group_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_group_members' AND policyname='family_members_select') THEN
    CREATE POLICY "family_members_select" ON public.family_group_members FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.family_groups WHERE id = group_id AND owner_id = auth.uid()) OR auth.uid() = user_id);
    CREATE POLICY "family_members_insert" ON public.family_group_members FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.family_groups WHERE id = group_id AND owner_id = auth.uid()));
    CREATE POLICY "family_members_delete" ON public.family_group_members FOR DELETE
      USING (EXISTS (SELECT 1 FROM public.family_groups WHERE id = group_id AND owner_id = auth.uid()));
  END IF;
END $$;

-- 8. favorite_places
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorite_places' AND policyname='favorite_places_owner') THEN
    CREATE POLICY "favorite_places_owner" ON public.favorite_places USING (auth.uid() = user_id);
  END IF;
END $$;

-- 9. emergency_events
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='emergency_events' AND policyname='emergency_events_user') THEN
    CREATE POLICY "emergency_events_user"  ON public.emergency_events USING (auth.uid() = user_id);
    CREATE POLICY "emergency_events_admin" ON public.emergency_events FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 10. subscription_plans
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscription_plans' AND policyname='subscription_plans_select') THEN
    CREATE POLICY "subscription_plans_select" ON public.subscription_plans FOR SELECT USING (true);
    CREATE POLICY "subscription_plans_admin"  ON public.subscription_plans FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;
INSERT INTO public.subscription_plans (key, name, price_cents, discount_rides, priority_support, cashback_percent, features) VALUES
  ('basic',   'Basic',   1990, 5,  false, 0,   ARRAY['5% desconto em corridas','Sem taxa de cancelamento','Suporte prioritario']),
  ('premium', 'Premium', 3990, 15, true,  2.5, ARRAY['15% desconto','Sem cancelamento','Suporte 24h','2.5% cashback','Corridas agendadas']),
  ('vip',     'VIP',     7990, 30, true,  5.0, ARRAY['30% desconto','Motorista dedicado','Suporte VIP','5% cashback','Agendadas ilimitadas'])
ON CONFLICT (key) DO NOTHING;

-- 11. user_payment_methods
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_payment_methods' AND policyname='user_payment_methods_owner') THEN
    CREATE POLICY "user_payment_methods_owner" ON public.user_payment_methods USING (auth.uid() = user_id);
  END IF;
END $$;

-- ================================================================
-- BLOCO 2: TABELAS DO SCRIPT 050
-- ================================================================

-- 12. live_activities
CREATE TABLE IF NOT EXISTS public.live_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id       UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL DEFAULT 'ride',
  token         TEXT,
  state         JSONB NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.live_activities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='live_activities' AND policyname='live_activities_owner') THEN
    CREATE POLICY "live_activities_owner" ON public.live_activities USING (auth.uid() = user_id);
  END IF;
END $$;

-- 13. driver_trips_summary
CREATE TABLE IF NOT EXISTS public.driver_trips_summary (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_date      DATE NOT NULL,
  period_type      TEXT NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily','weekly','monthly')),
  total_trips      INT NOT NULL DEFAULT 0,
  completed_trips  INT NOT NULL DEFAULT 0,
  cancelled_trips  INT NOT NULL DEFAULT 0,
  total_earnings   NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_distance   NUMERIC(10,2) NOT NULL DEFAULT 0,
  avg_rating       NUMERIC(3,2),
  online_minutes   INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, period_date, period_type)
);
ALTER TABLE public.driver_trips_summary ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_trips_summary' AND policyname='driver_trips_summary_driver') THEN
    CREATE POLICY "driver_trips_summary_driver" ON public.driver_trips_summary
      FOR SELECT USING (auth.uid() = driver_id);
    CREATE POLICY "driver_trips_summary_admin" ON public.driver_trips_summary FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 14. ride_eta_log
CREATE TABLE IF NOT EXISTS public.ride_eta_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id          UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id        UUID REFERENCES public.profiles(id),
  estimated_eta    INT NOT NULL,
  actual_duration  INT,
  logged_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ride_eta_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_eta_log' AND policyname='ride_eta_log_participants') THEN
    CREATE POLICY "ride_eta_log_participants" ON public.ride_eta_log FOR SELECT
      USING (auth.uid() = driver_id OR EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND passenger_id = auth.uid()));
    CREATE POLICY "ride_eta_log_driver_insert" ON public.ride_eta_log FOR INSERT
      WITH CHECK (auth.uid() = driver_id);
  END IF;
END $$;

-- 15. app_review_requests
CREATE TABLE IF NOT EXISTS public.app_review_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL DEFAULT 'trip_completed',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded    BOOLEAN NOT NULL DEFAULT false,
  response     TEXT,
  responded_at TIMESTAMPTZ,
  UNIQUE(user_id, trigger_type)
);
ALTER TABLE public.app_review_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='app_review_requests' AND policyname='app_review_requests_owner') THEN
    CREATE POLICY "app_review_requests_owner" ON public.app_review_requests USING (auth.uid() = user_id);
  END IF;
END $$;

-- 16. blocked_users
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blocked_users' AND policyname='blocked_users_blocker') THEN
    CREATE POLICY "blocked_users_blocker" ON public.blocked_users USING (auth.uid() = blocker_id);
  END IF;
END $$;

-- 17. ride_offers_log
CREATE TABLE IF NOT EXISTS public.ride_offers_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id     UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action      TEXT NOT NULL DEFAULT 'notified' CHECK (action IN ('notified','viewed','offered','ignored','expired'))
);
ALTER TABLE public.ride_offers_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_offers_log' AND policyname='ride_offers_log_driver') THEN
    CREATE POLICY "ride_offers_log_driver" ON public.ride_offers_log FOR SELECT USING (auth.uid() = driver_id);
    CREATE POLICY "ride_offers_log_insert" ON public.ride_offers_log FOR INSERT WITH CHECK (auth.uid() = driver_id);
    CREATE POLICY "ride_offers_log_admin"  ON public.ride_offers_log FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 18. driver_rating_breakdown
CREATE TABLE IF NOT EXISTS public.driver_rating_breakdown (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_key    TEXT NOT NULL,
  category_label  TEXT NOT NULL,
  avg_score       NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_ratings   INT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, category_key)
);
ALTER TABLE public.driver_rating_breakdown ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_rating_breakdown' AND policyname='driver_rating_breakdown_public') THEN
    CREATE POLICY "driver_rating_breakdown_public" ON public.driver_rating_breakdown FOR SELECT USING (true);
    CREATE POLICY "driver_rating_breakdown_admin"  ON public.driver_rating_breakdown FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 19. user_activity_log
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  resource    TEXT,
  metadata    JSONB DEFAULT '{}',
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_activity_log' AND policyname='user_activity_log_owner') THEN
    CREATE POLICY "user_activity_log_owner" ON public.user_activity_log FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "user_activity_log_insert" ON public.user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "user_activity_log_admin"  ON public.user_activity_log FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- ================================================================
-- BLOCO 3: TABELAS DO SCRIPT 07 (route_history, driver_popular_routes, admin_logs)
-- ================================================================

-- 20. route_history
CREATE TABLE IF NOT EXISTS public.route_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id        UUID REFERENCES public.rides(id),
  start_location JSONB NOT NULL,
  end_location   JSONB NOT NULL,
  distance       NUMERIC(10,2),
  duration       INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.route_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='route_history' AND policyname='route_history_owner') THEN
    CREATE POLICY "route_history_owner"  ON public.route_history FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "route_history_insert" ON public.route_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 21. admin_logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID NOT NULL REFERENCES public.profiles(id),
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   UUID,
  details       JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_logs' AND policyname='admin_logs_admin') THEN
    CREATE POLICY "admin_logs_admin" ON public.admin_logs FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 22. driver_popular_routes (depende de popular_routes)
CREATE TABLE IF NOT EXISTS public.driver_popular_routes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin       TEXT NOT NULL,
  destination  TEXT NOT NULL,
  frequency    INT NOT NULL DEFAULT 1,
  avg_earnings NUMERIC(10,2),
  last_used    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(driver_id, origin, destination)
);
ALTER TABLE public.driver_popular_routes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_popular_routes' AND policyname='driver_popular_routes_driver') THEN
    CREATE POLICY "driver_popular_routes_driver" ON public.driver_popular_routes FOR SELECT USING (auth.uid() = driver_id);
    CREATE POLICY "driver_popular_routes_manage" ON public.driver_popular_routes FOR ALL   USING (auth.uid() = driver_id);
  END IF;
END $$;

-- ================================================================
-- BLOCO 4: TABELAS EXTRAS DOCUMENTADAS (orphas que podem ser usadas)
-- ================================================================

-- 23. location_history
CREATE TABLE IF NOT EXISTS public.location_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude   NUMERIC(10,7) NOT NULL,
  longitude  NUMERIC(10,7) NOT NULL,
  accuracy   NUMERIC(8,2),
  ride_id    UUID REFERENCES public.rides(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='location_history' AND policyname='location_history_owner') THEN
    CREATE POLICY "location_history_owner"  ON public.location_history FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "location_history_insert" ON public.location_history FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "location_history_admin"  ON public.location_history FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 24. driver_route_segments
CREATE TABLE IF NOT EXISTS public.driver_route_segments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id     UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  start_lat   NUMERIC(10,7) NOT NULL,
  start_lng   NUMERIC(10,7) NOT NULL,
  end_lat     NUMERIC(10,7) NOT NULL,
  end_lng     NUMERIC(10,7) NOT NULL,
  distance_km NUMERIC(8,3),
  duration_s  INT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.driver_route_segments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_route_segments' AND policyname='driver_route_segments_driver') THEN
    CREATE POLICY "driver_route_segments_driver" ON public.driver_route_segments FOR SELECT USING (auth.uid() = driver_id);
    CREATE POLICY "driver_route_segments_insert" ON public.driver_route_segments FOR INSERT WITH CHECK (auth.uid() = driver_id);
  END IF;
END $$;

-- 25. reports (denuncias)
CREATE TABLE IF NOT EXISTS public.reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id  UUID REFERENCES public.profiles(id),
  ride_id      UUID REFERENCES public.rides(id),
  type         TEXT NOT NULL DEFAULT 'user' CHECK (type IN ('user','driver','ride','content')),
  reason       TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','resolved','dismissed')),
  resolved_at  TIMESTAMPTZ,
  resolved_by  UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reports' AND policyname='reports_reporter') THEN
    CREATE POLICY "reports_reporter" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
    CREATE POLICY "reports_insert"   ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
    CREATE POLICY "reports_admin"    ON public.reports FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 26. enhanced_reviews (tabela referenciada no codigo)
CREATE TABLE IF NOT EXISTS public.enhanced_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id          UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  reviewer_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  overall_rating   INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  category_ratings JSONB DEFAULT '{}',
  tags             TEXT[] DEFAULT '{}',
  comment          TEXT,
  is_public        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.enhanced_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='enhanced_reviews' AND policyname='enhanced_reviews_public') THEN
    CREATE POLICY "enhanced_reviews_public"   ON public.enhanced_reviews FOR SELECT USING (is_public = true OR auth.uid() = reviewer_id);
    CREATE POLICY "enhanced_reviews_insert"   ON public.enhanced_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    CREATE POLICY "enhanced_reviews_admin"    ON public.enhanced_reviews FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- 27. review_categories (referenciada no codigo)
CREATE TABLE IF NOT EXISTS public.review_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  label      TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT 'star',
  user_type  TEXT NOT NULL DEFAULT 'both' CHECK (user_type IN ('passenger','driver','both')),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.review_categories ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='review_categories' AND policyname='review_categories_public') THEN
    CREATE POLICY "review_categories_public" ON public.review_categories FOR SELECT USING (true);
    CREATE POLICY "review_categories_admin"  ON public.review_categories FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;
INSERT INTO public.review_categories (key, label, icon, user_type, sort_order) VALUES
  ('punctuality',   'Pontualidade',   'clock',         'driver',    1),
  ('safety',        'Segurança',       'shield',        'driver',    2),
  ('cleanliness',   'Limpeza',         'sparkles',      'driver',    3),
  ('friendliness',  'Simpatia',        'heart',         'both',      4),
  ('communication', 'Comunicação',     'message-circle','both',      5),
  ('navigation',    'Rota',            'map',           'driver',    6),
  ('wait_time',     'Tempo de espera', 'timer',         'passenger', 7),
  ('payment',       'Pagamento',       'credit-card',   'passenger', 8)
ON CONFLICT (key) DO NOTHING;

-- 28. review_tags (referenciada no codigo)
CREATE TABLE IF NOT EXISTS public.review_tags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key       TEXT UNIQUE NOT NULL,
  label     TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'both' CHECK (user_type IN ('passenger','driver','both')),
  is_active BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.review_tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='review_tags' AND policyname='review_tags_public') THEN
    CREATE POLICY "review_tags_public" ON public.review_tags FOR SELECT USING (true);
    CREATE POLICY "review_tags_admin"  ON public.review_tags FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;
INSERT INTO public.review_tags (key, label, user_type) VALUES
  ('great_driver',   'Ótimo motorista',  'driver'),
  ('safe_driving',   'Direção segura',   'driver'),
  ('clean_car',      'Carro limpo',      'driver'),
  ('on_time',        'Pontual',          'driver'),
  ('friendly',       'Simpático',        'both'),
  ('good_route',     'Boa rota',         'driver'),
  ('good_passenger', 'Ótimo passageiro', 'passenger'),
  ('polite',         'Educado',          'both')
ON CONFLICT (key) DO NOTHING;

-- 29. bidirectional_reviews (referenciada no codigo)
CREATE TABLE IF NOT EXISTS public.bidirectional_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id         UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  passenger_score INT CHECK (passenger_score BETWEEN 1 AND 5),
  driver_score    INT CHECK (driver_score BETWEEN 1 AND 5),
  passenger_tags  TEXT[] DEFAULT '{}',
  driver_tags     TEXT[] DEFAULT '{}',
  passenger_note  TEXT,
  driver_note     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ride_id)
);
ALTER TABLE public.bidirectional_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='bidirectional_reviews' AND policyname='bidirectional_reviews_participants') THEN
    CREATE POLICY "bidirectional_reviews_participants" ON public.bidirectional_reviews
      USING (auth.uid() = passenger_id OR auth.uid() = driver_id);
    CREATE POLICY "bidirectional_reviews_admin" ON public.bidirectional_reviews FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- ================================================================
-- BLOCO 5: TABELAS RLS FIXAS (tabelas existentes sem RLS ativo)
-- ================================================================

ALTER TABLE IF EXISTS public.app_versions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.driver_bonuses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.driver_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.driver_earnings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_methods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ride_cancellations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ride_disputes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ride_route_points     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ride_tips             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_devices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_sessions         ENABLE ROW LEVEL SECURITY;

-- Policies para tabelas que já existiam mas estavam sem RLS

-- app_versions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='app_versions' AND policyname='app_versions_public') THEN
    CREATE POLICY "app_versions_public" ON public.app_versions FOR SELECT USING (true);
    CREATE POLICY "app_versions_admin"  ON public.app_versions FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- driver_bonuses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_bonuses' AND policyname='driver_bonuses_driver') THEN
    CREATE POLICY "driver_bonuses_driver" ON public.driver_bonuses FOR SELECT USING (auth.uid() = driver_id);
    CREATE POLICY "driver_bonuses_admin"  ON public.driver_bonuses FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- driver_documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_documents' AND policyname='driver_documents_driver') THEN
    CREATE POLICY "driver_documents_driver" ON public.driver_documents FOR SELECT USING (auth.uid() = driver_id);
    CREATE POLICY "driver_documents_insert" ON public.driver_documents FOR INSERT WITH CHECK (auth.uid() = driver_id);
    CREATE POLICY "driver_documents_admin"  ON public.driver_documents FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- driver_earnings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_earnings' AND policyname='driver_earnings_driver') THEN
    CREATE POLICY "driver_earnings_driver" ON public.driver_earnings FOR SELECT USING (auth.uid() = driver_id);
    CREATE POLICY "driver_earnings_admin"  ON public.driver_earnings FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- payment_methods
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payment_methods' AND policyname='payment_methods_owner') THEN
    CREATE POLICY "payment_methods_owner" ON public.payment_methods USING (auth.uid() = user_id);
  END IF;
END $$;

-- referral_achievements
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='referral_achievements' AND policyname='referral_achievements_owner') THEN
    CREATE POLICY "referral_achievements_owner" ON public.referral_achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ride_cancellations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_cancellations' AND policyname='ride_cancellations_participant') THEN
    CREATE POLICY "ride_cancellations_participant" ON public.ride_cancellations FOR SELECT
      USING (auth.uid() = cancelled_by OR EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
    CREATE POLICY "ride_cancellations_admin" ON public.ride_cancellations FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- ride_disputes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_disputes' AND policyname='ride_disputes_participant') THEN
    CREATE POLICY "ride_disputes_participant" ON public.ride_disputes FOR SELECT
      USING (auth.uid() = opened_by OR EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
    CREATE POLICY "ride_disputes_insert" ON public.ride_disputes FOR INSERT
      WITH CHECK (auth.uid() = opened_by);
    CREATE POLICY "ride_disputes_admin" ON public.ride_disputes FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin'));
  END IF;
END $$;

-- ride_route_points
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_route_points' AND policyname='ride_route_points_participant') THEN
    CREATE POLICY "ride_route_points_participant" ON public.ride_route_points FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
    CREATE POLICY "ride_route_points_driver_insert" ON public.ride_route_points FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND driver_id = auth.uid()));
  END IF;
END $$;

-- ride_tips
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tips' AND policyname='ride_tips_participant') THEN
    CREATE POLICY "ride_tips_participant" ON public.ride_tips FOR SELECT
      USING (auth.uid() = passenger_id OR auth.uid() = driver_id);
    CREATE POLICY "ride_tips_insert" ON public.ride_tips FOR INSERT
      WITH CHECK (auth.uid() = passenger_id);
  END IF;
END $$;

-- user_devices
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_devices' AND policyname='user_devices_owner') THEN
    CREATE POLICY "user_devices_owner" ON public.user_devices USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_preferences
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_preferences' AND policyname='user_preferences_owner') THEN
    CREATE POLICY "user_preferences_owner" ON public.user_preferences USING (auth.uid() = user_id);
  END IF;
END $$;

-- user_sessions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_sessions' AND policyname='user_sessions_owner') THEN
    CREATE POLICY "user_sessions_owner" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "user_sessions_insert" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "user_sessions_delete" ON public.user_sessions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ================================================================
-- BLOCO 6: REALTIME EM TODAS AS TABELAS
-- ================================================================
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'rides','profiles','driver_profiles','driver_locations','ride_tracking',
    'messages','notifications','price_offers','payments','wallet_transactions',
    'user_wallets','support_tickets','support_messages','emergency_alerts',
    'emergency_events','group_rides','group_ride_participants','social_posts',
    'social_post_likes','social_likes','social_comments','post_comments',
    'driver_withdrawals','scheduled_rides','hot_zones','city_zones',
    'leaderboard','user_achievements','ratings','driver_reviews',
    'fcm_tokens','push_log','user_push_tokens','push_subscriptions',
    'promo_codes','promo_code_uses','coupons','user_coupons','coupon_uses',
    'referrals','referral_achievements','subscriptions','subscription_plans',
    'delivery_orders','ride_recordings','live_activities','family_members',
    'family_groups','family_group_members','emergency_contacts',
    'favorite_places','favorites','favorite_drivers',
    'blocked_users','reports','ride_offers_log',
    'driver_trips_summary','ride_eta_log','app_review_requests',
    'driver_rating_breakdown','user_activity_log',
    'route_history','admin_logs','driver_popular_routes',
    'location_history','driver_route_segments',
    'enhanced_reviews','review_categories','review_tags','bidirectional_reviews',
    'user_sessions','user_devices','user_preferences','user_payment_methods',
    'app_versions','driver_bonuses','driver_documents','driver_earnings',
    'ride_cancellations','ride_disputes','ride_route_points','ride_tips',
    'payment_methods','webhooks','user_promotions','intercity_routes',
    'webhook_endpoints','webhook_deliveries','social_follows',
    'notification_preferences','sms_logs','sms_deliveries',
    'audit_logs','fraud_flags','feature_flags','app_config',
    'system_config','system_settings','pricing_rules','surge_pricing',
    'surge_events','driver_schedule','user_settings','user_sms_preferences',
    'faqs','legal_documents','vehicle_categories','vehicles'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    BEGIN
      EXECUTE format(
        'ALTER TABLE IF EXISTS public.%I REPLICA IDENTITY FULL',
        tbl
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- Publicar todas as tabelas no canal realtime
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'rides','profiles','driver_profiles','driver_locations','ride_tracking',
    'messages','notifications','price_offers','payments','wallet_transactions',
    'user_wallets','support_tickets','support_messages','emergency_alerts',
    'emergency_events','group_rides','group_ride_participants','social_posts',
    'social_post_likes','social_likes','social_comments','post_comments',
    'driver_withdrawals','scheduled_rides','hot_zones','city_zones',
    'leaderboard','user_achievements','ratings','driver_reviews',
    'fcm_tokens','push_log','user_push_tokens','push_subscriptions',
    'promo_codes','promo_code_uses','coupons','user_coupons','coupon_uses',
    'referrals','referral_achievements','subscriptions','subscription_plans',
    'delivery_orders','ride_recordings','live_activities','family_members',
    'family_groups','family_group_members','emergency_contacts',
    'favorite_places','favorites','favorite_drivers',
    'blocked_users','reports','ride_offers_log',
    'driver_trips_summary','ride_eta_log','app_review_requests',
    'driver_rating_breakdown','user_activity_log',
    'route_history','admin_logs','driver_popular_routes',
    'location_history','driver_route_segments',
    'enhanced_reviews','review_categories','review_tags','bidirectional_reviews',
    'user_sessions','user_devices','user_preferences','user_payment_methods',
    'app_versions','driver_bonuses','driver_documents','driver_earnings',
    'ride_cancellations','ride_disputes','ride_route_points','ride_tips',
    'payment_methods','webhooks','user_promotions','intercity_routes',
    'webhook_endpoints','webhook_deliveries','social_follows',
    'notification_preferences','sms_logs','sms_deliveries',
    'audit_logs','fraud_flags','feature_flags','app_config',
    'system_config','system_settings','pricing_rules','surge_pricing',
    'surge_events','driver_schedule','user_settings','user_sms_preferences',
    'faqs','legal_documents','vehicle_categories','vehicles'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    BEGIN
      EXECUTE format(
        'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
        tbl
      );
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- ================================================================
-- BLOCO 7: INDICES DE PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_social_likes_post        ON public.social_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_user        ON public.social_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_post     ON public.social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_grp ON public.family_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_family_group_members_usr ON public.family_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_places_user     ON public.favorite_places(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_user    ON public.emergency_events(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_status  ON public.emergency_events(status);
CREATE INDEX IF NOT EXISTS idx_user_pay_methods_user    ON public.user_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_user_promotions_user     ON public.user_promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_intercity_routes_cities  ON public.intercity_routes(origin_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_webhooks_active          ON public.webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_location_history_user    ON public.location_history(user_id);
CREATE INDEX IF NOT EXISTS idx_location_history_time    ON public.location_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_route_seg_driver  ON public.driver_route_segments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_route_seg_ride    ON public.driver_route_segments(ride_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter         ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status           ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_enhanced_reviews_ride    ON public.enhanced_reviews(ride_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_reviews_reviewed ON public.enhanced_reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_ride_offers_log_ride     ON public.ride_offers_log(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_offers_log_driver   ON public.ride_offers_log(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_rating_bd_driver  ON public.driver_rating_breakdown(driver_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user   ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_time   ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin         ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_time          ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_trips_sum_driver  ON public.driver_trips_summary(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_trips_sum_period  ON public.driver_trips_summary(period_date);
CREATE INDEX IF NOT EXISTS idx_route_history_user       ON public.route_history(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker    ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked    ON public.blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_live_activities_user     ON public.live_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_live_activities_active   ON public.live_activities(is_active);

-- ================================================================
-- VERIFICACAO FINAL
-- ================================================================
SELECT 
  COUNT(*) AS total_tabelas,
  COUNT(*) FILTER (WHERE rowsecurity = true) AS com_rls,
  COUNT(*) FILTER (WHERE rowsecurity = false) AS sem_rls
FROM pg_tables
WHERE schemaname = 'public';
