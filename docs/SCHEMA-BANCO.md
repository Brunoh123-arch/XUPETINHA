# UPPI - Schema Completo do Banco de Dados

**Atualizado:** 16/03/2026 | **Projeto:** ullmjdgppucworavoiia | **PostgreSQL 15+ com PostGIS**

---

## RESUMO GERAL

| Item | Quantidade | Status |
|------|------------|--------|
| Tabelas | 164 | OK |
| Tabelas com RLS | 163/164 | OK |
| Politicas RLS | 280 | OK |
| Tabelas Realtime | 22 | OK |
| Indices | 483 | OK |
| CHECK Constraints | 579 | OK |
| Foreign Keys | 222 | OK |
| Triggers | 52 | OK |
| Funcoes | 762 | OK |
| Storage Buckets | 5 | OK |

---

## TODAS AS 164 TABELAS POR CATEGORIA

### 1. USUARIOS E PERFIS (15 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 1 | `profiles` | Perfil principal do usuario | OK |
| 2 | `user_settings` | Configuracoes do usuario | OK |
| 3 | `user_devices` | Dispositivos registrados | OK |
| 4 | `user_sessions` | Sessoes ativas | OK |
| 5 | `user_2fa` | Autenticacao 2 fatores | OK |
| 6 | `user_documents` | Documentos do usuario | OK |
| 7 | `user_activity_log` | Log de atividades | OK |
| 8 | `user_blocks` | Usuarios bloqueados | OK |
| 9 | `user_reports` | Denuncias de usuarios | OK |
| 10 | `user_follows` | Seguidores | OK |
| 11 | `user_points` | Pontos de fidelidade | OK |
| 12 | `user_achievements` | Conquistas desbloqueadas | OK |
| 13 | `user_subscriptions` | Assinaturas | OK |
| 14 | `user_recording_preferences` | Preferencias de gravacao | OK |
| 15 | `user_social_stats` | Estatisticas sociais | OK |

### 2. MOTORISTAS (21 tabelas)
| # | Tabela | Descricao | RLS | Realtime |
|---|--------|-----------|-----|----------|
| 16 | `driver_profiles` | Perfil do motorista | OK | SIM |
| 17 | `driver_documents` | CNH, CRLV, antecedentes | OK | - |
| 18 | `driver_verifications` | Status de verificacao | OK | - |
| 19 | `driver_availability` | Online/Offline | OK | SIM |
| 20 | `driver_earnings` | Ganhos por corrida | OK | - |
| 21 | `driver_stats` | Estatisticas gerais | OK | - |
| 22 | `driver_rating_breakdown` | Detalhes das avaliacoes | OK | - |
| 23 | `driver_commissions` | Comissoes da plataforma | OK | - |
| 24 | `driver_bonuses` | Bonus e incentivos | OK | - |
| 25 | `driver_incentives` | Metas e recompensas | OK | - |
| 26 | `driver_level_tiers` | Niveis (Bronze a Diamante) | OK | - |
| 27 | `driver_levels` | Nivel atual do motorista | OK | - |
| 28 | `driver_shift_logs` | Historico de turnos | OK | - |
| 29 | `driver_trips_summary` | Resumo de viagens | OK | - |
| 30 | `driver_location_history` | Historico de GPS | OK | - |
| 31 | `driver_popular_routes` | Rotas frequentes | OK | - |
| 32 | `driver_preferred_zones` | Zonas preferidas | OK | - |
| 33 | `driver_ride_preferences` | Preferencias de corrida | OK | - |
| 34 | `driver_favorites` | Passageiros favoritos | OK | - |
| 35 | `driver_training` | Treinamentos concluidos | OK | - |
| 36 | `driver_performance_metrics` | Metricas de desempenho | OK | - |

### 3. VEICULOS (2 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 37 | `vehicles` | Dados do veiculo | OK |
| 38 | `vehicle_inspections` | Inspecoes periodicas | OK |

### 4. CORRIDAS (20 tabelas)
| # | Tabela | Descricao | RLS | Realtime |
|---|--------|-----------|-----|----------|
| 39 | `rides` | Corridas principais | OK | SIM |
| 40 | `ride_requests` | Solicitacoes de corrida | OK | SIM |
| 41 | `ride_locations` | GPS em tempo real | OK | SIM |
| 42 | `ride_route_points` | Pontos da rota | OK | - |
| 43 | `ride_waypoints` | Paradas intermediarias | OK | - |
| 44 | `ride_cancellations` | Cancelamentos | OK | - |
| 45 | `ride_disputes` | Disputas | OK | SIM |
| 46 | `ride_feedback` | Feedback da corrida | OK | - |
| 47 | `ride_experiences` | Experiencias especiais | OK | - |
| 48 | `ride_special_requests` | Pedidos especiais | OK | - |
| 49 | `ride_receipts` | Recibos | OK | - |
| 50 | `ride_recordings` | Gravacoes de audio | OK | - |
| 51 | `ride_eta_log` | Historico de ETA | OK | - |
| 52 | `ride_offers_log` | Log de ofertas | OK | - |
| 53 | `ride_pricing_rules` | Regras de preco | OK | - |
| 54 | `scheduled_rides` | Corridas agendadas | OK | SIM |
| 55 | `intercity_rides` | Viagens intermunicipais | OK | - |
| 56 | `delivery_rides` | Entregas | OK | SIM |
| 57 | `ride_share_passengers` | Passageiros de carona | OK | SIM |
| 58 | `group_rides` | Corridas em grupo | OK | SIM |
| 59 | `group_ride_members` | Membros do grupo | OK | SIM |

### 5. PRECOS E NEGOCIACAO (6 tabelas)
| # | Tabela | Descricao | RLS | Realtime |
|---|--------|-----------|-----|----------|
| 60 | `price_offers` | Ofertas de preco | OK | SIM |
| 61 | `price_negotiations` | Negociacoes | OK | SIM |
| 62 | `surge_pricing` | Tarifa dinamica | OK | - |
| 63 | `surge_pricing_log` | Historico de surge | OK | - |
| 64 | `zone_pricing` | Precos por zona | OK | - |
| 65 | `pricing_experiments` | Testes A/B de preco | OK | - |

### 6. PAGAMENTOS E FINANCEIRO (15 tabelas)
| # | Tabela | Descricao | RLS | Realtime |
|---|--------|-----------|-----|----------|
| 66 | `payments` | Pagamentos | OK | - |
| 67 | `wallets` | Carteiras digitais | OK | - |
| 68 | `transactions` | Transacoes | OK | - |
| 69 | `withdrawals` | Saques de motoristas | OK | - |
| 70 | `refunds` | Reembolsos | OK | - |
| 71 | `invoices` | Faturas | OK | - |
| 72 | `payment_methods_saved` | Cartoes salvos | OK | - |
| 73 | `payment_splits` | Divisao de pagamento | OK | SIM |
| 74 | `payment_split_members` | Membros da divisao | OK | - |
| 75 | `tip_transactions` | Gorjetas | OK | SIM |
| 76 | `points_transactions` | Transacoes de pontos | OK | - |
| 77 | `cashback_rules` | Regras de cashback | OK | - |
| 78 | `cashback_earned` | Cashback ganho | OK | - |
| 79 | `corporate_accounts` | Contas corporativas | OK | - |
| 80 | `corporate_invoices` | Faturas corporativas | OK | - |

### 7. CUPONS E PROMOCOES (6 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 81 | `coupons` | Cupons de desconto | OK |
| 82 | `coupon_uses` | Uso de cupons | OK |
| 83 | `user_coupons` | Cupons do usuario | OK |
| 84 | `promo_codes` | Codigos promocionais | OK |
| 85 | `promotions` | Promocoes ativas | OK |
| 86 | `campaigns` | Campanhas de marketing | OK |

### 8. AVALIACOES E REVIEWS (5 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 87 | `reviews` | Avaliacoes de corridas | OK |
| 88 | `review_tags` | Tags das avaliacoes | OK |
| 89 | `app_review_requests` | Pedidos de avaliacao | OK |
| 90 | `feedback_forms` | Formularios de feedback | OK |
| 91 | `feedback_responses` | Respostas de feedback | OK |

### 9. COMUNICACAO (7 tabelas)
| # | Tabela | Descricao | RLS | Realtime |
|---|--------|-----------|-----|----------|
| 92 | `conversations` | Conversas | OK | SIM |
| 93 | `messages` | Mensagens de chat | OK | SIM |
| 94 | `notifications` | Notificacoes push | OK | SIM |
| 95 | `notification_preferences` | Preferencias de notif. | OK | - |
| 96 | `fcm_tokens` | Tokens Firebase | OK | - |
| 97 | `push_subscriptions` | Inscricoes push | OK | - |
| 98 | `push_logs` | Log de push enviados | OK | - |

### 10. SUPORTE (7 tabelas)
| # | Tabela | Descricao | RLS | Realtime |
|---|--------|-----------|-----|----------|
| 99 | `support_tickets` | Tickets de suporte | OK | - |
| 100 | `support_conversations` | Conversas de suporte | OK | SIM |
| 101 | `support_messages` | Mensagens de suporte | OK | SIM |
| 102 | `ticket_replies` | Respostas de tickets | OK | - |
| 103 | `faqs` | Perguntas frequentes | OK | - |
| 104 | `faq_categories` | Categorias de FAQ | OK | - |
| 105 | `faq_items` | Itens de FAQ | OK | - |

### 11. SEGURANCA E EMERGENCIA (7 tabelas)
| # | Tabela | Descricao | RLS | Realtime |
|---|--------|-----------|-----|----------|
| 106 | `emergency_contacts` | Contatos de emergencia | OK | - |
| 107 | `emergency_alerts` | Alertas de emergencia | OK | SIM |
| 108 | `sos_events` | Eventos SOS | OK | SIM |
| 109 | `incident_reports` | Relatorios de incidentes | OK | - |
| 110 | `insurance_claims` | Sinistros de seguro | OK | - |
| 111 | `safety_checks` | Verificacoes de seguranca | OK | - |
| 112 | `recording_consents` | Consentimento gravacao | OK | - |

### 12. ENDERECOS E LOCALIZACAO (9 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 113 | `addresses` | Enderecos salvos | OK |
| 114 | `address_history` | Historico de enderecos | OK |
| 115 | `address_search_history` | Historico de buscas | OK |
| 116 | `favorite_addresses` | Enderecos favoritos | OK |
| 117 | `popular_destinations` | Destinos populares | OK |
| 118 | `geographic_zones` | Zonas geograficas | OK |
| 119 | `service_areas` | Areas de servico | OK |
| 120 | `airports` | Aeroportos | OK |
| 121 | `hotels` | Hoteis parceiros | OK |

### 13. PARCEIROS (1 tabela)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 122 | `partner_companies` | Empresas parceiras | OK |

### 14. REFERRAL E GAMIFICACAO (6 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 123 | `referral_rewards` | Recompensas de indicacao | OK |
| 124 | `achievements` | Conquistas disponiveis | OK |
| 125 | `leaderboards` | Placares | OK |
| 126 | `leaderboard_entries` | Entradas nos placares | OK |
| 127 | `waitlist` | Lista de espera | OK |
| 128 | `onboarding_steps` | Etapas de onboarding | OK |

### 15. REDE SOCIAL (5 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 129 | `social_posts` | Posts sociais | OK |
| 130 | `social_post_likes` | Curtidas | OK |
| 131 | `social_post_comments` | Comentarios | OK |
| 132 | `social_follows` | Seguidores | OK |
| 133 | `social_shares` | Compartilhamentos | OK |

### 16. AUTENTICACAO (4 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 134 | `email_otps` | OTPs por email | OK |
| 135 | `sms_verification_codes` | Codigos SMS | OK |
| 136 | `sms_fallback_log` | Log de fallback SMS | OK |
| 137 | `api_keys` | Chaves de API | OK |

### 17. ADMIN E SISTEMA (16 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 138 | `admin_users` | Usuarios admin | OK |
| 139 | `admin_actions` | Acoes de admin | OK |
| 140 | `audit_logs` | Logs de auditoria | OK |
| 141 | `error_logs` | Logs de erro | OK |
| 142 | `system_config` | Configuracoes do sistema | OK |
| 143 | `feature_flags` | Feature flags | OK |
| 144 | `app_versions` | Versoes do app | OK |
| 145 | `maintenance_windows` | Janelas de manutencao | OK |
| 146 | `announcements` | Anuncios | OK |
| 147 | `in_app_banners` | Banners in-app | OK |
| 148 | `legal_documents` | Documentos legais | OK |
| 149 | `terms_versions` | Versoes dos termos | OK |
| 150 | `terms_acceptances` | Aceites de termos | OK |
| 151 | `dashboard_metrics` | Metricas do dashboard | OK |
| 152 | `campaign_analytics` | Analytics de campanhas | OK |
| 153 | `analytics_events` | Eventos de analytics | OK |

### 18. INTEGRACAO E LOGS (7 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 154 | `webhooks` | Webhooks configurados | OK |
| 155 | `webhook_logs` | Logs de webhooks | OK |
| 156 | `email_logs` | Logs de email | OK |
| 157 | `sms_logs` | Logs de SMS | OK |
| 158 | `live_activities` | Live Activities iOS | OK |
| 159 | `blocked_ips` | IPs bloqueados | OK |
| 160 | `ban_history` | Historico de bans | OK |

### 19. PASSAGEIROS (2 tabelas)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 161 | `passenger_preferences` | Preferencias do passageiro | OK |
| 162 | `passenger_ride_stats` | Estatisticas de corridas | OK |

### 20. ASSINATURAS (1 tabela)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 163 | `subscription_plans` | Planos de assinatura | OK |

### 21. SISTEMA POSTGIS (1 tabela)
| # | Tabela | Descricao | RLS |
|---|--------|-----------|-----|
| 164 | `spatial_ref_sys` | Referencia espacial PostGIS | N/A |

---

## TABELAS COM REALTIME (22)

```
1.  rides                    - Status da corrida em tempo real
2.  ride_requests            - Novas solicitacoes de corrida
3.  ride_locations           - GPS do motorista
4.  ride_disputes            - Disputas abertas
5.  driver_profiles          - Perfil atualizado
6.  driver_availability      - Online/Offline
7.  conversations            - Novas conversas
8.  messages                 - Novas mensagens
9.  notifications            - Push notifications
10. price_offers             - Ofertas de preco
11. price_negotiations       - Negociacoes
12. emergency_alerts         - Alertas SOS
13. sos_events               - Eventos de emergencia
14. group_rides              - Corridas em grupo
15. group_ride_members       - Membros do grupo
16. scheduled_rides          - Agendamentos
17. delivery_rides           - Entregas
18. ride_share_passengers    - Carona
19. payment_splits           - Divisao pagamento
20. support_conversations    - Suporte
21. support_messages         - Mensagens suporte
22. tip_transactions         - Gorjetas
```

---

## STORAGE BUCKETS (5)

| Bucket | Publico | Uso | RLS |
|--------|---------|-----|-----|
| `avatars` | SIM | Fotos de perfil | OK |
| `driver-documents` | NAO | CNH, CRLV, antecedentes | OK |
| `vehicle-photos` | NAO | Fotos do veiculo | OK |
| `ride-recordings` | NAO | Gravacoes de seguranca | OK |
| `support-attachments` | NAO | Prints de suporte | OK |

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
| `fn_withdrawal_debit_wallet()` | Processar saque |
| `get_wallet_balance()` | Obter saldo |
| `request_withdrawal()` | Solicitar saque |

### Usuarios
| Funcao | Descricao |
|--------|-----------|
| `fn_update_user_rating()` | Atualizar avaliacao |
| `fn_add_points()` | Adicionar pontos |
| `fn_check_achievement()` | Verificar conquista |

### Notificacoes
| Funcao | Descricao |
|--------|-----------|
| `create_notification()` | Criar notificacao |
| `send_push_notification()` | Enviar push |

---

## TRIGGERS PRINCIPAIS

| Trigger | Tabela | Evento | Acao |
|---------|--------|--------|------|
| `update_updated_at` | Todas | UPDATE | Atualiza campo updated_at |
| `notify_new_ride` | rides | INSERT | Notifica motoristas proximos |
| `update_driver_stats` | rides | UPDATE | Atualiza estatisticas do motorista |
| `process_payment` | rides | UPDATE (completed) | Processa pagamento automaticamente |
| `send_push` | notifications | INSERT | Envia push notification |
| `update_rating` | reviews | INSERT | Atualiza media de avaliacao |
| `log_activity` | profiles | UPDATE | Registra atividade |

---

## INDICES IMPORTANTES

### Performance
- `idx_rides_status` - Filtro por status
- `idx_rides_driver_id` - Corridas do motorista
- `idx_rides_passenger_id` - Corridas do passageiro
- `idx_rides_created_at` - Ordenacao por data
- `idx_driver_availability_location` - Busca geografica
- `idx_driver_profiles_status` - Motoristas ativos
- `idx_ride_locations_ride_id` - GPS da corrida
- `idx_messages_conversation_id` - Mensagens da conversa
- `idx_notifications_user_id` - Notificacoes do usuario

### Indices Espaciais (PostGIS/GIST)
- `idx_rides_pickup_location_gist` - Ponto de embarque
- `idx_rides_dropoff_location_gist` - Ponto de destino
- `idx_driver_availability_current_location_gist` - Localizacao atual do motorista

---

## CHECK CONSTRAINTS

### Financeiros
- `balance >= 0` - Saldo nao pode ser negativo
- `amount > 0` - Valores devem ser positivos
- `final_price >= 0` - Preco final valido
- `commission_rate BETWEEN 0 AND 1` - Taxa entre 0 e 100%

### Status
- `status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')`
- `user_type IN ('passenger', 'driver', 'both')`
- `document_status IN ('pending', 'approved', 'rejected')`
- `payment_status IN ('pending', 'completed', 'failed', 'refunded')`

### Avaliacoes
- `rating BETWEEN 1 AND 5` - Nota de 1 a 5 estrelas

---

## EXTENSOES POSTGRESQL

- `uuid-ossp` - Geracao de UUIDs
- `pgcrypto` - Criptografia
- `postgis` - Dados geograficos
- `pg_graphql` - API GraphQL
- `pg_stat_statements` - Estatisticas de queries
- `supabase_vault` - Secrets
- `plpgsql` - Stored procedures

---

## SEGURANCA

### Row Level Security (RLS)
- 163/164 tabelas com RLS ativo
- Apenas `spatial_ref_sys` (PostGIS) sem RLS
- 280 politicas de seguranca configuradas

### Criptografia
- `user_2fa.secret` - Criptografado com AES-256
- `profiles.cpf` - Criptografado com AES-256
- `webhooks.secret` - Criptografado com AES-256
- Chave de criptografia: `ENCRYPTION_KEY` no Vercel

### Funcoes SECURITY DEFINER
- Todas configuradas com `SET search_path = public`
- Previne SQL injection via search_path hijacking

---

## APIS (99 rotas)

### Autenticacao (6)
- `POST /api/v1/auth/email-otp/send`
- `POST /api/v1/auth/email-otp/verify`
- `POST /api/v1/auth/verify`
- `GET/PUT /api/v1/profile`
- `DELETE /api/v1/profile/delete`
- `GET/PUT /api/v1/settings`

### Corridas (15)
- `GET/POST /api/v1/rides`
- `POST /api/v1/rides/[id]/accept`
- `POST /api/v1/rides/[id]/start`
- `POST /api/v1/rides/[id]/complete`
- `POST /api/v1/rides/[id]/cancel`
- `POST /api/v1/rides/[id]/rate`
- `POST /api/v1/rides/[id]/tip`
- `GET /api/v1/rides/[id]/receipt`
- `POST /api/v1/rides/[id]/report`
- `GET /api/v1/rides/[id]/status`
- `POST /api/v1/rides/estimate`
- `GET/POST /api/v1/scheduled-rides`
- `GET/POST /api/v1/group-rides`

### Motorista (10)
- `GET/POST /api/v1/driver/documents`
- `GET /api/v1/driver/earnings`
- `POST /api/v1/driver/location`
- `POST /api/v1/driver/mode`
- `POST /api/v1/driver/shift`
- `GET /api/v1/driver/verifications`
- `POST /api/v1/driver/verify`
- `POST /api/v1/driver/withdraw`
- `GET /api/v1/drivers/hot-zones`
- `GET /api/v1/drivers/nearby`

### Pagamentos (6)
- `GET /api/v1/payments/history`
- `POST /api/v1/payments/pix`
- `POST /api/v1/payments/refund`
- `GET /api/v1/wallet`
- `GET /api/v1/wallet/transactions`
- `POST /api/pix/webhook`

### Ofertas (4)
- `GET/POST /api/v1/offers`
- `POST /api/v1/offers/[id]/accept`
- `POST /api/v1/offers/[id]/counter`
- `POST /api/v1/offers/[id]/reject`

### Social (5)
- `GET/POST /api/v1/social/posts`
- `POST /api/v1/social/posts/[id]/like`
- `GET/POST /api/v1/social/posts/[id]/comments`
- `GET/POST /api/v1/social/follows`
- `GET /api/v1/leaderboard`

### Suporte (4)
- `GET/POST /api/v1/support`
- `GET/POST /api/v1/support/messages`
- `GET/POST /api/v1/support/tickets`
- `POST /api/v1/emergency`

### E mais 49 rotas para notificacoes, cupons, avaliacoes, geocoding, admin, webhooks, etc.

---

## STATUS FINAL

| Categoria | Status |
|-----------|--------|
| 164 Tabelas criadas | OK |
| 163 Tabelas com RLS | OK |
| 280 Politicas RLS | OK |
| 22 Tabelas Realtime | OK |
| 483 Indices | OK |
| 222 Foreign Keys | OK |
| 579 CHECK Constraints | OK |
| 52 Triggers | OK |
| 5 Storage Buckets | OK |
| 99 APIs | OK |
| Criptografia | OK |
| SECURITY DEFINER | OK |

**BANCO DE DADOS 100% COMPLETO E PRONTO PARA PRODUCAO**
