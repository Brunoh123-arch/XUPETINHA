# Supabase - Status da Integracao

**Ultima Atualizacao:** 09/03/2026
**Projeto:** jpnwxqjrhzaobnugjnyx
**Status:** Totalmente Operacional

---

## Status Geral (verificado via SQL em 09/03/2026)

```
PROJETO:   jpnwxqjrhzaobnugjnyx
TABELAS:   80 (schema public)
RLS:       79 tabelas (exceto spatial_ref_sys)
REALTIME:  43 tabelas (verificado via pg_publication_tables em 09/03/2026 pós migration 026)
RPCs:      58 funcoes de negocio callable (excluindo PostGIS)
TRIGGERS:  25+ functions
```

---

## O Que Esta Pronto

### Autenticacao
- [x] Login/Signup com email
- [x] Reset de senha
- [x] OAuth (Google, GitHub, etc)
- [x] Middleware de protecao (middleware.ts — Next.js 16 compativel)
- [x] Refresh automatico de tokens
- [x] Trigger automatico: on_auth_user_created cria profiles + wallet + settings

### Banco de Dados
- [x] 80 tabelas no schema public
- [x] RLS em 79 tabelas
- [x] 25+ triggers ativos
- [x] Indexes otimizados
- [x] PostGIS instalado (find_nearby_drivers usa ST_Distance)

### Realtime (43 tabelas — verificado via pg_publication_tables, pós migration 026)
- [x] rides, price_offers, driver_locations, driver_profiles, driver_reviews
- [x] messages, notifications, support_messages, support_tickets
- [x] payments, wallet_transactions, user_wallets, driver_withdrawals
- [x] social_posts, social_post_likes, social_follows, post_likes, post_comments
- [x] ratings, leaderboard, user_achievements, user_push_tokens
- [x] group_rides, group_ride_members, group_ride_participants
- [x] intercity_rides, intercity_bookings, delivery_orders
- [x] scheduled_rides, ride_tracking, hot_zones, city_zones, surge_pricing
- [x] emergency_alerts, emergency_contacts, sms_deliveries
- [x] subscriptions, promo_banners, referrals, favorite_drivers
- [x] profiles, error_logs, webhook_deliveries

### Tabelas SEM Realtime (37 tabelas — nao precisam de escuta em tempo real)
address_history, address_search_history, admin_logs, app_config, campaigns,
coupon_uses, coupons, driver_verifications, email_otps, family_members, faqs,
favorites, legal_documents, notification_preferences, platform_metrics,
popular_routes, pricing_rules, promotions, push_subscriptions, rating_categories,
recording_consents, referral_achievements, reviews, ride_recordings, sms_logs,
sms_templates, spatial_ref_sys, system_settings, user_2fa, user_coupons,
user_onboarding, user_recording_preferences, user_settings, user_sms_preferences,
user_social_stats, vehicles, webhook_endpoints

### RPCs Disponiveis (58 funcoes de negocio — verificado via SQL em 09/03/2026)

**Corridas:** find_nearby_drivers, create_ride, accept_ride, start_ride, complete_ride, cancel_ride, submit_price_offer, accept_price_offer, upsert_driver_location, estimate_ride_price, get_surge_multiplier, get_driver_active_ride, driver_accept_scheduled_ride, handle_driver_cancellation, handle_ride_completed, get_ride_with_details, get_ride_history, get_ride_history_paginated

**Financeiro:** calculate_wallet_balance, get_wallet_balance, get_full_wallet_statement, get_driver_wallet_balance, get_user_payment_summary, request_withdrawal, request_withdrawal_v2, apply_coupon, apply_coupon_to_ride, redeem_coupon, admin_approve_withdrawal, admin_reject_withdrawal, admin_process_withdrawal, get_admin_financial_summary, get_rides_revenue_by_day, sync_driver_wallet_on_complete, auto_create_payment_on_complete, book_intercity_seat, get_pending_withdrawals

**Perfil:** get_full_profile, get_driver_stats, get_driver_dashboard_stats, get_passenger_home_data, get_driver_home_data, get_referral_stats, generate_referral_code, submit_rating, check_ride_reviewed, get_pending_reviews, update_user_rating, update_acceptance_rate, update_trust_score, handle_new_user, handle_new_profile, handle_new_profile_wallet, handle_new_user_settings

**Social e Gamificacao:** get_social_feed, get_leaderboard, get_leaderboard_full, refresh_leaderboard, update_leaderboard_on_complete, check_and_award_achievements, check_and_grant_achievements, check_and_grant_referral_achievements, update_post_likes_count, update_post_comments_count, increment_comment_count, decrement_comment_count, process_referral_reward, check_referral_on_complete

**Admin e Plataforma:** admin_ban_user, admin_verify_driver, send_notification, mark_all_notifications_read, get_app_config, create_support_ticket, reply_support_ticket, create_emergency_alert, get_popular_routes, record_address_search, search_address_history, snapshot_platform_metrics, trigger_snapshot_on_complete, update_updated_at_column

---

## Como Usar

### Server Component
```typescript
import { createClient } from '@/lib/supabase/server'

export async function Page() {
  const client = await createClient()
  const { data } = await client.from('rides').select('*')
  return <div>{data?.length} corridas</div>
}
```

### Client Component
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function Component() {
  const client = createClient()
  // usar client aqui
}
```

### RPC
```typescript
// Motoristas proximos
const { data } = await client.rpc('find_nearby_drivers', {
  lat: -23.5505, lng: -46.6333, radius_km: 5
})

// Aceitar oferta
await client.rpc('accept_price_offer', {
  p_offer_id: offerId, p_ride_id: rideId
})
```

### Realtime
```typescript
'use client'
const channel = client
  .channel('rides-updates')
  .on('postgres_changes', {
    event: 'INSERT', schema: 'public', table: 'price_offers',
    filter: `ride_id=eq.${rideId}`
  }, (payload) => console.log(payload))
  .subscribe()
```

---

## Arquivos

```
lib/supabase/
  client.ts          Cliente browser
  server.ts          Cliente servidor
  admin.ts           Cliente admin (service role)
  config.ts          Configuracoes

middleware.ts         Middleware autenticacao (Next.js 16 compativel)
```

---

## Pontos de Atencao (09/03/2026)

1. `user_wallets` — NAO tem reserved_balance, pending_balance, total_earned, total_spent
2. `support_tickets` — campo e `topic` (nao `subject`)
3. `ratings` — usar rater_id (nao reviewer_id), score (nao stars)
4. `ride_recordings` — usar duration_seconds (nao duration_sec)

---

## Documentacao Completa

- `docs/03-banco-de-dados/SCHEMA.md` — 80 tabelas detalhadas
- `docs/03-banco-de-dados/AUDITORIA-COMPLETA.md` — Codigo vs banco
- `SUPABASE-CHECKLIST.md` — Checklist + RPCs + exemplos

---

**Status:** Totalmente Operacional
**Data:** 09/03/2026 — jpnwxqjrhzaobnugjnyx
