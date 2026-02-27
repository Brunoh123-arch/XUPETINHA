-- Tabela para armazenar OTPs de 6 dígitos enviados por email
CREATE TABLE IF NOT EXISTS public.email_otps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para busca rápida por email + code
CREATE INDEX IF NOT EXISTS email_otps_email_idx ON public.email_otps (email, used, expires_at);

-- Sem RLS — esta tabela é acessada apenas pelo service role key no servidor
-- (nunca exposta ao cliente diretamente)
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy pública: acesso apenas via service_role (server-side)
