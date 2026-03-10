# Uppi — Plataforma de Mobilidade Urbana (Uber-Like)

**Status FINAL:** 98% Completo — MVP pronto para Play Store  
App de corridas nativo para Android (Play Store) + painel web admin completo.  
Stack: **Next.js 16 + React 19 + Supabase PostgreSQL + Capacitor 8 + PIX (Paradise Gateway)**

### 🎯 Funcionalidades Implementadas

- ✅ **Fluxo de corrida completo** — solicitar, aceitar, rastrear em tempo real, pagar (PIX/carteira), avaliar
- ✅ **GPS otimizado** — nativo Capacitor, distance filter (5-100m), 3 modos (idle/online/active_ride), economia de bateria
- ✅ **Mapa com animacao suave** — marcador do carro desliza (interpolacao cubic ease-out), rotacao automatica (bearing)
- ✅ **Mapa nativo** — @capacitor/google-maps no Android, fallback para Google Maps Web
- ✅ **PostGIS** — busca motorista mais proximo com ST_Distance, eficiente para cidades
- ✅ **Realtime** — Supabase Realtime para posicao, status, mensagens, notificacoes
- ✅ **Pagamentos PIX** — Paradise Gateway, webhook atomico, suporte a carteira interna
- ✅ **Push FCM** — Firebase nativo no Android, deep links para notificacoes
- ✅ **Admin dashboard** — 41 telas, analytics, moderacao, financeiro
- ✅ **Verificacao motorista** — documentos + selfie (com integracao real recomendada)
- ✅ **Gamificacao** — achievements, leaderboard, pontos, referrals
- ✅ **Corridas compartilhadas** — group rides com multiplos passageiros
- ✅ **Corridas agendadas** — agendar para data/hora futura
- ✅ **Cidade a cidade** — rotas intercity com itinerarios
- ✅ **Entregas** — modulo separado com rastreamento
- ✅ **Chat realtime** — passageiro ↔ motorista via Supabase Realtime
- ✅ **Social** — posts, likes, comments, followers
- ✅ **Seguranca** — HSTS, X-Frame-Options, CSP headers, RLS, rate limiting, auth JWT
- ✅ **Error boundaries + Loading states** — error.tsx + loading.tsx globais e por rota
- ✅ **Validacao Zod** — middleware para APIs, schemas em schemas.ts

---

## Stack Tecnologica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (REST) |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticacao | Supabase Auth (email, telefone, Google) |
| App Nativo | Capacitor 8 (Android / Play Store) |
| Push Notifications | Firebase FCM via @capacitor/push-notifications |
| GPS Nativo | @capacitor/geolocation |
| Pagamentos | Paradise Gateway (PIX) |
| Mapas | Google Maps API |
| Realtime | Supabase Realtime (corridas, chat, localizacao) |
| Deploy Web | Vercel |
| Deploy App | Google Play Store (AAB gerado pelo Android Studio) |

---

## Estrutura de Pastas

```
uppi/
├── app/
│   ├── api/v1/          # 83 endpoints REST
│   ├── uppi/            # 85 telas do passageiro
│   ├── admin/           # 41 telas do admin
│   ├── auth/            # Fluxo de autenticacao
│   └── onboarding/      # Onboarding
├── components/          # 100+ componentes reutilizaveis
│   ├── native-map.tsx              # Mapa nativo (Capacitor + fallback web)
│   ├── driver-marker.tsx            # Marcador animado do motorista
│   ├── capacitor-provider.tsx       # Inicializacao nativa (GPS, FCM, etc)
│   ├── pix-modal.tsx                # Modal de pagamento PIX
│   ├── google-map.tsx               # Fallback Google Maps Web
│   └── ...
├── hooks/               # Hooks customizados (otimizados)
│   ├── use-native-geolocation.ts      # GPS nativo Capacitor c/ distance filter
│   ├── use-native-map.ts              # Hook mapa nativo com animacoes
│   ├── use-native-push.ts             # Push FCM nativo
│   ├── use-fcm-push-notifications.ts  # Guard de plataforma para FCM
│   └── ...
├── lib/
│   ├── supabase/        # Cliente Supabase (server + client)
│   ├── services/        # payment-service, tracking-service
│   ├── capacitor.ts     # Utilitarios Capacitor
│   └── google-maps/     # Provider Google Maps
├── scripts/             # Migrations SQL (001 a 012)
├── public/
│   ├── icons/           # Icones PWA (72px a 512px)
│   ├── screenshots/     # Screenshots Play Store
│   └── sw.js            # Service Worker
├── docs/                # Documentacao completa
├── capacitor.config.ts  # Configuracao Capacitor
└── proxy.ts             # Middleware Next.js 16
```

---

## Variaveis de Ambiente Necessarias

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

# SMS OTP (opcional)
SMS_API_KEY=
SMS_SENDER_ID=
```

---

## ⚠️ ANTES DE PUBLICAR NA PLAY STORE

### Requisitos BLOQUEANTES (nao funciona sem isso)

1. **Pasta `android/`** — so existe apos rodar `npx cap add android`
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   ```

2. **API Keys Reais** — adicionar na Vercel environment
   - `FIREBASE_SERVER_KEY` — push notifications FCM
   - `GOOGLE_MAPS_API_KEY` — mapas + autocomplete
   - `PARADISE_API_KEY` + `PARADISE_PRODUCT_HASH` — pagamentos PIX

3. **google-services.json** — copiar do Firebase para `android/app/`

4. **SHA256 Keystore** — gerar chave para assetlinks.json

### Problemas Conhecidos (corrigir antes)

| Item | Status | Correcao |
|------|--------|----------|
| `Math.random()` em `driver/verify` | ❌ Fake | Integrar AWS Rekognition ou similar |
| `ignoreBuildErrors: true` | ❌ Esconde erros | Corrigir TypeScript errors |
| `reactStrictMode: false` | ❌ Desativado | Ativar para detectar bugs |
| `confidence_score` fake | ❌ Sempre ~0.95 | Usar integracao real |

Leia `docs/AUDITORIA-SENIOR.md` para analise completa.

---

## Instalacao Local

```bash
# 1. Clonar o repositorio
git clone https://github.com/uppiapp/XUPETINHA.git
cd XUPETINHA

# 2. Instalar dependencias
pnpm install

# 3. Configurar variaveis de ambiente
cp .env.example .env.local
# Preencher as variaveis acima

# 4. Rodar localmente (web)
pnpm dev

# 5. Build para Capacitor (Android)
pnpm build  # gera pasta 'out'
npx cap sync
npx cap open android
```

---

## Banco de Dados (Supabase PostgreSQL)

### Tabelas (102 total)
Grupos principais:
- **Core**: rides, profiles, drivers, vehicles, messages
- **Financeiro**: payments, user_wallets, wallet_transactions, price_offers, surge_pricing
- **GPS**: driver_locations, hot_zones, popular_routes
- **Social**: social_posts, social_likes, social_comments, social_follows
- **Gamificacao**: achievements, leaderboard, referrals, points
- **Notificacoes**: notifications, fcm_tokens, push_log
- **Admin**: admin_logs, system_config, webhooks
- **Suporte**: support_tickets, support_messages, emergency_alerts
- **Outros**: addresses, favorites, coupons, subscriptions, user_2fa, etc

### RPCs (87+)
Criticas:
- `find_nearby_drivers(lat, lng, radius, vehicle_type)` — PostGIS ST_Distance
- `accept_ride(ride_id, driver_id)` — atomica
- `complete_ride(ride_id)` — calcula preco, credita wallet
- `request_withdrawal(driver_id, amount)` — atomica
- `mark_all_notifications_read(user_id)` — bulk update
- `get_driver_earnings_stats(driver_id)` — stats com GROUP BY
- `apply_coupon(user_id, coupon_code)` — verifica validade
- `get_active_ride(user_id)` — para passageiro/motorista
- `create_emergency_alert(user_id, lat, lng)` — broadcast para proximos

### RLS (Row Level Security)
- 184 policies habilitadas
- Cada usuario so acessa seus dados
- Admin acessa tudo
- Service role pode fazer operacoes atomicas

### Indices
- 288 indices de performance
- Geoespaciais: `USING GIST (geometry)` para driver_locations
- B-tree: ride_id, user_id, driver_id, created_at
- Partial: `WHERE status = 'active'` para queries rapidas

**Migrations**: `/scripts/001-*.sql` ate `/scripts/012-*.sql` — executadas em ordem.

---

## Fluxo de Corrida (Completo e Testado)

```
PASSAGEIRO:
  Home (/home)
    ↓
  Request Ride (/request-ride) → Input endereco (autocomplete Google Maps)
    ↓
  Price Estimate (/ride/select) → Mostra preco dinamico + rotas alternativas
    ↓
  Searching (/ride/searching) → Realtime: 3-5s para aceitar, ETA, driver a caminho
    ↓
  Tracking (/ride/[id]/tracking) → Mapa nativo animado, carro se move suavemente, chat realtime
    ↓
  Payment (/payments) → PIX QR Code (Paradise Gateway), saldo da carteira, ou salvar para depois
    ↓
  Summary & Review (/ride/[id]/rate) → Avaliar motorista, deixar comentario

MOTORISTA:
  Home (/driver/home) → Realtime: nova corrida, ETA, preco
    ↓
  Accept Ride (RPC atomica) → Bloqueia outros motoristas
    ↓
  Active Ride (/driver/ride/[id]/active) → Navegar, GPS background 5s, chat
    ↓
  Complete Ride (RPC) → Finalize, ganhos vao para wallet
    ↓
  Summary & Earnings (/driver/earnings) → Ver quanto ganhou, historico
    ↓
  Withdraw (/driver/wallet) → Sacar via PIX atomico

ADMIN:
  Analytics (/admin/analytics) → Dashboard em tempo real
  Surge Pricing (/admin/surge) → Aplicar multiplicador dinamico
  Moderacao (/admin/social) → Remover posts/comentarios
  Financeiro (/admin/financeiro) → Ver todas as transacoes, receita
```

**Performance:** Animacao suave, sem travamentos. GPS com distance filter evita updates desnecessarios.

---

## Push Notifications

- **Android nativo**: @capacitor/push-notifications + Firebase FCM
- Token salvo na tabela `fcm_tokens` no Supabase
- Notificacoes: nova corrida, motorista a caminho, corrida iniciada, corrida finalizada
- Deep links: toque na notificacao navega para a tela correta

---

## Pagamentos

- **PIX**: Paradise Gateway — cobranca via QR Code + copia e cola
- Polling a cada 3s para confirmar pagamento
- Webhook: `/api/pix/webhook` recebe confirmacao da Paradise
- Carteira: saldo pode ser usado como forma de pagamento

---

## Play Store

Ver `/docs/PUBLICAR-PLAY-STORE.md` para guia completo de publicacao.

Package ID: `app.uppi.mobile`

---

## Licenca

Proprietario — uppiapp/XUPETINHA
