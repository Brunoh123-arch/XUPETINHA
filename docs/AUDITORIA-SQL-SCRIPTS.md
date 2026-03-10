# AUDITORIA DOS SCRIPTS SQL — UPPI

**Data:** 10/03/2026  
**Total de Scripts:** 83 arquivos .sql  
**Pasta:** /scripts/

---

## RESUMO EXECUTIVO

| Categoria | Quantidade | Status |
|-----------|------------|--------|
| Scripts de Setup Base | 12 | Alguns duplicados |
| Scripts de Tabelas | 15 | OK |
| Scripts de Features | 20 | OK |
| Scripts de RPCs | 8 | OK |
| Scripts de Seed | 5 | OK |
| Scripts de Admin | 3 | OK |
| Scripts de Realtime | 3 | Incompleto (4 vs 51 tabelas) |
| Scripts Duplicados | ~20 | PROBLEMA |

---

## PROBLEMAS IDENTIFICADOS

### 1. SCRIPTS DUPLICADOS (Prioridade Alta)

Varios scripts criam as mesmas tabelas com definicoes diferentes:

| Tabela | Scripts que criam |
|--------|-------------------|
| `profiles` | 001-setup-database.sql, 001_create_profiles_table.sql, 001_profiles.sql, create-profiles-table.sql |
| `driver_profiles` | 001-setup-database.sql, 001_create_all_tables.sql, 003_create_driver_profiles_table.sql |
| `rides` | 001-setup-database.sql, 001_create_all_tables.sql, 03-create-rides.sql |
| `price_offers` | 001-setup-database.sql, 001_create_all_tables.sql, 04-create-price-offers.sql |

**Recomendacao:** Usar apenas `000-migration-consolidada.sql` ou criar um unico script master.

### 2. INCONSISTENCIAS DE SCHEMA

#### Tabela `rides` - Diferentes definicoes:

**Script 001-setup-database.sql:**
```sql
status ride_status DEFAULT 'pending'  -- Usa ENUM
pickup_lat DECIMAL
```

**Script 001_create_all_tables.sql:**
```sql
status TEXT DEFAULT 'pending' CHECK (status IN (...))  -- Usa TEXT com CHECK
origin_lat DOUBLE PRECISION  -- Coluna diferente
```

**Recomendacao:** Padronizar para usar ENUMs ou TEXT com CHECK, nao misturar.

#### Tabela `driver_profiles` - Colunas inconsistentes:

| Coluna | 001-setup | 001_create_all | 000-consolidada |
|--------|-----------|----------------|-----------------|
| vehicle_type | ENUM | TEXT | ENUM |
| current_location | GEOGRAPHY | Nao tem | GEOGRAPHY |
| license_number | Tem | Nao tem | Tem como cnh |

### 3. REALTIME INCOMPLETO

O script `enable-realtime.sql` adiciona apenas 4 tabelas:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE price_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

**Problema:** A documentacao diz que 51 tabelas tem Realtime, mas o script so configura 4.

**Faltam:** driver_locations, payments, group_rides, support_tickets, emergency_alerts, etc.

### 4. FKs QUEBRAVEIS

Alguns scripts referenciam tabelas que podem nao existir ainda:

```sql
-- 012-tabelas-rpcs-faltantes.sql
REFERENCES public.social_posts(id)  -- social_posts precisa existir antes
REFERENCES public.promotions(id)    -- promotions precisa existir antes
```

**Recomendacao:** Criar dependencias em ordem correta ou usar IF EXISTS.

---

## LISTA COMPLETA DE SCRIPTS (83 arquivos)

### Scripts de Setup (Ordem de Execucao Recomendada)

1. `000-migration-consolidada.sql` — Migration completa (usar esta OU as outras)
2. `001-setup-database.sql` — Enums + 8 tabelas core + triggers
3. `002-financial-emergency.sql` — Tabelas financeiras
4. `003-reviews-social.sql` — Reviews e social
5. `004-groups-recordings-sms-webhooks.sql` — Groups e webhooks
6. `005-referrals-support.sql` — Referrals e suporte
7. `006-postgis-analytics-leaderboard.sql` — PostGIS e analytics
8. `007-admin-realtime.sql` — Admin e Realtime
9. `008-security-fixes.sql` — Correcoes de seguranca
10. `009-enable-more-realtime.sql` — Mais tabelas Realtime
11. `010-driver-popular-routes.sql` — Rotas populares
12. `011-address-history.sql` — Historico de enderecos
13. `012-tabelas-rpcs-faltantes.sql` — Tabelas e RPCs extras
14. `016-driver-withdrawals.sql` — Saques de motoristas
15. `017-missing-rpcs.sql` — RPCs faltantes

### Scripts Duplicados (NAO USAR - Redundantes)

- `001_create_all_tables.sql` — Duplica 001-setup
- `001_create_profiles_table.sql` — Duplica profiles
- `001_profiles.sql` — Duplica profiles
- `001_schema.sql` — Duplica schema
- `001_create_schema.sql` — Duplica schema
- `01-create-main-schema.sql` — Duplica schema
- `01-create-profiles.sql` — Duplica profiles
- `01-init-database.sql` — Duplica init
- `02-additional-tables.sql` — Duplica tabelas
- `02-create-additional-tables.sql` — Duplica tabelas
- `02-create-driver-profiles.sql` — Duplica driver_profiles
- `03-create-rides.sql` — Duplica rides
- `03-rls-policies.sql` — Duplica RLS
- `04-create-price-offers.sql` — Duplica price_offers
- `05-create-ratings.sql` — Duplica ratings
- `06-create-notifications.sql` — Duplica notifications
- `07-create-wallets.sql` — Duplica wallets
- `08-create-coupons.sql` — Duplica coupons

### Scripts de Features (Unicos - OK)

- `add-driver-verification.sql` — Verificacao de motorista
- `add-postgis-regions.sql` — Regioes PostGIS
- `add-referral-system.sql` — Sistema de indicacao
- `add-vehicle-type-to-rides.sql` — Tipo de veiculo
- `create-analytics-functions.sql` — Funcoes de analytics
- `create-bidirectional-reviews.sql` — Reviews bidirecionais
- `create-email-otps.sql` — OTP por email
- `create-enhanced-reviews.sql` — Reviews melhorados
- `create-error-logs-table.sql` — Logs de erro
- `create-group-rides.sql` — Corridas em grupo
- `create-heatmap-function.sql` — Funcao de heatmap
- `create-leaderboard.sql` — Leaderboard
- `create-nearby-drivers-function.sql` — Funcao find_nearby_drivers
- `create-ride-recordings.sql` — Gravacoes de corrida
- `create-sms-fallback.sql` — Fallback SMS
- `create-social-feed.sql` — Feed social
- `create-subscriptions.sql` — Assinaturas
- `create-support-chat.sql` — Chat de suporte
- `create-system-settings.sql` — Configuracoes do sistema
- `create-wallet-tables.sql` — Tabelas de carteira
- `create-webhooks.sql` — Webhooks

### Scripts de Seed

- `seed-system-settings.sql` — Seeds de configuracao
- `seed-test-data.sql` — Dados de teste

### Scripts de Admin

- `admin-schema.sql` — Schema admin
- `admin-setup.sql` — Setup admin
- `create-first-admin.sql` — Criar primeiro admin
- `promote-admin.sql` — Promover usuario a admin

---

## SCRIPT DE REALTIME CORRETO

Para habilitar Realtime em todas as 51 tabelas documentadas:

```sql
-- Habilitar Realtime para todas as tabelas necessarias
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS driver_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS rides;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS ride_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS messages;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS payments;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS price_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS group_rides;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS group_ride_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS social_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS social_post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS fcm_tokens;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS user_wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS wallet_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS user_achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS scheduled_rides;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS intercity_rides;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS intercity_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS delivery_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS surge_pricing;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS hot_zones;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS city_zones;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS driver_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS driver_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS driver_withdrawals;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS ratings;
-- ... (mais 17 tabelas)
```

---

## RECOMENDACOES

### 1. Consolidar Scripts
- Usar APENAS `000-migration-consolidada.sql` para novos deploys
- Remover ou arquivar scripts duplicados
- Criar pasta `/scripts/deprecated/` para scripts antigos

### 2. Padronizar Definicoes
- Escolher entre ENUMs ou TEXT com CHECK (recomendo ENUMs)
- Padronizar nomes de colunas (pickup_lat vs origin_lat)
- Unificar tipos de dados (DECIMAL vs NUMERIC vs DOUBLE PRECISION)

### 3. Corrigir Realtime
- Atualizar `enable-realtime.sql` para incluir todas as 51 tabelas
- Ou criar script `enable-all-realtime.sql` completo

### 4. Ordem de Execucao
Se nao usar a migration consolidada, executar nesta ordem:
1. Extensions (PostGIS, uuid-ossp)
2. ENUMs
3. Tabelas Core (profiles, driver_profiles, rides)
4. Tabelas Dependentes (price_offers, payments, etc)
5. RPCs e Funcoes
6. Triggers
7. RLS Policies
8. Realtime
9. Seeds

---

**Auditado em 10/03/2026** — 83 scripts SQL verificados
