-- =====================================================
-- UPPI - Enable Realtime para 51 tabelas
-- Atualizado em: 16/03/2026
-- Executa no Supabase SQL Editor
-- =====================================================

-- Remove tabelas da publicacao se ja existirem (evita erros)
DO $$
DECLARE
  tbl TEXT;
  tables_to_add TEXT[] := ARRAY[
    'driver_locations',
    'rides',
    'ride_tracking',
    'messages',
    'notifications',
    'payments',
    'price_offers',
    'profiles',
    'group_rides',
    'group_ride_participants',
    'group_ride_members',
    'emergency_alerts',
    'emergency_contacts',
    'support_tickets',
    'support_messages',
    'social_posts',
    'social_post_likes',
    'post_comments',
    'social_follows',
    'fcm_tokens',
    'user_push_tokens',
    'user_wallets',
    'wallet_transactions',
    'leaderboard',
    'user_achievements',
    'referrals',
    'scheduled_rides',
    'intercity_rides',
    'intercity_bookings',
    'delivery_orders',
    'surge_pricing',
    'hot_zones',
    'city_zones',
    'subscriptions',
    'sms_deliveries',
    'push_log',
    'webhook_deliveries',
    'system_config',
    'promo_banners',
    'promo_codes',
    'promo_code_uses',
    'driver_profiles',
    'driver_reviews',
    'driver_withdrawals',
    'driver_schedule',
    'error_logs',
    'favorite_drivers',
    'family_members',
    'ratings',
    'achievements',
    'admin_logs'
  ];
BEGIN
  -- Adiciona cada tabela a publicacao supabase_realtime
  FOREACH tbl IN ARRAY tables_to_add
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', tbl);
      RAISE NOTICE 'Tabela % adicionada ao Realtime', tbl;
    EXCEPTION
      WHEN undefined_table THEN
        RAISE NOTICE 'Tabela % nao existe, pulando...', tbl;
      WHEN duplicate_object THEN
        RAISE NOTICE 'Tabela % ja esta no Realtime', tbl;
    END;
  END LOOP;
END $$;

-- Verifica quais tabelas estao com Realtime ativo
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
