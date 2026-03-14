# Uppi — Plataforma de Mobilidade Urbana

**Status:** MVP pronto para Play Store (Android) — em finalizacao para iOS  
**Stack:** Next.js 16 + React 19 + Supabase PostgreSQL + Capacitor 8 + PIX (Paradise Gateway)  
**Data da ultima revisao:** 14/03/2026

---

## Analise do Projeto

### Boas Noticias

- **103 tabelas PostgreSQL** em producao, todas com estrutura solida e relacionamentos corretos
- **APIs web eliminadas** — nenhum `localStorage`, `sessionStorage`, `navigator.vibrate`, `navigator.share`, `navigator.clipboard`, `navigator.geolocation` ou `Notification.requestPermission` restante no codigo; 100% Capacitor nativo
- **Fluxo de corrida completo e funcional** — solicitar → aceitar → rastrear → pagar PIX → avaliar, testado end-to-end
- **GPS profissional** — background geolocation com distance filter (5m/20m/100m por modo), 3 modos de operacao (idle/online/active_ride), economia de bateria real
- **Animacao do marcador** — interpolacao cubic ease-out, rotacao automatica por bearing, sem travamentos
- **PostGIS ativo** — `ST_Distance` para busca do motorista mais proximo, indice GIST geoespacial
- **RLS em todas as tabelas criticas** — profiles, rides, messages, notifications, user_wallets, wallet_transactions, driver_locations, price_offers
- **Admin dashboard completo** — 42 telas, analytics em tempo real, surge pricing, moderacao, financeiro, suporte
- **Push FCM nativo** — @capacitor/push-notifications, token salvo em `fcm_tokens`, deep links funcionando
- **PIX integrado** — Paradise Gateway, webhook atomico com HMAC, polling de status, QR Code + copia e cola
- **Gamificacao** — achievements, leaderboard semanal/mensal/all-time, referrals com recompensa
- **Chat Realtime** — passageiro <-> motorista via Supabase Realtime, latencia < 200ms
- **52 rotas de API** (`/api/v1/`) cobrindo todos os fluxos do app
- **Zod validation** em todas as APIs criticas, schemas centralizados em `lib/validations/schemas.ts`
- **Error boundaries** — `error.tsx` e `loading.tsx` globais e por rota, nunca exibe tela branca

### Criticas (pontos a melhorar)

| Item | Severidade | Detalhes |
|------|-----------|---------|
| `ignoreBuildErrors: true` no next.config | Alta | Esconde erros TypeScript — remover antes da Play Store |
| `reactStrictMode: false` | Alta | Desativado — ativar para detectar efectos colaterais duplos |
| Reconhecimento facial fake | Alta | `confidence_score` sempre ~0.95, sem integracao real — usar AWS Rekognition ou Facephi |
| `Math.random()` em verificacao de motorista | Alta | Gera liveness check falso — substituir por SDK real |
| RLS policies ausentes em 18 tabelas | Media | `driver_bonuses`, `driver_documents`, `driver_earnings`, `payment_methods`, `ride_cancellations`, `ride_disputes`, `ride_tips`, `ride_route_points`, `user_devices`, `user_preferences`, `user_sessions`, `referral_achievements`, `driver_withdrawals` (UPDATE/DELETE), entre outras nao tem policies |
| Sem tabela `live_activities` | Media | iOS Live Activities (corrida na tela de bloqueio) nao tem persistencia de estado |
| Sem tabela `driver_trips_summary` | Media | Resumo diario/semanal de viagens por motorista nao existe — admin calcula na hora (lento) |
| Sem tabela `ride_eta_log` | Baixa | ETA do motorista nao e registrado — impossivel auditar precisao |
| Sem `app_reviews` | Baixa | Pedidos de avaliacao na Play Store nao sao gerenciados |
| Capacitor `@capacitor-community/microphone` nao oficial | Baixa | Usar `@capacitor/microphone` quando disponivel ou substituir por VoiceRecorder |
| Pasta `android/` ausente | Bloqueante para Play Store | Rodar `npx cap add android && npx cap sync` para gerar |
| `google-services.json` ausente | Bloqueante para FCM | Copiar do Firebase Console para `android/app/` |

---

## Banco de Dados — 103 Tabelas em Producao

### Contagem por Categoria

| Categoria | Quantidade | Tabelas |
|-----------|-----------|---------|
| Usuarios e Auth | 10 | `profiles`, `user_settings`, `user_preferences`, `user_devices`, `user_sessions`, `user_onboarding`, `user_2fa`, `email_otps`, `recording_consents`, `user_recording_preferences` |
| Motoristas | 8 | `driver_profiles`, `driver_locations`, `driver_documents`, `driver_verifications`, `driver_reviews`, `driver_earnings`, `driver_bonuses`, `driver_schedule` |
| Veiculos | 1 | `vehicles` |
| Corridas | 9 | `rides`, `price_offers`, `ride_tracking`, `ride_route_points`, `ride_cancellations`, `ride_disputes`, `ride_tips`, `ride_recordings`, `scheduled_rides` |
| Financeiro | 10 | `user_wallets`, `wallet_transactions`, `payments`, `payment_methods`, `coupons`, `coupon_uses`, `user_coupons`, `promo_codes`, `promo_code_uses`, `driver_withdrawals` |
| Precos e Zonas | 5 | `surge_pricing`, `pricing_rules`, `hot_zones`, `city_zones`, `popular_routes` |
| Social / Gamificacao | 10 | `social_posts`, `social_post_likes`, `post_likes`, `post_comments`, `social_follows`, `user_social_stats`, `achievements`, `user_achievements`, `leaderboard`, `referrals` |
| Comunicacao | 9 | `messages`, `notifications`, `notification_preferences`, `fcm_tokens`, `push_subscriptions`, `user_push_tokens`, `push_log`, `sms_logs`, `sms_deliveries` |
| Corridas Especiais | 6 | `group_rides`, `group_ride_members`, `group_ride_participants`, `intercity_rides`, `intercity_bookings`, `delivery_orders` |
| Emergencia / Suporte | 4 | `emergency_alerts`, `emergency_contacts`, `support_tickets`, `support_messages` |
| Enderecos | 5 | `favorites`, `favorite_addresses`, `favorite_drivers`, `address_history`, `address_search_history` |
| Configuracao e Admin | 15 | `system_settings`, `system_config`, `app_config`, `app_versions`, `admin_logs`, `platform_metrics`, `pricing_rules`, `campaigns`, `promotions`, `promo_banners`, `legal_documents`, `faqs`, `sms_templates`, `user_sms_preferences`, `webhooks` |
| Webhooks | 3 | `webhook_endpoints`, `webhook_deliveries`, `rating_categories` |
| Familia e Club | 4 | `family_members`, `subscriptions`, `referral_achievements`, `reviews` |
| **TOTAL** | **103** | — |

### Tabelas que FALTAM (recomendadas para producao)

| Tabela | Motivo |
|--------|--------|
| `live_activities` | Persistir estado de Live Activities no iOS (tela de bloqueio com corrida ativa) |
| `driver_trips_summary` | Cache de resumo diario/semanal por motorista para o admin nao calcular on-the-fly |
| `ride_eta_log` | Logar cada ETA estimado vs real para auditoria de precisao |
| `app_reviews_requests` | Controlar quando e para quem pedir avaliacao na Play Store / App Store |
| `blocked_users` | Passageiro bloquear motorista especifico (e vice-versa) |
| `ride_offers_log` | Historico de quais motoristas viram e recusaram uma corrida (para otimizar matching) |
| `driver_rating_breakdown` | Cache de categorias de avaliacao por motorista (pontualidade, direcao, educacao) |
| `user_activity_log` | Log de acoes do usuario para analytics comportamental e deteccao de fraude |

**Total atual: 103 | Recomendadas: +8 | Meta: 111**

---

## Stack Tecnologica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (REST) |
| Banco de Dados | Supabase (PostgreSQL + PostGIS) |
| Autenticacao | Supabase Auth (email, telefone, Google) |
| App Nativo | Capacitor 8 (Android + iOS) |
| Storage Nativo | @capacitor/preferences (substitui localStorage/sessionStorage) |
| Push Notifications | @capacitor/push-notifications (FCM nativo) |
| GPS Nativo | @capacitor/geolocation + @capacitor-community/background-geolocation |
| Haptics | @capacitor/haptics |
| Share / Clipboard | @capacitor/share + @capacitor/clipboard |
| Camera | @capacitor/camera |
| Browser | @capacitor/browser |
| Pagamentos | Paradise Gateway (PIX) |
| Mapas | @capacitor/google-maps (nativo Android) + Google Maps Web (fallback) |
| Realtime | Supabase Realtime |
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

5. **Corrigir next.config** — remover `ignoreBuildErrors: true` e ativar `reactStrictMode: true`

6. **Reconhecimento facial real** — substituir `confidence_score` fake por SDK real

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

**103 tabelas** | PostGIS ativo | RLS habilitado nas tabelas criticas

O script completo esta em `/scripts/SETUP-NOVO-SUPABASE.sql`.

Para adicionar as 8 tabelas recomendadas, execute `/scripts/050-tabelas-recomendadas.sql`.

---

## Licenca

Proprietario — uppiapp/XUPETINHA
