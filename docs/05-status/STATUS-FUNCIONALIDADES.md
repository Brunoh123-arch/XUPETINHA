# UPPI - Status de Funcionalidades

**Ultima Atualizacao:** 09/03/2026
**Versao:** 21.0
**Status Geral:** Operacional — Supabase jpnwxqjrhzaobnugjnyx — 80 tabelas, 43 com Realtime, 58 RPCs, 150 politicas RLS, 211 indices

---

## Resumo Geral (09/03/2026)

| Categoria | Valor |
|-----------|-------|
| Projeto Supabase | jpnwxqjrhzaobnugjnyx |
| Tabelas no Banco (public) | 80 |
| Tabelas com RLS ativo | 79 |
| Tabelas com Realtime | **43** |
| RPCs callable | **58** |
| Politicas RLS | **150** |
| Indices de performance | **211** |
| Paginas (page.tsx) | 152 |
| API route.ts | 57+ |
| Endpoints HTTP | 92+ |

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

### Admin (33) — /admin/

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

## 2. Backend - API Routes (57+ arquivos)

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

## 3. Banco de Dados (09/03/2026 — jpnwxqjrhzaobnugjnyx)

| Item | Status |
|------|--------|
| Projeto ativo | jpnwxqjrhzaobnugjnyx |
| Tabelas public | 80 |
| Tabelas com RLS | 79 (exceto spatial_ref_sys) |
| Tabelas com Realtime | 35 |
| RPCs callable | 42 |
| Trigger functions | 25+ |
| Extensoes | 7 (PostGIS, pgcrypto, uuid-ossp, pg_graphql, pg_stat_statements, supabase_vault, plpgsql) |

### Tabelas com Realtime ativo (35)
city_zones, delivery_orders, driver_locations, driver_profiles, driver_reviews, driver_withdrawals, emergency_alerts, emergency_contacts, error_logs, group_ride_members, group_ride_participants, group_rides, hot_zones, intercity_bookings, intercity_rides, leaderboard, messages, notifications, payments, price_offers, profiles, promo_banners, ratings, ride_tracking, rides, scheduled_rides, sms_deliveries, social_follows, social_post_likes, social_posts, subscriptions, support_messages, support_tickets, surge_pricing, user_achievements, user_push_tokens, wallet_transactions, webhook_deliveries, user_wallets

---

## 4. RPCs de Negocio (42 funcoes — verificadas em 09/03/2026)

### Corridas e Motorista (18)
- [x] find_nearby_drivers
- [x] create_ride
- [x] accept_ride
- [x] start_ride
- [x] complete_ride (x2)
- [x] cancel_ride
- [x] submit_price_offer
- [x] accept_price_offer
- [x] upsert_driver_location (x2)
- [x] get_driver_active_ride
- [x] get_available_scheduled_rides
- [x] driver_accept_scheduled_ride
- [x] handle_driver_cancellation
- [x] estimate_ride_price
- [x] get_surge_multiplier

### Financeiro (17)
- [x] calculate_wallet_balance
- [x] get_wallet_balance
- [x] get_full_wallet_statement
- [x] request_withdrawal (x2)
- [x] request_withdrawal_v2
- [x] admin_approve_withdrawal
- [x] admin_reject_withdrawal
- [x] admin_process_withdrawal
- [x] get_pending_withdrawals
- [x] get_user_payment_summary
- [x] apply_coupon
- [x] apply_coupon_to_ride
- [x] redeem_coupon
- [x] get_admin_financial_summary
- [x] get_rides_revenue_by_day
- [x] get_driver_wallet_balance

### Perfil e Usuario (9)
- [x] get_full_profile
- [x] get_driver_stats
- [x] get_driver_dashboard_stats
- [x] get_driver_home_data
- [x] get_passenger_home_data
- [x] get_referral_stats
- [x] generate_referral_code
- [x] submit_rating
- [x] check_ride_reviewed
- [x] get_pending_reviews

### Social e Gamificacao (10)
- [x] get_social_feed
- [x] get_leaderboard (x3)
- [x] get_leaderboard_full
- [x] refresh_leaderboard
- [x] check_and_award_achievements
- [x] check_and_grant_achievements
- [x] check_and_grant_referral_achievements
- [x] process_referral_reward
- [x] check_referral_on_complete

### Admin e Plataforma (15)
- [x] admin_ban_user
- [x] admin_verify_driver
- [x] create_emergency_alert
- [x] create_support_ticket
- [x] get_app_config
- [x] get_popular_routes
- [x] get_ride_history
- [x] get_ride_history_paginated
- [x] get_ride_with_details
- [x] mark_all_notifications_read
- [x] record_address_search
- [x] reply_support_ticket
- [x] search_address_history
- [x] send_notification
- [x] snapshot_platform_metrics

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

## 6. Pontos de Atencao (auditoria 09/03/2026)

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

1. Deploy Vercel — verificar variaveis de ambiente corretas
2. Testes E2E: auth → home → corrida → oferta → pagamento → avaliacao
3. Corrigir referencias a campos inexistentes em user_wallets
4. Padronizar uso de rater_id vs reviewer_id nas queries
5. Configurar Twilio para SMS (opcional)
6. Monitorar error_logs no painel admin apos go-live

---

**Atualizado em 09/03/2026** — Supabase jpnwxqjrhzaobnugjnyx — dados verificados via SQL direto
