# UPPI - Documentacao Completa

**Ultima Atualizacao:** 16/03/2026

---

## Documentos Disponiveis

| Documento | Descricao |
|-----------|-----------|
| [STATUS.md](./STATUS.md) | Status atual do projeto, auditoria completa |
| [GUIA-PUBLICACAO-PLAY-STORE.md](./GUIA-PUBLICACAO-PLAY-STORE.md) | Passo a passo para publicar na Play Store |
| [SETUP-SUPABASE.md](./SETUP-SUPABASE.md) | Como configurar novo projeto Supabase |
| [SCHEMA-BANCO.md](./SCHEMA-BANCO.md) | Documentacao completa do banco de dados |
| [EMAIL-TEMPLATES.md](./EMAIL-TEMPLATES.md) | Templates de email personalizados |
| [DEEP_LINKS_SETUP.md](./DEEP_LINKS_SETUP.md) | Configuracao de deep links Android/iOS |
| [SPLASH_ICON_SETUP.md](./SPLASH_ICON_SETUP.md) | Icones e splash screen |

---

## Resumo do Projeto

### Numeros

| Item | Quantidade | Status |
|------|------------|--------|
| Tabelas | 164 | OK |
| RLS Ativo | 163/164 | OK (99.4%) |
| Politicas RLS | 280 | OK |
| Indices | 483 | OK |
| CHECK Constraints | 579 | OK |
| Foreign Keys | 222 | OK |
| Triggers | 52 | OK |
| Funcoes | 762 | OK |
| Realtime | 22 tabelas | OK |
| Storage Buckets | 5 | OK |
| APIs | 99 rotas | OK |
| Componentes | 215 | OK |
| Paginas | 162 | OK |

### Backend - 100% Completo

- Todas as 164 tabelas criadas e configuradas
- RLS habilitado em 163 tabelas (apenas spatial_ref_sys do PostGIS sem)
- 22 tabelas com Realtime para atualizacoes em tempo real
- 5 Storage Buckets com RLS configurado
- 99 APIs cobrindo todas as funcionalidades

### Frontend - 100% Completo

- 162 paginas criadas
- 215 componentes reutilizaveis
- Design responsivo mobile-first
- Suporte a tema claro/escuro

### Mobile - Configurado

- Capacitor 8 inicializado
- Projeto Android pronto
- Aguardando configuracoes externas (Firebase, Google Maps)

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Backend | Supabase (PostgreSQL 15, Auth, Realtime, Storage) |
| Mobile | Capacitor 8 (Android), Firebase FCM |
| Mapas | Google Maps SDK, Navigation SDK |
| Pagamentos | PIX via Paradise Gateway |
| Geocoding | Google Maps Geocoding API |

---

## Estrutura de Pastas

```
/
├── app/                    # Paginas Next.js (App Router)
│   ├── api/               # APIs (99 rotas)
│   ├── (auth)/            # Paginas de autenticacao
│   ├── (app)/             # Paginas do app principal
│   └── admin/             # Painel administrativo
├── components/            # Componentes React (215)
├── lib/                   # Utilitarios e configuracoes
├── hooks/                 # Custom hooks
├── docs/                  # Documentacao
├── scripts/               # Scripts SQL
└── android/               # Projeto Android (Capacitor)
```

---

## Scripts SQL

```
scripts/
├── database-master.sql    # Resumo do banco (referencia)
├── create-first-admin.sql # Criar primeiro admin
├── promote-admin.sql      # Promover usuario a admin
└── README.md              # Documentacao dos scripts
```

**IMPORTANTE:** O banco ja esta configurado no Supabase. Esses scripts sao apenas para referencia ou novos projetos.

---

## Configuracoes Necessarias

### Ja Configurado (Backend)

- [x] Supabase conectado
- [x] 164 tabelas criadas
- [x] RLS em todas as tabelas
- [x] Realtime habilitado
- [x] Storage Buckets criados
- [x] Funcoes e Triggers
- [x] Indices otimizados

### Pendente (Configuracoes Externas)

- [ ] Firebase (google-services.json)
- [ ] Google Maps API Key
- [ ] ENCRYPTION_KEY no Vercel
- [ ] Conta Google Play Developer ($25)
- [ ] Keystore de assinatura Android
- [ ] Politica de Privacidade (URL)
- [ ] Icones do app (512x512)
- [ ] Screenshots para Play Store

---

## Variaveis de Ambiente

### Obrigatorias (Ja configuradas no Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=https://ullmjdgppucworavoiia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Pendentes (Voce precisa configurar)

```env
ENCRYPTION_KEY=sua-chave-de-32-caracteres
GOOGLE_MAPS_API_KEY=sua-api-key
PARADISE_PIX_TOKEN=token-do-gateway
CRON_SECRET=secret-para-cron-jobs
```

---

## Como Publicar na Play Store

Veja o guia completo em [GUIA-PUBLICACAO-PLAY-STORE.md](./GUIA-PUBLICACAO-PLAY-STORE.md)

Resumo:
1. Configurar Firebase e Google Maps
2. Gerar keystore de assinatura
3. Build do projeto: `npm run build:android`
4. Gerar AAB no Android Studio
5. Upload na Play Console
6. Preencher informacoes do app
7. Enviar para revisao

---

## Contato

App ID: `app.uppi.mobile`
Nome: Uppi
