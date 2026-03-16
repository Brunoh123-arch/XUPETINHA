-- =====================================================
-- UPPI - SETUP COMPLETO PARA NOVO SUPABASE
-- =====================================================
-- Este script configura um projeto Supabase do zero
-- Execute no SQL Editor do Supabase Dashboard
-- Data: 14/03/2026 | Versao: 2.0
-- =====================================================

-- =====================================================
-- PARTE 1: EXTENSOES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- PARTE 2: TIPOS ENUMERADOS
-- =====================================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('passenger', 'driver', 'admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'banned'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE driver_status AS ENUM ('pending', 'approved', 'rejected', 'suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE vehicle_type AS ENUM ('economy', 'comfort', 'premium', 'suv', 'van', 'moto'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE ride_status AS ENUM ('searching', 'pending_offers', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE ride_type AS ENUM ('individual', 'shared', 'scheduled', 'delivery', 'intercity'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'pix', 'cash', 'wallet'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE transaction_type AS ENUM ('ride', 'refund', 'bonus', 'cashback', 'referral', 'subscription', 'withdrawal', 'deposit'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('ride', 'offer', 'message', 'achievement', 'promotion', 'system'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- PARTE 3: FUNCAO UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PARTE 4: TABELAS CORE
-- =====================================================

-- Profiles (conectado ao auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  cpf TEXT UNIQUE,
  birth_date DATE,
  user_type TEXT DEFAULT 'passenger' CHECK (user_type IN ('passenger', 'driver', 'admin')),
  is_admin BOOLEAN DEFAULT FALSE,
  is_driver BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Profiles
CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  cnh TEXT,
  cnh_category TEXT,
  cnh_expiry DATE,
  cnh_photo_url TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_online BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  acceptance_rate DECIMAL(5,2) DEFAULT 100,
  cancellation_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES driver_profiles(id) ON DELETE CASCADE,
  vehicle_type TEXT DEFAULT 'economy',
  brand TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  plate TEXT UNIQUE,
  renavam TEXT,
  crlv_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  seats INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Locations (com PostGIS)
CREATE TABLE IF NOT EXISTS driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  heading DECIMAL(5,2) DEFAULT 0,
  speed DECIMAL(8,2) DEFAULT 0,
  accuracy DECIMAL(8,2),
  is_online BOOLEAN DEFAULT FALSE,
  last_ride_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice geoespacial
CREATE INDEX IF NOT EXISTS idx_driver_locations_geo 
ON driver_locations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- =====================================================
-- PARTE 5: TABELAS DE CORRIDAS
-- =====================================================

-- Rides
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  -- Origem
  origin_address TEXT,
  origin_lat DECIMAL(10,7),
  origin_lng DECIMAL(10,7),
  
  -- Destino
  destination_address TEXT,
  destination_lat DECIMAL(10,7),
  destination_lng DECIMAL(10,7),
  
  -- Detalhes
  ride_type TEXT DEFAULT 'individual',
  vehicle_type TEXT DEFAULT 'economy',
  status TEXT DEFAULT 'searching' CHECK (status IN ('searching', 'pending_offers', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled', 'failed')),
  
  -- Valores
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Pagamento
  payment_method TEXT DEFAULT 'pix',
  payment_status TEXT DEFAULT 'pending',
  
  -- Timestamps
  scheduled_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Extras
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

-- =====================================================
-- PARTE 6: TABELAS FINANCEIRAS
-- =====================================================

-- User Wallets
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) DEFAULT 0,
  pending_balance DECIMAL(12,2) DEFAULT 0,
  total_earned DECIMAL(12,2) DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES user_wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2),
  description TEXT,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  reference_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  gateway_id TEXT,
  gateway_response JSONB,
  pix_code TEXT,
  pix_qr_code TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Withdrawals
CREATE TABLE IF NOT EXISTS driver_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  pix_key TEXT,
  pix_key_type TEXT,
  bank_name TEXT,
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount DECIMAL(10,2),
  min_ride_value DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surge Pricing
CREATE TABLE IF NOT EXISTS surge_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id TEXT,
  multiplier DECIMAL(3,2) DEFAULT 1.0,
  reason TEXT,
  active_from TIMESTAMPTZ DEFAULT NOW(),
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 7: TABELAS DE COMUNICACAO
-- =====================================================

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FCM Tokens
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT,
  device_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- =====================================================
-- PARTE 8: TABELAS DE AVALIACOES
-- =====================================================

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rated_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Reviews
CREATE TABLE IF NOT EXISTS driver_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  passenger_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 9: TABELAS SOCIAIS E GAMIFICACAO
-- =====================================================

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 0,
  requirement_type TEXT,
  requirement_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  total_rides INTEGER DEFAULT 0,
  total_distance_km DECIMAL(10,2) DEFAULT 0,
  period TEXT CHECK (period IN ('weekly', 'monthly', 'all_time')),
  rank INTEGER,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period, period_start)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  reward_amount DECIMAL(10,2),
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Social Posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Likes
CREATE TABLE IF NOT EXISTS social_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Social Comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Follows
CREATE TABLE IF NOT EXISTS social_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- =====================================================
-- PARTE 10: CORRIDAS ESPECIAIS
-- =====================================================

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

-- =====================================================
-- PARTE 11: EMERGENCIA E SUPORTE
-- =====================================================

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Alerts
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  alert_type TEXT CHECK (alert_type IN ('sos', 'suspicious', 'accident', 'other')),
  description TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  status TEXT DEFAULT 'active',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Messages
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 12: ADMIN E SISTEMA
-- =====================================================

-- Admin Logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Config
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error Logs
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB DEFAULT '[]',
  secret TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Deliveries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT,
  payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 13: LOCALIZACAO E ZONAS
-- =====================================================

-- Hot Zones
CREATE TABLE IF NOT EXISTS hot_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),
  radius_km DECIMAL(5,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- City Zones
CREATE TABLE IF NOT EXISTS city_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  polygon JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorite Addresses
CREATE TABLE IF NOT EXISTS favorite_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorite Drivers
CREATE TABLE IF NOT EXISTS favorite_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, driver_id)
);

-- =====================================================
-- PARTE 14: EXTRAS
-- =====================================================

-- User Push Tokens (alternativo ao FCM)
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Driver Schedule
CREATE TABLE IF NOT EXISTS driver_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Members (para compartilhar corridas)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT,
  can_book_rides BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, member_id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT,
  status TEXT DEFAULT 'active',
  price DECIMAL(10,2),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Banners
CREATE TABLE IF NOT EXISTS promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT,
  link_url TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT,
  discount_value DECIMAL(10,2),
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo Code Uses
CREATE TABLE IF NOT EXISTS promo_code_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  discount_applied DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Log
CREATE TABLE IF NOT EXISTS push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT,
  body TEXT,
  data JSONB,
  status TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Deliveries
CREATE TABLE IF NOT EXISTS sms_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  phone TEXT,
  message TEXT,
  status TEXT,
  provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User 2FA
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT FALSE,
  secret TEXT,
  backup_codes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 15: TABELAS ADICIONAIS (completando 100)
-- =====================================================

-- Coupon Uses
CREATE TABLE IF NOT EXISTS coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  discount_applied DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Coupons
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  ride_updates BOOLEAN DEFAULT TRUE,
  promotions BOOLEAN DEFAULT TRUE,
  social BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews (avaliacoes gerais)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rating Categories
CREATE TABLE IF NOT EXISTS rating_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_positive BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Social Stats
CREATE TABLE IF NOT EXISTS user_social_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Likes (alias de social_post_likes)
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Driver Verifications
CREATE TABLE IF NOT EXISTS driver_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT,
  document_url TEXT,
  selfie_url TEXT,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ride Recordings
CREATE TABLE IF NOT EXISTS ride_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  recording_url TEXT,
  duration_seconds INTEGER,
  file_size_mb DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recording Consents
CREATE TABLE IF NOT EXISTS recording_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Recording Preferences
CREATE TABLE IF NOT EXISTS user_recording_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  auto_record BOOLEAN DEFAULT FALSE,
  keep_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Ride Participants
CREATE TABLE IF NOT EXISTS group_ride_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_ride_id UUID REFERENCES group_rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_ride_id, user_id)
);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT,
  discount_value DECIMAL(10,2),
  min_ride_value DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Popular Routes
CREATE TABLE IF NOT EXISTS popular_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_name TEXT,
  origin_lat DECIMAL(10,7),
  origin_lng DECIMAL(10,7),
  destination_name TEXT,
  destination_lat DECIMAL(10,7),
  destination_lng DECIMAL(10,7),
  ride_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Address Search History
CREATE TABLE IF NOT EXISTS address_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Address History
CREATE TABLE IF NOT EXISTS address_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  times_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Templates
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Logs
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  phone TEXT,
  template TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User SMS Preferences
CREATE TABLE IF NOT EXISTS user_sms_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  ride_updates BOOLEAN DEFAULT TRUE,
  promotions BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing Rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type TEXT,
  base_fare DECIMAL(10,2) DEFAULT 5,
  per_km_rate DECIMAL(10,2) DEFAULT 2,
  per_minute_rate DECIMAL(10,2) DEFAULT 0.5,
  minimum_fare DECIMAL(10,2) DEFAULT 8,
  cancellation_fee DECIMAL(10,2) DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- App Config
CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Metrics
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_rides INTEGER DEFAULT 0,
  completed_rides INTEGER DEFAULT 0,
  cancelled_rides INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_drivers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  target_audience TEXT,
  discount_type TEXT,
  discount_value DECIMAL(10,2),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Documents
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email OTPs
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'pt-BR',
  dark_mode BOOLEAN DEFAULT FALSE,
  haptic_feedback BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Onboarding
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  step INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook Endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB DEFAULT '[]',
  secret TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral Achievements
CREATE TABLE IF NOT EXISTS referral_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  icon TEXT,
  reward_credits DECIMAL(10,2) DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods (cartoes salvos)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('credit_card', 'debit_card', 'pix')),
  last_four TEXT,
  brand TEXT,
  holder_name TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  gateway_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ride Cancellations
CREATE TABLE IF NOT EXISTS ride_cancellations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  reason_code TEXT,
  fee_charged DECIMAL(10,2) DEFAULT 0,
  fee_waived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Earnings (historico diario)
CREATE TABLE IF NOT EXISTS driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_rides INTEGER DEFAULT 0,
  gross_earnings DECIMAL(12,2) DEFAULT 0,
  platform_fees DECIMAL(12,2) DEFAULT 0,
  net_earnings DECIMAL(12,2) DEFAULT 0,
  bonuses DECIMAL(12,2) DEFAULT 0,
  tips DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, date)
);

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_id TEXT,
  device_type TEXT,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ride Tips
CREATE TABLE IF NOT EXISTS ride_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Bonuses
CREATE TABLE IF NOT EXISTS driver_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Devices
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_id TEXT,
  platform TEXT,
  os_version TEXT,
  app_version TEXT,
  push_token TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ride Disputes
CREATE TABLE IF NOT EXISTS ride_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  raised_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Driver Documents
CREATE TABLE IF NOT EXISTS driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_url TEXT,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_vehicle_type TEXT DEFAULT 'economy',
  preferred_payment_method TEXT DEFAULT 'pix',
  auto_tip_percentage INTEGER DEFAULT 0,
  share_ride_by_default BOOLEAN DEFAULT FALSE,
  quiet_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ride Route Points (pontos da rota)
CREATE TABLE IF NOT EXISTS ride_route_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- App Versions (controle de versoes)
CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT CHECK (platform IN ('android', 'ios', 'web')),
  version TEXT NOT NULL,
  build_number INTEGER,
  min_supported_version TEXT,
  force_update BOOLEAN DEFAULT FALSE,
  changelog TEXT,
  release_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PARTE 16: TRIGGERS UPDATED_AT
-- =====================================================

-- Criar triggers para todas as tabelas com updated_at
DO $$
DECLARE
  t TEXT;
  tables_with_updated_at TEXT[] := ARRAY[
    'profiles', 'driver_profiles', 'vehicles', 'driver_locations',
    'rides', 'price_offers', 'user_wallets', 'payments',
    'driver_withdrawals', 'support_tickets', 'system_config',
    'user_achievements', 'user_2fa', 'fcm_tokens'
  ];
BEGIN
  FOREACH t IN ARRAY tables_with_updated_at LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
      CREATE TRIGGER update_%s_updated_at
      BEFORE UPDATE ON %s
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- =====================================================
-- PARTE 16: TRIGGER CRIAR PROFILE NO SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Criar wallet para o usuario
  INSERT INTO public.user_wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- PARTE 17: RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS em todas as tabelas
DO $$
DECLARE
  t TEXT;
  all_tables TEXT[] := ARRAY[
    'profiles', 'driver_profiles', 'vehicles', 'driver_locations',
    'rides', 'price_offers', 'ride_tracking', 'messages', 'notifications',
    'fcm_tokens', 'ratings', 'driver_reviews', 'user_wallets', 'wallet_transactions',
    'payments', 'driver_withdrawals', 'coupons', 'surge_pricing',
    'achievements', 'user_achievements', 'leaderboard', 'referrals',
    'social_posts', 'social_post_likes', 'post_comments', 'social_follows',
    'scheduled_rides', 'group_rides', 'group_ride_members',
    'intercity_rides', 'intercity_bookings', 'delivery_orders',
    'emergency_contacts', 'emergency_alerts', 'support_tickets', 'support_messages',
    'admin_logs', 'system_config', 'error_logs', 'webhooks', 'webhook_deliveries',
    'hot_zones', 'city_zones', 'favorite_addresses', 'favorite_drivers',
    'user_push_tokens', 'driver_schedule', 'family_members', 'subscriptions',
    'promo_banners', 'promo_codes', 'promo_code_uses', 'push_log', 'sms_deliveries', 'user_2fa',
    'coupon_uses', 'user_coupons', 'notification_preferences', 'push_subscriptions',
    'reviews', 'rating_categories', 'user_social_stats', 'post_likes',
    'driver_verifications', 'ride_recordings', 'recording_consents', 'user_recording_preferences',
    'group_ride_participants', 'promotions', 'popular_routes', 'address_search_history',
    'address_history', 'favorites', 'sms_templates', 'sms_logs', 'user_sms_preferences',
    'pricing_rules', 'app_config', 'system_settings', 'platform_metrics',
    'campaigns', 'faqs', 'legal_documents', 'email_otps', 'user_settings',
    'user_onboarding', 'webhook_endpoints'
  ];
BEGIN
  FOREACH t IN ARRAY all_tables LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- Policies para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);

-- Policies para rides
CREATE POLICY "Users can view own rides" ON rides FOR SELECT USING (auth.uid() = passenger_id OR auth.uid() = driver_id);
CREATE POLICY "Users can create rides" ON rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Drivers can update assigned rides" ON rides FOR UPDATE USING (auth.uid() = driver_id OR auth.uid() = passenger_id);

-- Policies para price_offers
CREATE POLICY "Users can view offers for their rides" ON price_offers FOR SELECT USING (
  auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id) OR auth.uid() = driver_id
);
CREATE POLICY "Drivers can create offers" ON price_offers FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Users can update offers" ON price_offers FOR UPDATE USING (
  auth.uid() IN (SELECT passenger_id FROM rides WHERE id = ride_id) OR auth.uid() = driver_id
);

-- Policies para messages
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policies para notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Policies para wallets
CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Policies para driver_locations (publico para buscar motoristas proximos)
CREATE POLICY "Anyone can view online drivers" ON driver_locations FOR SELECT USING (is_online = true);
CREATE POLICY "Drivers can update own location" ON driver_locations FOR UPDATE USING (auth.uid() = driver_id);
CREATE POLICY "Drivers can insert own location" ON driver_locations FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Admin policies (para usuarios com is_admin = true)
CREATE POLICY "Admins can do everything on profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- =====================================================
-- PARTE 18: HABILITAR REALTIME
-- =====================================================

-- Habilitar Realtime nas tabelas principais
DO $$
DECLARE
  t TEXT;
  realtime_tables TEXT[] := ARRAY[
    'driver_locations', 'rides', 'ride_tracking', 'messages', 'notifications',
    'payments', 'price_offers', 'profiles', 'group_rides', 'group_ride_members',
    'emergency_alerts', 'support_tickets', 'support_messages', 'social_posts',
    'social_post_likes', 'post_comments', 'fcm_tokens', 'user_wallets',
    'wallet_transactions', 'leaderboard', 'user_achievements', 'referrals',
    'scheduled_rides', 'intercity_rides', 'intercity_bookings', 'delivery_orders',
    'surge_pricing', 'hot_zones', 'city_zones', 'subscriptions', 'sms_deliveries',
    'push_log', 'webhook_deliveries', 'system_config', 'promo_banners',
    'promo_codes', 'promo_code_uses', 'driver_profiles', 'driver_reviews',
    'driver_withdrawals', 'driver_schedule', 'error_logs', 'favorite_drivers',
    'family_members', 'ratings', 'social_follows', 'user_push_tokens',
    'emergency_contacts', 'vehicles', 'group_ride_participants', 'reviews',
    'driver_verifications', 'user_social_stats'
  ];
BEGIN
  FOREACH t IN ARRAY realtime_tables LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %s;', t);
    EXCEPTION WHEN OTHERS THEN
      -- Ignora se ja estiver adicionada
      NULL;
    END;
  END LOOP;
END $$;

-- =====================================================
-- PARTE 19: RPCs PRINCIPAIS
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
  -- Lock na corrida
  SELECT * INTO v_ride FROM rides WHERE id = p_ride_id FOR UPDATE;
  
  IF v_ride IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Corrida nao encontrada');
  END IF;
  
  IF v_ride.status NOT IN ('searching', 'pending_offers') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Corrida ja foi aceita ou cancelada');
  END IF;
  
  -- Pegar preco da oferta se existir
  IF p_offer_id IS NOT NULL THEN
    SELECT offered_price INTO v_price FROM price_offers WHERE id = p_offer_id;
  ELSE
    v_price := v_ride.estimated_price;
  END IF;
  
  -- Atualizar corrida
  UPDATE rides SET
    driver_id = p_driver_id,
    status = 'accepted',
    final_price = COALESCE(v_price, estimated_price),
    accepted_at = NOW(),
    updated_at = NOW()
  WHERE id = p_ride_id;
  
  -- Atualizar oferta se existir
  IF p_offer_id IS NOT NULL THEN
    UPDATE price_offers SET status = 'accepted', accepted_at = NOW() WHERE id = p_offer_id;
    -- Rejeitar outras ofertas
    UPDATE price_offers SET status = 'rejected' WHERE ride_id = p_ride_id AND id != p_offer_id AND status = 'pending';
  END IF;
  
  -- Atualizar disponibilidade do motorista
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
  
  -- Atualizar corrida
  UPDATE rides SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_ride_id;
  
  -- Calcular taxa da plataforma (20%)
  v_platform_fee := v_ride.final_price * 0.20;
  
  -- Creditar motorista
  SELECT id INTO v_driver_wallet_id FROM user_wallets WHERE user_id = v_ride.driver_id;
  
  UPDATE user_wallets SET
    balance = balance + (v_ride.final_price - v_platform_fee),
    total_earned = total_earned + (v_ride.final_price - v_platform_fee),
    updated_at = NOW()
  WHERE user_id = v_ride.driver_id;
  
  -- Registrar transacao
  INSERT INTO wallet_transactions (user_id, wallet_id, type, amount, description, ride_id)
  VALUES (v_ride.driver_id, v_driver_wallet_id, 'ride', v_ride.final_price - v_platform_fee, 'Corrida completada', p_ride_id);
  
  -- Liberar motorista
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
  
  -- Debitar saldo
  UPDATE user_wallets SET
    balance = balance - p_amount,
    pending_balance = pending_balance + p_amount,
    updated_at = NOW()
  WHERE user_id = auth.uid();
  
  -- Criar solicitacao
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

-- =====================================================
-- PARTE 20: INDICES DE PERFORMANCE
-- =====================================================

-- Indices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_rides_passenger ON rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created ON rides(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_price_offers_ride ON price_offers(ride_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_driver ON price_offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_status ON price_offers(status);

CREATE INDEX IF NOT EXISTS idx_messages_ride ON messages(ride_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_driver_profiles_user ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_status ON driver_profiles(status);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON driver_profiles(is_online) WHERE is_online = true;

-- =====================================================
-- PARTE 21: SEED DATA (Dados iniciais)
-- =====================================================

-- Configuracoes do sistema
INSERT INTO system_config (key, value, description) VALUES
('platform_fee_percentage', '20', 'Taxa da plataforma em percentual'),
('min_withdrawal_amount', '50', 'Valor minimo para saque em reais'),
('max_search_radius_km', '10', 'Raio maximo de busca de motoristas'),
('offer_expiry_minutes', '2', 'Tempo de expiracao de ofertas'),
('cancellation_fee', '5', 'Taxa de cancelamento em reais'),
('referral_bonus', '20', 'Bonus por indicacao em reais')
ON CONFLICT (key) DO NOTHING;

-- Achievements iniciais
INSERT INTO achievements (name, description, icon, points, requirement_type, requirement_value) VALUES
('Primeira Corrida', 'Complete sua primeira corrida', 'car', 10, 'rides_completed', 1),
('Motorista 5 Estrelas', 'Mantenha avaliacao 5 estrelas em 10 corridas', 'star', 50, 'rating_5_stars', 10),
('Viajante Frequente', 'Complete 50 corridas', 'road', 100, 'rides_completed', 50),
('Economizador', 'Economize R$100 em corridas compartilhadas', 'piggy-bank', 30, 'savings_amount', 100),
('Social', 'Faca 10 amigos no app', 'users', 25, 'friends_count', 10)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- FIM DO SETUP
-- =====================================================

-- Verificar setup
DO $$
DECLARE
  table_count INTEGER;
  rls_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public';
  SELECT COUNT(DISTINCT tablename) INTO rls_count FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'SETUP COMPLETO!';
  RAISE NOTICE 'Tabelas criadas: %', table_count;
  RAISE NOTICE 'Tabelas com RLS: %', rls_count;
  RAISE NOTICE '=====================================================';
END $$;
