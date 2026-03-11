# UPPI - Status de Funcionalidades

**Ultima Atualizacao:** 11/03/2026
**Versao:** 25.0 — Contagem de arquivos atualizada
**Status Geral:** 98% Pronto para Producao — Supabase jpnwxqjrhzaobnugjnyx

---

## Resumo Geral (11/03/2026)

| Categoria | Valor |
|-----------|-------|
| Projeto Supabase | jpnwxqjrhzaobnugjnyx |
| Tabelas no Banco (public) | **100** |
| Tabelas com RLS ativo | **86** |
| Tabelas com Realtime | **51** |
| RPCs callable | **75** |
| Politicas RLS | **162** |
| Indices de performance | **260** |
| Triggers customizados | **34** |
| Views | **3** (ride_offers + 2 PostGIS sistema) |
| Migrations aplicadas | **49** |
| Paginas (page.tsx) | **152** |
| API route.ts | **84** |
| Admin dashboard | **42 telas** |
| Components | **152** |

### Pontos Fortes
- GPS com 3 modos de tracking (idle/online/active_ride) + distance filter
- RLS em 86 tabelas com 162 politicas
- Realtime em 51 tabelas para atualizacoes em tempo real
- PostGIS para busca de motoristas proximos
- Animacao suave do marcador no mapa (interpolacao cubic ease-out)

---

## 1. Frontend - Paginas (152 total)

### Auth (12) — /auth/
- [x] /auth/welcome
- [x] /auth/login
- [x] /auth/sign-up
- [x] /auth/sign-up-success
- [x] /auth/user-type
- [x] /auth/error
- [x] /auth/callback
- [x] /auth/selection
- [x] /auth/passenger
- [x] /auth/driver/welcome
- [x] /auth/driver/login
- [x] /auth/driver/sign-up

### Home e Navegacao (5)
- [x] /uppi/home
- [x] /uppi/notifications
- [x] /uppi/history
- [x] /uppi/favorites
- [x] /uppi/favorites/add

### Fluxo de Corrida (14)
- [x] /uppi/request-ride
- [x] /uppi/ride/route-input
- [x] /uppi/ride/select
- [x] /uppi/ride/route-alternatives
- [x] /uppi/ride/searching
- [x] /uppi/ride/schedule
- [x] /uppi/ride/group
- [x] /uppi/ride/[id]/offers
- [x] /uppi/ride/[id]/tracking
- [x] /uppi/ride/[id]/chat
- [x] /uppi/ride/[id]/details
- [x] /uppi/ride/[id]/payment
- [x] /uppi/ride/[id]/review
- [x] /uppi/ride/[id]/review-enhanced
- [x] /uppi/tracking

### Motorista (9)
- [x] /uppi/driver
- [x] /uppi/driver/register
- [x] /uppi/driver/documents
- [x] /uppi/driver/verify
- [x] /uppi/driver/earnings
- [x] /uppi/driver/history
- [x] /uppi/driver/profile
- [x] /uppi/driver/wallet
- [x] /uppi/driver-mode (legado)

### Perfil e Configuracoes (8)
- [x] /uppi/profile
- [x] /uppi/settings
- [x] /uppi/settings/sms
- [x] /uppi/settings/recording
- [x] /uppi/settings/2fa
- [x] /uppi/settings/emergency
- [x] /uppi/settings/language
- [x] /uppi/settings/password

### Financeiro (4)
- [x] /uppi/wallet
- [x] /uppi/payments
- [x] /uppi/promotions
- [x] /uppi/club

### Social e Gamificacao (6)
- [x] /uppi/social
- [x] /uppi/social/create
- [x] /uppi/leaderboard
- [x] /uppi/achievements
- [x] /uppi/referral
- [x] /uppi/analytics

### Seguranca (3)
- [x] /uppi/emergency
- [x] /uppi/emergency-contacts
- [x] /uppi/seguranca

### Servicos Extras (3)
- [x] /uppi/entregas
- [x] /uppi/cidade-a-cidade
- [x] /uppi/ios-showcase

### Suporte e Legal (6)
- [x] /uppi/suporte
- [x] /uppi/suporte/chat
- [x] /uppi/help
- [x] /uppi/legal/privacy
- [x] /uppi/legal/terms
- [x] /uppi/privacy | /uppi/terms

### Admin (42) — /admin/

**Visao Geral**
- [x] /admin (dashboard KPIs)
- [x] /admin/analytics
- [x] /admin/monitor
- [x] /admin/emergency
- [x] /admin/login

**Usuarios**
- [x] /admin/users
- [x] /admin/drivers
- [x] /admin/drivers/earnings
- [x] /admin/reviews
- [x] /admin/achievements
- [x] /admin/leaderboard
- [x] /admin/referrals
- [x] /admin/subscriptions
- [x] /admin/favoritos

**Corridas**
- [x] /admin/rides
- [x] /admin/rides/[id]
- [x] /admin/agendamentos
- [x] /admin/group-rides
- [x] /admin/cidade-a-cidade
- [x] /admin/entregas
- [x] /admin/price-offers

**Operacoes**
- [x] /admin/financeiro
- [x] /admin/payments
- [x] /admin/cupons
- [x] /admin/messages
- [x] /admin/notifications
- [x] /admin/suporte
- [x] /admin/social

**Sistema**
- [x] /admin/webhooks
- [x] /admin/logs
- [x] /admin/settings
- [x] /admin/sms
- [x] /admin/recordings

### Onboarding e Outros
- [x] /onboarding | /onboarding/splash | /onboarding/create-account
- [x] / | /offline | /share | /google-setup
- [x] /login | /signup | /phone | /privacy | /terms

---

## 2. Backend - API Routes (84 arquivos)

- [x] /api/v1/health
- [x] /api/v1/profile — GET + PATCH
- [x] /api/v1/stats
- [x] /api/v1/rides — GET + POST
- [x] /api/v1/rides/[id]/status — PATCH
- [x] /api/v1/rides/[id]/cancel — POST
- [x] /api/v1/rides/[id]/report — POST
- [x] /api/v1/offers — GET + POST
- [x] /api/v1/offers/[id]/accept — POST
- [x] /api/v1/ratings — GET + POST
- [x] /api/v1/reviews — GET + POST
- [x] /api/v1/reviews/enhanced — GET + POST
- [x] /api/v1/reviews/driver — GET + POST
- [x] /api/v1/notifications — GET + POST + PATCH
- [x] /api/v1/notifications/send — POST
- [x] /api/v1/messages — GET + POST
- [x] /api/v1/wallet — GET + POST
- [x] /api/v1/coupons — GET + POST
- [x] /api/v1/subscriptions — GET + POST
- [x] /api/v1/favorites — GET + POST + DELETE
- [x] /api/v1/referrals — GET + POST
- [x] /api/v1/achievements — GET
- [x] /api/v1/leaderboard — GET
- [x] /api/v1/social/posts — GET + POST
- [x] /api/v1/social/posts/[id]/like — POST + DELETE
- [x] /api/v1/social/posts/[id]/comments — GET + POST + DELETE
- [x] /api/v1/drivers/nearby — GET (find_nearby_drivers RPC)
- [x] /api/v1/drivers/hot-zones — GET
- [x] /api/v1/driver/location — GET + PATCH
- [x] /api/v1/driver/documents — GET + POST
- [x] /api/v1/driver/verify — POST
- [x] /api/v1/group-rides — GET + POST
- [x] /api/v1/group-rides/join — POST
- [x] /api/v1/emergency — GET + POST + PUT
- [x] /api/v1/recordings/upload — POST
- [x] /api/v1/sms/send — POST
- [x] /api/v1/sms/status — GET + POST
- [x] /api/v1/geocode — GET
- [x] /api/v1/places/autocomplete — GET
- [x] /api/v1/places/details — GET
- [x] /api/v1/routes/alternatives — GET
- [x] /api/v1/distance — GET
- [x] /api/v1/webhooks — GET + POST + DELETE
- [x] /api/v1/webhooks/process — GET + POST
- [x] /api/v1/auth/verify — POST
- [x] /api/v1/auth/email-otp/send — POST
- [x] /api/v1/auth/email-otp/verify — POST
- [x] /api/v1/push/subscribe — POST
- [x] /api/v1/push/send — POST
- [x] /api/v1/push/broadcast — POST
- [x] /api/v1/push/vapid-public-key — GET
- [x] /api/v1/admin/setup — POST
- [x] /api/v1/admin/create-first — POST
- [x] /api/admin/check — GET

---

## 3. Banco de Dados (11/03/2026 — jpnwxqjrhzaobnugjnyx)

| Item | Status |
|------|--------|
| Projeto ativo | jpnwxqjrhzaobnugjnyx |
| Tabelas public | **100** (migrations 001-049) |
| Tabelas com RLS | **86** (exceto spatial_ref_sys) |
| Tabelas com Realtime | **51** |
| RPCs callable | **75** |
| Politicas RLS | **162** |
| Indices | **260** |
| Triggers customizados | **34** |
| Views | **3** (ride_offers + geometry_columns + geography_columns) |
| Migrations aplicadas | **49** |
| Extensoes | 7 (PostGIS, pgcrypto, uuid-ossp, pg_graphql, pg_stat_statements, supabase_vault, plpgsql) |

### Tabelas com Realtime ativo (51 — verificadas via pg_publication_tables em 11/03/2026)
city_zones, delivery_orders, driver_locations, driver_profiles, driver_reviews, driver_withdrawals, emergency_alerts, emergency_contacts, error_logs, favorite_drivers, fcm_tokens, group_ride_members, group_ride_participants, group_rides, hot_zones, intercity_bookings, intercity_rides, leaderboard, messages, notifications, payments, post_comments, post_likes, price_offers, profiles, promo_banners, ratings, referrals, ride_tracking, rides, scheduled_rides, sms_deliveries, social_follows, social_post_likes, social_posts, subscriptions, support_messages, support_tickets, surge_pricing, user_achievements, user_push_tokens, user_wallets, wallet_transactions, webhook_deliveries, driver_schedule, family_members, promo_codes, push_log, system_config, promo_code_uses, user_social_stats

---

## 4. RPCs de Negocio (75 funcoes — verificadas via SQL em 11/03/2026)

### Corridas e Motorista (20)
- [x] accept_price_offer
- [x] accept_ride
- [x] book_intercity_seat
- [x] cancel_ride
- [x] complete_ride
- [x] create_ride
- [x] driver_accept_scheduled_ride
- [x] estimate_ride_price
- [x] find_nearby_drivers
- [x] get_available_scheduled_rides
- [x] get_driver_active_ride
- [x] get_driver_home_data
- [x] get_nearby_drivers
- [x] get_popular_routes_nearby
- [x] get_surge_multiplier
- [x] handle_driver_cancellation
- [x] search_drivers_nearby
- [x] start_ride
- [x] submit_price_offer
- [x] upsert_driver_location

### Financeiro (18)
- [x] admin_approve_withdrawal
- [x] admin_process_withdrawal
- [x] admin_reject_withdrawal
- [x] apply_coupon
- [x] apply_coupon_to_ride
- [x] approve_withdrawal
- [x] calculate_wallet_balance
- [x] get_admin_financial_summary
- [x] get_driver_wallet_balance
- [x] get_full_wallet_statement
- [x] get_pending_withdrawals
- [x] get_rides_revenue_by_day
- [x] get_user_payment_summary
- [x] get_wallet_balance
- [x] redeem_coupon
- [x] reject_withdrawal
- [x] request_withdrawal
- [x] request_withdrawal_v2

### Perfil e Usuario (16)
- [x] calculate_ride_price
- [x] check_ride_reviewed
- [x] generate_referral_code
- [x] get_driver_dashboard_stats
- [x] get_driver_earnings_stats
- [x] get_driver_stats
- [x] get_frequent_destinations
- [x] get_full_profile
- [x] get_passenger_home_data
- [x] get_pending_reviews
- [x] get_referral_stats
- [x] get_user_stats
- [x] needs_facial_verification
- [x] submit_rating
- [x] submit_ride_rating
- [x] update_trust_score

### Social e Gamificacao (8)
- [x] check_and_award_achievements
- [x] check_and_grant_achievements
- [x] check_and_grant_referral_achievements
- [x] get_leaderboard
- [x] get_leaderboard_full
- [x] get_social_feed
- [x] process_referral_reward
- [x] refresh_leaderboard

### Notificacoes (4)
- [x] create_notification
- [x] get_notifications_summary
- [x] mark_all_notifications_read
- [x] send_notification

### Suporte (3)
- [x] create_support_ticket
- [x] get_support_ticket_with_messages
- [x] reply_support_ticket

### Admin e Plataforma (11)
- [x] admin_ban_user
- [x] admin_verify_driver
- [x] create_emergency_alert
- [x] get_app_config
- [x] get_popular_routes
- [x] get_ride_history
- [x] get_ride_history_paginated
- [x] get_ride_with_details
- [x] record_address_search
- [x] search_address_history
- [x] snapshot_platform_metrics

### Webhooks (2)
- [x] get_pending_webhooks
- [x] update_webhook_delivery

### Utilitarios adicionais (verificados via SQL)
- [x] get_active_hot_zones
- [x] get_driver_earnings_stats

---

## 5. Variaveis de Ambiente

- [x] NEXT_PUBLIC_SUPABASE_URL
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
- [x] RESEND_API_KEY
- [ ] CRON_SECRET (opcional — webhooks automaticos)
- [ ] TWILIO_ACCOUNT_SID (opcional — SMS)
- [ ] TWILIO_AUTH_TOKEN (opcional — SMS)

---

## 6. Pontos de Atencao (auditoria 11/03/2026)

### Inconsistencias codigo vs banco

| Tabela | Campo no Codigo | Campo Real no Banco | Acao |
|--------|-----------------|---------------------|------|
| user_wallets | reserved_balance, pending_balance, total_earned, total_spent | NAO EXISTEM | Remover referencias |
| ratings | rater_id / reviewer_id | Ambos existem (duplicados) | Usar rater_id preferencialmente |
| ratings | score / stars | Ambos existem (duplicados) | Usar score preferencialmente |
| support_tickets | subject | topic | Corrigir nome do campo |
| ride_recordings | duration_sec | duration_seconds (ambos existem) | Usar duration_seconds |
| ride_recordings | size_bytes | file_size_bytes (ambos existem) | Usar file_size_bytes |
| sms_deliveries | phone | phone_number (ambos existem) | Verificar qual usar |

---

## 7. Proximos Passos

### Criticos (Bloqueantes para Producao)
1. Corrigir verificacao facial fake (usa Math.random())
2. Remover `ignoreBuildErrors: true` do next.config.mjs
3. Ativar `reactStrictMode: true`
4. Configurar FIREBASE_SERVER_KEY para push FCM
5. Configurar PARADISE_API_KEY para pagamentos PIX

### Recomendados
1. Deploy Vercel — verificar variaveis de ambiente corretas
2. Testes E2E: auth → home → corrida → oferta → pagamento → avaliacao
3. Corrigir referencias a campos inexistentes em user_wallets
4. Padronizar uso de rater_id vs reviewer_id nas queries
5. Configurar Twilio para SMS (opcional)
6. Monitorar error_logs no painel admin apos go-live

### Play Store
1. Rodar `npx cap add android` para gerar pasta android/
2. Copiar google-services.json para android/app/
3. Gerar keystore e atualizar assetlinks.json
4. Build AAB via Android Studio

---

**Atualizado em 11/03/2026** — Supabase jpnwxqjrhzaobnugjnyx — **100 tabelas / 86 RLS / 51 Realtime / 75 RPCs / 162 politicas / 260 indices / 34 triggers / 49 migrations** — **152 telas / 84 APIs / 42 admin / 152 components**

Ver tambem: `docs/AUDITORIA-SENIOR.md` para analise tecnica completa.
