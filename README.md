# Uppi — Plataforma de Mobilidade Urbana

App de corridas nativo para Android (Play Store) + painel web admin.
Stack: **Next.js 16 + Supabase + Capacitor 8 + PIX (Paradise Gateway)**

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
├── components/          # 94 componentes reutilizaveis
│   ├── capacitor-provider.tsx   # Inicializacao nativa
│   ├── pix-modal.tsx            # Modal de pagamento PIX
│   └── ...
├── hooks/               # Hooks customizados
│   ├── use-native-geolocation.ts  # GPS nativo Capacitor
│   ├── use-native-push.ts         # Push FCM nativo
│   └── use-fcm-push-notifications.ts
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

## Banco de Dados

O projeto usa **Supabase PostgreSQL** com:
- 102 tabelas
- 87+ RPCs (funcoes PostgreSQL)
- 184 RLS policies
- 288 indices de performance

Migrations em `/scripts/` — executar na ordem numerica (001 a 012).

---

## Fluxo de Corrida

```
Passageiro: Home → Route Input → Price Estimate → Searching → Tracking → Payment (PIX) → Review
Motorista:  Home → Accept Ride → Active Ride (GPS tracking) → Summary → Earnings
```

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
