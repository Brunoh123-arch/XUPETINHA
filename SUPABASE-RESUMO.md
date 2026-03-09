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
REALTIME:  35 tabelas
RPCs:      42 funcoes callable
TRIGGERS:  25+ functions
```

---

## O Que Esta Pronto

### Autenticacao
- [x] Login/Signup com email
- [x] Reset de senha
- [x] OAuth (Google, GitHub, etc)
- [x] Middleware de protecao (proxy.ts — Next.js 16)
- [x] Refresh automatico de tokens
- [x] Trigger automatico: on_auth_user_created cria profiles + wallet + settings

### Banco de Dados
- [x] 80 tabelas no schema public
- [x] RLS em 79 tabelas
- [x] 25+ triggers ativos
- [x] Indexes otimizados
- [x] PostGIS instalado (find_nearby_drivers usa ST_Distance)

### Realtime (35 tabelas publicadas)
- [x] rides, price_offers, driver_locations, driver_profiles
- [x] messages, notifications, support_messages, support_tickets
- [x] payments, wallet_transactions, user_wallets
- [x] social_posts, social_post_likes, social_follows
- [x] ratings, driver_reviews, leaderboard, user_achievements
- [x] group_rides, group_ride_members, group_ride_participants
- [x] intercity_rides, intercity_bookings, delivery_orders
- [x] scheduled_rides, ride_tracking, hot_zones, city_zones, surge_pricing
- [x] emergency_alerts, emergency_contacts, sms_deliveries
- [x] subscriptions, promo_banners, user_push_tokens
- [x] profiles, error_logs, webhook_deliveries

### RPCs Disponiveis (42 funcoes)

**Corridas:** find_nearby_drivers, create_ride, accept_ride, start_ride, complete_ride, cancel_ride, submit_price_offer, accept_price_offer, upsert_driver_location, estimate_ride_price, get_surge_multiplier, get_driver_active_ride, driver_accept_scheduled_ride

**Financeiro:** calculate_wallet_balance, get_wallet_balance, get_full_wallet_statement, request_withdrawal, request_withdrawal_v2, apply_coupon, redeem_coupon, admin_approve_withdrawal, admin_reject_withdrawal

**Perfil:** get_full_profile, get_driver_stats, get_driver_dashboard_stats, get_passenger_home_data, get_driver_home_data, get_referral_stats, generate_referral_code, submit_rating

**Social:** get_social_feed, get_leaderboard, refresh_leaderboard, check_and_award_achievements, process_referral_reward

**Admin:** admin_ban_user, admin_verify_driver, send_notification, create_support_ticket, get_ride_with_details, get_ride_history, snapshot_platform_metrics

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

proxy.ts             Middleware autenticacao (Next.js 16)
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
