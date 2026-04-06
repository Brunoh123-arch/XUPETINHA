-- Tabelas faltantes identificadas no código

-- subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'basic', 'premium', 'vip'
  display_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  interval TEXT NOT NULL DEFAULT 'month', -- 'month', 'year'
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_plans_select_all" ON public.subscription_plans FOR SELECT USING (true);

-- user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_subscriptions_select_own" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_subscriptions_insert_own" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_subscriptions_update_own" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- driver_documents
CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'cnh', 'crlv', 'selfie', 'cpf', 'comprovante_residencia'
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_documents_select_own" ON public.driver_documents FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "driver_documents_insert_own" ON public.driver_documents FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "driver_documents_update_own" ON public.driver_documents FOR UPDATE USING (auth.uid() = driver_id);
CREATE POLICY "driver_documents_admin_all" ON public.driver_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ratings (avaliacoes de corrida)
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tags TEXT[] DEFAULT '{}',
  categories JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ratings_select_all" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "ratings_insert_own" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Seed: planos de assinatura
INSERT INTO public.subscription_plans (name, display_name, price, features, is_active)
VALUES
  ('basic', 'Básico', 0.00, '["Corridas ilimitadas", "Suporte básico"]', true),
  ('premium', 'Premium', 29.90, '["Corridas ilimitadas", "Prioridade no atendimento", "Descontos exclusivos", "Sem taxa de cancelamento"]', true),
  ('vip', 'VIP', 59.90, '["Corridas ilimitadas", "Motoristas 5 estrelas", "Prioridade máxima", "Desconto de 10%", "Sem taxa de cancelamento", "Suporte 24/7"]', true)
ON CONFLICT (name) DO NOTHING;

-- Indexes de performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON public.driver_documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ride_id ON public.ratings(ride_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewed_id ON public.ratings(reviewed_id);
