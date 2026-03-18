-- Script final: tabelas que ainda faltam para completar o schema
-- Banco atual: 157 tabelas | Meta: ~192 tabelas

-- ===== NOTIFICACOES =====

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  device_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fcm_tokens_own" ON fcm_tokens FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS push_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  body TEXT,
  status VARCHAR(50) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE push_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push_log_own" ON push_log FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token VARCHAR(500) NOT NULL,
  device_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, push_token)
);
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_push_tokens_own" ON user_push_tokens FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sms_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sms_log_id UUID REFERENCES sms_logs(id) ON DELETE SET NULL,
  delivery_status VARCHAR(50),
  delivered_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE sms_deliveries ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS in_app_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255),
  message TEXT,
  banner_type VARCHAR(50),
  cta_text VARCHAR(100),
  cta_action VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE in_app_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "in_app_banners_public" ON in_app_banners FOR SELECT USING (TRUE);

-- ===== SEGURANCA =====

CREATE TABLE IF NOT EXISTS sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  event_type VARCHAR(50),
  description TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  status VARCHAR(50) DEFAULT 'reported',
  response_time_minutes INTEGER,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sos_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sos_events_own" ON sos_events FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS recording_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP WITH TIME ZONE,
  consent_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);
ALTER TABLE recording_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recording_consents_own" ON recording_consents FOR ALL USING (auth.uid() = user_id);

-- ===== LOCALIZACAO =====

CREATE TABLE IF NOT EXISTS address_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address VARCHAR(500),
  latitude NUMERIC,
  longitude NUMERIC,
  last_used_at TIMESTAMP WITH TIME ZONE,
  frequency INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE address_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "address_history_own" ON address_history FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_type VARCHAR(50),
  favorite_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_own" ON favorites FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_content_type VARCHAR(50),
  reported_content_id VARCHAR(100),
  reason VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_reports_own" ON content_reports FOR SELECT USING (auth.uid() = reporter_id);

-- ===== PAGAMENTOS EXTRAS =====

CREATE TABLE IF NOT EXISTS pix_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  pix_key VARCHAR(255),
  pix_key_type VARCHAR(50),
  qr_code TEXT,
  qr_code_url TEXT,
  e2e_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE pix_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pix_transactions_own" ON pix_transactions FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS payment_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_splits_public" ON payment_splits FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS payment_split_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id UUID NOT NULL REFERENCES payment_splits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(split_id, user_id)
);
ALTER TABLE payment_split_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_split_members_own" ON payment_split_members FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cashback_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cashback_type VARCHAR(50),
  cashback_value NUMERIC(10,2),
  min_ride_value NUMERIC(10,2),
  max_cashback NUMERIC(10,2),
  conditions JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE cashback_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cashback_rules_public" ON cashback_rules FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS cashback_earned (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES cashback_rules(id) ON DELETE SET NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  credited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE cashback_earned ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cashback_earned_own" ON cashback_earned FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier VARCHAR(50) DEFAULT 'bronze',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_points_own" ON user_points FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  gross_income NUMERIC(10,2),
  commission_paid NUMERIC(10,2),
  net_income NUMERIC(10,2),
  tax_withheld NUMERIC(10,2),
  document_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(driver_id, year, month)
);
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tax_records_own" ON tax_records FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM driver_profiles WHERE id = driver_id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  corporate_id UUID REFERENCES corporate_accounts(id) ON DELETE SET NULL,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  period_start DATE,
  period_end DATE,
  subtotal NUMERIC(10,2),
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_own" ON invoices FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_items_own" ON invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS scheduled_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount NUMERIC(10,2),
  description TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE scheduled_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scheduled_payments_own" ON scheduled_payments FOR ALL USING (auth.uid() = user_id);

-- ===== INTERCITY EXTRAS =====

CREATE TABLE IF NOT EXISTS intercity_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES intercity_routes(id) ON DELETE CASCADE,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(100),
  sequence INTEGER NOT NULL,
  pickup_allowed BOOLEAN DEFAULT TRUE,
  dropoff_allowed BOOLEAN DEFAULT TRUE,
  estimated_arrival_offset INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE intercity_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intercity_stops_public" ON intercity_stops FOR SELECT USING (TRUE);

-- ===== GAMIFICACAO EXTRAS =====

CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(50),
  reference_type VARCHAR(50),
  reference_id UUID,
  description TEXT,
  balance_after INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "point_transactions_own" ON point_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reward_redemptions_own" ON reward_redemptions FOR ALL USING (auth.uid() = user_id);

-- ===== ADMIN EXTRAS =====

CREATE TABLE IF NOT EXISTS admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  report_type VARCHAR(100),
  title VARCHAR(255),
  parameters JSONB,
  result_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_reports ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- ===== INDICES DE PERFORMANCE =====

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_log_user_id ON push_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_events_user_id ON sos_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sos_events_status ON sos_events(status);
CREATE INDEX IF NOT EXISTS idx_address_history_user_id ON address_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_user_id ON pix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_status ON pix_transactions(status);
CREATE INDEX IF NOT EXISTS idx_cashback_earned_user_id ON cashback_earned(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_driver_id ON tax_records(driver_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_corporate_id ON invoices(corporate_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_intercity_stops_route_id ON intercity_stops(route_id);
