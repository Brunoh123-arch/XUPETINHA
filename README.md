# Uppi - Plataforma de Mobilidade Urbana

**Status:** Pronto para Play Store  
**Stack:** Next.js 16 + React 19 + Supabase + Capacitor 8 + PIX  
**Ultima Atualizacao:** 16/03/2026

---

## Resumo do Projeto

| Item | Quantidade | Status |
|------|------------|--------|
| Tabelas PostgreSQL | 164 | OK |
| Politicas RLS | 280 | OK |
| Indices | 483 | OK |
| Foreign Keys | 222 | OK |
| CHECK Constraints | 579 | OK |
| Triggers | 52 | OK |
| Funcoes | 762 | OK |
| Tabelas Realtime | 22 | OK |
| Storage Buckets | 5 | OK |
| APIs | 99 | OK |
| Paginas | 162 | OK |
| Componentes | 215 | OK |

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (REST) |
| Banco de Dados | Supabase PostgreSQL + PostGIS |
| Autenticacao | Supabase Auth (email, telefone, Google) |
| App Nativo | Capacitor 8 (Android + iOS) |
| Storage Nativo | @capacitor/preferences |
| Push Notifications | @capacitor/push-notifications (FCM) |
| GPS Nativo | @capacitor/geolocation + background-geolocation |
| Pagamentos | PIX (Paradise Gateway) |
| Mapas | @capacitor/google-maps |
| Realtime | Supabase Realtime |
| Deploy Web | Vercel |
| Deploy App | Google Play Store |

---

## Estrutura de Pastas

```
uppi/
├── app/
│   ├── api/v1/          # 99 rotas de API
│   ├── uppi/            # Telas passageiro/motorista
│   ├── admin/           # Dashboard administrativo
│   └── auth/            # Autenticacao
├── components/          # 215 componentes
├── hooks/               # Hooks customizados
├── lib/
│   ├── supabase/        # Cliente Supabase
│   ├── services/        # Servicos (payment, tracking)
│   ├── native.ts        # Helpers nativos
│   └── storage.ts       # Storage wrapper
├── android/             # Projeto Android (Capacitor)
├── scripts/             # Scripts SQL essenciais
├── docs/                # Documentacao completa
└── capacitor.config.ts  # Config Capacitor
```

---

## Variaveis de Ambiente

```bash
# Supabase (obrigatorio)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Maps (obrigatorio)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_API_KEY=

# Firebase FCM (obrigatorio para push)
FIREBASE_SERVER_KEY=

# PIX Paradise Gateway (obrigatorio para pagamentos)
PARADISE_API_KEY=
PARADISE_API_URL=
PARADISE_PRODUCT_HASH=

# Criptografia (obrigatorio)
ENCRYPTION_KEY=

# Webhooks
CRON_SECRET=
```

---

## Publicar na Play Store

### 1. Configurar Firebase
```bash
# Criar projeto no Firebase Console
# Baixar google-services.json
# Copiar para android/app/
```

### 2. Configurar Google Maps
```bash
# Ativar Maps SDK for Android no Google Cloud
# Criar API Key
# Editar android/app/src/main/res/values/strings.xml
```

### 3. Build do APK
```bash
npm install
npm run build:android
npm run android:open
# No Android Studio: Build > Generate Signed Bundle / APK
```

### 4. Publicar
```bash
# Criar conta Google Play Developer ($25)
# Upload do AAB
# Preencher ficha da loja
# Enviar para revisao
```

---

## Documentacao

| Documento | Conteudo |
|-----------|----------|
| [STATUS.md](docs/STATUS.md) | Auditoria completa do projeto |
| [SCHEMA-BANCO.md](docs/SCHEMA-BANCO.md) | Todas as 164 tabelas |
| [GUIA-PUBLICACAO-PLAY-STORE.md](docs/GUIA-PUBLICACAO-PLAY-STORE.md) | Passo a passo Play Store |
| [SETUP-SUPABASE.md](docs/SETUP-SUPABASE.md) | Configuracao Supabase |
| [DEEP_LINKS_SETUP.md](docs/DEEP_LINKS_SETUP.md) | Deep links Android/iOS |
| [EMAIL-TEMPLATES.md](docs/EMAIL-TEMPLATES.md) | Templates de email |
| [SPLASH_ICON_SETUP.md](docs/SPLASH_ICON_SETUP.md) | Icones e splash |

---

## Fluxo de Corrida

```
PASSAGEIRO:
  Home → Solicitar → Buscar Motorista → Acompanhar → Pagar PIX → Avaliar

MOTORISTA:
  Home → Aceitar Corrida → Navegar → Finalizar → Ver Ganhos

ADMIN:
  Dashboard → Analytics → Moderacao → Financeiro → Suporte
```

---

## Banco de Dados - 164 Tabelas

### Por Categoria

| Categoria | Qtd | Principais Tabelas |
|-----------|-----|-------------------|
| Usuarios | 18 | profiles, user_settings, user_2fa, addresses |
| Motoristas | 16 | driver_profiles, driver_documents, driver_earnings |
| Veiculos | 4 | vehicles, vehicle_inspections |
| Corridas | 18 | rides, ride_requests, ride_locations, scheduled_rides |
| Financeiro | 14 | wallets, payments, withdrawals, refunds |
| Precos | 8 | ride_pricing_rules, surge_pricing, zone_pricing |
| Social | 12 | social_posts, follows, achievements, leaderboard |
| Comunicacao | 10 | messages, notifications, fcm_tokens |
| Emergencia | 6 | emergency_alerts, sos_events, incident_reports |
| Suporte | 6 | support_tickets, support_messages |
| Marketing | 10 | campaigns, promotions, coupons, in_app_banners |
| Admin | 8 | admin_users, admin_actions, system_config |
| Logs | 12 | error_logs, email_logs, sms_logs, webhook_logs |
| Outros | 22 | Lookup tables, configuracoes |

### Realtime Ativo (22 tabelas)

rides, ride_locations, ride_requests, driver_availability, messages, 
notifications, emergency_alerts, sos_events, price_negotiations, 
price_offers, group_rides, scheduled_rides, delivery_rides, 
payment_splits, ride_disputes, support_conversations, etc.

### Storage Buckets (5)

| Bucket | Uso |
|--------|-----|
| avatars | Fotos de perfil |
| driver-documents | CNH, CRLV |
| vehicle-photos | Fotos do veiculo |
| ride-recordings | Gravacoes de seguranca |
| support-attachments | Anexos de suporte |

---

## Licenca

Proprietario - Uppi App
