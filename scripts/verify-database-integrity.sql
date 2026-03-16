-- =====================================================
-- UPPI - Verificacao de Integridade do Banco
-- Atualizado em: 14/03/2026
-- Executa no Supabase SQL Editor para auditoria
-- =====================================================

-- 1. CONTAGEM DE TABELAS
SELECT 'TABELAS' as categoria, COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 2. TABELAS COM RLS ATIVO
SELECT 'TABELAS COM RLS' as categoria, COUNT(*) as total
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' AND c.relrowsecurity = true;

-- 3. TABELAS COM REALTIME
SELECT 'TABELAS COM REALTIME' as categoria, COUNT(*) as total
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND schemaname = 'public';

-- 4. RPCs CALLABLE
SELECT 'RPCs CALLABLE' as categoria, COUNT(*) as total
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name NOT LIKE 'st_%'
  AND routine_name NOT LIKE '_st_%'
  AND routine_name NOT LIKE 'postgis%'
  AND routine_name NOT LIKE 'geometry%'
  AND routine_name NOT LIKE 'geography%'
  AND routine_name NOT LIKE 'box%'
  AND routine_name NOT LIKE 'spheroid%';

-- 5. POLITICAS RLS
SELECT 'POLITICAS RLS' as categoria, COUNT(*) as total
FROM pg_policies WHERE schemaname = 'public';

-- 6. INDICES
SELECT 'INDICES' as categoria, COUNT(*) as total
FROM pg_indexes WHERE schemaname = 'public';

-- 7. TRIGGERS
SELECT 'TRIGGERS' as categoria, COUNT(*) as total
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 8. VIEWS
SELECT 'VIEWS' as categoria, COUNT(*) as total
FROM information_schema.views 
WHERE table_schema = 'public';

-- =====================================================
-- DETALHES: TABELAS SEM RLS (PROBLEMA)
-- =====================================================
SELECT 'TABELA SEM RLS' as problema, t.tablename
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public' 
  AND c.relrowsecurity = false
  AND t.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
ORDER BY t.tablename;

-- =====================================================
-- DETALHES: FKs INVALIDAS (PROBLEMA CRITICO)
-- =====================================================
SELECT 
  'FK INVALIDA' as problema,
  tc.table_name as tabela,
  kcu.column_name as coluna,
  ccu.table_name as referencia
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name NOT IN (
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  );

-- =====================================================
-- DETALHES: TABELAS SEM REALTIME (INFO)
-- =====================================================
SELECT 'TABELA SEM REALTIME' as info, t.tablename
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename NOT IN (
    SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'
  )
  AND t.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
ORDER BY t.tablename;

-- =====================================================
-- RESUMO FINAL
-- =====================================================
SELECT '=== RESUMO DA AUDITORIA ===' as info;
