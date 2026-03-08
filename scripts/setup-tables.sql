-- Criação das tabelas necessárias para o Uppi

-- Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  user_type TEXT DEFAULT 'passenger' CHECK (user_type IN ('passenger', 'driver', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela drivers
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  license_number TEXT,
  license_category TEXT,
  cpf TEXT,
  background_check_status TEXT DEFAULT 'pending',
  is_online BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  total_earnings NUMERIC(10,2) DEFAULT 0,
  availability JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir perfil do motorista existente
INSERT INTO public.profiles (id, email, full_name, phone, user_type, created_at)
VALUES (
  '6b0d6d18-4b9c-488e-b80b-f72d9074d35c',
  'motorista@uppi.com',
  'Teste Motorista',
  '(11) 99999-9999',
  'driver',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET user_type = 'driver';

-- Inserir registro na tabela drivers
INSERT INTO public.drivers (user_id, status, license_number, license_category, cpf, background_check_status, rating)
VALUES (
  '6b0d6d18-4b9c-488e-b80b-f72d9074d35c',
  'approved',
  'ABC123456',
  'D',
  '12345678900',
  'approved',
  5.0
)
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access profiles" ON public.profiles
  USING (true) WITH CHECK (true);

CREATE POLICY "Drivers can view own record" ON public.drivers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access drivers" ON public.drivers
  USING (true) WITH CHECK (true);
