# Uppi - Plataforma de Mobilidade Urbana

**Status:** Pronto para Play Store
**Stack:** Next.js 16 + React 19 + Supabase + Capacitor 8 + PIX
**Ultima Atualizacao:** 16/03/2026

---

## Resumo do Projeto

| Item | Quantidade | Status |
|------|------------|--------|
| Tabelas PostgreSQL | 275 | OK |
| Politicas RLS | 422+ | OK |
| Indices | 702+ | OK |
| Tabelas Realtime | 36 | OK |
| Storage Buckets | 5 | OK |
| APIs | 100 | OK |
| Paginas /uppi | 85 | OK |
| Paginas /admin | 42 | OK |
| Total Paginas | 135 | OK |

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (REST) |
| Banco de Dados | Supabase PostgreSQL + PostGIS |
| Autenticacao | Supabase Auth (email OTP, telefone, 2FA TOTP) |
| App Nativo | Capacitor 8 (Android) |
| Push Notifications | @capacitor/push-notifications (FCM) |
| GPS Nativo | @capacitor/geolocation + background-geolocation |
| Pagamentos | PIX (Paradise/EfiPay) |
| Mapas | @capacitor/google-maps + Google Maps API |
| Realtime | Supabase Realtime (36 tabelas) |
| Deploy Web | Vercel |
| Deploy App | Google Play Store |

---

## Estrutura de Pastas

```
uppi/
├── app/
│   ├── api/             # 100 rotas de API
│   │   ├── v1/          # Endpoints versionados
│   │   ├── pix/         # Webhook PIX externo
│   │   ├── email/       # Email transacional
│   │   ├── admin/       # Check admin
│   │   └── health/      # Health check
│   ├── uppi/            # 85 telas passageiro/motorista
│   ├── admin/           # 42 paginas do painel admin
│   └── auth/            # Autenticacao
├── components/          # Componentes React reutilizaveis
├── hooks/               # Hooks customizados
├── lib/
│   ├── supabase/        # Cliente Supabase + types
│   ├── services/        # Servicos (payment, tracking, etc)
│   ├── encryption.ts    # AES-256-GCM
│   ├── native.ts        # Helpers Capacitor nativos
│   └── storage.ts       # Storage wrapper
├── android/             # Projeto Android (Capacitor)
├── scripts/             # Scripts SQL
├── docs/                # Documentacao completa
└── capacitor.config.ts  # Config Capacitor
```

---

## Variaveis de Ambiente

```bash
# Supabase (obrigatorio)
NEXT_PUBLIC_SUPABASE_URL=https://ullmjdgppucworavoiia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Google Maps (obrigatorio para mapas)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
GOOGLE_MAPS_API_KEY=...

# Firebase FCM (obrigatorio para push)
FIREBASE_SERVER_KEY=...

# PIX Paradise Gateway
PARADISE_API_KEY=...
PARADISE_API_URL=...
PARADISE_PRODUCT_HASH=...

# Criptografia (obrigatorio para CPF e 2FA)
# Gerar com: openssl rand -base64 32
ENCRYPTION_KEY=...

# Opcional
CRON_SECRET=...
RESEND_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

---

## Publicar na Play Store

### 1. Configurar Firebase
```bash
# 1. Criar projeto no Firebase Console
# 2. Adicionar app Android com ID: app.uppi.mobile
# 3. Baixar google-services.json
# 4. Copiar para android/app/
```

### 2. Configurar Google Maps
```bash
# 1. Ativar Maps SDK for Android no Google Cloud
# 2. Criar API Key com restricao para app.uppi.mobile
# 3. Editar android/app/src/main/res/values/strings.xml
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
# 1. Criar conta Google Play Developer ($25)
# 2. Upload do AAB
# 3. Preencher ficha da loja
# 4. Enviar para revisao
```

---

## Banco de Dados — 275 Tabelas

| Categoria | Qtd | Principais Tabelas |
|-----------|-----|-------------------|
| Usuarios | 31 | profiles, user_2fa, trust_score, avatars |
| Motoristas | 20 | driver_profiles, driver_documents, driver_withdrawals |
| Veiculos | 5 | vehicles, vehicle_inspections |
| Corridas | 20 | rides, ride_tracking, ride_offers, delivery_orders |
| Avaliacoes | 9 | reviews, enhanced_reviews, bidirectional_reviews |
| Financeiro | 13 | user_wallets, wallet_transactions, pix_transactions |
| Cupons | 9 | coupons, promo_codes, user_coupons |
| Comunicacao | 9 | messages, notifications, push_log, user_push_tokens |
| Suporte | 5 | support_tickets, support_messages, faqs |
| Emergencia | 9 | emergency_alerts, sos_alerts, emergency_events |
| Localizacao | 21 | favorites, hot_zones, surge_pricing, zone_pricing |
| Social | 5 | social_posts, post_comments, social_post_likes |
| Referral/Gamif. | 6 | referrals, achievements, leaderboard |
| Autenticacao | 3 | email_otps, user_2fa, user_2fa_backup_codes |
| Admin/Sistema | 12 | system_settings, pricing_rules, error_logs |
| Integracoes | 10 | webhook_endpoints, webhook_deliveries, sms_deliveries |
| Familia/Grupo | 3 | family_members, family_groups |
| Assinaturas | 2 | subscriptions, subscription_plans |
| Passageiros | 2 | passenger_achievements, passenger_stats |
| Marketing/A/B | 4 | ab_test_participants, app_banners |

---

## Fluxo de Corrida

```
PASSAGEIRO:
  Home → Inserir Origem/Destino → Estimar Preco →
  Solicitar → Buscar Motorista → Acompanhar GPS →
  Finalizar → Pagar PIX → Avaliar

MOTORISTA:
  Home → Aceitar Corrida → Navegar ate Passageiro →
  Iniciar → Navegar ate Destino → Finalizar → Ver Ganhos

ADMIN:
  Dashboard → Monitor Tempo Real → Moderacao →
  Financeiro → Suporte → Configuracoes
```

---

## Documentacao

| Documento | Conteudo |
|-----------|----------|
| [STATUS.md](docs/STATUS.md) | Auditoria completa — metricas reais |
| [SCHEMA-BANCO.md](docs/SCHEMA-BANCO.md) | Todas as 275 tabelas por categoria |
| [API-REFERENCE.md](docs/API-REFERENCE.md) | 100 endpoints documentados |
| [FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) | 160+ funcionalidades detalhadas |
| [SEGURANCA.md](docs/SEGURANCA.md) | RLS, criptografia, checklist |
| [VARIAVEIS-AMBIENTE.md](docs/VARIAVEIS-AMBIENTE.md) | Variaveis e como configurar |
| [GUIA-PUBLICACAO-PLAY-STORE.md](docs/GUIA-PUBLICACAO-PLAY-STORE.md) | Passo a passo Play Store |
| [SETUP-SUPABASE.md](docs/SETUP-SUPABASE.md) | Configuracao do Supabase |
| [DEEP_LINKS_SETUP.md](docs/DEEP_LINKS_SETUP.md) | Deep links Android/iOS |
| [EMAIL-TEMPLATES.md](docs/EMAIL-TEMPLATES.md) | Templates de email |
| [SPLASH_ICON_SETUP.md](docs/SPLASH_ICON_SETUP.md) | Icones e splash screen |

---

## Licenca

Proprietario — Uppi App
