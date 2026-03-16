-- =====================================================
-- UPPI - PARTE 12: RLS E POLITICAS DE SEGURANCA
-- =====================================================

-- Habilitar RLS em tabelas principais
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS price_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ride_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS driver_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies para rides
DROP POLICY IF EXISTS "rides_select_own" ON rides;
CREATE POLICY "rides_select_own" ON rides FOR SELECT USING (
  auth.uid() = passenger_id OR 
  auth.uid() = driver_id OR 
  status IN ('searching', 'pending_offers')
);

DROP POLICY IF EXISTS "rides_insert_own" ON rides;
CREATE POLICY "rides_insert_own" ON rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);

DROP POLICY IF EXISTS "rides_update_own" ON rides;
CREATE POLICY "rides_update_own" ON rides FOR UPDATE USING (
  auth.uid() = passenger_id OR auth.uid() = driver_id
);

-- Policies para price_offers
DROP POLICY IF EXISTS "offers_select" ON price_offers;
CREATE POLICY "offers_select" ON price_offers FOR SELECT USING (
  auth.uid() = driver_id OR 
  EXISTS (SELECT 1 FROM rides WHERE rides.id = price_offers.ride_id AND rides.passenger_id = auth.uid())
);

DROP POLICY IF EXISTS "offers_insert" ON price_offers;
CREATE POLICY "offers_insert" ON price_offers FOR INSERT WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "offers_update" ON price_offers;
CREATE POLICY "offers_update" ON price_offers FOR UPDATE USING (
  auth.uid() = driver_id OR 
  EXISTS (SELECT 1 FROM rides WHERE rides.id = price_offers.ride_id AND rides.passenger_id = auth.uid())
);

-- Policies para messages
DROP POLICY IF EXISTS "messages_select_own" ON messages;
CREATE POLICY "messages_select_own" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

DROP POLICY IF EXISTS "messages_insert_own" ON messages;
CREATE POLICY "messages_insert_own" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policies para notifications
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT WITH CHECK (true);

-- Policies para wallets
DROP POLICY IF EXISTS "wallets_select_own" ON user_wallets;
CREATE POLICY "wallets_select_own" ON user_wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallet_transactions_select_own" ON wallet_transactions;
CREATE POLICY "wallet_transactions_select_own" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Policies para driver_locations
DROP POLICY IF EXISTS "driver_locations_select" ON driver_locations;
CREATE POLICY "driver_locations_select" ON driver_locations FOR SELECT USING (is_online = true OR auth.uid() = driver_id);

DROP POLICY IF EXISTS "driver_locations_insert" ON driver_locations;
CREATE POLICY "driver_locations_insert" ON driver_locations FOR INSERT WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "driver_locations_update" ON driver_locations;
CREATE POLICY "driver_locations_update" ON driver_locations FOR UPDATE USING (auth.uid() = driver_id);

-- Policies para driver_profiles
DROP POLICY IF EXISTS "driver_profiles_select" ON driver_profiles;
CREATE POLICY "driver_profiles_select" ON driver_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "driver_profiles_insert" ON driver_profiles;
CREATE POLICY "driver_profiles_insert" ON driver_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "driver_profiles_update" ON driver_profiles;
CREATE POLICY "driver_profiles_update" ON driver_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies para vehicles
DROP POLICY IF EXISTS "vehicles_select" ON vehicles;
CREATE POLICY "vehicles_select" ON vehicles FOR SELECT USING (true);

-- Policies para emergency
DROP POLICY IF EXISTS "emergency_contacts_select_own" ON emergency_contacts;
CREATE POLICY "emergency_contacts_select_own" ON emergency_contacts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "emergency_contacts_insert_own" ON emergency_contacts;
CREATE POLICY "emergency_contacts_insert_own" ON emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "emergency_alerts_select_own" ON emergency_alerts;
CREATE POLICY "emergency_alerts_select_own" ON emergency_alerts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "emergency_alerts_insert_own" ON emergency_alerts;
CREATE POLICY "emergency_alerts_insert_own" ON emergency_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para support
DROP POLICY IF EXISTS "support_tickets_select_own" ON support_tickets;
CREATE POLICY "support_tickets_select_own" ON support_tickets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "support_tickets_insert_own" ON support_tickets;
CREATE POLICY "support_tickets_insert_own" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
