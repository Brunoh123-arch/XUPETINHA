# UPPI - Schema Completo do Banco de Dados

**Atualizado:** 16/03/2026 | **Projeto:** ullmjdgppucworavoiia | **PostgreSQL 15+ com PostGIS**

---

## RESUMO GERAL

| Item | Quantidade | Status |
|------|------------|--------|
| Tabelas | 275 | OK |
| Tabelas com RLS | 275/275 | OK |
| Politicas RLS | 422+ | OK |
| Tabelas Realtime | 36 | OK |
| Indices | 702+ | OK |
| Storage Buckets | 5 | OK |

---

## HISTORICO DE CRIACAO

| Fase | Tabelas | Descricao |
|------|---------|-----------|
| Migrations 001-038 | 164 | Core tables originais |
| Fase 2 — Auditoria lista externa | 74 | Tabelas da lista de 99 faltantes |
| Fase 3 — Auditoria real do codigo | 20 | Tabelas que o app usava e nao existiam |
| Fase 4 — Auditoria final | 17 | Tabelas restantes identificadas |
| **Total** | **275** | **Banco 100% alinhado com o app** |

---

## TABELAS POR CATEGORIA

### 1. USUARIOS E PERFIS
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `profiles` | Perfil principal do usuario | OK |
| `user_settings` | Configuracoes do usuario | OK |
| `user_2fa` | Autenticacao 2 fatores | OK |
| `user_2fa_backup_codes` | Codigos de backup 2FA | OK |
| `user_sms_preferences` | Preferencias de SMS | OK |
| `user_recording_preferences` | Preferencias de gravacao | OK |
| `user_social_stats` | Estatisticas sociais | OK |
| `user_activity_log` | Log de atividades | OK |
| `user_achievements` | Conquistas desbloqueadas | OK |
| `user_onboarding` | Progresso de onboarding | OK |
| `user_devices` | Dispositivos registrados | OK |
| `user_sessions` | Sessoes ativas | OK |
| `user_wallets` | Carteira digital do usuario | OK |
| `wallet_transactions` | Transacoes da carteira | OK |
| `user_payment_methods` | Metodos de pagamento salvos | OK |
| `user_promotions` | Promocoes do usuario | OK |
| `user_preferences` | Preferencias gerais | OK |
| `user_levels` | Nivel de gamificacao | OK |
| `user_stats` | Estatisticas gerais | OK |
| `user_notifications_log` | Log de notificacoes | OK |
| `user_reports` | Denuncias feitas | OK |
| `user_verifications` | Verificacoes do usuario | OK |
| `user_login_history` | Historico de login | OK |
| `user_trust_score` | Score de confianca (tabela detalhe) | OK |
| `trust_score` | Score de confianca (tabela principal) | OK |
| `user_badges` | Badges conquistadas | OK |
| `badge_definitions` | Definicoes de badges | OK |
| `user_feedback` | Feedback enviado | OK |
| `avatars` | Fotos de perfil | OK |
| `blocked_users` | Usuarios bloqueados | OK |
| `phone_verifications` | Verificacoes de telefone | OK |

### 2. MOTORISTAS
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `driver_profiles` | Perfil do motorista | OK |
| `driver_documents` | CNH, CRLV, antecedentes | OK |
| `driver_verifications` | Status de verificacao | OK |
| `driver_schedule` | Agenda do motorista | OK |
| `driver_earnings` | Ganhos por corrida | OK |
| `driver_stats` | Estatisticas gerais | OK |
| `driver_rating_breakdown` | Detalhes das avaliacoes | OK |
| `driver_bonuses` | Bonus e incentivos | OK |
| `driver_bonuses_log` | Log de bonus | OK |
| `driver_penalties` | Penalidades | OK |
| `driver_weekly_summary` | Resumo semanal | OK |
| `driver_performance` | Metricas de desempenho | OK |
| `driver_level_config` | Configuracao de niveis | OK |
| `driver_route_segments` | Segmentos de rota | OK |
| `driver_trips_summary` | Resumo de viagens | OK |
| `driver_popular_routes` | Rotas frequentes | OK |
| `driver_achievements` | Conquistas do motorista | OK |
| `driver_withdrawals` | Solicitacoes de saque | OK |
| `driver_locations` | Localizacao em tempo real | OK |
| `driver_availability` | Status online/offline | OK |

### 3. VEICULOS
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `vehicles` | Dados do veiculo | OK |
| `vehicle_inspections` | Inspecoes periodicas | OK |
| `vehicle_documents` | Documentos do veiculo | OK |
| `vehicle_categories` | Categorias de veiculo | OK |
| `vehicle_types` | Tipos de veiculo | OK |

### 4. CORRIDAS
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `rides` | Corridas principais | OK | SIM |
| `ride_tracking` | GPS em tempo real | OK | SIM |
| `ride_offers` | Ofertas de preco para corridas | OK | SIM |
| `ride_bids` | Lances em leilao de corrida | OK | - |
| `ride_stops` | Paradas da corrida | OK | - |
| `ride_checkpoints` | Checkpoints da rota | OK | - |
| `ride_events` | Eventos da corrida | OK | - |
| `ride_history_summary` | Resumo mensal de corridas | OK | - |
| `ride_photos` | Fotos da corrida | OK | - |
| `ride_ratings` | Notas da corrida | OK | - |
| `ride_recordings` | Gravacoes de audio | OK | - |
| `scheduled_rides` | Corridas agendadas | OK | SIM |
| `intercity_rides` | Viagens intermunicipais | OK | - |
| `intercity_bookings` | Reservas intermunicipais | OK | SIM |
| `intercity_routes` | Rotas intermunicipais | OK | - |
| `delivery_orders` | Pedidos de entrega | OK | SIM |
| `group_rides` | Corridas em grupo | OK | SIM |
| `group_ride_members` | Membros do grupo | OK | SIM |
| `group_ride_participants` | Participantes do grupo | OK | SIM |
| `price_offers` | Ofertas de preco | OK | SIM |

### 5. AVALIACOES E REVIEWS
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `reviews` | Avaliacoes gerais | OK |
| `driver_reviews` | Avaliacoes de motoristas | OK |
| `ratings` | Notas detalhadas | OK |
| `rating_categories` | Categorias de avaliacao | OK |
| `enhanced_reviews` | Avaliacoes com categorias | OK |
| `review_categories` | Categorias de review | OK |
| `review_tags` | Tags de avaliacao | OK |
| `bidirectional_reviews` | Avaliacao mutua | OK |
| `ride_feedback` | Feedback da corrida | OK |

### 6. PAGAMENTOS E FINANCEIRO
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `payments` | Pagamentos processados | OK |
| `pix_transactions` | Transacoes PIX | OK |
| `pix_keys` | Chaves PIX cadastradas | OK |
| `payment_disputes` | Disputas de pagamento | OK |
| `scheduled_payments` | Pagamentos agendados | OK |
| `cashback_transactions` | Cashback ganho | OK |
| `tax_records` | Registros tributarios (motorista) | OK |
| `loyalty_points` | Pontos de fidelidade | OK |
| `loyalty_tiers` | Niveis de fidelidade | OK |
| `loyalty_transactions` | Transacoes de pontos | OK |
| `invoices` | Faturas | OK |
| `invoice_items` | Itens de fatura | OK |
| `trip_insurance` | Seguro de viagem | OK |

### 7. CUPONS E PROMOCOES
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `coupons` | Cupons de desconto | OK |
| `coupon_uses` | Uso de cupons | OK |
| `user_coupons` | Cupons do usuario | OK |
| `promo_codes` | Codigos promocionais | OK |
| `promo_code_uses` | Uso de codigos promo | OK |
| `promotions` | Promocoes ativas | OK |
| `promo_banners` | Banners promocionais | OK |
| `promo_campaigns` | Campanhas de marketing | OK |
| `campaigns` | Campanhas gerais | OK |

### 8. COMUNICACAO
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `messages` | Mensagens de chat | OK | SIM |
| `notifications` | Notificacoes push | OK | SIM |
| `notification_preferences` | Preferencias de notif. | OK | - |
| `notification_templates` | Templates de notificacao | OK | - |
| `fcm_tokens` | Tokens Firebase | OK | - |
| `push_subscriptions` | Inscricoes push | OK | - |
| `push_log` | Log de push enviados | OK | - |
| `user_push_tokens` | Tokens push do usuario | OK | - |
| `in_app_messages` | Mensagens in-app | OK | SIM |

### 9. SUPORTE
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `support_tickets` | Tickets de suporte | OK |
| `support_messages` | Mensagens de suporte | OK |
| `faqs` | Perguntas frequentes | OK |
| `knowledge_base_articles` | Base de conhecimento | OK |
| `feedback_categories` | Categorias de feedback | OK |

### 10. SEGURANCA E EMERGENCIA
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `emergency_contacts` | Contatos de emergencia | OK | - |
| `emergency_alerts` | Alertas de emergencia | OK | SIM |
| `emergency_events` | Eventos de emergencia | OK | SIM |
| `emergency_records` | Historico de acoes em emergencia | OK | - |
| `sos_alerts` | Alertas SOS | OK | SIM |
| `content_reports` | Denuncias de conteudo | OK | - |
| `trip_reports` | Relatorios de corrida | OK | - |
| `recording_consents` | Consentimento gravacao | OK | - |
| `ride_recordings` | Gravacoes de seguranca | OK | - |

### 11. ENDERECOS E LOCALIZACAO
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `address_history` | Historico de enderecos | OK |
| `address_search_history` | Historico de buscas | OK |
| `favorite_addresses` | Enderecos favoritos | OK |
| `favorite_places` | Lugares favoritos | OK |
| `favorites` | Favoritos gerais | OK |
| `favorite_drivers` | Motoristas favoritos | OK |
| `popular_routes` | Rotas populares | OK |
| `popular_destinations` | Destinos populares | OK |
| `destination_suggestions` | Sugestoes de destino | OK |
| `route_history` | Historico de rotas | OK |
| `location_history` | Historico de localizacao GPS | OK |
| `service_areas` | Areas de atendimento | OK |
| `city_configurations` | Configuracoes por cidade | OK |
| `city_zones` | Zonas da cidade | OK |
| `hot_zones` | Zonas de alta demanda | OK |
| `zone_availability` | Disponibilidade por zona | OK |
| `zone_pricing` | Precos por zona | OK |
| `zone_restrictions` | Restricoes por zona | OK |
| `zone_stats` | Estatisticas por zona | OK |
| `surge_pricing` | Tarifa dinamica | OK |
| `surge_events` | Eventos de surge | OK |

### 12. REFERRAL E GAMIFICACAO
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `referrals` | Indicacoes | OK |
| `referral_codes` | Codigos de indicacao | OK |
| `referral_uses` | Uso de codigos de indicacao | OK |
| `referral_achievements` | Conquistas de indicacao | OK |
| `achievements` | Conquistas disponiveis | OK |
| `leaderboard` | Ranking geral | OK |

### 13. REDE SOCIAL
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `social_posts` | Posts sociais | OK | SIM |
| `social_post_likes` | Curtidas em posts | OK | - |
| `social_follows` | Seguidores | OK | - |
| `post_comments` | Comentarios | OK | SIM |
| `post_likes` | Curtidas | OK | - |

### 14. AUTENTICACAO
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `email_otps` | OTPs por email | OK |
| `user_2fa` | 2FA configurado | OK |
| `user_2fa_backup_codes` | Codigos de backup | OK |

### 15. ADMIN E SISTEMA
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `admin_logs` | Logs de admin | OK |
| `admin_notifications` | Notificacoes admin | OK |
| `admin_permissions` | Permissoes de admin | OK |
| `admin_roles` | Papeis de admin | OK |
| `app_config` | Configuracoes do app | OK |
| `app_versions` | Versoes do app | OK |
| `system_config` | Configuracoes do sistema | OK |
| `system_settings` | Configuracoes de sistema | OK |
| `error_logs` | Logs de erro | OK |
| `legal_documents` | Documentos legais | OK |
| `platform_metrics` | Metricas da plataforma | OK |
| `pricing_rules` | Regras de precificacao | OK |

### 16. INTEGRACOES E LOGS
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `webhook_endpoints` | Endpoints de webhook | OK |
| `webhook_deliveries` | Entregas de webhook | OK |
| `webhooks` | Webhooks configurados | OK |
| `sms_logs` | Logs de SMS | OK |
| `sms_deliveries` | Entregas de SMS | OK |
| `sms_templates` | Templates de SMS | OK |
| `email_templates` | Templates de email | OK |
| `live_activities` | Live Activities iOS | OK |
| `push_log` | Log de push | OK |
| `user_push_tokens` | Tokens push | OK |

### 17. FAMILIA E GRUPO
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `family_members` | Membros da familia | OK |
| `family_groups` | Grupos familiares | OK |
| `family_group_members` | Membros dos grupos | OK |

### 18. ASSINATURAS
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `subscriptions` | Assinaturas dos usuarios | OK |
| `subscription_plans` | Planos de assinatura | OK |

### 19. PASSAGEIROS
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `passenger_achievements` | Conquistas do passageiro | OK |
| `passenger_stats` | Estatisticas do passageiro | OK |

### 20. A/B TESTING E MARKETING
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `ab_test_participants` | Participantes de testes A/B | OK |
| `app_banners` | Banners do app | OK |
| `in_app_messages` | Mensagens in-app | OK |
| `reports` | Relatorios gerados | OK |

---

## TABELAS COM REALTIME (36)

```
1.  rides                      - Status da corrida em tempo real
2.  ride_tracking               - GPS do motorista
3.  ride_offers                 - Ofertas de preco
4.  delivery_orders             - Entregas em tempo real
5.  intercity_bookings          - Reservas intermunicipais
6.  group_ride_participants     - Participantes do grupo
7.  driver_locations            - Localizacao do motorista
8.  messages                    - Novas mensagens
9.  notifications               - Push notifications
10. price_offers                - Negociacao de preco
11. emergency_alerts            - Alertas SOS
12. sos_alerts                  - Eventos SOS
13. emergency_events            - Eventos de emergencia
14. trust_score                 - Score de confianca
15. hot_zones                   - Zonas quentes
16. pix_transactions            - Status de pagamento PIX
17. in_app_messages             - Mensagens in-app
18. post_comments               - Comentarios sociais
19. social_posts                - Posts sociais
20. group_rides                 - Corridas em grupo
21. group_ride_members          - Membros do grupo
22. scheduled_rides             - Agendamentos
23. support_messages            - Mensagens de suporte
24. + 13 outras tabelas         - Funcionalidades diversas
```

---

## STORAGE BUCKETS (5)

| Bucket | Publico | Uso |
|--------|---------|-----|
| `avatars` | SIM | Fotos de perfil |
| `driver-documents` | NAO | CNH, CRLV, antecedentes |
| `vehicle-photos` | NAO | Fotos do veiculo |
| `ride-recordings` | NAO | Gravacoes de seguranca |
| `support-attachments` | NAO | Prints de suporte |

---

## FUNCOES PRINCIPAIS (RPCs)

### Corridas
| Funcao | Descricao |
|--------|-----------|
| `fn_create_ride()` | Criar nova corrida |
| `fn_accept_ride()` | Motorista aceita corrida |
| `fn_start_ride()` | Iniciar corrida |
| `fn_complete_ride()` | Finalizar corrida |
| `fn_cancel_ride()` | Cancelar corrida |
| `fn_calculate_ride_price()` | Calcular preco |
| `find_nearby_drivers()` | Buscar motoristas proximos |

### Motorista
| Funcao | Descricao |
|--------|-----------|
| `fn_update_driver_location()` | Atualizar GPS |
| `fn_toggle_driver_availability()` | Alternar Online/Offline |
| `fn_calculate_driver_earnings()` | Calcular ganhos |
| `upsert_driver_location()` | Inserir/Atualizar localizacao |

### Pagamentos
| Funcao | Descricao |
|--------|-----------|
| `fn_process_payment()` | Processar pagamento |
| `fn_create_wallet_transaction()` | Criar transacao |
| `fn_apply_coupon()` | Aplicar cupom |
| `fn_split_payment()` | Dividir pagamento |
| `get_wallet_balance()` | Obter saldo |
| `request_withdrawal()` | Solicitar saque |

---

## SEGURANCA

### Row Level Security (RLS)
- **275/275** tabelas com RLS ativo — 100%
- 422+ politicas de seguranca configuradas
- Padrao: dados pessoais so acessiveis pelo proprio usuario
- Tabelas lookup: leitura publica, escrita apenas admin

### Criptografia
- `user_2fa.secret` — AES-256-GCM
- `profiles.cpf` — AES-256-GCM
- `webhook_endpoints.secret` — AES-256-GCM
- Chave: `ENCRYPTION_KEY` no Vercel

---

## STATUS FINAL

| Categoria | Valor | Status |
|-----------|-------|--------|
| Total tabelas | 275 | OK |
| Tabelas com RLS | 275 | OK |
| Politicas RLS | 422+ | OK |
| Tabelas Realtime | 36 | OK |
| Indices | 702+ | OK |
| Storage Buckets | 5 | OK |

**BANCO DE DADOS 100% ALINHADO COM O CODIGO DO APP**

---

Atualizado em 16/03/2026 — Projeto Supabase ullmjdgppucworavoiia
