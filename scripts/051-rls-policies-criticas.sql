-- ============================================================
-- 051-rls-policies-criticas.sql
-- RLS policies para as tabelas mais criticas sem policies
-- Gerado em: 2026-03-14
-- ============================================================

-- ── PAGAMENTOS ────────────────────────────────────────────────────────────────

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Users can view own payments') THEN
    CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='Users can insert own payments') THEN
    CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── EMERGENCIA ────────────────────────────────────────────────────────────────

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='emergency_alerts' AND policyname='Users can manage own emergency alerts') THEN
    CREATE POLICY "Users can manage own emergency alerts" ON emergency_alerts FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='emergency_contacts' AND policyname='Users can manage own emergency contacts') THEN
    CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── SUPORTE ───────────────────────────────────────────────────────────────────

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='support_tickets' AND policyname='Users can manage own tickets') THEN
    CREATE POLICY "Users can manage own tickets" ON support_tickets FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
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

-- ── MOTORISTA ─────────────────────────────────────────────────────────────────

ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_profiles' AND policyname='Drivers can manage own profile') THEN
    CREATE POLICY "Drivers can manage own profile" ON driver_profiles FOR ALL USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_profiles' AND policyname='Passengers can view driver profiles') THEN
    CREATE POLICY "Passengers can view driver profiles" ON driver_profiles FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname='Drivers can manage own vehicles') THEN
    CREATE POLICY "Drivers can manage own vehicles" ON vehicles FOR ALL USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='vehicles' AND policyname='Anyone can view active vehicles') THEN
    CREATE POLICY "Anyone can view active vehicles" ON vehicles FOR SELECT USING (is_active = true);
  END IF;
END $$;

ALTER TABLE driver_verifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_verifications' AND policyname='Drivers can view own verifications') THEN
    CREATE POLICY "Drivers can view own verifications" ON driver_verifications FOR SELECT USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_verifications' AND policyname='Drivers can insert own verifications') THEN
    CREATE POLICY "Drivers can insert own verifications" ON driver_verifications FOR INSERT WITH CHECK (auth.uid() = driver_id);
  END IF;
END $$;

ALTER TABLE driver_withdrawals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_withdrawals' AND policyname='Drivers can manage own withdrawals') THEN
    CREATE POLICY "Drivers can manage own withdrawals" ON driver_withdrawals FOR ALL USING (auth.uid() = driver_id);
  END IF;
END $$;

ALTER TABLE driver_reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_reviews' AND policyname='Anyone can view driver reviews') THEN
    CREATE POLICY "Anyone can view driver reviews" ON driver_reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_reviews' AND policyname='Passengers can insert driver reviews') THEN
    CREATE POLICY "Passengers can insert driver reviews" ON driver_reviews FOR INSERT WITH CHECK (auth.uid() = passenger_id);
  END IF;
END $$;

ALTER TABLE driver_schedule ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='driver_schedule' AND policyname='Drivers can manage own schedule') THEN
    CREATE POLICY "Drivers can manage own schedule" ON driver_schedule FOR ALL USING (auth.uid() = driver_id);
  END IF;
END $$;

-- ── FAVORITOS / ENDERECOS ─────────────────────────────────────────────────────

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorites' AND policyname='Users can manage own favorites') THEN
    CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE favorite_addresses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorite_addresses' AND policyname='Users can manage own favorite addresses') THEN
    CREATE POLICY "Users can manage own favorite addresses" ON favorite_addresses FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE favorite_drivers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='favorite_drivers' AND policyname='Users can manage own favorite drivers') THEN
    CREATE POLICY "Users can manage own favorite drivers" ON favorite_drivers FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE address_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='address_history' AND policyname='Users can manage own address history') THEN
    CREATE POLICY "Users can manage own address history" ON address_history FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE address_search_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='address_search_history' AND policyname='Users can manage own search history') THEN
    CREATE POLICY "Users can manage own search history" ON address_search_history FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── CORRIDAS ──────────────────────────────────────────────────────────────────

ALTER TABLE ride_tracking ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tracking' AND policyname='Users can view tracking for own rides') THEN
    CREATE POLICY "Users can view tracking for own rides" ON ride_tracking FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_tracking' AND policyname='Drivers can insert tracking') THEN
    CREATE POLICY "Drivers can insert tracking" ON ride_tracking FOR INSERT WITH CHECK (auth.uid() = driver_id);
  END IF;
END $$;

ALTER TABLE scheduled_rides ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='scheduled_rides' AND policyname='Users can view own scheduled rides') THEN
    CREATE POLICY "Users can view own scheduled rides" ON scheduled_rides FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND passenger_id = auth.uid()));
  END IF;
END $$;

ALTER TABLE ride_recordings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ride_recordings' AND policyname='Ride participants can view recordings') THEN
    CREATE POLICY "Ride participants can view recordings" ON ride_recordings FOR SELECT
      USING (EXISTS (SELECT 1 FROM rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid())));
  END IF;
END $$;

ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='delivery_orders' AND policyname='Senders can manage own deliveries') THEN
    CREATE POLICY "Senders can manage own deliveries" ON delivery_orders FOR ALL USING (auth.uid() = sender_id);
  END IF;
END $$;

-- ── SOCIAL ────────────────────────────────────────────────────────────────────

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_posts' AND policyname='Anyone can view posts') THEN
    CREATE POLICY "Anyone can view posts" ON social_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_posts' AND policyname='Users can manage own posts') THEN
    CREATE POLICY "Users can manage own posts" ON social_posts FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE social_post_likes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_post_likes' AND policyname='Users can manage own likes') THEN
    CREATE POLICY "Users can manage own likes" ON social_post_likes FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_comments' AND policyname='Anyone can view comments') THEN
    CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='post_comments' AND policyname='Users can manage own comments') THEN
    CREATE POLICY "Users can manage own comments" ON post_comments FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE social_follows ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_follows' AND policyname='Users can manage own follows') THEN
    CREATE POLICY "Users can manage own follows" ON social_follows FOR ALL USING (auth.uid() = follower_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_follows' AND policyname='Anyone can view follows') THEN
    CREATE POLICY "Anyone can view follows" ON social_follows FOR SELECT USING (true);
  END IF;
END $$;

-- ── GAMIFICACAO ───────────────────────────────────────────────────────────────

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_achievements' AND policyname='Users can view own achievements') THEN
    CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_achievements' AND policyname='System can manage achievements') THEN
    CREATE POLICY "System can manage achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leaderboard' AND policyname='Anyone can view leaderboard') THEN
    CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='referrals' AND policyname='Users can view own referrals') THEN
    CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
  END IF;
END $$;

-- ── CONFIGURACOES DO USUARIO ──────────────────────────────────────────────────

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_settings' AND policyname='Users can manage own settings') THEN
    CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_onboarding' AND policyname='Users can manage own onboarding') THEN
    CREATE POLICY "Users can manage own onboarding" ON user_onboarding FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_2fa' AND policyname='Users can manage own 2fa') THEN
    CREATE POLICY "Users can manage own 2fa" ON user_2fa FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE recording_consents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recording_consents' AND policyname='Users can manage own consent') THEN
    CREATE POLICY "Users can manage own consent" ON recording_consents FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notification_preferences' AND policyname='Users can manage own notification preferences') THEN
    CREATE POLICY "Users can manage own notification preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='fcm_tokens' AND policyname='Users can manage own fcm tokens') THEN
    CREATE POLICY "Users can manage own fcm tokens" ON fcm_tokens FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='user_push_tokens' AND policyname='Users can manage own push tokens') THEN
    CREATE POLICY "Users can manage own push tokens" ON user_push_tokens FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── CORRIDAS EM GRUPO ─────────────────────────────────────────────────────────

ALTER TABLE group_rides ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_rides' AND policyname='Creators can manage own group rides') THEN
    CREATE POLICY "Creators can manage own group rides" ON group_rides FOR ALL USING (auth.uid() = creator_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_rides' AND policyname='Anyone can view group rides') THEN
    CREATE POLICY "Anyone can view group rides" ON group_rides FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE group_ride_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_ride_members' AND policyname='Users can manage own membership') THEN
    CREATE POLICY "Users can manage own membership" ON group_ride_members FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── INTERCIDADES ──────────────────────────────────────────────────────────────

ALTER TABLE intercity_rides ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intercity_rides' AND policyname='Drivers can manage own intercity rides') THEN
    CREATE POLICY "Drivers can manage own intercity rides" ON intercity_rides FOR ALL USING (auth.uid() = driver_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intercity_rides' AND policyname='Anyone can view available intercity rides') THEN
    CREATE POLICY "Anyone can view available intercity rides" ON intercity_rides FOR SELECT USING (status = 'available');
  END IF;
END $$;

ALTER TABLE intercity_bookings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='intercity_bookings' AND policyname='Passengers can manage own bookings') THEN
    CREATE POLICY "Passengers can manage own bookings" ON intercity_bookings FOR ALL USING (auth.uid() = passenger_id);
  END IF;
END $$;

-- ── CUPONS / AVALIACOES (publicos) ────────────────────────────────────────────

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupons' AND policyname='Active coupons are publicly viewable') THEN
    CREATE POLICY "Active coupons are publicly viewable" ON coupons FOR SELECT USING (is_active = true);
  END IF;
END $$;

ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coupon_uses' AND policyname='Users can view own coupon uses') THEN
    CREATE POLICY "Users can view own coupon uses" ON coupon_uses FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ratings' AND policyname='Anyone can view ratings') THEN
    CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ratings' AND policyname='Users can insert own ratings') THEN
    CREATE POLICY "Users can insert own ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
  END IF;
END $$;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Anyone can view reviews') THEN
    CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Users can insert own reviews') THEN
    CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
  END IF;
END $$;

-- ── FAMILIA ───────────────────────────────────────────────────────────────────

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='family_members' AND policyname='Users can manage own family') THEN
    CREATE POLICY "Users can manage own family" ON family_members FOR ALL USING (auth.uid() = user_id OR auth.uid() = member_id);
  END IF;
END $$;
