-- =============================================================================
-- XUPETINHA — TRIGGERS
-- =============================================================================

-- =============================================================================
-- TRIGGER: Criar perfil automaticamente ao cadastrar usuário
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    phone
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TRIGGERS: updated_at automático
-- =============================================================================
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_driver_profiles ON public.driver_profiles;
CREATE TRIGGER set_updated_at_driver_profiles
  BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_vehicles ON public.vehicles;
CREATE TRIGGER set_updated_at_vehicles
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_saved_addresses ON public.saved_addresses;
CREATE TRIGGER set_updated_at_saved_addresses
  BEFORE UPDATE ON public.saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_rides ON public.rides;
CREATE TRIGGER set_updated_at_rides
  BEFORE UPDATE ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_payments ON public.payments;
CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_driver_wallets ON public.driver_wallets;
CREATE TRIGGER set_updated_at_driver_wallets
  BEFORE UPDATE ON public.driver_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_support_tickets ON public.support_tickets;
CREATE TRIGGER set_updated_at_support_tickets
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_system_settings ON public.system_settings;
CREATE TRIGGER set_updated_at_system_settings
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- TRIGGER: Gerar código de referência automático
-- =============================================================================
DROP TRIGGER IF EXISTS generate_referral_code_trigger ON public.profiles;
CREATE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- =============================================================================
-- ÍNDICES DE PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON public.driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_status ON public.driver_profiles(status);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_is_online ON public.driver_profiles(is_online);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_is_verified ON public.driver_profiles(is_verified);

CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON public.vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON public.vehicles(is_active);

CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON public.saved_addresses(user_id);

CREATE INDEX IF NOT EXISTS idx_rides_passenger_id ON public.rides(passenger_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON public.rides(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ride_requests_ride_id ON public.ride_requests(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_driver_id ON public.ride_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_ride_requests_status ON public.ride_requests(status);

CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON public.payments(ride_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON public.wallet_transactions(type);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_ride_id ON public.chat_messages(ride_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON public.promo_codes(is_active);

-- =============================================================================
-- REALTIME PUBLICATIONS
-- =============================================================================
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
  public.rides,
  public.ride_requests,
  public.chat_messages,
  public.notifications,
  public.driver_profiles;
