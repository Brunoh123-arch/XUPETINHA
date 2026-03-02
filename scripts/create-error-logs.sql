-- ============================================================
-- Tabela: error_logs
-- Substitui o Sentry — armazena erros capturados pelo app
-- ============================================================

CREATE TABLE IF NOT EXISTS public.error_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL    DEFAULT now(),
  message     text        NOT NULL,
  stack       text,
  context     text,           -- URL / rota onde o erro ocorreu
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent  text,
  severity    text        NOT NULL DEFAULT 'error', -- 'error' | 'warning' | 'info'
  extra       jsonb                                 -- dados adicionais livres
);

-- Índices para consultas do painel admin
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON public.error_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx   ON public.error_logs (severity);

-- ============================================================
-- RLS: admins lêem; qualquer um pode inserir (anon / autenticado)
-- ============================================================

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Política de leitura: só admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'error_logs' AND policyname = 'Admins podem ler logs'
  ) THEN
    CREATE POLICY "Admins podem ler logs" ON public.error_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;

-- Política de inserção: qualquer um
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'error_logs' AND policyname = 'Qualquer um pode inserir log'
  ) THEN
    CREATE POLICY "Qualquer um pode inserir log" ON public.error_logs
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;
