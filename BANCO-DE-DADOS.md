# Banco de Dados — XUPETINHA / UPPI

**Atualizado em:** 16/03/2026  
**Projeto Supabase:** bdijrorwlpmfzpuhrnva  
**Total de tabelas no banco:** 203  
**Tabelas usadas no app:** ~70  
**Tabelas orphas (no banco, sem uso no app):** ~133  
**Tabelas com bug (usadas no app, não existem no banco):** 4

---

## STATUS DE CADA TABELA

### LEGENDA
- `ATIVA` — tabela existe no banco E é referenciada no código
- `ORPHA` — tabela existe no banco MAS não é usada em nenhum arquivo do app
- `BUG` — tabela é referenciada no código MAS não existe no banco (erro/inconsistência)

---

## TABELAS ATIVAS (usadas no app)

| Tabela | Usado em |
|---|---|
| `profiles` | auth, home, driver, admin, tracking, review, receipts, etc. |
| `driver_profiles` | trust-score, profile, tracking, driver register, verify |
| `rides` | home, history, tracking, receipts, earnings, etc. |
| `notifications` | home, ride status, wallet, subscriptions, emergency |
| `favorites` | favorites page, history-service, favorites-service |
| `favorite_drivers` | favorites/drivers page, driver home |
| `price_offers` | tracking, searching, auction, offers, ride-service |
| `payments` | ride cancel, pix, payments page |
| `wallet_transactions` | payments page, wallet API, driver wallet |
| `user_wallets` | wallet API, payment-service |
| `support_tickets` | suporte page, support API |
| `support_messages` | suporte chat, support API |
| `messages` | ride chat, chat-service |
| `fcm_tokens` | push hooks, push API, supabase functions |
| `push_log` | push API, supabase functions |
| `driver_locations` | tracking-service, nearby drivers API |
| `ride_tracking` | tracking-service |
| `ratings` | review-enhanced, ratings API, stats API |
| `rating_categories` | review-enhanced page |
| `driver_reviews` | driver ratings page, driver profile, reviews API |
| `user_achievements` | database.ts |
| `leaderboard` | database.ts |
| `system_config` | database.ts, pricing |
| `system_settings` | lib/supabase/test-connection |
| `hot_zones` | database.ts, driver earnings |
| `pricing_rules` | lib/utils/pricing |
| `promo_codes` | database.ts |
| `promo_code_uses` | database.ts |
| `scheduled_rides` | driver schedule, scheduled-rides API |
| `emergency_alerts` | emergency page, emergency API |
| `emergency_contacts` | emergency-contacts page |
| `family_members` | family page, family API |
| `faqs` | help page |
| `legal_documents` | terms/privacy pages |
| `app_config` | referrals page |
| `user_settings` | settings/2fa, settings API |
| `user_sms_preferences` | settings/sms, sms API |
| `sms_deliveries` | sms API |
| `sms_logs` | sms status API |
| `social_posts` | social API |
| `social_post_likes` | social like API |
| `post_comments` | social comments API |
| `subscriptions` | subscriptions API |
| `referrals` | referral page, referrals API |
| `referral_achievements` | referral page |
| `webhook_endpoints` | webhooks API |
| `webhook_deliveries` | webhooks process API |
| `group_rides` | group-rides API |
| `group_ride_participants` | group-rides API |
| `coupons` | promotions page |
| `user_coupons` | promotions page |
| `delivery_orders` | entregas page |
| `user_push_tokens` | rides API |
| `ride_recordings` | recordings API |
| `user_recording_preferences` | settings/recording, recordings API |

---

## BUGS — Tabelas usadas no código que NÃO existem no banco

| Tabela (no código) | Arquivo | Diagnóstico |
|---|---|---|
| `ride_offers` | `lib/supabase/database.ts:150` | **Alias errado** — deveria ser `price_offers` |
| `ride_ratings` | `app/api/v1/rides/[id]/rate/route.ts:17` | **Alias errado** — deveria ser `ratings` |
| `enhanced_reviews` | `app/api/v1/reviews/enhanced/route.ts` | **Tabela inexistente** — feature não migrada |
| `review_categories` | `app/api/v1/reviews/enhanced/route.ts` | **Tabela inexistente** — feature não migrada |
| `review_tags` | `app/api/v1/reviews/enhanced/route.ts` | **Tabela inexistente** — feature não migrada |
| `bidirectional_reviews` | `app/api/v1/reviews/driver/route.ts` | **Tabela inexistente** — feature não migrada |
| `avatars` | `lib/services/profile-service.ts:51` | **Não é tabela** — é um bucket de Storage do Supabase |

---

## TABELAS ORPHAS (existem no banco, sem uso no app)

Estas tabelas foram criadas nas migrations mas nenhum arquivo `.ts` ou `.tsx` faz `.from('nome')` delas.  
Podem ser usadas futuramente, podem ser duplicatas ou podem ser removidas.

### Possíveis Duplicatas / Redundâncias

| Tabela | Possível duplicata de |
|---|---|
| `post_likes` | `social_post_likes` — mesmo conceito, duas tabelas |
| `social_likes` | `social_post_likes` — mesmo conceito, duas tabelas |
| `social_comments` | `post_comments` — mesmo conceito, duas tabelas |
| `family_groups` + `family_group_members` | `family_members` — dois sistemas paralelos |
| `driver_ratings` | `ratings` — dois sistemas de avaliação |
| `reviews` | `driver_reviews` + `ratings` — terceiro sistema de avaliação |
| `ride_disputes` | `payment_disputes` — sobreposição de conceito |
| `user_payment_methods` | `payment_methods` — duas tabelas para métodos de pagamento |
| `surge_pricing` | `surge_events` — dois sistemas de preço dinâmico |
| `passenger_achievements` | `user_achievements` — mesmo conceito com nome diferente |
| `passenger_stats` | `user_stats` — mesmo conceito com nome diferente |
| `destination_suggestions` | `place_suggestions` + `address_search_history` — sobreposição |
| `push_subscriptions` | `fcm_tokens` + `user_push_tokens` — três tabelas para push |
| `push_notification_templates` | `sms_templates` + `email_templates` — espelho para push |
| `support_ticket_messages` | `support_messages` — duas tabelas para mensagens de suporte |

### Tabelas Orphas (uso futuro planejado)

| Tabela | Categoria |
|---|---|
| `ab_tests` | Testes A/B |
| `ab_test_participants` | Testes A/B |
| `achievements` | Gamificação |
| `address_history` | Histórico de endereços |
| `address_search_history` | Buscas de endereço |
| `admin_logs` | Admin |
| `admin_notifications` | Admin |
| `admin_permissions` | Admin |
| `admin_role_permissions` | Admin |
| `admin_roles` | Admin |
| `admin_user_roles` | Admin |
| `api_keys` | API |
| `api_usage_logs` | API |
| `app_banners` | Banners |
| `app_review_requests` | App stores |
| `app_versions` | Versionamento |
| `audit_logs` | Auditoria |
| `badge_definitions` | Badges |
| `blocked_users` | Segurança |
| `broadcast_messages` | Comunicação |
| `campaigns` | Marketing |
| `cashback_rules` | Cashback |
| `cashback_transactions` | Cashback |
| `chat_rooms` | Chat |
| `city_configurations` | Configurações por cidade |
| `city_zones` | Zonas |
| `content_reports` | Moderação |
| `coupon_uses` | Cupons (duplica `user_coupons`) |
| `driver_achievements` | Gamificação motorista |
| `driver_availability` | Disponibilidade |
| `driver_bonuses` | Bônus |
| `driver_documents` | Documentos |
| `driver_earnings` | Ganhos (duplica `rides`) |
| `driver_idle_log` | Log de inatividade |
| `driver_incentives` | Incentivos |
| `driver_level_config` | Níveis |
| `driver_performance` | Performance |
| `driver_rating_breakdown` | Avaliações detalhadas |
| `driver_schedule` | Agenda |
| `driver_selfie_checks` | Segurança |
| `driver_stats` | Estatísticas |
| `driver_trips_summary` | Resumo de viagens |
| `driver_verifications` | Verificações |
| `driver_withdrawals` | Saques |
| `driver_zones` | Zonas do motorista |
| `email_otps` | OTP por email |
| `email_templates` | Templates de email |
| `emergency_events` | Eventos de emergência |
| `error_logs` | Logs de erro |
| `feature_flags` | Feature flags |
| `fcm_tokens` | Push (ativo) |
| `fraud_flags` | Anti-fraude |
| `group_ride_members` | Corridas em grupo (duplica `group_ride_participants`) |
| `insurance_claims` | Seguro |
| `intercity_bookings` | Viagens intermunicipais |
| `intercity_rides` | Viagens intermunicipais |
| `intercity_routes` | Rotas intermunicipais |
| `invoice_items` | Itens de fatura |
| `invoices` | Faturas |
| `ip_blocklist` | Segurança |
| `knowledge_base_articles` | Base de conhecimento |
| `live_activities` | Atividades ao vivo |
| `loyalty_points` | Fidelidade |
| `loyalty_tiers` | Níveis de fidelidade |
| `loyalty_transactions` | Transações de fidelidade |
| `maintenance_windows` | Manutenção |
| `notification_batches` | Push em massa |
| `notification_preferences` | Preferências de notificação |
| `passenger_level_config` | Níveis de passageiro |
| `payment_disputes` | Disputas de pagamento |
| `payment_gateway_logs` | Logs de gateway |
| `peak_hour_bonuses` | Bônus de horário de pico |
| `phone_verifications` | Verificação de telefone |
| `pix_transactions` | Transações PIX |
| `place_suggestions` | Sugestões de lugar |
| `platform_fees` | Taxas da plataforma |
| `platform_metrics` | Métricas |
| `popular_routes` | Rotas populares |
| `promo_banners` | Banners promocionais |
| `promotions` | Promoções |
| `push_notification_templates` | Templates push |
| `push_subscriptions` | Assinaturas push |
| `rate_limit_logs` | Rate limiting |
| `recording_consents` | Consentimentos de gravação |
| `referral_campaigns` | Campanhas de indicação |
| `referral_codes` | Códigos de indicação |
| `referral_uses` | Usos de indicação |
| `ride_bids` | Leilão de corridas |
| `ride_cancellations` | Cancelamentos |
| `ride_checkpoints` | Checkpoints de rota |
| `ride_disputes` | Disputas |
| `ride_eta_log` | Log de ETA |
| `ride_events` | Eventos de corrida |
| `ride_feedback` | Feedback de corrida |
| `ride_history_summary` | Resumo de histórico |
| `ride_offers_log` | Log de ofertas |
| `ride_requests` | Requisições de corrida |
| `ride_route_points` | Pontos de rota |
| `ride_tips` | Gorjetas |
| `ride_waypoints` | Waypoints |
| `safety_checks` | Verificações de segurança |
| `scheduled_payments` | Pagamentos agendados |
| `service_areas` | Áreas de serviço |
| `sms_templates` | Templates SMS |
| `social_follows` | Seguir usuários |
| `sos_alerts` | Alertas SOS |
| `subscription_plans` | Planos de assinatura |
| `surge_events` | Preço dinâmico |
| `surge_pricing` | Preço dinâmico (duplica `surge_events`) |
| `tax_records` | Registros fiscais |
| `trip_insurance` | Seguro de viagem |
| `trip_reports` | Relatórios de viagem |
| `user_2fa` | 2FA |
| `user_activity_log` | Log de atividade |
| `user_badges` | Badges do usuário |
| `user_devices` | Dispositivos |
| `user_onboarding` | Onboarding |
| `user_preferences` | Preferências |
| `user_promotions` | Promoções do usuário |
| `user_sessions` | Sessões |
| `user_social_stats` | Estatísticas sociais |
| `user_stats` | Estatísticas |
| `user_verifications` | Verificações |
| `vehicle_categories` | Categorias de veículo |
| `vehicle_inspections` | Inspeções |
| `vehicle_maintenance` | Manutenção |
| `vehicles` | Veículos |
| `zone_availability` | Disponibilidade por zona |
| `zone_pricing` | Preço por zona |

---

## AÇÕES RECOMENDADAS

### 1. Corrigir bugs imediatos (tabelas erradas no código)
- `lib/supabase/database.ts:150` — trocar `ride_offers` por `price_offers`
- `app/api/v1/rides/[id]/rate/route.ts:17` — trocar `ride_ratings` por `ratings`
- Criar as tabelas `enhanced_reviews`, `review_categories`, `review_tags`, `bidirectional_reviews` — OU remover as rotas `/api/v1/reviews/enhanced` e `/api/v1/reviews/driver`

### 2. Resolver duplicatas (consolidar ou remover)
- Escolher entre `post_likes` vs `social_post_likes` vs `social_likes` (manter 1)
- Escolher entre `social_comments` vs `post_comments` (manter 1)
- Escolher entre `family_members` vs `family_groups/family_group_members` (manter 1)
- Escolher entre `support_messages` vs `support_ticket_messages` (manter 1)
- Escolher entre `group_ride_participants` vs `group_ride_members` (manter 1)
- Consolidar sistema de avaliações: `ratings` + `driver_reviews` + `driver_ratings` + `reviews` (4 tabelas para o mesmo conceito)

### 3. Tabelas órfãs com baixa prioridade (podem ficar por agora)
Todas as tabelas de features futuras (intercity, loyalty, insurance, etc.) podem permanecer no banco sem impacto.
