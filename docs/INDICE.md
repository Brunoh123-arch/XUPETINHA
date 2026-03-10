# UPPI - Indice Completo do Projeto

**Ultima atualizacao:** 10/03/2026
**Versao:** 18.0 — Docs organizados (duplicados removidos)
**Projeto Supabase:** jpnwxqjrhzaobnugjnyx

---

## Numeros do Projeto

| Metrica | Valor |
|---------|-------|
| Tabelas PostgreSQL | **100** |
| Tabelas com RLS | **86** |
| Tabelas com Realtime | **51** |
| RPCs callable | **75** |
| Politicas RLS | **162** |
| Indices | **260** |
| Triggers | **34** |
| Migrations | **49** |
| Telas (page.tsx) | **149** |
| APIs (route.ts) | **81** |
| Admin Dashboard | **42 telas** |

---

## Estrutura de Documentacao (32 arquivos)

```
/
├── README.md                                   Visao geral do projeto

docs/
├── INDICE.md                                   VOCE ESTA AQUI - Mapa completo

├── AUDITORIAS/
│   ├── AUDITORIA-SENIOR.md                     Analise tecnica com problemas criticos
│   ├── AUDITORIA-SUPABASE-COMPLETA.md          100 tabelas, RPCs, RLS, Realtime
│   └── AUDITORIA-SQL-SCRIPTS.md                83 scripts SQL auditados

├── GUIAS/
│   ├── GUIA-SETUP-SUPABASE.md                  Passo-a-passo para novo Supabase
│   └── CONFIGURACAO-COMPLETA.md                Env vars, integracoes, proximos passos

├── STATUS/
│   └── 05-status/STATUS-FUNCIONALIDADES.md     Checklist completo atualizado

├── FRONTEND/
│   ├── 00-ANALISE-COMPLETA.md                  Analise geral do projeto
│   ├── 01-TELAS-E-FLUXOS.md                    149 telas documentadas
│   ├── 01-frontend/IMPLEMENTACAO.md            Componentes, hooks, UX
│   └── PAINEL-ADMIN.md                         42 paginas do admin

├── BACKEND/
│   ├── 02-backend-api/API-ENDPOINTS.md         81 route.ts documentados
│   ├── 02-backend-api/AUDITORIA-APIS.md        Auditoria de APIs
│   └── 02-backend-api/VERSIONAMENTO.md         Padrao /api/v1/

├── BANCO DE DADOS/
│   ├── 03-banco-de-dados/SCHEMA.md             100 tabelas detalhadas
│   ├── 03-banco-de-dados/AUDITORIA-COMPLETA.md Schema real verificado
│   └── 03-banco-de-dados/ANALISE-SCHEMAS-COMPLETA.md Todos os schemas

├── INFRAESTRUTURA/
│   ├── 04-infraestrutura/GOOGLE-MAPS.md        Setup e troubleshooting
│   ├── 04-infraestrutura/GOOGLE-MAPS-EXEMPLOS.md 10 exemplos praticos
│   └── 04-infraestrutura/TESTE-REALTIME.md     Guia de teste Realtime

├── FEATURES/
│   ├── 04-PLAY-STORE-CAPACITOR.md              Publicacao Android/Capacitor
│   ├── 05-DESENVOLVIMENTO-LOCAL.md             Setup local
│   ├── 06-VARIAVEIS-DE-AMBIENTE.md             Todas as env vars
│   ├── 07-ARQUITETURA.md                       Arquitetura do sistema
│   ├── 08-PAGAMENTOS-PIX.md                    Integracao PIX
│   ├── 09-SEGURANCA-RLS.md                     Row Level Security
│   ├── 10-GPS-E-TRACKING.md                    GPS nativo + tracking
│   └── 11-FIREBASE-FCM.md                      Push notifications

└── DESIGN/
    ├── 07-design/DESIGN-SYSTEM-IOS.md          Design system iOS completo
    └── 07-design/BUTTONS-COMPONENTS.md         Guia de componentes
```

---

## Scripts SQL (scripts/)

| Script | Descricao | Usar |
|--------|-----------|------|
| **SETUP-NOVO-SUPABASE.sql** | Setup completo para novo Supabase | PRINCIPAL |
| 000-migration-consolidada.sql | Migration master consolidada | Referencia |
| enable-realtime.sql | Habilita Realtime em 51 tabelas | Pos-setup |
| verify-database-integrity.sql | Auditoria do banco | Diagnostico |
| fix-missing-rls.sql | Corrige RLS faltante | Correcao |

---

## Documentos por Categoria

### Essenciais (ler primeiro)
1. `README.md` - Visao geral
2. `docs/05-status/STATUS-FUNCIONALIDADES.md` - Estado atual
3. `docs/GUIA-SETUP-SUPABASE.md` - Como configurar

### Desenvolvimento
1. `docs/01-TELAS-E-FLUXOS.md` - Todas as telas
2. `docs/02-backend-api/API-ENDPOINTS.md` - Todas as APIs
3. `docs/03-banco-de-dados/SCHEMA.md` - Schema do banco

### Seguranca
1. `docs/09-SEGURANCA-RLS.md` - RLS policies
2. `docs/AUDITORIA-SENIOR.md` - Problemas criticos

### Deploy
1. `docs/04-PLAY-STORE-CAPACITOR.md` - Android/Capacitor
2. `docs/06-VARIAVEIS-DE-AMBIENTE.md` - Env vars

---

## Tech Stack

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Next.js | 16.0.7 | Framework fullstack |
| React | 19 | UI library |
| TypeScript | 5.7.3 | Tipagem |
| Tailwind CSS | 3.4.17 | Estilos |
| Supabase | 2.47.x | Backend (Auth + DB + Realtime) |
| Capacitor | 8.x | App Android nativo |
| Google Maps | latest | Mapas e rotas |

---

## Arquivos Removidos (duplicados)

Os seguintes arquivos foram removidos por serem duplicados:

- `SUPABASE-CHECKLIST.md` (consolidado em AUDITORIA-SUPABASE-COMPLETA.md)
- `SUPABASE-RESUMO.md` (consolidado em AUDITORIA-SUPABASE-COMPLETA.md)
- `docs/SUPABASE-CONEXAO.md` (consolidado em GUIA-SETUP-SUPABASE.md)
- `docs/SUPABASE-GUIA-RAPIDO.md` (consolidado em GUIA-SETUP-SUPABASE.md)
- `docs/02-APIs.md` (duplicado de 02-backend-api/API-ENDPOINTS.md)
- `docs/03-BANCO-DE-DADOS.md` (duplicado de 03-banco-de-dados/SCHEMA.md)
- `docs/PUBLICAR-PLAY-STORE.md` (duplicado de 04-PLAY-STORE-CAPACITOR.md)
- `docs/06-deploy/PLAY-STORE.md` (duplicado de 04-PLAY-STORE-CAPACITOR.md)
- `docs/AUDITORIA-PROJETO.md` (consolidado em AUDITORIA-SENIOR.md)

---

**Atualizado em 10/03/2026** — 32 documentos organizados, 9 duplicados removidos
