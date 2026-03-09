# Checklist de Integracao Supabase — UPPI

**Ultima Atualizacao:** 09/03/2026
**Projeto:** jpnwxqjrhzaobnugjnyx
**Status:** Totalmente Operacional

---

## Status da Integracao

- [x] **Supabase conectado a integracao do Vercel**
- [x] **Variaveis de ambiente configuradas**
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - POSTGRES_URL
  - E variaveis adicionais do Vercel Postgres

---

## Banco de Dados (verificado via SQL em 09/03/2026)

- [x] **80 tabelas no schema public**
- [x] **79 tabelas com RLS ativo** (exceto spatial_ref_sys — PostGIS)
- [x] **35 tabelas com Realtime publicado** (verificado via pg_publication_tables)
- [x] **42 RPCs de negocio callable**
- [x] **25+ trigger functions ativas**

### Tabelas com Realtime (35)
city_zones, delivery_orders, driver_locations, driver_profiles, driver_reviews, driver_withdrawals, emergency_alerts, emergency_contacts, error_logs, group_ride_members, group_ride_participants, group_rides, hot_zones, intercity_bookings, intercity_rides, leaderboard, messages, notifications, payments, price_offers, profiles, promo_banners, ratings, ride_tracking, rides, scheduled_rides, sms_deliveries, social_follows, social_post_likes, social_posts, subscriptions, support_messages, support_tickets, surge_pricing, user_achievements, user_push_tokens, wallet_transactions, webhook_deliveries, user_wallets

---

## Clientes Supabase Implementados

- [x] `lib/supabase/client.ts` — Cliente navegador
- [x] `lib/supabase/server.ts` — Cliente servidor
- [x] `lib/supabase/admin.ts` — Cliente admin (service role)
- [x] `lib/supabase/config.ts` — Configuracoes
- [x] `proxy.ts` — Middleware de autenticacao (Next.js 16)

---

## Como Usar

### Componente Servidor
```typescript
import { createClient } from '@/lib/supabase/server'

export async function MyPage() {
  const client = await createClient()
  const { data } = await client.from('rides').select('*')
  return <div>{/* use data */}</div>
}
```

### Componente Cliente
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export function MyComponent() {
  const client = createClient()
  // use client
}
```

### Route Handler
```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const client = await createClient()
  const { data } = await client.from('rides').select('*')
  return Response.json(data)
}
```

### Realtime
```typescript
'use client'
const channel = client
  .channel('rides-updates')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, (payload) => {
    console.log(payload)
  })
  .subscribe()
```

### RPC
```typescript
// Motoristas proximos
const { data } = await client.rpc('find_nearby_drivers', {
  lat: -23.5505,
  lng: -46.6333,
  radius_km: 5
})

// Aceitar oferta
await client.rpc('accept_price_offer', {
  p_offer_id: offerId,
  p_ride_id: rideId
})

// Saldo da carteira
const { data } = await client.rpc('calculate_wallet_balance', {
  user_id: userId
})
```

---

## RPCs Disponiveis (42 funcoes)

### Corridas e Motorista
- find_nearby_drivers, create_ride, accept_ride, start_ride, complete_ride, cancel_ride
- submit_price_offer, accept_price_offer, upsert_driver_location
- get_driver_active_ride, estimate_ride_price, get_surge_multiplier
- driver_accept_scheduled_ride, get_available_scheduled_rides

### Financeiro
- calculate_wallet_balance, get_wallet_balance, get_full_wallet_statement
- request_withdrawal, request_withdrawal_v2
- apply_coupon, apply_coupon_to_ride, redeem_coupon
- admin_approve_withdrawal, admin_reject_withdrawal, admin_process_withdrawal
- get_admin_financial_summary, get_rides_revenue_by_day

### Perfil e Usuario
- get_full_profile, get_driver_stats, get_driver_dashboard_stats
- get_passenger_home_data, get_driver_home_data
- get_referral_stats, generate_referral_code
- submit_rating, check_ride_reviewed, get_pending_reviews

### Social e Gamificacao
- get_social_feed, get_leaderboard, get_leaderboard_full, refresh_leaderboard
- check_and_award_achievements, check_and_grant_achievements
- process_referral_reward, check_referral_on_complete

### Admin e Plataforma
- admin_ban_user, admin_verify_driver, send_notification
- mark_all_notifications_read, get_app_config
- create_support_ticket, reply_support_ticket, create_emergency_alert
- get_ride_history, get_ride_history_paginated, get_ride_with_details
- get_popular_routes, record_address_search, search_address_history
- snapshot_platform_metrics

---

## Pontos de Atencao

### Campos que NAO existem no banco (verificado em 09/03/2026)
- `user_wallets`: reserved_balance, pending_balance, total_earned, total_spent — **NAO EXISTEM**
- `support_tickets`: subject — campo e `topic` no banco real

### Campos duplicados no banco (resultado de migrations incrementais)
- `ratings`: rater_id/reviewer_id (usar rater_id), score/stars (usar score)
- `ride_recordings`: duration_sec/duration_seconds (usar duration_seconds)
- `sms_deliveries`: phone/phone_number, cost/cost_cents

---

## Arquivos de Referencia

- `docs/03-banco-de-dados/SCHEMA.md` — Schema completo das 80 tabelas
- `docs/03-banco-de-dados/ANALISE-SCHEMAS-COMPLETA.md` — Analise de todos os schemas
- `docs/03-banco-de-dados/AUDITORIA-COMPLETA.md` — Auditoria codigo vs banco
- `docs/02-backend-api/API-ENDPOINTS.md` — Todos os endpoints da API
- `docs/05-status/STATUS-FUNCIONALIDADES.md` — Status geral do projeto

---

**Status:** Totalmente Operacional
**Atualizado:** 09/03/2026 — Projeto Supabase jpnwxqjrhzaobnugjnyx
