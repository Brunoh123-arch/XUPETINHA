-- ============================================================
-- 052-full-rls-realtime-all-tables.sql
-- RLS COMPLETO + REALTIME em todas as 103 tabelas
-- UPPI App - 16/03/2026
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- PASSO 1: HABILITAR REALTIME EM TODAS AS TABELAS PRINCIPAIS
-- ══════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE ride_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE price_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE user_wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE group_rides;
ALTER PUBLICATION supabase_realtime ADD TABLE group_ride_members;
ALTER PUBLICATION supabase_realtime ADD TABLE group_ride_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE intercity_rides;
ALTER PUBLICATION supabase_realtime ADD TABLE intercity_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE social_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE social_post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE social_follows;
ALTER PUBLICATION supabase_realtime ADD TABLE user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_withdrawals;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_earnings;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_bonuses;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE user_social_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE hot_zones;
ALTER PUBLICATION supabase_realtime ADD TABLE surge_pricing;
ALTER PUBLICATION supabase_realtime ADD TABLE ride_recordings;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_rides;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_schedule;
ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE app_config;
ALTER PUBLICATION supabase_realtime ADD TABLE platform_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE push_log;
ALTER PUBLICATION supabase_realtime ADD TABLE fcm_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE promo_banners;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE popular_routes;
ALTER PUBLICATION supabase_realtime ADD TABLE rating_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE driver_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE coupon_uses;
ALTER PUBLICATION supabase_realtime ADD TABLE user_coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE promo_code_uses;
ALTER PUBLICATION supabase_realtime ADD TABLE family_members;
ALTER PUBLICATION supabase_realtime ADD TABLE user_onboarding;
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE user_sms_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE user_recording_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE recording_consents;
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_logs;


-- ══════════════════════════════════════════════════════════════
-- PASSO 2: HABILITAR RLS EM TODAS AS TABELAS
-- ══════════════════════════════════════════════════════════════

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE address_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_ride_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_ride_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE intercity_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rating_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_route_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE surge_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recording_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sms_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_documents ENABLE ROW LEVEL SECURITY;


-- ══════════════════════════════════════════════════════════════
-- PASSO 3: POLICIES POR DOMINIO (idempotentes com IF NOT EXISTS)
-- ══════════════════════════════════════════════════════════════

-- ── PROFILES ─────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Public profiles are viewable') THEN
    CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Admins can do everything on profiles') THEN
    CREATE POLICY "Admins can do everything on profiles" ON profiles FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
    );
  END IF;
END $$;

-- ── RIDES ─────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rides' AND policyname='Users can create rides') THEN
    CREATE POLICY "Users can create rides" ON rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rides' AND policyname='Users can view own rides') THEN
    CREATE POLICY "Users can view own rides" ON rides FOR SELECT USING (auth.uid() = passenger_id OR auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rides' AND policyname='Drivers can update assigned rides') THEN
    CREATE POLICY "Drivers can update assigned rides" ON rides FOR UPDATE USING (auth.uid() = driver_id OR auth.uid() = passenger_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rides' AND policyname='Drivers can view pending rides') THEN
    CREATE POLICY "Drivers can view pending rides" ON rides FOR SELECT USING (
      status = 'pending' AND auth.uid() != passenger_id
    );
  END IF;
END $$;

-- ── DRIVER LOCATIONS ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_locations' AND policyname='Drivers can insert own location') THEN
    CREATE POLICY "Drivers can insert own location" ON driver_locations FOR INSERT WITH CHECK (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_locations' AND policyname='Drivers can update own location') THEN
    CREATE POLICY "Drivers can update own location" ON driver_locations FOR UPDATE USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_locations' AND policyname='Anyone can view online drivers') THEN
    CREATE POLICY "Anyone can view online drivers" ON driver_locations FOR SELECT USING (is_online = true);
  END IF;
END $$;

-- ── PRICE OFFERS ──────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='price_offers' AND policyname='Drivers can create offers') THEN
    CREATE POLICY "Drivers can create offers" ON price_offers FOR INSERT WITH CHECK (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='price_offers' AND policyname='Users can view offers for their rides') THEN
    CREATE POLICY "Users can view offers for their rides" ON price_offers FOR SELECT USING (
      EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND passenger_id = auth.uid())
      OR auth.uid() = driver_id
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='price_offers' AND policyname='Users can update offers') THEN
    CREATE POLICY "Users can update offers" ON price_offers FOR UPDATE USING (
      EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND passenger_id = auth.uid())
      OR auth.uid() = driver_id
    );
  END IF;
END $$;

-- ── MESSAGES ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Users can view own messages') THEN
    CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Users can send messages') THEN
    CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='messages' AND policyname='Users can update own messages') THEN
    CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
END $$;

-- ── NOTIFICATIONS ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='Service can insert notifications') THEN
    CREATE POLICY "Service can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ── USER WALLETS ──────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_wallets' AND policyname='Users can view own wallet') THEN
    CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_wallets' AND policyname='Users can update own wallet') THEN
    CREATE POLICY "Users can update own wallet" ON user_wallets FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── WALLET TRANSACTIONS ───────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='wallet_transactions' AND policyname='Users can view own transactions') THEN
    CREATE POLICY "Users can view own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── PAYMENTS ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Users can view own payments') THEN
    CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Users can insert own payments') THEN
    CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── PAYMENT METHODS ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payment_methods' AND policyname='Users can manage own payment methods') THEN
    CREATE POLICY "Users can manage own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── DRIVER PROFILES ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_profiles' AND policyname='Drivers can manage own profile') THEN
    CREATE POLICY "Drivers can manage own profile" ON driver_profiles FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_profiles' AND policyname='Passengers can view driver profiles') THEN
    CREATE POLICY "Passengers can view driver profiles" ON driver_profiles FOR SELECT USING (true);
  END IF;
END $$;

-- ── VEHICLES ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname='Drivers can manage own vehicles') THEN
    CREATE POLICY "Drivers can manage own vehicles" ON vehicles FOR ALL USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname='Anyone can view active vehicles') THEN
    CREATE POLICY "Anyone can view active vehicles" ON vehicles FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── DRIVER DOCUMENTS ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_documents' AND policyname='Drivers can manage own documents') THEN
    CREATE POLICY "Drivers can manage own documents" ON driver_documents FOR ALL USING (auth.uid() = driver_id);
  END IF;
END $$;

-- ── DRIVER VERIFICATIONS ──────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_verifications' AND policyname='Drivers can view own verifications') THEN
    CREATE POLICY "Drivers can view own verifications" ON driver_verifications FOR SELECT USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_verifications' AND policyname='Drivers can insert own verifications') THEN
    CREATE POLICY "Drivers can insert own verifications" ON driver_verifications FOR INSERT WITH CHECK (auth.uid() = driver_id);
  END IF;
END $$;

-- ── DRIVER WITHDRAWALS ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_withdrawals' AND policyname='Drivers can manage own withdrawals') THEN
    CREATE POLICY "Drivers can manage own withdrawals" ON driver_withdrawals FOR ALL USING (auth.uid() = driver_id);
  END IF;
END $$;

-- ── DRIVER EARNINGS ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_earnings' AND policyname='Drivers can view own earnings') THEN
    CREATE POLICY "Drivers can view own earnings" ON driver_earnings FOR SELECT USING (auth.uid() = driver_id);
  END IF;
END $$;

-- ── DRIVER BONUSES ────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_bonuses' AND policyname='Drivers can view own bonuses') THEN
    CREATE POLICY "Drivers can view own bonuses" ON driver_bonuses FOR SELECT USING (auth.uid() = driver_id);
  END IF;
END $$;

-- ── DRIVER REVIEWS ────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_reviews' AND policyname='Anyone can view driver reviews') THEN
    CREATE POLICY "Anyone can view driver reviews" ON driver_reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_reviews' AND policyname='Passengers can insert driver reviews') THEN
    CREATE POLICY "Passengers can insert driver reviews" ON driver_reviews FOR INSERT WITH CHECK (auth.uid() = passenger_id);
  END IF;
END $$;

-- ── DRIVER SCHEDULE ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_schedule' AND policyname='Drivers can manage own schedule') THEN
    CREATE POLICY "Drivers can manage own schedule" ON driver_schedule FOR ALL USING (auth.uid() = driver_id);
  END IF;
END $$;

-- ── EMERGENCY ALERTS ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='emergency_alerts' AND policyname='Users can manage own emergency alerts') THEN
    CREATE POLICY "Users can manage own emergency alerts" ON emergency_alerts FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── EMERGENCY CONTACTS ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='emergency_contacts' AND policyname='Users can manage own emergency contacts') THEN
    CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── SUPPORT TICKETS ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='support_tickets' AND policyname='Users can manage own tickets') THEN
    CREATE POLICY "Users can manage own tickets" ON support_tickets FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── SUPPORT MESSAGES ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='support_messages' AND policyname='Users can view own support messages') THEN
    CREATE POLICY "Users can view own support messages" ON support_messages FOR SELECT
      USING (auth.uid() = sender_id OR EXISTS (
        SELECT 1 FROM support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid()
      ));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='support_messages' AND policyname='Users can send support messages') THEN
    CREATE POLICY "Users can send support messages" ON support_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

-- ── RATINGS ───────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ratings' AND policyname='Anyone can view ratings') THEN
    CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ratings' AND policyname='Users can insert own ratings') THEN
    CREATE POLICY "Users can insert own ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
  END IF;
END $$;

-- ── REVIEWS ───────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Anyone can view reviews') THEN
    CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Users can insert own reviews') THEN
    CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
  END IF;
END $$;

-- ── RIDE TRACKING ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tracking' AND policyname='Users can view tracking for own rides') THEN
    CREATE POLICY "Users can view tracking for own rides" ON ride_tracking FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tracking' AND policyname='Drivers can insert tracking') THEN
    CREATE POLICY "Drivers can insert tracking" ON ride_tracking FOR INSERT WITH CHECK (auth.uid() = driver_id);
  END IF;
END $$;

-- ── RIDE ROUTE POINTS ─────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_route_points' AND policyname='Ride participants can view route points') THEN
    CREATE POLICY "Ride participants can view route points" ON ride_route_points FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
  END IF;
END $$;

-- ── RIDE RECORDINGS ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_recordings' AND policyname='Ride participants can view recordings') THEN
    CREATE POLICY "Ride participants can view recordings" ON ride_recordings FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
  END IF;
END $$;

-- ── RIDE CANCELLATIONS ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_cancellations' AND policyname='Ride participants can view cancellations') THEN
    CREATE POLICY "Ride participants can view cancellations" ON ride_cancellations FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_cancellations' AND policyname='Users can insert cancellations') THEN
    CREATE POLICY "Users can insert cancellations" ON ride_cancellations FOR INSERT WITH CHECK (auth.uid() = cancelled_by);
  END IF;
END $$;

-- ── RIDE DISPUTES ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_disputes' AND policyname='Ride participants can manage disputes') THEN
    CREATE POLICY "Ride participants can manage disputes" ON ride_disputes FOR ALL
      USING (auth.uid() = raised_by OR EXISTS (
        SELECT 1 FROM rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())
      ));
  END IF;
END $$;

-- ── RIDE TIPS ─────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tips' AND policyname='Users can view own tips') THEN
    CREATE POLICY "Users can view own tips" ON ride_tips FOR SELECT USING (auth.uid() = passenger_id OR auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tips' AND policyname='Passengers can insert tips') THEN
    CREATE POLICY "Passengers can insert tips" ON ride_tips FOR INSERT WITH CHECK (auth.uid() = passenger_id);
  END IF;
END $$;

-- ── SCHEDULED RIDES ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scheduled_rides' AND policyname='Users can view own scheduled rides') THEN
    CREATE POLICY "Users can view own scheduled rides" ON scheduled_rides FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND passenger_id = auth.uid()));
  END IF;
END $$;

-- ── DELIVERY ORDERS ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='delivery_orders' AND policyname='Senders can manage own deliveries') THEN
    CREATE POLICY "Senders can manage own deliveries" ON delivery_orders FOR ALL USING (auth.uid() = sender_id);
  END IF;
END $$;

-- ── GROUP RIDES ───────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_rides' AND policyname='Creators can manage own group rides') THEN
    CREATE POLICY "Creators can manage own group rides" ON group_rides FOR ALL USING (auth.uid() = creator_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_rides' AND policyname='Anyone can view group rides') THEN
    CREATE POLICY "Anyone can view group rides" ON group_rides FOR SELECT USING (true);
  END IF;
END $$;

-- ── GROUP RIDE MEMBERS ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_ride_members' AND policyname='Users can manage own membership') THEN
    CREATE POLICY "Users can manage own membership" ON group_ride_members FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── GROUP RIDE PARTICIPANTS ───────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_ride_participants' AND policyname='Users can manage own participation') THEN
    CREATE POLICY "Users can manage own participation" ON group_ride_participants FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── INTERCITY RIDES ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intercity_rides' AND policyname='Drivers can manage own intercity rides') THEN
    CREATE POLICY "Drivers can manage own intercity rides" ON intercity_rides FOR ALL USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intercity_rides' AND policyname='Anyone can view available intercity rides') THEN
    CREATE POLICY "Anyone can view available intercity rides" ON intercity_rides FOR SELECT USING (status = 'available');
  END IF;
END $$;

-- ── INTERCITY BOOKINGS ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intercity_bookings' AND policyname='Passengers can manage own bookings') THEN
    CREATE POLICY "Passengers can manage own bookings" ON intercity_bookings FOR ALL USING (auth.uid() = passenger_id);
  END IF;
END $$;

-- ── SOCIAL POSTS ──────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_posts' AND policyname='Anyone can view posts') THEN
    CREATE POLICY "Anyone can view posts" ON social_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_posts' AND policyname='Users can manage own posts') THEN
    CREATE POLICY "Users can manage own posts" ON social_posts FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── SOCIAL POST LIKES ─────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_post_likes' AND policyname='Users can manage own likes') THEN
    CREATE POLICY "Users can manage own likes" ON social_post_likes FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_post_likes' AND policyname='Anyone can view likes') THEN
    CREATE POLICY "Anyone can view likes" ON social_post_likes FOR SELECT USING (true);
  END IF;
END $$;

-- ── POST COMMENTS ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_comments' AND policyname='Anyone can view comments') THEN
    CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_comments' AND policyname='Users can manage own comments') THEN
    CREATE POLICY "Users can manage own comments" ON post_comments FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── POST LIKES ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_likes' AND policyname='Users can manage own post likes') THEN
    CREATE POLICY "Users can manage own post likes" ON post_likes FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_likes' AND policyname='Anyone can view post likes') THEN
    CREATE POLICY "Anyone can view post likes" ON post_likes FOR SELECT USING (true);
  END IF;
END $$;

-- ── SOCIAL FOLLOWS ────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_follows' AND policyname='Users can manage own follows') THEN
    CREATE POLICY "Users can manage own follows" ON social_follows FOR ALL USING (auth.uid() = follower_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_follows' AND policyname='Anyone can view follows') THEN
    CREATE POLICY "Anyone can view follows" ON social_follows FOR SELECT USING (true);
  END IF;
END $$;

-- ── USER SOCIAL STATS ─────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_social_stats' AND policyname='Anyone can view social stats') THEN
    CREATE POLICY "Anyone can view social stats" ON user_social_stats FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_social_stats' AND policyname='Users can update own social stats') THEN
    CREATE POLICY "Users can update own social stats" ON user_social_stats FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER ACHIEVEMENTS ─────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_achievements' AND policyname='Users can view own achievements') THEN
    CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_achievements' AND policyname='System can manage achievements') THEN
    CREATE POLICY "System can manage achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── ACHIEVEMENTS (tabela global, leitura livre) ───────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='achievements' AND policyname='Anyone can view achievements') THEN
    CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='achievements' AND policyname='Admins can manage achievements') THEN
    CREATE POLICY "Admins can manage achievements" ON achievements FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── LEADERBOARD ───────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leaderboard' AND policyname='Anyone can view leaderboard') THEN
    CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);
  END IF;
END $$;

-- ── REFERRALS ─────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='referrals' AND policyname='Users can view own referrals') THEN
    CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='referrals' AND policyname='Users can create referrals') THEN
    CREATE POLICY "Users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
  END IF;
END $$;

-- ── REFERRAL ACHIEVEMENTS ─────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='referral_achievements' AND policyname='Users can view own referral achievements') THEN
    CREATE POLICY "Users can view own referral achievements" ON referral_achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── FAVORITES ─────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorites' AND policyname='Users can manage own favorites') THEN
    CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── FAVORITE ADDRESSES ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorite_addresses' AND policyname='Users can manage own favorite addresses') THEN
    CREATE POLICY "Users can manage own favorite addresses" ON favorite_addresses FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── FAVORITE DRIVERS ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorite_drivers' AND policyname='Users can manage own favorite drivers') THEN
    CREATE POLICY "Users can manage own favorite drivers" ON favorite_drivers FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── ADDRESS HISTORY ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='address_history' AND policyname='Users can manage own address history') THEN
    CREATE POLICY "Users can manage own address history" ON address_history FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── ADDRESS SEARCH HISTORY ────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='address_search_history' AND policyname='Users can manage own search history') THEN
    CREATE POLICY "Users can manage own search history" ON address_search_history FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── FAMILY MEMBERS ────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Users can manage own family') THEN
    CREATE POLICY "Users can manage own family" ON family_members FOR ALL USING (auth.uid() = user_id OR auth.uid() = member_id);
  END IF;
END $$;

-- ── COUPONS ───────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='Active coupons are publicly viewable') THEN
    CREATE POLICY "Active coupons are publicly viewable" ON coupons FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── COUPON USES ───────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_uses' AND policyname='Users can view own coupon uses') THEN
    CREATE POLICY "Users can view own coupon uses" ON coupon_uses FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_uses' AND policyname='Users can insert coupon uses') THEN
    CREATE POLICY "Users can insert coupon uses" ON coupon_uses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER COUPONS ──────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_coupons' AND policyname='Users can view own user coupons') THEN
    CREATE POLICY "Users can view own user coupons" ON user_coupons FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── PROMO CODES ───────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promo_codes' AND policyname='Active promo codes are viewable') THEN
    CREATE POLICY "Active promo codes are viewable" ON promo_codes FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── PROMO CODE USES ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promo_code_uses' AND policyname='Users can view own promo uses') THEN
    CREATE POLICY "Users can view own promo uses" ON promo_code_uses FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promo_code_uses' AND policyname='Users can insert promo uses') THEN
    CREATE POLICY "Users can insert promo uses" ON promo_code_uses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── PROMOTIONS ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promotions' AND policyname='Active promotions are viewable') THEN
    CREATE POLICY "Active promotions are viewable" ON promotions FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── PROMO BANNERS ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='promo_banners' AND policyname='Active banners are viewable') THEN
    CREATE POLICY "Active banners are viewable" ON promo_banners FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── CAMPAIGNS ─────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='campaigns' AND policyname='Active campaigns are viewable') THEN
    CREATE POLICY "Active campaigns are viewable" ON campaigns FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='Users can view own subscriptions') THEN
    CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='Users can insert own subscriptions') THEN
    CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER SETTINGS ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_settings' AND policyname='Users can manage own settings') THEN
    CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER PREFERENCES ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_preferences' AND policyname='Users can manage own preferences') THEN
    CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── NOTIFICATION PREFERENCES ──────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notification_preferences' AND policyname='Users can manage own notification preferences') THEN
    CREATE POLICY "Users can manage own notification preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER ONBOARDING ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_onboarding' AND policyname='Users can manage own onboarding') THEN
    CREATE POLICY "Users can manage own onboarding" ON user_onboarding FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER 2FA ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_2fa' AND policyname='Users can manage own 2fa') THEN
    CREATE POLICY "Users can manage own 2fa" ON user_2fa FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER DEVICES ──────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_devices' AND policyname='Users can manage own devices') THEN
    CREATE POLICY "Users can manage own devices" ON user_devices FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER SESSIONS ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_sessions' AND policyname='Users can view own sessions') THEN
    CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_sessions' AND policyname='Users can manage own sessions') THEN
    CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── RECORDING CONSENTS ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recording_consents' AND policyname='Users can manage own consent') THEN
    CREATE POLICY "Users can manage own consent" ON recording_consents FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER RECORDING PREFERENCES ───────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_recording_preferences' AND policyname='Users can manage own recording preferences') THEN
    CREATE POLICY "Users can manage own recording preferences" ON user_recording_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── FCM TOKENS ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fcm_tokens' AND policyname='Users can manage own fcm tokens') THEN
    CREATE POLICY "Users can manage own fcm tokens" ON fcm_tokens FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── USER PUSH TOKENS ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_push_tokens' AND policyname='Users can manage own push tokens') THEN
    CREATE POLICY "Users can manage own push tokens" ON user_push_tokens FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── PUSH SUBSCRIPTIONS ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='push_subscriptions' AND policyname='Users can manage own push subscriptions') THEN
    CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── PUSH LOG ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='push_log' AND policyname='Users can view own push logs') THEN
    CREATE POLICY "Users can view own push logs" ON push_log FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── EMAIL OTPS ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='email_otps' AND policyname='Users can view own otps') THEN
    CREATE POLICY "Users can view own otps" ON email_otps FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='email_otps' AND policyname='Service can manage otps') THEN
    CREATE POLICY "Service can manage otps" ON email_otps FOR ALL USING (true);
  END IF;
END $$;

-- ── SMS LOGS ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sms_logs' AND policyname='Users can view own sms logs') THEN
    CREATE POLICY "Users can view own sms logs" ON sms_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── SMS DELIVERIES ────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sms_deliveries' AND policyname='Users can view own sms deliveries') THEN
    CREATE POLICY "Users can view own sms deliveries" ON sms_deliveries FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── SMS TEMPLATES (publico) ───────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sms_templates' AND policyname='Admins can manage sms templates') THEN
    CREATE POLICY "Admins can manage sms templates" ON sms_templates FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── USER SMS PREFERENCES ──────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_sms_preferences' AND policyname='Users can manage own sms preferences') THEN
    CREATE POLICY "Users can manage own sms preferences" ON user_sms_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── ERROR LOGS ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='error_logs' AND policyname='Users can insert own error logs') THEN
    CREATE POLICY "Users can insert own error logs" ON error_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='error_logs' AND policyname='Admins can view all error logs') THEN
    CREATE POLICY "Admins can view all error logs" ON error_logs FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── ADMIN LOGS ────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_logs' AND policyname='Admins can view admin logs') THEN
    CREATE POLICY "Admins can view admin logs" ON admin_logs FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_logs' AND policyname='Admins can insert admin logs') THEN
    CREATE POLICY "Admins can insert admin logs" ON admin_logs FOR INSERT WITH CHECK (auth.uid() = admin_id);
  END IF;
END $$;

-- ── RATING CATEGORIES (publico) ───────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rating_categories' AND policyname='Anyone can view rating categories') THEN
    CREATE POLICY "Anyone can view rating categories" ON rating_categories FOR SELECT USING (true);
  END IF;
END $$;

-- ── PRICING RULES (publico) ───────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='pricing_rules' AND policyname='Anyone can view active pricing rules') THEN
    CREATE POLICY "Anyone can view active pricing rules" ON pricing_rules FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── HOT ZONES (publico) ───────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='hot_zones' AND policyname='Anyone can view active hot zones') THEN
    CREATE POLICY "Anyone can view active hot zones" ON hot_zones FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── SURGE PRICING (publico) ───────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='surge_pricing' AND policyname='Anyone can view active surge pricing') THEN
    CREATE POLICY "Anyone can view active surge pricing" ON surge_pricing FOR SELECT USING (true);
  END IF;
END $$;

-- ── CITY ZONES (publico) ──────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='city_zones' AND policyname='Anyone can view active city zones') THEN
    CREATE POLICY "Anyone can view active city zones" ON city_zones FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── POPULAR ROUTES (publico) ──────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='popular_routes' AND policyname='Anyone can view popular routes') THEN
    CREATE POLICY "Anyone can view popular routes" ON popular_routes FOR SELECT USING (true);
  END IF;
END $$;

-- ── FAQS (publico) ────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='faqs' AND policyname='Anyone can view active faqs') THEN
    CREATE POLICY "Anyone can view active faqs" ON faqs FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── LEGAL DOCUMENTS (publico) ─────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='legal_documents' AND policyname='Anyone can view active legal documents') THEN
    CREATE POLICY "Anyone can view active legal documents" ON legal_documents FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ── APP VERSIONS (publico) ────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='app_versions' AND policyname='Anyone can view app versions') THEN
    CREATE POLICY "Anyone can view app versions" ON app_versions FOR SELECT USING (true);
  END IF;
END $$;

-- ── APP CONFIG (publico) ──────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='app_config' AND policyname='Anyone can view app config') THEN
    CREATE POLICY "Anyone can view app config" ON app_config FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='app_config' AND policyname='Admins can manage app config') THEN
    CREATE POLICY "Admins can manage app config" ON app_config FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── SYSTEM CONFIG ─────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='system_config' AND policyname='Anyone can view system config') THEN
    CREATE POLICY "Anyone can view system config" ON system_config FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='system_config' AND policyname='Admins can manage system config') THEN
    CREATE POLICY "Admins can manage system config" ON system_config FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── SYSTEM SETTINGS ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='system_settings' AND policyname='Anyone can view system settings') THEN
    CREATE POLICY "Anyone can view system settings" ON system_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='system_settings' AND policyname='Admins can manage system settings') THEN
    CREATE POLICY "Admins can manage system settings" ON system_settings FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── PLATFORM METRICS ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='platform_metrics' AND policyname='Admins can view platform metrics') THEN
    CREATE POLICY "Admins can view platform metrics" ON platform_metrics FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── WEBHOOK ENDPOINTS ─────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='webhook_endpoints' AND policyname='Admins can manage webhook endpoints') THEN
    CREATE POLICY "Admins can manage webhook endpoints" ON webhook_endpoints FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── WEBHOOKS ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='webhooks' AND policyname='Admins can manage webhooks') THEN
    CREATE POLICY "Admins can manage webhooks" ON webhooks FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;

-- ── WEBHOOK DELIVERIES ────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='webhook_deliveries' AND policyname='Admins can view webhook deliveries') THEN
    CREATE POLICY "Admins can view webhook deliveries" ON webhook_deliveries FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
  END IF;
END $$;


-- ══════════════════════════════════════════════════════════════
-- PASSO 4: POLICY FALLBACK - service_role tem acesso total em tudo
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'achievements','address_history','address_search_history','admin_logs',
    'app_config','app_versions','campaigns','city_zones','coupon_uses','coupons',
    'delivery_orders','driver_bonuses','driver_documents','driver_earnings',
    'driver_locations','driver_profiles','driver_reviews','driver_schedule',
    'driver_verifications','driver_withdrawals','email_otps','emergency_alerts',
    'emergency_contacts','error_logs','family_members','faqs','favorite_addresses',
    'favorite_drivers','favorites','fcm_tokens','group_ride_members',
    'group_ride_participants','group_rides','hot_zones','intercity_bookings',
    'intercity_rides','leaderboard','legal_documents','messages',
    'notification_preferences','notifications','payment_methods','payments',
    'platform_metrics','popular_routes','post_comments','post_likes','price_offers',
    'pricing_rules','profiles','promo_banners','promo_code_uses','promo_codes',
    'promotions','push_log','push_subscriptions','rating_categories','ratings',
    'recording_consents','referral_achievements','referrals','reviews',
    'ride_cancellations','ride_disputes','ride_recordings','ride_route_points',
    'ride_tips','ride_tracking','rides','scheduled_rides','sms_deliveries',
    'sms_logs','sms_templates','social_follows','social_post_likes','social_posts',
    'subscriptions','support_messages','support_tickets','surge_pricing',
    'system_config','system_settings','user_2fa','user_achievements','user_coupons',
    'user_devices','user_onboarding','user_preferences','user_push_tokens',
    'user_recording_preferences','user_sessions','user_settings',
    'user_sms_preferences','user_social_stats','user_wallets','vehicles',
    'wallet_transactions','webhook_deliveries','webhook_endpoints','webhooks'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    BEGIN
      EXECUTE format(
        'CREATE POLICY "service_role full access" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        tbl
      );
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- policy ja existe, ok
    END;
  END LOOP;
END $$;

-- ══════════════════════════════════════════════════════════════
-- FIM - Verificacao final
-- ══════════════════════════════════════════════════════════════

SELECT
  t.tablename,
  c.relrowsecurity AS rls_enabled,
  COUNT(p.policyname) AS total_policies
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
  AND t.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
GROUP BY t.tablename, c.relrowsecurity
ORDER BY c.relrowsecurity DESC, t.tablename;
