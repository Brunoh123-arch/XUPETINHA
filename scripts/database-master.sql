-- ============================================================
-- UPPI - DATABASE MASTER SCRIPT
-- ============================================================
-- Data: 16/03/2026
-- Versao: 1.0
-- Tabelas: 164
-- Projeto: ullmjdgppucworavoiia
-- 
-- INSTRUCOES:
-- Este script NAO deve ser executado em um banco ja configurado.
-- O banco atual (ullmjdgppucworavoiia) ja tem todas as 164 tabelas.
-- Use este script apenas para criar um NOVO projeto Supabase.
--
-- Para executar:
-- 1. Crie um novo projeto no Supabase
-- 2. Va em SQL Editor
-- 3. Cole este script e execute
-- ============================================================

-- O banco ullmjdgppucworavoiia ja possui:
-- - 164 tabelas
-- - 163 com RLS (1 e spatial_ref_sys do PostGIS)
-- - 280 politicas RLS
-- - 22 tabelas com Realtime
-- - 483 indices
-- - 579 CHECK constraints
-- - 222 Foreign Keys
-- - 52 triggers
-- - 762 funcoes

-- ============================================================
-- IMPORTANTE: NAO EXECUTE ESTE SCRIPT NO BANCO ATUAL
-- ============================================================
-- O banco ullmjdgppucworavoiia ja esta 100% configurado.
-- As migrations 001-038 ja foram aplicadas.
-- 
-- Este arquivo serve como DOCUMENTACAO e BACKUP do schema.
-- Para criar um novo banco, execute os scripts na pasta
-- supabase/migrations/ na ordem numerica.
-- ============================================================

-- EXTENSOES NECESSARIAS
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- ESTRUTURA DO BANCO (164 TABELAS)
-- ============================================================

-- GRUPO: USUARIOS E PERFIS
-- - profiles
-- - driver_profiles
-- - driver_availability
-- - driver_documents
-- - driver_verifications
-- - user_sessions
-- - user_devices
-- - user_2fa
-- - user_preferences
-- - user_settings

-- GRUPO: CORRIDAS
-- - rides
-- - ride_requests
-- - ride_locations
-- - ride_tracking
-- - ride_route_points
-- - ride_recordings
-- - ride_reviews
-- - ride_disputes
-- - ride_cancellations
-- - scheduled_rides
-- - group_rides
-- - group_ride_members
-- - delivery_rides
-- - ride_share_passengers

-- GRUPO: NEGOCIACAO
-- - price_offers
-- - price_negotiations

-- GRUPO: FINANCEIRO
-- - wallets
-- - wallet_transactions
-- - transactions
-- - payments
-- - withdrawals
-- - driver_earnings
-- - tip_transactions
-- - refunds
-- - payment_methods_saved
-- - payment_splits

-- GRUPO: COMUNICACAO
-- - messages
-- - conversations
-- - notifications
-- - push_logs
-- - fcm_tokens
-- - sms_logs
-- - sms_fallback_log
-- - email_logs

-- GRUPO: SUPORTE
-- - support_tickets
-- - support_conversations
-- - support_messages
-- - faq_categories
-- - faq_items

-- GRUPO: EMERGENCIA
-- - emergency_contacts
-- - emergency_alerts
-- - sos_events
-- - incident_reports
-- - insurance_claims

-- GRUPO: AVALIACOES
-- - ratings
-- - reviews
-- - review_tags
-- - driver_rating_breakdown

-- GRUPO: SOCIAL
-- - social_posts
-- - social_post_likes
-- - post_comments
-- - user_follows
-- - user_blocks
-- - user_reports

-- GRUPO: GAMIFICACAO
-- - achievements
-- - user_achievements
-- - leaderboard_entries
-- - user_points
-- - driver_levels
-- - driver_level_tiers

-- GRUPO: MARKETING
-- - coupons
-- - coupon_uses
-- - user_coupons
-- - promo_codes
-- - campaigns
-- - campaign_analytics
-- - promotions
-- - in_app_banners
-- - announcements

-- GRUPO: REFERRAL
-- - referrals
-- - referral_rewards

-- GRUPO: CONFIGURACAO
-- - system_config
-- - app_versions
-- - feature_flags
-- - maintenance_windows
-- - terms_versions
-- - terms_acceptances

-- GRUPO: LOCALIZACAO
-- - driver_locations
-- - driver_location_history
-- - hot_zones
-- - geographic_zones
-- - service_areas
-- - popular_destinations
-- - saved_addresses
-- - addresses
-- - airports
-- - hotels

-- GRUPO: PRECOS
-- - ride_pricing_rules
-- - surge_pricing
-- - zone_pricing
-- - pricing_experiments
-- - cashback_rules
-- - cashback_earned

-- GRUPO: ADMIN
-- - admin_actions
-- - admin_logs
-- - audit_logs
-- - error_logs
-- - api_keys
-- - webhooks
-- - webhook_logs
-- - blocked_ips
-- - ban_history

-- GRUPO: OUTROS
-- - vehicles
-- - vehicle_inspections
-- - driver_training
-- - driver_schedule
-- - driver_preferred_zones
-- - driver_popular_routes
-- - driver_stats
-- - passenger_ride_stats
-- - user_social_stats
-- - user_documents
-- - user_recording_preferences
-- - feedback_forms
-- - feedback_responses
-- - safety_checks
-- - live_activities
-- - app_review_requests
-- - partner_companies
-- - subscription_plans
-- - invoices

-- ============================================================
-- REALTIME (22 TABELAS)
-- ============================================================
-- rides, ride_locations, ride_requests, driver_availability,
-- driver_profiles, messages, conversations, notifications,
-- price_negotiations, price_offers, emergency_alerts, sos_events,
-- group_rides, group_ride_members, scheduled_rides, delivery_rides,
-- ride_share_passengers, payment_splits, ride_disputes,
-- support_conversations, support_messages, tip_transactions

-- ============================================================
-- STORAGE BUCKETS (5)
-- ============================================================
-- avatars (public)
-- driver-documents (private)
-- vehicle-photos (private)
-- ride-recordings (private)
-- support-attachments (private)

-- ============================================================
-- PARA MAIS DETALHES
-- ============================================================
-- Consulte: docs/SCHEMA-BANCO.md
-- Consulte: docs/STATUS.md
-- Consulte: docs/SETUP-SUPABASE.md

SELECT 'Este script e apenas documentacao. O banco ullmjdgppucworavoiia ja esta configurado.' AS info;
