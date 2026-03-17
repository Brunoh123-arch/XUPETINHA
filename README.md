# Uppi - Plataforma de Mobilidade Urbana

**Status:** Producao — Banco 100% limpo e alinhado
**Stack:** Next.js 16 + React 19 + Supabase + Capacitor 8 + PIX
**Ultima Atualizacao:** 16/03/2026

---

## Resumo do Projeto

| Item | Quantidade | Status |
|------|------------|--------|
| Tabelas PostgreSQL | 192 | OK |
| Politicas RLS | 302 | OK |
| Indices | 508 | OK |
| Tabelas Realtime | 36 | OK |
| Storage Buckets | 5 | OK |
| APIs | 98 | OK |
| Paginas /uppi | 102 | OK |
| Paginas /admin | 59 | OK |
| Total Paginas | 161+ | OK |
| Tabelas lixo removidas | 88 | FEITO |

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
│   ├── api/             # 98 rotas de API
│   │   ├── v1/          # Endpoints versionados
│   │   ├── pix/         # Webhook PIX externo
│   │   ├── email/       # Email transacional
│   │   ├── admin/       # Check admin
│   │   └── health/      # Health check
│   ├── uppi/            # 103 telas passageiro/motorista
│   ├── admin/           # 50 paginas do painel admin
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

## Banco de Dados — 192 Tabelas (limpas, sem duplicatas)

| Categoria | Qtd | Principais Tabelas |
|-----------|-----|-------------------|
| Usuarios | 18 | profiles, user_2fa, trust_score, blocked_users, user_devices, user_sessions |
| Motoristas | 16 | driver_profiles, driver_documents, driver_performance, driver_levels, driver_training |
| Veiculos | 5 | vehicles, vehicle_types, vehicle_categories |
| Corridas | 14 | rides, ride_tracking, ride_offers, scheduled_rides, delivery_orders, ride_disputes |
| Pagamentos | 10 | payments, wallets, wallet_transactions, payment_splits, refunds |
| Avaliacoes | 8 | reviews, enhanced_reviews, ride_ratings, bidirectional_reviews |
| Cupons/Promo | 6 | coupons, promo_codes, campaigns, feature_flags |
| Comunicacao | 8 | messages, notifications, push_log, announcements, email_templates |
| Suporte | 6 | support_tickets, support_messages, faqs, knowledge_base_articles |
| Seguranca | 6 | emergency_alerts, sos_events, ride_cancellations, user_reports |
| Localizacao | 14 | favorites, hot_zones, surge_pricing, service_areas, airports |
| Social/Gamif. | 8 | social_posts, post_comments, user_points, cashback_earned, user_badges |
| Referral | 4 | referrals, referral_achievements, user_achievements, leaderboard |
| Admin | 8 | admin_roles, admin_permissions, admin_users, admin_actions |
| Sistema | 10 | system_settings, app_versions, feature_flags, maintenance_windows |
| Integracao | 6 | webhook_endpoints, webhook_deliveries, sms_logs, email_logs |
| Familia | 2 | family_members, emergency_contacts |
| Corporativo | 2 | corporate_accounts, corporate_invoices |
| Seguros | 2 | trip_insurance, insurance_claims |
| Fiscal | 3 | tax_records, invoices, invoice_items |

---

## Fluxo de Corrida

```
PASSAGEIRO:
  Home → Inserir Origem/Destino → Estimar Preco →
  Solicitar → Buscar Motorista → Acompanhar GPS →
  Finalizar → Pagar PIX → Avaliar → Reportar (opcional)

MOTORISTA:
  Home → Aceitar Corrida → Navegar ate Passageiro →
  Iniciar → Navegar ate Destino → Finalizar → Ver Ganhos

ADMIN:
  Dashboard → Monitor Tempo Real → Moderacao →
  Financeiro → Suporte → Configuracoes → Feature Flags
```

---

## Telas por Categoria

### Passageiro (/uppi) — 102 paginas
- Corridas: solicitar, rastrear, avaliar, disputar, reembolsar, dividir, reportar, experiencia
- Motorista: home, ganhos, documentos, desempenho, preferencias, treinamento, fiscal
- Configuracoes: 2FA, sessoes, bloqueados, preferencias de viagem
- Social: feed, conquistas, pontos/emblemas, clube, leaderboard
- Seguranca: SOS, gravacoes, contatos emergencia
- Corporativo: conta empresa, funcionarios, faturas mensais

### Admin (/admin) — 59 paginas
- Operacoes: reembolsos, disputas, incentivos, cashback, feature flags, faturas, experimentos
- Motoristas: verificacao, documentos, performance individual
- Marketing: campanhas, promocoes, cupons, experiments A/B
- Parceiros: corporativo, hoteis, lista de espera
- Sistema: equipe admin, permissoes, comunicacoes, auditoria, versoes app, aeroportos
- Conhecimento: base de ajuda, templates push/email, banners in-app

---

## Documentacao

| Documento | Conteudo |
|-----------|----------|
| [STATUS.md](docs/STATUS.md) | Auditoria completa — metricas reais |
| [SCHEMA-BANCO.md](docs/SCHEMA-BANCO.md) | Todas as 192 tabelas por categoria |
| [API-REFERENCE.md](docs/API-REFERENCE.md) | 98 endpoints documentados |
| [FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) | 180+ funcionalidades detalhadas |
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
