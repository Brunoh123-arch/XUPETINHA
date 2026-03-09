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

## Banco de Dados (verificado via SQL em 09/03/2026 — VALORES FINAIS DEFINITIVOS)

- [x] **87 tabelas no schema public** (migrations 001-035 / 49 entradas)
- [x] **86 tabelas com RLS ativo** (exceto spatial_ref_sys — PostGIS)
- [x] **51 tabelas com Realtime publicado** (verificado via pg_publication_tables em 09/03/2026)
- [x] **162 politicas RLS**
- [x] **260 indices de performance** (migrations 001-035)
- [x] **34 triggers customizados**
- [x] **3 Views** (ride_offers + 2 PostGIS sistema)
- [x] **0 FK quebradas** — integridade referencial 100%
- [x] **0 tabelas sem politicas** — nenhuma tabela com RLS bloqueado sem politicas
- [x] **0 RPCs criticas faltando** — todas as 75 RPCs do codigo existem no banco

### Tabelas COM Realtime (51 — verificadas via pg_publication_tables em 09/03/2026)
city_zones, delivery_orders, driver_locations, driver_profiles, driver_reviews, driver_withdrawals, emergency_alerts, emergency_contacts, error_logs, favorite_drivers, fcm_tokens, group_ride_members, group_ride_participants, group_rides, hot_zones, intercity_bookings, intercity_rides, leaderboard, messages, notifications, payments, post_comments, post_likes, price_offers, profiles, promo_banners, ratings, referrals, ride_tracking, rides, scheduled_rides, sms_deliveries, social_follows, social_post_likes, social_posts, subscriptions, support_messages, support_tickets, surge_pricing, user_achievements, user_push_tokens, user_wallets, wallet_transactions, webhook_deliveries, driver_schedule, family_members, promo_codes, push_log, system_config, promo_code_uses, user_social_stats

---

## Clientes Supabase Implementados

- [x] `lib/supabase/client.ts` — Cliente navegador
- [x] `lib/supabase/server.ts` — Cliente servidor
- [x] `lib/supabase/admin.ts` — Cliente admin (service role)
- [x] `lib/supabase/config.ts` — Configuracoes
- [x] `middleware.ts` — Middleware de autenticacao (Next.js 16 compativel)

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

## RPCs Disponiveis (75 funcoes de negocio — verificadas via SELECT em information_schema.routines em 09/03/2026)

### Novas RPCs (migrations 033-034)
- `get_nearby_drivers` — alias otimizado de find_nearby_drivers
- `search_drivers_nearby` — busca com filtros adicionais
- `get_popular_routes_nearby` — rotas populares por localizacao
- `calculate_ride_price` — calculo detalhado de preco
- `get_user_stats` — estatisticas gerais do usuario
- `get_driver_earnings_stats` — estatisticas de ganhos do motorista
- `get_frequent_destinations` — destinos frequentes do passageiro
- `needs_facial_verification` — verifica se precisa verificacao facial
- `submit_ride_rating` — alias de submit_rating com validacoes extras
- `approve_withdrawal` — alias de admin_approve_withdrawal
- `reject_withdrawal` — alias de admin_reject_withdrawal
- `create_notification` — cria notificacao programaticamente
- `get_notifications_summary` — resumo de notificacoes nao lidas
- `get_support_ticket_with_messages` — ticket com mensagens em uma RPC
- `update_trust_score` — atualiza trust score manualmente
- `get_pending_webhooks` — webhooks com falha pendentes
- `update_webhook_delivery` — atualiza status de entrega de webhook

### Corridas e Motorista
- find_nearby_drivers, create_ride, accept_ride, start_ride, complete_ride, cancel_ride
- submit_price_offer, accept_price_offer, upsert_driver_location (2 assinaturas)
- get_driver_active_ride, estimate_ride_price, get_surge_multiplier
- driver_accept_scheduled_ride, get_available_scheduled_rides
- handle_driver_cancellation, handle_ride_completed
- get_ride_with_details, get_ride_history, get_ride_history_paginated

### Financeiro
- calculate_wallet_balance, get_wallet_balance, get_full_wallet_statement
- get_driver_wallet_balance, get_user_payment_summary
- request_withdrawal (2 assinaturas), request_withdrawal_v2
- apply_coupon, apply_coupon_to_ride, redeem_coupon
- admin_approve_withdrawal, admin_reject_withdrawal, admin_process_withdrawal
- get_admin_financial_summary, get_rides_revenue_by_day
- sync_driver_wallet_on_complete, auto_create_payment_on_complete
- book_intercity_seat, get_pending_withdrawals

### Perfil e Usuario
- get_full_profile, get_driver_stats, get_driver_dashboard_stats
- get_passenger_home_data, get_driver_home_data
- get_referral_stats, generate_referral_code
- submit_rating, check_ride_reviewed, get_pending_reviews
- update_user_rating (2 assinaturas), update_acceptance_rate (2 assinaturas)
- update_trust_score, trigger_update_trust_score
- handle_new_user, handle_new_profile, handle_new_profile_wallet
- handle_new_user_settings, handle_new_recording_prefs, handle_new_sms_prefs

### Social e Gamificacao
- get_social_feed, get_leaderboard (3 assinaturas), get_leaderboard_full, refresh_leaderboard
- update_leaderboard_on_complete
- check_and_award_achievements, check_and_grant_achievements
- check_and_grant_referral_achievements, trigger_check_achievements_on_complete
- update_post_likes_count, update_post_comments_count
- increment, increment_comment_count, decrement_comment_count
- process_referral_reward, check_referral_on_complete

### Admin e Plataforma
- admin_ban_user, admin_verify_driver, send_notification
- mark_all_notifications_read, get_app_config
- create_support_ticket, reply_support_ticket, create_emergency_alert
- get_popular_routes, record_address_search, search_address_history
- snapshot_platform_metrics, trigger_snapshot_on_complete
- update_updated_at_column

---

## Pontos de Atencao

### Tabelas duplicadas (mesmo conceito)
- `post_likes` + `social_post_likes` — usar **social_post_likes** (tem Realtime e RLS corretas)
- `group_ride_members` + `group_ride_participants` — usar **group_ride_participants** (mais completa)

### Campos que NAO existem no banco (verificado via SQL em 09/03/2026)
- `user_wallets`: reserved_balance, pending_balance, total_earned, total_spent — **NAO EXISTEM**
- `support_tickets`: subject — campo correto e **`topic`**

### Campos duplicados — usar a coluna da direita
| Tabela | Evitar | Usar |
|---|---|---|
| ratings | reviewer_id | rater_id |
| ratings | reviewed_id | rated_id |
| ratings | stars | score |
| driver_reviews | driver_id_ref | driver_id |
| ride_recordings | duration_sec | duration_seconds |
| ride_recordings | size_bytes | file_size_bytes |
| sms_deliveries | phone_number | phone |
| sms_deliveries | cost_cents | cost |
| coupons | usage_limit / usage_count | max_uses / current_uses |

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
