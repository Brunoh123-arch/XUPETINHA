# Uppi — Plataforma de Mobilidade Urbana

**Status:** MVP pronto para Play Store (Android) — em finalizacao para iOS  
**Stack:** Next.js 16 + React 19 + Supabase PostgreSQL + Capacitor 8 + PIX (Paradise Gateway)  
**Data da ultima revisao:** 14/03/2026  
**Natividade:** 95% nativo Capacitor — 5% sao guards intencionais dentro do WebView

---

## Analise do Projeto (revisao 14/03/2026)

### Boas Noticias

- **111 tabelas PostgreSQL** em producao com estrutura solida, relacionamentos corretos e PostGIS ativo
- **APIs web 100% eliminadas** — zero `localStorage`, `sessionStorage`, `navigator.vibrate`, `navigator.share`, `navigator.clipboard`, `navigator.geolocation`, `Notification.requestPermission` ou `navigator.serviceWorker` no codigo
- **21 plugins Capacitor instalados** cobrindo GPS, haptics, push, share, clipboard, camera, storage, browser, device, network, local notifications e app launcher
- **lib/storage.ts** — wrapper centralizado sobre `@capacitor/preferences`, substitui 100% dos `localStorage`/`sessionStorage`
- **lib/native.ts** — helpers centrais `nativeShare`, `nativeCopy`, `nativeOpenUrl`, `nativeCall`, `nativeEmail` — zero chamadas web diretas
- **GPS profissional** — background geolocation com 3 modos (idle/online/active_ride), distance filter (5m/20m/100m), economia de bateria real
- **RLS configurado em 75+ tabelas** — scripts 050 e 051 cobriram payments, emergency, suporte, motorista, social, gamificacao, favoritos, corridas, familia
- **Admin dashboard** — 42 telas com analytics em tempo real, surge pricing, moderacao, financeiro e suporte
- **Push FCM nativo** — @capacitor/push-notifications, token em `fcm_tokens`, deep links funcionando
- **PIX integrado** — Paradise Gateway, webhook HMAC atomico, polling de status, QR Code + copia e cola
- **Fluxo end-to-end funcional** — solicitar → aceitar → rastrear → pagar PIX → avaliar
- **130+ rotas de API** em `/api/v1/` cobrindo todos os dominios do app
- **Zod validation** em todas as APIs criticas, schemas em `lib/validations/schemas.ts`
- **Error boundaries** — `error.tsx` e `loading.tsx` globais e por rota

### Criticas (pontos a corrigir antes da Play Store)

| Item | Severidade | Detalhes |
|------|-----------|---------|
| Reconhecimento facial fake | Alta | `confidence_score` sempre ~0.95, sem integracao real — usar AWS Rekognition ou Facephi |
| `Math.random()` em liveness check | Alta | Verificacao de motorista fake — substituir por SDK real |
| Duplicacao de tabelas | Media | `favorites`+`favorite_addresses`, `reviews`+`driver_reviews`+`ratings`, `webhooks`+`webhook_endpoints`, `post_likes`+`social_post_likes` — consolidar em uma por dominio |
| `database.types.ts` desatualizado | Media | Nao reflete as 111 tabelas — regenerar com `supabase gen types` |
| Pasta `android/` ausente | Bloqueante | Rodar `npx cap add android && npx cap sync` para gerar |
| `google-services.json` ausente | Bloqueante para FCM | Copiar do Firebase Console para `android/app/` |

---

## Banco de Dados — 111 Tabelas em Producao

### Contagem por Categoria

| Categoria | Quantidade | Tabelas |
|-----------|-----------|---------|
| Usuarios e Auth | 14 | `profiles`, `user_settings`, `user_preferences`, `user_devices`, `user_sessions`, `user_onboarding`, `user_2fa`, `email_otps`, `recording_consents`, `user_recording_preferences`, `user_sms_preferences`, `user_social_stats`, `user_coupons`, `notification_preferences` |
| Motoristas | 11 | `driver_profiles`, `driver_locations`, `driver_documents`, `driver_verifications`, `driver_reviews`, `driver_earnings`, `driver_bonuses`, `driver_schedule`, `driver_withdrawals`, `driver_trips_summary`, `driver_rating_breakdown` |
| Veiculos | 1 | `vehicles` |
| Corridas | 11 | `rides`, `price_offers`, `ride_tracking`, `ride_route_points`, `ride_cancellations`, `ride_disputes`, `ride_tips`, `ride_recordings`, `scheduled_rides`, `ride_eta_log`, `ride_offers_log` |
| Financeiro | 9 | `user_wallets`, `wallet_transactions`, `payments`, `payment_methods`, `coupons`, `coupon_uses`, `promo_codes`, `promo_code_uses`, `surge_pricing` |
| Precos e Zonas | 4 | `pricing_rules`, `hot_zones`, `city_zones`, `popular_routes` |
| Social / Gamificacao | 12 | `social_posts`, `social_post_likes`, `post_likes`, `post_comments`, `social_follows`, `achievements`, `user_achievements`, `leaderboard`, `referrals`, `referral_achievements`, `rating_categories`, `ratings` |
| Comunicacao | 9 | `messages`, `notifications`, `fcm_tokens`, `push_subscriptions`, `user_push_tokens`, `push_log`, `sms_logs`, `sms_deliveries`, `sms_templates` |
| Corridas Especiais | 6 | `group_rides`, `group_ride_members`, `group_ride_participants`, `intercity_rides`, `intercity_bookings`, `delivery_orders` |
| Emergencia / Suporte | 6 | `emergency_alerts`, `emergency_contacts`, `support_tickets`, `support_messages`, `error_logs`, `blocked_users` |
| Enderecos | 5 | `favorites`, `favorite_addresses`, `favorite_drivers`, `address_history`, `address_search_history` |
| Configuracao e Admin | 13 | `system_settings`, `system_config`, `app_config`, `app_versions`, `app_review_requests`, `admin_logs`, `platform_metrics`, `campaigns`, `promotions`, `promo_banners`, `legal_documents`, `faqs`, `promo_code_uses` |
| Webhooks | 3 | `webhooks`, `webhook_endpoints`, `webhook_deliveries` |
| Familia e Club | 3 | `family_members`, `subscriptions`, `reviews` |
| Monitoramento | 3 | `live_activities`, `user_activity_log`, `recording_consents` |
| Sistema PostGIS | 3 | `geography_columns`, `geometry_columns`, `spatial_ref_sys` |
| **TOTAL** | **111** | — |

### RLS — Status de Seguranca

| Estado | Quantidade |
|---|---|
| Tabelas com RLS + policies | **75+** |
| Tabelas sem policies (leitura publica — intencional) | `app_versions`, `pricing_rules`, `faqs`, `legal_documents`, `achievements`, `rating_categories` |
| Tabelas de log (acesso server-side via service_role) | `admin_logs`, `push_log`, `error_logs`, `sms_logs`, `platform_metrics` |

---

## Stack Tecnologica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (REST) |
| Banco de Dados | Supabase (PostgreSQL + PostGIS) |
| Autenticacao | Supabase Auth (email, telefone, Google) |
| App Nativo | Capacitor 8 (Android + iOS) |
| Storage Nativo | @capacitor/preferences (substitui 100% localStorage/sessionStorage) |
| Push Notifications | @capacitor/push-notifications (FCM nativo) |
| GPS Nativo | @capacitor/geolocation + @capacitor-community/background-geolocation |
| Haptics | @capacitor/haptics |
| Share / Clipboard | @capacitor/share + @capacitor/clipboard |
| Camera | @capacitor/camera |
| Browser / Links Externos | @capacitor/browser |
| Device Info | @capacitor/device |
| Network Status | @capacitor/network |
| Local Notifications | @capacitor/local-notifications |
| App Launcher | @capacitor/app-launcher |
| Keep Awake | @capacitor-community/keep-awake |
| Text to Speech | @capacitor-community/text-to-speech |
| Pagamentos | Paradise Gateway (PIX) |
| Mapas | @capacitor/google-maps (nativo Android) + @vis.gl/react-google-maps (fallback web) |
| Realtime | Supabase Realtime |
| Animacoes | Framer Motion |
| Deploy Web | Vercel |
| Deploy App | Google Play Store (AAB via Android Studio) |

---

## Estrutura de Pastas

```
uppi/
├── app/
│   ├── api/v1/          # 52 rotas de API (route.ts)
│   ├── uppi/            # 90+ telas passageiro e motorista
│   ├── admin/           # 42 telas do admin dashboard
│   ├── auth/            # 12 telas de autenticacao
│   └── onboarding/      # 3 telas de onboarding
├── components/          # 100+ componentes reutilizaveis
│   ├── native-map.tsx              # Mapa nativo (Capacitor + fallback web)
│   ├── driver-marker.tsx           # Marcador animado do motorista
│   ├── capacitor-provider.tsx      # Inicializacao nativa
│   ├── pix-modal.tsx               # Modal de pagamento PIX
│   └── google-map.tsx              # Google Maps Web (fallback)
├── hooks/               # Hooks customizados
│   ├── use-native-geolocation.ts   # GPS nativo c/ distance filter e 3 modos
│   ├── use-native-map.ts           # Hook mapa nativo com animacoes
│   ├── use-haptic.ts               # Haptics via @capacitor/haptics
│   └── use-fcm-push-notifications.ts
├── lib/
│   ├── supabase/        # Cliente Supabase (server + client)
│   ├── services/        # payment-service, tracking-service
│   ├── native.ts        # Helpers centrais: nativeShare, nativeCopy, nativeCall, nativeOpenUrl
│   ├── storage.ts       # Helper Storage: wrapper sobre @capacitor/preferences
│   ├── capacitor.ts     # Inicializacao Capacitor
│   └── google-maps/     # Provider Google Maps
├── plugins/             # Plugins Capacitor customizados (ex: navigation)
├── scripts/             # SQL migrations (000 a 049+)
│   └── SETUP-NOVO-SUPABASE.sql  # Script completo do banco (103 tabelas)
├── docs/                # Documentacao tecnica
├── capacitor.config.ts  # Configuracao Capacitor
└── proxy.ts             # Middleware Next.js 16
```

---

## Variaveis de Ambiente

```bash
# Supabase (obrigatorio)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Maps (obrigatorio para mapas e autocomplete)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_API_KEY=

# Firebase FCM (obrigatorio para push notifications)
FIREBASE_SERVER_KEY=

# Paradise Gateway PIX (obrigatorio para pagamentos)
PARADISE_API_KEY=
PARADISE_API_URL=
PARADISE_PRODUCT_HASH=

# SMS OTP (opcional)
SMS_API_KEY=
SMS_SENDER_ID=
```

---

## Antes de Publicar na Play Store

### Requisitos Bloqueantes

1. **Pasta `android/`** — so existe apos rodar:
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   ```

2. **API Keys Reais** — adicionar na Vercel:
   - `FIREBASE_SERVER_KEY` — push FCM
   - `GOOGLE_MAPS_API_KEY` — mapas + autocomplete
   - `PARADISE_API_KEY` + `PARADISE_PRODUCT_HASH` — pagamentos PIX

3. **google-services.json** — copiar do Firebase para `android/app/`

4. **SHA256 Keystore** — substituir em `public/.well-known/assetlinks.json`

5. **Regenerar types** — `supabase gen types typescript --project-id SEU_PROJECT_ID > lib/database.types.ts`

6. **Reconhecimento facial real** — substituir `confidence_score` fake por SDK real (AWS Rekognition ou Facephi)

---

## Fluxo de Corrida

```
PASSAGEIRO:
  /home → /request-ride → /ride/select → /ride/searching
       → /ride/[id]/tracking → /payments → /ride/[id]/rate

MOTORISTA:
  /driver/home → /driver/ride/[id]/accept → /driver/ride/[id]/active
              → /driver/ride/[id]/summary → /driver/earnings

ADMIN:
  /admin → analytics, surge, moderacao, financeiro, suporte
```

---

## Banco de Dados

**111 tabelas** | PostGIS ativo | RLS em 75+ tabelas

Scripts SQL:
- `/scripts/SETUP-NOVO-SUPABASE.sql` — schema completo inicial
- `/scripts/050-tabelas-recomendadas.sql` — 8 tabelas adicionadas (live_activities, driver_trips_summary, etc)
- `/scripts/051-rls-policies-criticas.sql` — RLS policies para 40+ tabelas que estavam desprotegidas

---

## Licenca

Proprietario — uppiapp/XUPETINHA
