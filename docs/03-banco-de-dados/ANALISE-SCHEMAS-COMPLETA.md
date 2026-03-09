# Analise Completa de Todos os Schemas — Supabase UPPI

**Data da Analise:** 09/03/2026
**Projeto:** jpnwxqjrhzaobnugjnyx (ativo — verificado via SQL em 09/03/2026)
**Metodo:** SELECT direto via supabase_execute_sql — dados reais

---

## Resumo Executivo

| Schema | Tabelas | Descricao | Gerenciado por |
|--------|---------|-----------|----------------|
| **public** | **80** | Dominio da aplicacao UPPI | Nos |
| pg_catalog | 64 | Sistema interno do PostgreSQL | PostgreSQL |
| auth | 21 | Autenticacao e sessoes | Supabase Auth |
| storage | 8 | Arquivos e buckets | Supabase Storage |
| information_schema | 4 | Views do sistema SQL | PostgreSQL |
| realtime | 3 | Pub/Sub em tempo real | Supabase Realtime |
| supabase_migrations | 1 | Controle de versao do banco | Supabase CLI |
| vault | 1 | Segredos criptografados | Supabase Vault |

---

## 1. Schema: public (80 tabelas — Dominio UPPI)

### Tabelas por categoria (verificadas em 09/03/2026)

| Categoria | Tabelas |
|-----------|---------|
| Usuarios e Perfis | profiles, driver_profiles |
| Corridas | rides, price_offers, scheduled_rides |
| Localizacao | driver_locations, ride_tracking, hot_zones, city_zones |
| Comunicacao | messages, notifications, notification_preferences, push_subscriptions, user_push_tokens |
| Pagamentos e Carteira | user_wallets, wallet_transactions, payments, coupons, coupon_uses, user_coupons, driver_withdrawals |
| Social e Gamificacao | social_posts, social_post_likes, social_follows, post_comments, post_likes, user_social_stats, leaderboard, user_achievements, referral_achievements |
| Avaliacoes | ratings, driver_reviews, reviews, rating_categories |
| Motorista | driver_verifications, vehicles |
| Seguranca | emergency_contacts, emergency_alerts, ride_recordings, recording_consents, user_recording_preferences |
| Corridas Especiais | group_rides, group_ride_members, group_ride_participants, intercity_rides, intercity_bookings |
| Delivery | delivery_orders |
| Suporte | support_tickets, support_messages |
| Indicacoes e Fidelidade | referrals, subscriptions, promotions, promo_banners, favorite_drivers |
| Rotas e Enderecos | popular_routes, address_search_history, address_history, favorites |
| SMS | sms_templates, sms_deliveries, sms_logs, user_sms_preferences |
| Precificacao | pricing_rules, surge_pricing, app_config, platform_metrics |
| Admin e Logs | admin_logs, error_logs, campaigns |
| Legal e Conteudo | faqs, legal_documents |
| Auth e Seguranca | email_otps, user_2fa, user_settings, user_onboarding, family_members |
| Webhooks | webhook_endpoints, webhook_deliveries |
| Configuracoes do Sistema | system_settings |
| PostGIS (sistema) | spatial_ref_sys |

### RLS (Row Level Security)

- **79 tabelas com RLS ativo** (verificado via `pg_class.relrowsecurity`)
- Unica tabela sem RLS: `spatial_ref_sys` (sistema interno do PostGIS)

### Realtime Publications (35 tabelas)

Verificadas via `pg_publication_tables` em 09/03/2026:

```
city_zones, delivery_orders, driver_locations, driver_profiles,
driver_reviews, driver_withdrawals, emergency_alerts, emergency_contacts,
error_logs, group_ride_members, group_ride_participants, group_rides,
hot_zones, intercity_bookings, intercity_rides, leaderboard, messages,
notifications, payments, price_offers, profiles, promo_banners,
ratings, ride_tracking, rides, scheduled_rides, sms_deliveries,
social_follows, social_post_likes, social_posts, subscriptions,
support_messages, support_tickets, surge_pricing, user_achievements,
user_push_tokens, wallet_transactions, webhook_deliveries, user_wallets
```

### Triggers no schema public (20+ triggers)

| Trigger | Funcao | Evento |
|---------|--------|--------|
| on_auth_user_created | handle_new_user | AFTER INSERT em auth.users |
| handle_new_profile | handle_new_profile | AFTER INSERT em profiles |
| handle_new_profile_wallet | handle_new_profile_wallet | AFTER INSERT em profiles |
| handle_new_user_settings | handle_new_user_settings | AFTER INSERT em profiles |
| handle_new_sms_prefs | handle_new_sms_prefs | AFTER INSERT em profiles |
| handle_new_recording_prefs | handle_new_recording_prefs | AFTER INSERT em profiles |
| on_ride_completed | handle_ride_completed | AFTER UPDATE em rides |
| sync_driver_wallet | sync_driver_wallet_on_complete | AFTER UPDATE em rides |
| auto_payment | auto_create_payment_on_complete | AFTER UPDATE em rides |
| update_acceptance | update_acceptance_rate | AFTER UPDATE em rides |
| update_leaderboard | update_leaderboard_on_complete | AFTER UPDATE em rides |
| check_achievements | trigger_check_achievements_on_complete | AFTER UPDATE em rides |
| snapshot_metrics | trigger_snapshot_on_complete | AFTER UPDATE em rides |
| update_trust | trigger_update_trust_score | AFTER UPDATE em rides/ratings |
| on_post_like_insert | update_post_likes_count | AFTER INSERT em social_post_likes |
| on_post_like_delete | update_post_likes_count | AFTER DELETE em social_post_likes |
| on_post_comment_insert | increment_comment_count | AFTER INSERT em post_comments |
| set_*_updated_at | update_updated_at_column | BEFORE UPDATE em todas as tabelas com updated_at |

### RPCs do dominio

#### Callable via API (42 funcoes de negocio)

**Corridas e Motorista:**
accept_price_offer, accept_ride, book_intercity_seat, cancel_ride, complete_ride (x2), create_ride, driver_accept_scheduled_ride, estimate_ride_price, find_nearby_drivers, get_available_scheduled_rides, get_driver_active_ride, get_driver_home_data, get_surge_multiplier, handle_driver_cancellation, start_ride, submit_price_offer, upsert_driver_location (x2)

**Financeiro:**
apply_coupon, apply_coupon_to_ride, calculate_wallet_balance, get_admin_financial_summary, get_driver_wallet_balance, get_full_wallet_statement, get_pending_withdrawals, get_rides_revenue_by_day, get_user_payment_summary, get_wallet_balance, redeem_coupon, request_withdrawal (x2), request_withdrawal_v2, admin_approve_withdrawal, admin_process_withdrawal, admin_reject_withdrawal

**Perfil e Usuario:**
get_full_profile, get_driver_stats, get_driver_dashboard_stats, get_passenger_home_data, get_referral_stats, generate_referral_code, get_pending_reviews, check_ride_reviewed, submit_rating

**Social e Gamificacao:**
check_and_award_achievements, check_and_grant_achievements, check_and_grant_referral_achievements, get_leaderboard (x3 overloads), get_leaderboard_full, get_social_feed, process_referral_reward, refresh_leaderboard, check_referral_on_complete

**Admin e Plataforma:**
admin_ban_user, admin_verify_driver, create_emergency_alert, create_support_ticket, get_app_config, get_popular_routes, get_ride_history, get_ride_history_paginated, get_ride_with_details, mark_all_notifications_read, record_address_search, reply_support_ticket, search_address_history, send_notification, snapshot_platform_metrics

#### Trigger helpers (internos)
auto_create_payment_on_complete, check_referral_on_complete, decrement_comment_count, handle_driver_cancellation, handle_new_profile, handle_new_profile_wallet, handle_new_recording_prefs, handle_new_sms_prefs, handle_new_user, handle_new_user_settings, handle_ride_completed, increment, increment_comment_count, sync_driver_wallet_on_complete, trigger_check_achievements_on_complete, trigger_snapshot_on_complete, trigger_update_trust_score, update_acceptance_rate (x2), update_leaderboard_on_complete, update_post_comments_count, update_post_likes_count, update_trust_score, update_updated_at_column, update_user_rating (x2)

---

## 2. Schema: auth (21 tabelas — Supabase Auth)

Gerenciado inteiramente pelo Supabase. Nao modificar diretamente.

| Tabela | Descricao |
|--------|-----------|
| users | Usuarios autenticados (email, phone, metadata, confirmado, etc.) |
| sessions | Sessoes ativas (access_token, refresh_token, user_agent, ip) |
| identities | Provedores OAuth vinculados ao usuario |
| refresh_tokens | Tokens de refresh para renovacao de sessao |
| mfa_factors | Fatores de MFA configurados (TOTP, SMS) |
| mfa_challenges | Desafios MFA pendentes |
| mfa_amr_claims | Claims AMR dos metodos de autenticacao |
| flow_state | Estado do fluxo OAuth (PKCE, etc.) |
| oauth_clients | Clientes OAuth registrados |
| oauth_authorizations | Autorizacoes OAuth ativas |
| oauth_client_states | Estado temporario de clientes OAuth |
| oauth_consents | Consentimentos OAuth do usuario |
| custom_oauth_providers | Provedores OAuth customizados |
| one_time_tokens | Tokens de uso unico (magic link, email confirm, OTP) |
| saml_providers | Provedores SAML para SSO enterprise |
| saml_relay_states | Estados de relay SAML |
| sso_providers | Provedores SSO configurados |
| sso_domains | Dominios associados a provedores SSO |
| instances | Instancias do servidor Auth |
| audit_log_entries | Log de auditoria de acoes de autenticacao |
| schema_migrations | Controle interno de versao do schema auth |

**Trigger critico (nosso):** `on_auth_user_created` em `auth.users` chama `public.handle_new_user()` que cria automaticamente registros em: `public.profiles`, `public.user_wallets`, `public.user_settings`, `public.user_sms_preferences`, `public.user_recording_preferences`.

---

## 3. Schema: storage (8 tabelas — Supabase Storage)

| Tabela | Descricao |
|--------|-----------|
| buckets | Buckets de armazenamento (nome, publico/privado, limites) |
| objects | Arquivos armazenados (path, bucket_id, metadata, owner) |
| s3_multipart_uploads | Uploads multipart S3 em andamento |
| s3_multipart_uploads_parts | Partes de uploads multipart |
| migrations | Controle interno de versao do storage |
| buckets_analytics | Metricas de uso dos buckets |
| buckets_vectors | Vetores de busca semantica dos buckets |
| vector_indexes | Indices vetoriais para busca por similaridade |

---

## 4. Schema: realtime (3 tabelas — Supabase Realtime)

| Tabela | Descricao |
|--------|-----------|
| subscription | Subscricoes ativas dos clientes |
| messages | Mensagens do canal Realtime Broadcast |
| schema_migrations | Controle interno de versao |

---

## 5. Schema: vault (1 tabela — Supabase Vault)

| Tabela | Descricao |
|--------|-----------|
| secrets | Segredos criptografados com AES-GCM |

```sql
-- Uso recomendado para chaves de API externas
SELECT vault.create_secret('valor', 'TWILIO_AUTH_TOKEN', 'Token Twilio');
SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'TWILIO_AUTH_TOKEN';
```

---

## 6. Extensoes Instaladas

| Extensao | Descricao |
|----------|-----------|
| plpgsql | Linguagem procedural para functions e triggers |
| uuid-ossp | Geracao de UUIDs |
| postgis | Geometria espacial (ST_Distance, find_nearby_drivers) |
| pgcrypto | Criptografia |
| pg_graphql | API GraphQL automatica |
| pg_stat_statements | Estatisticas de performance de queries |
| supabase_vault | Armazenamento seguro de segredos |

---

## 7. Consolidado Final (09/03/2026)

| Metrica | Valor |
|---------|-------|
| Projeto Supabase | jpnwxqjrhzaobnugjnyx |
| Tabelas totais (todos schemas) | ~182 |
| Tabelas dominio (public) | 80 |
| Tabelas com RLS | 79 |
| Tabelas com Realtime | 35 |
| RPCs callable | 42 |
| Trigger functions | 25+ |
| Schemas ativos | 8 |
| Extensoes | 7 |

---

**Gerado em 09/03/2026** — Analise via SQL direto no Supabase jpnwxqjrhzaobnugjnyx
