# Arquitetura — Uppi

## Visao Geral

```
┌─────────────────────────────────────────────────────┐
│                  CLIENTE                            │
│  ┌──────────────┐    ┌────────────────────────┐    │
│  │  App Android │    │  Browser (admin/web)   │    │
│  │  (Capacitor) │    │  (Next.js SSR)         │    │
│  └──────┬───────┘    └───────────┬────────────┘    │
└─────────┼─────────────────────────┼─────────────────┘
          │ HTTPS                   │ HTTPS
┌─────────▼─────────────────────────▼─────────────────┐
│                   VERCEL (Edge)                      │
│  ┌────────────────────────────────────────────────┐ │
│  │             Next.js 16 App Router              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │ │
│  │  │ /app/uppi│  │/app/admin│  │  /app/api   │  │ │
│  │  │ (passag.)│  │ (gestor) │  │  REST v1    │  │ │
│  │  └──────────┘  └──────────┘  └──────┬──────┘  │ │
│  └────────────────────────────────────┼──────────┘ │
└───────────────────────────────────────┼─────────────┘
                                        │
┌───────────────────────────────────────▼─────────────┐
│                   SUPABASE                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │PostgreSQL│ │  Auth    │ │Realtime  │ │Storage │ │
│  │102 tables│ │  JWT     │ │Websocket │ │Files   │ │
│  │87+ RPCs  │ │  RLS     │ │          │ │        │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────────────────┘
          │                        │
┌─────────▼──────┐      ┌──────────▼──────────┐
│ Firebase FCM   │      │  Paradise Gateway   │
│ Push Notif.    │      │  PIX Pagamentos     │
└────────────────┘      └─────────────────────┘
```

---

## Camadas da Aplicacao

### 1. App Nativo Android (Capacitor)
- Wrapper nativo do app Next.js
- Acessa GPS, Camera, Push nativo
- Build: `next build` → `npx cap sync` → Android Studio → AAB
- Plugins: `@capacitor/geolocation`, `@capacitor/push-notifications`, `@capacitor/status-bar`, `@capacitor/splash-screen`

### 2. Frontend (Next.js 16 App Router)
- **`/app/uppi/`** — 83 telas do passageiro
- **`/app/admin/`** — 42 telas do painel admin
- **`/app/auth/`** — Autenticacao (login, registro, reset senha)
- **`/app/onboarding/`** — Onboarding passageiro e motorista
- Rendering: Server Components + Client Components

### 3. API REST (`/app/api/v1/`)
- 81 arquivos route.ts com 137 handlers HTTP
- Autenticacao via Supabase JWT no header
- Padrao: validacao de input → query Supabase → response JSON
- Rate limiting via headers Vercel

### 4. Banco de Dados (Supabase PostgreSQL)
- 102 tabelas com relacionamentos FK
- 87+ RPCs para logica de negocio complexa
- RLS (Row Level Security) em todas as tabelas
- Realtime subscriptions para tracking e chat
- 288 indices de performance

---

## Fluxo de Autenticacao

```
1. Usuario acessa o app
2. proxy.ts verifica cookie de sessao Supabase
3. Se autenticado: continua para a rota
4. Se nao autenticado: redireciona para /auth/login
5. Login/Registro via Supabase Auth (email + senha)
6. JWT salvo em cookie HTTP-only
7. Todas as requests API validam o JWT via createServerClient
```

---

## Fluxo de Corrida (Tempo Real)

```
1. Passageiro entra a origem/destino
2. API calcula preco via RPC calculate_fare
3. Passageiro confirma → cria ride no banco (status: searching)
4. Supabase Realtime notifica motoristas proximos
5. Motorista aceita → ride.status = accepted, driver_id = motorista.id
6. FCM push para passageiro: "Motorista a caminho"
7. Motorista ativa GPS → upsert driver_locations a cada 5s
8. Passageiro ve motorista em tempo real no mapa
9. Motorista chega → status = arrived
10. Corrida inicia → status = in_progress
11. Corrida termina → status = completed
12. PIX Modal abre para o passageiro
13. Pagamento confirmado → wallet credita motorista
14. Ambos avaliam → reviews salvas no banco
```

---

## Componentes Chave

| Componente | Funcao |
|---|---|
| `CapacitorProvider` | Inicializa GPS, Push, StatusBar no Android |
| `PixModal` | Modal de pagamento PIX com polling |
| `GoogleMapsProvider` | Instancia unica do Google Maps |
| `ServiceWorker` | Cache offline, push web |
| `ClientProviders` | Wrapper de todos os providers |

---

## Seguranca

- Supabase RLS em todas as 102 tabelas
- JWT verificado em toda request server-side
- `SUPABASE_SERVICE_ROLE_KEY` nunca exposta ao cliente
- Parametros SQL sempre via Supabase client (previne SQL injection)
- Rate limiting nas APIs criticas (auth, pagamentos)
- Webhooks PIX validados por assinatura HMAC
