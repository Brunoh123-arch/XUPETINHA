# Guia de Setup - Novo Projeto Supabase

**Data:** 14/03/2026
**Versao:** 2.0 — Contagem definitiva: 155 tabelas unicas nos scripts

---

## Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote o **Project ID** e as **API Keys**

### 2. Executar o Script de Setup

1. No Supabase Dashboard, va para **SQL Editor**
2. Copie e cole o conteudo de `scripts/SETUP-NOVO-SUPABASE.sql`
3. Clique em **Run**
4. Aguarde a execucao (pode levar 1-2 minutos)

### 3. Verificar a Instalacao

Apos executar, voce vera uma mensagem como:
```
SETUP COMPLETO!
Tabelas criadas: 100
Tabelas com RLS: 86
```

> **Nota:** O script `SETUP-NOVO-SUPABASE.sql` cria as 100 tabelas base. Para as 55 tabelas adicionais definidas nos scripts pendentes (012, 050, 06, 07, 05), execute-os separadamente apos o setup principal.

### 4. Configurar Variaveis de Ambiente

Copie as chaves do Supabase (Settings > API) e configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

---

## O Que o Script Cria

| Categoria | Quantidade | Detalhes |
|-----------|------------|----------|
| Tabelas (script SETUP-NOVO-SUPABASE.sql) | 100 | Tabelas base do UPPI |
| Tabelas nos scripts pendentes (012, 050, 06, 07, 05) | +55 | Tabelas extras nao aplicadas |
| **Total unico nos scripts** | **155** | Deduplicated |
| ENUMs | 12 | Tipos customizados |
| RLS Policies | 162 | Seguranca por linha |
| Realtime | 51 tabelas | Atualizacoes em tempo real |
| RPCs | 75 | Funcoes de negocio |
| Triggers | 34 | Automacoes |
| Indices | 260 | Performance |
| Seed Data | Config + Achievements | Dados iniciais |

---

## Tabelas Criadas

### Core
- `profiles` - Usuarios
- `driver_profiles` - Motoristas
- `vehicles` - Veiculos
- `driver_locations` - GPS dos motoristas

### Corridas
- `rides` - Corridas
- `price_offers` - Ofertas de preco
- `ride_tracking` - Rastreamento GPS
- `messages` - Chat

### Financeiro
- `user_wallets` - Carteiras
- `wallet_transactions` - Transacoes
- `payments` - Pagamentos
- `driver_withdrawals` - Saques
- `coupons` - Cupons

### Social/Gamificacao
- `achievements` - Conquistas
- `user_achievements` - Conquistas do usuario
- `leaderboard` - Ranking
- `referrals` - Indicacoes
- `social_posts` - Posts
- `social_post_likes` - Curtidas
- `post_comments` - Comentarios

### Corridas Especiais
- `scheduled_rides` - Agendadas
- `group_rides` - Compartilhadas
- `intercity_rides` - Intermunicipais
- `delivery_orders` - Entregas

### Suporte/Admin
- `support_tickets` - Tickets
- `support_messages` - Mensagens
- `admin_logs` - Logs admin
- `system_config` - Configuracoes

---

## RPCs Disponiveis

| RPC | Descricao |
|-----|-----------|
| `find_nearby_drivers(lat, lng, radius, vehicle_type)` | Busca motoristas proximos |
| `accept_ride(ride_id, driver_id, offer_id)` | Aceita uma corrida |
| `complete_ride(ride_id)` | Completa uma corrida |
| `upsert_driver_location(lat, lng, heading, speed)` | Atualiza GPS do motorista |
| `request_withdrawal(amount, pix_key, pix_key_type)` | Solicita saque |
| `get_wallet_balance()` | Retorna saldo da carteira |

---

## Apos o Setup

### Scripts Adicionais (Opcionais)

Se precisar de mais funcionalidades, execute na ordem:

1. `scripts/enable-realtime.sql` - Mais tabelas com Realtime
2. `scripts/fix-missing-rls.sql` - Corrige RLS faltante
3. `scripts/verify-database-integrity.sql` - Verificacao de integridade

### Testar a Conexao

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Testar
const { data, error } = await supabase.from('profiles').select('count')
console.log('Conexao OK:', data)
```

---

## Troubleshooting

### Erro: "relation already exists"
O script usa `CREATE TABLE IF NOT EXISTS`, entao pode ser executado novamente sem problemas.

### Erro: "permission denied"
Certifique-se de estar executando como owner do projeto.

### Erro no PostGIS
A extensao PostGIS pode nao estar disponivel em todos os planos. Verifique se seu plano suporta.

---

## Arquivos de Scripts

| Arquivo | Descricao |
|---------|-----------|
| `SETUP-NOVO-SUPABASE.sql` | Setup completo (use este!) |
| `000-migration-consolidada.sql` | Versao anterior |
| `enable-realtime.sql` | Habilita Realtime em 51 tabelas |
| `fix-missing-rls.sql` | Corrige RLS faltante |
| `verify-database-integrity.sql` | Auditoria do banco |

---

**Pronto!** Apos seguir estes passos, seu novo projeto Supabase estara configurado com 100 tabelas base, 75 RPCs, 162 politicas RLS, 51 tabelas com Realtime e todas as configuracoes do UPPI. Para as 55 tabelas extras nos scripts pendentes, execute-os na sequencia indicada acima.

**Atualizado em 14/03/2026** — v2.0
