# Desenvolvimento Local — Uppi

## Stack Tecnologica

| Tecnologia | Versao | Uso |
|---|---|---|
| Next.js | 16 | Framework principal |
| React | 19.2 | UI |
| TypeScript | 5 | Tipagem |
| Tailwind CSS | 4 | Estilizacao |
| Supabase | latest | Banco + Auth |
| Capacitor | 8.2 | App nativo Android |
| shadcn/ui | latest | Componentes UI |
| SWR | latest | Data fetching client |
| pnpm | 9+ | Gerenciador de pacotes |

---

## Configuracao Inicial

### 1. Clonar o repositorio
```bash
git clone https://github.com/uppiapp/XUPETINHA.git
cd XUPETINHA
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variaveis de ambiente
Criar arquivo `.env.local` na raiz:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jpnwxqjrhzaobnugjnyx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=sua_google_maps_key

# Firebase (FCM)
FIREBASE_SERVER_KEY=sua_firebase_server_key

# Pagamentos PIX (Paradise Gateway)
PARADISE_API_KEY=sua_paradise_key
PARADISE_API_URL=https://api.paradise.com.br

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Rodar em desenvolvimento
```bash
pnpm dev
# Acesse http://localhost:3000
```

---

## Estrutura de Pastas

```
/
├── app/
│   ├── (auth)/              # Telas de autenticacao
│   ├── uppi/                # Telas do passageiro (83 telas)
│   ├── driver/              # Telas do motorista (24 telas)
│   ├── admin/               # Telas do admin (42 telas)
│   └── api/                 # APIs REST (81 endpoints, 137 handlers)
│
├── components/              # 94 componentes reutilizaveis
│   ├── ui/                  # shadcn/ui base
│   ├── capacitor-provider   # Inicializacao nativa Android
│   ├── client-providers     # Providers do app
│   └── service-worker       # Registro do SW
│
├── hooks/                   # Custom hooks
│   ├── use-native-geolocation  # GPS nativo (Capacitor)
│   ├── use-native-push         # Push FCM nativo
│   └── use-fcm-push-notifications
│
├── lib/
│   ├── supabase/            # Clients Supabase (server + client)
│   ├── capacitor.ts         # Utilitarios Capacitor (dynamic imports)
│   └── google-maps/         # Provider Google Maps
│
├── public/
│   ├── icons/               # Icones PWA (72px a 512px)
│   ├── screenshots/         # Screenshots Play Store
│   ├── sw.js                # Service Worker
│   └── .well-known/
│       └── assetlinks.json  # Verificacao TWA/Capacitor
│
├── scripts/                 # Migrations SQL
├── docs/                    # Documentacao completa
├── capacitor.config.ts      # Config Capacitor Android
└── proxy.ts                 # Middleware Next.js 16 (Supabase SSR)
```

---

## Fluxos de Autenticacao

| Tipo | Rota | Descricao |
|---|---|---|
| Login email/senha | `/auth/login` | Login padrao |
| Cadastro | `/auth/register` | Novo usuario |
| OTP SMS | `/auth/verify-otp` | Verificacao por SMS |
| Recuperar senha | `/auth/forgot-password` | Reset de senha |
| Motorista onboarding | `/driver/onboarding` | Cadastro de motorista |

### Tipos de usuario (`profiles.user_type`)
- `passenger` — passageiro padrao
- `driver` — motorista verificado
- `admin` — administrador com acesso total

---

## Scripts de Banco (Migrations)

Todos os scripts SQL estao em `/scripts/` numerados sequencialmente.
Para aplicar manualmente, executar no Supabase SQL Editor na ordem numerica.

| Script | Conteudo |
|---|---|
| `001` a `011` | Schema inicial, tabelas, funcoes, seeds |
| `012` | Tabelas faltantes + 6 RPCs novas |

---

## Comandos Uteis

```bash
# Desenvolvimento
pnpm dev                    # Servidor local

# Build
pnpm build                  # Build de producao (gera /out para Capacitor)
pnpm start                  # Servidor de producao local

# Capacitor Android
npx cap add android         # Adicionar plataforma (1x apenas)
npx cap sync android        # Sincronizar build com Android
npx cap open android        # Abrir Android Studio
npx cap run android         # Rodar no emulador/dispositivo

# Live Reload no dispositivo fisico
npx cap run android --livereload --external
```

---

## Variaveis de Ambiente em Producao (Vercel)

Configurar no painel Vercel > Settings > Environment Variables:
- Todas as variaveis do `.env.local`
- Adicionar `NEXT_PUBLIC_APP_URL` com a URL de producao

---

## Branches Git

| Branch | Uso |
|---|---|
| `main` | Producao estavel |
| `v0/aaw87-5346-0654ffd6` | Branch de desenvolvimento atual (v0) |
| `analise-do-projeto` | Branch de analise |
