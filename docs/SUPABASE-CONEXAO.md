# UPPI - Conexao Supabase

**Data da Conexao:** 02/03/2026
**Projeto Supabase:** pjlbixnzjndezoscbhej
**Integration Instance:** supabase-amber-door
**Status:** ATIVO — schema completamente aplicado e verificado via SQL

---

## Resumo do Schema (verificado via SQL direto em 02/03/2026)

| Metrica | Valor |
|---------|-------|
| Tabelas no schema public | **74** |
| Tabelas totais (todos schemas) | **176** |
| RLS policies ativas | **145** (em 73 tabelas) |
| Triggers ativos (schema public) | **20** |
| Funcoes RPC callable | **15** |
| Funcoes trigger/helper internas | **5** |
| Tabelas com Realtime publicado | **8** |
| Extensoes instaladas | **7** |
| Migrations aplicadas | **4** |

---

## Migrations Aplicadas

| Version | Nome | Tabelas Criadas | Criado por | Data |
|---------|------|----------------|------------|------|
| 20260302200021 | 001_core_tables | profiles, driver_profiles, rides, price_offers, messages, ratings, favorites, notifications + trigger on_auth_user_created | limessoare@outlook.com | 02/03/2026 |
| 20260302200119 | 002_location_wallet_social | driver_locations, ride_tracking, ride_stops, location_history, hot_zones, user_wallets, wallet_transactions, payments, coupons, coupon_uses, user_coupons, social_posts, social_post_likes, post_comments, social_follows, user_social_stats, user_achievements, referral_achievements, leaderboard, rating_categories (seed 4 registros) | limessoare@outlook.com | 02/03/2026 |
| 20260302200356 | 003_driver_security_support | driver_verifications, vehicles, drivers, driver_route_segments, emergency_contacts, emergency_alerts, ride_recordings, recording_consents, user_recording_preferences, group_rides, group_ride_participants, scheduled_rides, ride_offers, support_tickets, support_messages, referrals, subscriptions, promotions, sms_templates, sms_deliveries, sms_logs, webhook_endpoints, webhook_deliveries, admin_logs, error_logs, system_settings (seed 6 registros), push_subscriptions, notification_preferences, user_sms_preferences, user_onboarding | limessoare@outlook.com | 02/03/2026 |
| 20260302200508 | 004_routes_reviews_misc | popular_routes, driver_popular_routes, route_history, address_search_history, reviews, driver_reviews, rating_helpful_votes, rating_reports, reports, pricing_rules (seed 6 tipos), avatars, users, campaigns, faqs, legal_documents + 15 RPCs | limessoare@outlook.com | 02/03/2026 |

---

## Distribuicao de Tabelas por Schema

| Schema | Tabelas | Responsabilidade |
|--------|---------|-----------------|
| **public** | **74** | Dominio UPPI — 4 migrations |
| pg_catalog | 64 | Catalogo interno PostgreSQL |
| auth | 21 | Supabase Auth (users, sessions, MFA, OAuth, SAML) |
| storage | 8 | Supabase Storage (buckets, objects, S3 multipart) |
| information_schema | 4 | Views SQL padrao |
| realtime | 3 | Supabase Realtime (subscription, messages, migrations) |
| supabase_migrations | 1 | Controle de versao |
| vault | 1 | Segredos criptografados AES-GCM |
| **TOTAL** | **176** | Verificado via SQL direto em 02/03/2026 |

---

## Tabelas com Realtime Publicado (8)

| Tabela | Uso |
|--------|-----|
| public.rides | Atualizacoes de status da corrida em tempo real |
| public.messages | Chat passageiro-motorista |
| public.notifications | Notificacoes push em tempo real |
| public.price_offers | Ofertas de preco dos motoristas |
| public.driver_locations | Posicao GPS dos motoristas no mapa |
| public.ride_tracking | Localizacao durante corrida ativa |
| public.support_messages | Mensagens de suporte |
| public.ride_offers | Ofertas de corrida |

---

## RLS: 145 Policies em 73 Tabelas

Todas as 74 tabelas do schema public tem RLS habilitado.
73 tabelas possuem ao menos 1 policy ativa. spatial_ref_sys (PostGIS) tem RLS habilitado mas sem policies proprias.

### Tabelas com mais policies
| Tabela | Policies |
|--------|----------|
| rides | 6 |
| profiles | 5 |
| driver_profiles | 5 |
| subscriptions | 4 |
| social_posts | 4 |
| group_ride_participants | 3 |
| post_comments | 3 |
| social_post_likes | 3 |
| driver_verifications | 3 |
| emergency_alerts | 3 |
| wallet_transactions | 3 |
| price_offers | 3 |
| ride_recordings | 3 |
| reports | 3 |
| support_tickets | 3 |
| user_achievements | 3 |
| driver_reviews | 3 |

---

## Triggers Ativos (20 no schema public)

| Trigger | Tabela | Tipo |
|---------|--------|------|
| set_profiles_updated_at | profiles | BEFORE UPDATE |
| set_driver_profiles_updated_at | driver_profiles | BEFORE UPDATE |
| set_rides_updated_at | rides | BEFORE UPDATE |
| set_price_offers_updated_at | price_offers | BEFORE UPDATE |
| set_social_posts_updated_at | social_posts | BEFORE UPDATE |
| on_post_like_insert | social_post_likes | AFTER INSERT |
| on_post_like_delete | social_post_likes | AFTER DELETE |
| on_post_comment_insert | post_comments | AFTER INSERT |
| set_support_tickets_updated_at | support_tickets | BEFORE UPDATE |
| set_system_settings_updated_at | system_settings | BEFORE UPDATE |
| set_vehicles_updated_at | vehicles | BEFORE UPDATE |
| set_driver_verif_updated_at | driver_verifications | BEFORE UPDATE |
| set_legal_docs_updated_at | legal_documents | BEFORE UPDATE |
| set_notif_prefs_updated_at | notification_preferences | BEFORE UPDATE |
| set_popular_routes_updated_at | popular_routes | BEFORE UPDATE |
| set_pricing_rules_updated_at | pricing_rules | BEFORE UPDATE |
| set_rec_prefs_updated_at | user_recording_preferences | BEFORE UPDATE |
| set_user_onboarding_updated_at | user_onboarding | BEFORE UPDATE |
| set_user_sms_prefs_updated_at | user_sms_preferences | BEFORE UPDATE |
| set_webhooks_updated_at | webhook_endpoints | BEFORE UPDATE |

**Trigger critico no schema auth:** on_auth_user_created em auth.users → public.handle_new_user() → cria registro em public.profiles automaticamente no signup

---

## Funcoes RPC Ativas (15 callable + 5 helpers)

### Callable via API
| Funcao | Retorno | Descricao |
|--------|---------|-----------|
| find_nearby_drivers | TABLE | Motoristas proximos por lat/lng e raio |
| calculate_wallet_balance | numeric | Saldo da carteira |
| accept_price_offer | void | Aceita oferta atomicamente |
| get_driver_stats | jsonb | Estatisticas do motorista |
| get_platform_stats | jsonb | Metricas globais |
| get_ride_with_details | jsonb | Corrida com joins |
| get_user_stats | jsonb | Estatisticas do usuario |
| get_social_feed | TABLE | Feed social paginado |
| get_leaderboard | TABLE | Ranking por periodo |
| get_hot_zones | TABLE | Zonas de alta demanda |
| get_category_ratings | jsonb | Medias por categoria |
| respond_to_rating | void | Responder avaliacao |
| needs_facial_verification | boolean | Verificacao facial necessaria |
| update_driver_location | void | Upsert GPS do motorista |
| update_user_rating | void | Recalcula rating do perfil |

### Helpers internos (trigger functions)
| Funcao | Descricao |
|--------|-----------|
| update_updated_at_column | Atualiza updated_at em todas as tabelas |
| handle_new_user | Cria public.profiles no signup |
| increment_post_likes | Incrementa likes_count |
| decrement_post_likes | Decrementa likes_count |
| increment_post_comments | Incrementa comments_count |

---

## Extensoes Instaladas (7)

| Extensao | Versao | Descricao |
|----------|--------|-----------|
| plpgsql | 1.0 | Linguagem procedural |
| uuid-ossp | 1.1 | gen_random_uuid() |
| postgis | 3.3.7 | Geometria espacial — find_nearby_drivers usa operador <@> |
| pgcrypto | 1.3 | Criptografia (bcrypt, AES) |
| pg_graphql | 1.5.11 | API GraphQL automatica |
| pg_stat_statements | 1.11 | Monitoramento de performance |
| supabase_vault | 0.3.1 | Armazenamento seguro de segredos |

---

## Analise por Schema

### auth (21 tabelas)
Gerenciado pelo Supabase. Principais: users (35 colunas), sessions (15), identities (9), refresh_tokens (9), mfa_factors (13), one_time_tokens (7), audit_log_entries (5).

### storage (8 tabelas)
Tabelas: buckets, objects, s3_multipart_uploads, s3_multipart_uploads_parts, migrations, buckets_analytics, buckets_vectors, vector_indexes.
**Buckets criados: nenhum.** Recomendado criar: avatars, documents, recordings.

### realtime (3 tabelas)
subscription (subscricoes WebSocket ativas), messages (Broadcast), schema_migrations.

### vault (1 tabela)
secrets — segredos criptografados AES-GCM. Usar para Twilio, Stripe, Google Maps em vez de env vars expostas.

```sql
-- Armazenar segredo
SELECT vault.create_secret('valor-da-chave', 'NOME_VARIAVEL', 'Descricao');
-- Ler segredo
SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'NOME_VARIAVEL';
```

---

## Variaveis de Ambiente

| Variavel | Status | Uso |
|---------|--------|-----|
| NEXT_PUBLIC_SUPABASE_URL | Configurado via integracao | Cliente browser |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Configurado via integracao | RLS no cliente |
| SUPABASE_SERVICE_ROLE_KEY | Configurado via integracao | Admin (bypass RLS) |
| NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL | Opcional | Redirect pos-login em dev |

---

## Clientes Supabase no Codigo

| Arquivo | Tipo | Uso |
|---------|------|-----|
| lib/supabase/client.ts | Browser client (createBrowserClient) | Componentes cliente |
| lib/supabase/server.ts | Server client (createServerClient) | Route handlers, RSC |
| lib/supabase/admin.ts | Service role | Admin, bypass RLS |
| proxy.ts | Middleware | Refresh token, protecao de rotas |

---

**Ultima atualizacao:** 02/03/2026 — 176 tabelas (74 public), 145 RLS policies, 20 triggers, 15 RPCs, 7 extensoes, 4 migrations — verificado via SQL direto
