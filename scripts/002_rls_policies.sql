-- =============================================================================
-- XUPETINHA — RLS POLICIES
-- =============================================================================

-- Funções auxiliares que dependem das tabelas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_driver()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT COALESCE((SELECT is_verified FROM driver_profiles WHERE user_id = auth.uid()), false);
$$;

-- =============================================================================
-- ENABLE RLS EM TODAS AS TABELAS
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_safety_checks ENABLE ROW LEVEL SECURITY;

-- Tabelas públicas (leitura para todos autenticados)
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLICIES - PROFILES
-- =============================================================================
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
  
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- =============================================================================
-- POLICIES - DRIVER_PROFILES
-- =============================================================================
CREATE POLICY "driver_profiles_select_own" ON public.driver_profiles
  FOR SELECT USING (user_id = auth.uid());
  
CREATE POLICY "driver_profiles_insert_own" ON public.driver_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
  
CREATE POLICY "driver_profiles_update_own" ON public.driver_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "driver_profiles_select_public" ON public.driver_profiles
  FOR SELECT USING (is_verified = true);

-- =============================================================================
-- POLICIES - VEHICLES
-- =============================================================================
CREATE POLICY "vehicles_select_own" ON public.vehicles
  FOR SELECT USING (
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );
  
CREATE POLICY "vehicles_insert_own" ON public.vehicles
  FOR INSERT WITH CHECK (
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );
  
CREATE POLICY "vehicles_update_own" ON public.vehicles
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "vehicles_select_active" ON public.vehicles
  FOR SELECT USING (is_active = true AND is_verified = true);

-- =============================================================================
-- POLICIES - SAVED_ADDRESSES
-- =============================================================================
CREATE POLICY "saved_addresses_all_own" ON public.saved_addresses
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- POLICIES - RIDES
-- =============================================================================
CREATE POLICY "rides_select_own" ON public.rides
  FOR SELECT USING (
    passenger_id = auth.uid() OR 
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "rides_insert_passenger" ON public.rides
  FOR INSERT WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "rides_update_own" ON public.rides
  FOR UPDATE USING (
    passenger_id = auth.uid() OR 
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );

-- =============================================================================
-- POLICIES - RIDE_REQUESTS
-- =============================================================================
CREATE POLICY "ride_requests_select_driver" ON public.ride_requests
  FOR SELECT USING (
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "ride_requests_insert_driver" ON public.ride_requests
  FOR INSERT WITH CHECK (
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "ride_requests_update_driver" ON public.ride_requests
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );

-- =============================================================================
-- POLICIES - PAYMENTS
-- =============================================================================
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- POLICIES - WALLET_TRANSACTIONS
-- =============================================================================
CREATE POLICY "wallet_transactions_select_own" ON public.wallet_transactions
  FOR SELECT USING (user_id = auth.uid());

-- =============================================================================
-- POLICIES - DRIVER_WALLETS
-- =============================================================================
CREATE POLICY "driver_wallets_select_own" ON public.driver_wallets
  FOR SELECT USING (
    driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
  );

-- =============================================================================
-- POLICIES - NOTIFICATIONS
-- =============================================================================
CREATE POLICY "notifications_all_own" ON public.notifications
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- POLICIES - PUSH_SUBSCRIPTIONS
-- =============================================================================
CREATE POLICY "push_subscriptions_all_own" ON public.push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- POLICIES - SUPPORT_TICKETS
-- =============================================================================
CREATE POLICY "support_tickets_select_own" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "support_tickets_insert_own" ON public.support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "support_tickets_update_own" ON public.support_tickets
  FOR UPDATE USING (user_id = auth.uid() OR assigned_to = auth.uid());

-- =============================================================================
-- POLICIES - SUPPORT_MESSAGES
-- =============================================================================
CREATE POLICY "support_messages_select_ticket" ON public.support_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE user_id = auth.uid() OR assigned_to = auth.uid()
    )
  );

CREATE POLICY "support_messages_insert_own" ON public.support_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- =============================================================================
-- POLICIES - CHAT_MESSAGES
-- =============================================================================
CREATE POLICY "chat_messages_select_ride" ON public.chat_messages
  FOR SELECT USING (
    ride_id IN (
      SELECT id FROM rides 
      WHERE passenger_id = auth.uid() OR 
            driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "chat_messages_insert_own" ON public.chat_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- =============================================================================
-- POLICIES - GAMIFICATION (USER TABLES)
-- =============================================================================
CREATE POLICY "user_achievements_all_own" ON public.user_achievements
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_badges_all_own" ON public.user_badges
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_challenges_all_own" ON public.user_challenges
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_rewards_all_own" ON public.user_rewards
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_promo_codes_all_own" ON public.user_promo_codes
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- POLICIES - REFERRALS
-- =============================================================================
CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

-- =============================================================================
-- POLICIES - EMERGENCY_CONTACTS
-- =============================================================================
CREATE POLICY "emergency_contacts_all_own" ON public.emergency_contacts
  FOR ALL USING (user_id = auth.uid());

-- =============================================================================
-- POLICIES - RIDE_SAFETY_CHECKS
-- =============================================================================
CREATE POLICY "ride_safety_checks_select_own" ON public.ride_safety_checks
  FOR SELECT USING (
    ride_id IN (
      SELECT id FROM rides 
      WHERE passenger_id = auth.uid() OR 
            driver_id IN (SELECT id FROM driver_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "ride_safety_checks_insert_own" ON public.ride_safety_checks
  FOR INSERT WITH CHECK (triggered_by = auth.uid());

-- =============================================================================
-- POLICIES - TABELAS PÚBLICAS (SELECT para autenticados)
-- =============================================================================
CREATE POLICY "vehicle_categories_select_all" ON public.vehicle_categories
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "vehicle_types_select_all" ON public.vehicle_types
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "accessibility_features_select_all" ON public.accessibility_features
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "achievements_select_all" ON public.achievements
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "badge_definitions_select_all" ON public.badge_definitions
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "challenges_select_active" ON public.challenges
  FOR SELECT TO authenticated USING (is_active = true AND ends_at > now());

CREATE POLICY "rewards_select_active" ON public.rewards
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "promo_codes_select_active" ON public.promo_codes
  FOR SELECT TO authenticated USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));
