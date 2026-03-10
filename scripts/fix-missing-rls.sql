-- =====================================================
-- UPPI - Corrigir RLS em Tabelas Faltantes
-- Atualizado em: 10/03/2026
-- Executa no Supabase SQL Editor
-- =====================================================

-- Funcao para adicionar RLS em todas as tabelas sem RLS
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT t.tablename
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
    WHERE t.schemaname = 'public' 
      AND c.relrowsecurity = false
      AND t.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  LOOP
    -- Habilita RLS
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
    RAISE NOTICE 'RLS habilitado em: %', tbl.tablename;
    
    -- Cria policy basica de leitura para usuarios autenticados
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Enable read access for authenticated users" ON %I FOR SELECT TO authenticated USING (true)',
        tbl.tablename
      );
      RAISE NOTICE 'Policy SELECT criada em: %', tbl.tablename;
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Policy SELECT ja existe em: %', tbl.tablename;
    END;
    
    -- Cria policy basica de escrita para service role
    BEGIN
      EXECUTE format(
        'CREATE POLICY "Enable all access for service role" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true)',
        tbl.tablename
      );
      RAISE NOTICE 'Policy service_role criada em: %', tbl.tablename;
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'Policy service_role ja existe em: %', tbl.tablename;
    END;
  END LOOP;
END $$;

-- Verifica resultado
SELECT 
  t.tablename,
  c.relrowsecurity as rls_enabled
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
WHERE t.schemaname = 'public'
ORDER BY c.relrowsecurity, t.tablename;
