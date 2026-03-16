-- =====================================================
-- UPPI - PARTE 1: EXTENSÕES E TIPOS
-- =====================================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TIPOS ENUMERADOS
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

-- FUNÇÃO UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
