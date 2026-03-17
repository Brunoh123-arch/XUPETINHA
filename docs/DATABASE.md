# XUPETINHA — Documentação do Banco de Dados

> Gerado automaticamente em: **2026-03-17**
> Migrations aplicadas: **001 → 015**
> Total de tabelas: **~130**
> Total de índices: **~430**

---

## Visão Geral

O banco usa **Supabase (PostgreSQL)** com as seguintes camadas de segurança e funcionalidade:

| Camada | Status |
|--------|--------|
| Row Level Security (RLS) | ✅ Habilitado em todas as tabelas |
| Índices de FK | ✅ 120 índices adicionados (migration 015) |
| Search Path nas funções | ✅ Corrigido (migration 014) |
| Realtime Publications | ✅ 10 tabelas publicadas |
| Triggers automáticos | ✅ 60+ triggers |

---

## SQL Master

O arquivo [`scripts/000_master_schema.sql`](../scripts/000_master_schema.sql) contém o schema completo e pode ser executado do zero em qualquer instância Supabase para recriar o banco inteiro.

---

## Migrations Aplicadas

| # | Nome | Descrição |
|---|------|-----------|
| 001 | `001_base_tables_no_fk` | Tabelas independentes (profiles, vehicle_categories, etc.) |
| 002 | `002_profile_dependent_tables` | Tabelas que dependem de profiles |
| 003 | `003_rides_and_financial_tables` | Rides, payments, wallets, financeiro |
| 004 | `004_social_support_security_tables` | Social, suporte, segurança |
| 005 | `005_corporate_gamification_analytics_tables` | Corporativo, gamificação, analytics |
| 006 | `006_remaining_tables` | Tabelas restantes |
| 007 | `007_rls_enable_and_policies` | Habilitar RLS + políticas base |
| 008 | `008_rls_policies_users_and_admin` | Políticas de usuário e admin |
| 009 | `009_rls_policies_rides_payments_social` | Políticas de corridas, pagamentos, social |
| 010 | `010_realtime_publications` | Publicações Realtime |
| 011 | `011_performance_indexes` | Índices de performance nas tabelas críticas |
| 012 | `012_triggers_and_functions` | Triggers e funções PL/pgSQL |
| 013 | `013_seed_data` | Dados iniciais (vehicle_categories, driver_level_config, etc.) |
| 014 | `014_fix_function_search_paths` | Fix `search_path` em todas as funções (security) |
| 015 | `015_missing_fk_indexes` | 120 índices nas colunas FK faltantes |

---

## Grupos de Tabelas

### 👤 Usuários / Perfis

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfil principal de todo usuário (passengers e drivers) |
| `user_settings` | Preferências de UI e notificações |
| `user_points` | Sistema de pontos/gamificação |
| `user_sessions` | Sessões ativas |
| `user_devices` | Dispositivos registrados |
| `user_2fa` | Autenticação de dois fatores |
| `user_verifications` | Verificações de identidade |
| `user_documents` | Documentos enviados pelo usuário |
| `user_addresses` | Endereços salvos |
| `user_activity_log` | Log de ações do usuário |
| `user_achievements` | Conquistas desbloqueadas |
| `user_badges` | Badges ganhos |
| `user_challenges` | Desafios em andamento |
| `user_coupons` | Cupons atribuídos ao usuário |
| `user_subscriptions` | Planos de assinatura ativos |
| `notification_preferences` | Preferências de notificações |
| `fcm_tokens` | Tokens FCM para push notifications |
| `blocked_users` | Usuários bloqueados |
| `favorite_drivers` | Motoristas favoritos |
| `favorite_locations` | Locais favoritos |
| `saved_routes` | Rotas salvas |

### 🚗 Motoristas

| Tabela | Descrição |
|--------|-----------|
| `driver_profiles` | Perfil completo do motorista |
| `driver_stats` | Estatísticas agregadas |
| `driver_locations` | Localização em tempo real |
| `driver_vehicles` | Veículos cadastrados |
| `driver_documents` | Documentos do motorista |
| `driver_compliance` | Conformidade regulatória |
| `driver_fiscal` | Dados fiscais (MEI, NF-e) |
| `driver_nfse` | Notas fiscais emitidas |
| `driver_payout_config` | Config de pagamentos/saques |
| `driver_earnings` | Ganhos por corrida |
| `driver_commissions` | Comissões calculadas |
| `driver_bonuses` | Bônus concedidos |
| `driver_penalties` | Penalidades aplicadas |
| `driver_breaks` | Pausas do motorista |
| `driver_goals` | Metas diárias/semanais |
| `driver_incentives` | Incentivos campanhas |
| `driver_rankings` | Rankings por período |
| `driver_ratings` | Avaliações recebidas |
| `driver_reviews` | Reviews públicos |
| `driver_availability` | Disponibilidade por dia/horário |
| `driver_schedule` | Agenda semanal |
| `driver_zones` | Zonas preferidas |
| `driver_accessibility` | Recursos de acessibilidade |
| `driver_training` | Treinamentos |
| `driver_performance_reports` | Relatórios de performance |
| `driver_level_config` | Configuração dos níveis (bronze/silver/gold/diamond) |

### 🛣️ Corridas

| Tabela | Descrição |
|--------|-----------|
| `rides` | Corrida principal |
| `ride_requests` | Solicitações enviadas a motoristas |
| `ride_tracking` | GPS tracking em tempo real |
| `ride_ratings` | Avaliações da corrida |
| `passenger_ratings` | Passageiro avaliado pelo motorista |
| `ride_cancellations` | Cancelamentos com motivo/taxa |
| `ride_incidents` | Incidentes reportados |
| `ride_complaints` | Reclamações |
| `ride_stops` | Paradas intermediárias |
| `ride_waypoints` | Waypoints da rota |
| `ride_receipts` | Recibo detalhado |
| `ride_chat` | Chat da corrida |
| `ride_share_links` | Links de compartilhamento |
| `ride_recordings` | Gravações de áudio |
| `ride_tolls` | Pedágios cobrados |
| `ride_accessibility` | Recursos de acessibilidade usados |
| `ride_estimates` | Estimativas antes de solicitar |
| `ride_insurance` | Seguro da corrida |
| `ride_history_summary` | Resumo mensal do usuário |
| `price_offers` | Ofertas de preço do motorista |
| `price_negotiations` | Negociações de preço |
| `delivery_rides` | Corridas de entrega |
| `scheduled_rides` | Corridas agendadas |
| `ride_pools` | Pools de corridas compartilhadas |
| `ride_pool_passengers` | Passageiros em pool |
| `messages` | Mensagens entre usuário/motorista |
| `chat_rooms` | Salas de chat |
| `chat_messages` | Mensagens no chat |

### 💰 Financeiro

| Tabela | Descrição |
|--------|-----------|
| `wallets` | Carteira digital |
| `wallet_transactions` | Todas as movimentações |
| `payments` | Pagamentos (PIX, cartão) |
| `payment_methods` | Métodos de pagamento salvos |
| `payment_disputes` | Disputas |
| `payment_webhooks` | Webhooks de gateways |
| `pix_keys` | Chaves PIX cadastradas |
| `withdrawals` | Saques |
| `refunds` | Estornos |
| `invoices` | Notas fiscais/recibos |
| `platform_revenue` | Receita da plataforma |
| `driver_commissions` | Comissões calculadas |
| `cashback_rules` | Regras de cashback |
| `cashback_transactions` | Cashback creditado |
| `tips` | Gorjetas |
| `coupons` | Cupons de desconto |
| `user_coupons` | Cupons do usuário |
| `promotions` | Promoções ativas |
| `promotion_usage` | Uso de promoções |
| `taxes` | Taxas configuráveis |
| `financial_reports` | Relatórios financeiros |

### 🌐 Social

| Tabela | Descrição |
|--------|-----------|
| `social_posts` | Posts dos usuários |
| `social_comments` | Comentários |
| `social_likes` | Curtidas em posts/comentários |
| `social_follows` | Seguidores |
| `social_shares` | Compartilhamentos |
| `social_reports` | Denúncias de conteúdo |

### 🔔 Notificações

| Tabela | Descrição |
|--------|-----------|
| `notifications` | Notificações do usuário |
| `notification_preferences` | Preferências |
| `notification_templates` | Templates de notificação |
| `push_logs` | Log de pushes enviados |
| `scheduled_notifications` | Notificações agendadas |
| `fcm_tokens` | Tokens FCM |
| `in_app_messages` | Mensagens in-app |
| `in_app_message_views` | Visualizações |
| `announcements` | Anúncios globais |

### 🏢 Corporativo

| Tabela | Descrição |
|--------|-----------|
| `corporate_accounts` | Contas corporativas |
| `corporate_employees` | Funcionários |
| `corporate_policies` | Políticas de uso |
| `corporate_invoices` | Faturas corporativas |
| `corporate_rides` | Corridas corporativas |

### 🎮 Gamificação

| Tabela | Descrição |
|--------|-----------|
| `achievements` | Definições de conquistas |
| `user_achievements` | Conquistas do usuário |
| `badge_definitions` | Definições de badges |
| `user_badges` | Badges do usuário |
| `challenges` | Desafios disponíveis |
| `user_challenges` | Progresso nos desafios |
| `rewards` | Recompensas no catálogo |
| `reward_redemptions` | Resgates de recompensas |
| `leaderboards` | Ranking global |
| `streaks` | Sequências de atividade |
| `points_transactions` | Movimentações de pontos |
| `user_points` | Pontos acumulados |

### 🗺️ Zonas e Pricing

| Tabela | Descrição |
|--------|-----------|
| `city_zones` | Zonas da cidade |
| `city_configurations` | Configurações por cidade |
| `geographic_zones` | Zonas geográficas gerais |
| `geo_fences` | Cercas geográficas |
| `hot_zones` | Zonas de alta demanda |
| `surge_pricing` | Preço dinâmico ativo |
| `surge_history` | Histórico de surge |
| `traffic_conditions` | Condições de tráfego |
| `weather_conditions` | Condições climáticas |
| `analytics_zones` | Analytics por zona |
| `pricing_rules` | Regras de precificação |
| `service_areas` | Áreas de atendimento |
| `airports` | Aeroportos com regras especiais |
| `event_locations` | Locais de eventos |

### 🛡️ Segurança

| Tabela | Descrição |
|--------|-----------|
| `user_2fa` | Autenticação 2FA |
| `user_sessions` | Sessões ativas |
| `login_attempts` | Tentativas de login |
| `ip_blocklist` | IPs bloqueados |
| `rate_limits` | Controle de rate limit |
| `fraud_alerts` | Alertas de fraude |
| `emergency_alerts` | Alertas SOS |
| `safety_checkins` | Check-ins de segurança |
| `safety_reports` | Relatórios de segurança |
| `user_reports` | Denúncias de usuários |
| `admin_audit_logs` | Auditoria de ações admin |

### 🔧 Suporte e Admin

| Tabela | Descrição |
|--------|-----------|
| `support_tickets` | Tickets de suporte |
| `support_messages` | Mensagens dos tickets |
| `feedback` | Feedback geral |
| `feedback_categories` | Categorias de feedback |
| `app_feedback` | Feedback do app |
| `knowledge_base_articles` | Base de conhecimento |
| `faqs` | Perguntas frequentes |
| `admin_roles` | Funções de admin |
| `admin_members` | Membros da equipe admin |
| `admin_notifications` | Notificações para admins |

### ⚙️ Configuração

| Tabela | Descrição |
|--------|-----------|
| `app_config` | Configurações do app |
| `system_config` | Config do sistema |
| `system_settings` | Configurações gerais |
| `feature_flags` | Feature flags |
| `app_versions` | Versões do app |
| `maintenance_windows` | Janelas de manutenção |
| `vehicle_categories` | Categorias de veículos |
| `vehicle_types` | Tipos de veículo |
| `vehicle_inspections` | Inspeções de veículos |
| `insurance_policies` | Apólices de seguro |
| `driver_level_config` | Configuração de níveis |
| `subscription_plans` | Planos de assinatura |

### 📊 Analytics

| Tabela | Descrição |
|--------|-----------|
| `analytics_daily` | Analytics diárias |
| `analytics_hourly` | Analytics horárias |
| `analytics_zones` | Analytics por zona |
| `financial_reports` | Relatórios financeiros |
| `driver_performance_reports` | Reports de motoristas |
| `driver_rankings` | Rankings |
| `ride_history_summary` | Resumo por usuário/mês |
| `experiments` | Experimentos A/B |
| `experiment_participants` | Participantes |
| `campaigns` | Campanhas de marketing |

### 📝 Logs

| Tabela | Descrição |
|--------|-----------|
| `api_logs` | Logs de requisições |
| `error_logs` | Erros da aplicação |
| `system_logs` | Logs do sistema |
| `webhook_logs` | Logs de webhooks |
| `push_logs` | Logs de push notifications |
| `admin_audit_logs` | Auditoria admin |
| `login_attempts` | Tentativas de login |
| `user_activity_log` | Ações dos usuários |

---

## Funções e Triggers

### Funções Principais

| Função | Tipo | Descrição |
|--------|------|-----------|
| `handle_new_user()` | SECURITY DEFINER | Cria profile, wallet, settings, points, notif_prefs ao criar usuário auth |
| `handle_new_driver()` | TRIGGER | Cria driver_stats e driver_locations ao criar driver_profile |
| `handle_ride_completed()` | TRIGGER | Atualiza contadores, cria earnings, wallet_transactions e platform_revenue |
| `update_driver_rating()` | TRIGGER | Recalcula rating médio do motorista em profiles e driver_stats |
| `update_driver_level()` | TRIGGER | Promove/rebaixa nível do motorista (bronze→silver→gold→diamond) |
| `update_coupon_usage()` | TRIGGER | Incrementa usage_count do cupom quando usado |
| `update_daily_analytics()` | TRIGGER | Atualiza analytics_daily a cada corrida completada/cancelada |
| `update_social_counts()` | TRIGGER | Mantém likes_count e comments_count em social_posts |
| `update_wallet_balance()` | TRIGGER | Recalcula balance da wallet a cada wallet_transaction |
| `generate_referral_code()` | TRIGGER | Gera referral_code único no INSERT de profiles |
| `handle_updated_at()` | TRIGGER | Atualiza updated_at automaticamente em 50+ tabelas |
| `is_admin()` | SQL STABLE | Verifica se o usuário atual é admin (usado nas RLS policies) |
| `is_driver()` | SQL STABLE | Verifica se o usuário atual é motorista verificado |

### Trigger Auth

```sql
-- Disparado quando um novo usuário se registra no Supabase Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## RLS — Row Level Security

### Padrões de Políticas

| Padrão | Tabelas | Regra |
|--------|---------|-------|
| `_own` | user_*, driver_*, wallets... | `user_id = auth.uid()` ou `is_admin()` |
| `_admin` | analytics, config, logs... | `is_admin()` |
| `_public` | vehicle_categories, faqs, announcements... | `is_active = true` |
| `_participants` | rides, chat, tracking... | passenger/driver da corrida |

### Funções de segurança usadas nas políticas

```sql
-- Verifica se o usuário logado é admin
is_admin()  →  SELECT is_admin FROM profiles WHERE id = auth.uid()

-- Verifica se o usuário logado é motorista verificado
is_driver() →  SELECT is_verified FROM driver_profiles WHERE user_id = auth.uid()
```

---

## Realtime (Supabase Realtime)

Tabelas com CDC (Change Data Capture) habilitado:

| Tabela | Caso de uso |
|--------|-------------|
| `rides` | Status da corrida em tempo real |
| `messages` | Chat entre usuário e motorista |
| `notifications` | Notificações push |
| `driver_locations` | Localização do motorista |
| `chat_messages` | Chat em salas |
| `ride_chat` | Chat específico da corrida |
| `emergency_alerts` | Alertas SOS |
| `price_offers` | Ofertas de preço |
| `ride_tracking` | GPS tracking |
| `surge_pricing` | Preço dinâmico |

---

## Estratégia de Índices

### Índices de Performance (migration 011)
Criados nas tabelas de maior volume de queries:
- `rides`: passenger_id, driver_id, status, created_at, coords (lat/lng), payment_status
- `payments`: ride_id, payer_id, payee_id, status, gateway_id
- `notifications`: user_id, is_read (partial), type, created_at
- `driver_locations`: driver_id, is_online+is_available (composite), coords
- `wallet_transactions`: wallet_id, user_id, type, created_at

### Índices de FK (migration 015)
120 índices adicionados em colunas de chave estrangeira que estavam sem índice, cobrindo todas as tabelas do schema.

---

## Fluxo de Dados — Corrida Completa

```
1. Passageiro solicita corrida
   → INSERT rides (status='pending')
   → INSERT ride_estimates

2. Sistema notifica motoristas
   → INSERT ride_requests (driver_id, status='pending')
   → INSERT notifications (driver)

3. Motorista aceita
   → UPDATE rides (status='accepted', driver_id, accepted_at)
   → INSERT chat_rooms
   → Realtime broadcast

4. Corrida em andamento
   → INSERT ride_tracking (GPS periódico)
   → INSERT ride_chat (mensagens)
   → INSERT safety_checkins (opcionais)

5. Corrida concluída
   → UPDATE rides (status='completed', completed_at, final_price)
   → TRIGGER handle_ride_completed():
      - UPDATE profiles (total_rides++)
      - UPDATE driver_profiles (total_trips++)
      - UPSERT driver_stats
      - INSERT driver_earnings
      - INSERT wallet_transactions (earning)
      - INSERT platform_revenue (commission)
   → TRIGGER update_daily_analytics():
      - UPSERT analytics_daily
   → INSERT ride_receipts
   → INSERT payments (pix/card)

6. Avaliações
   → INSERT ride_ratings
   → TRIGGER update_driver_rating():
      - UPDATE profiles (rating)
      - UPDATE driver_stats (avg_rating)
   → TRIGGER update_driver_level():
      - UPDATE driver_profiles (level, commission_rate)
```

---

## Variáveis de Ambiente Necessárias

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```
