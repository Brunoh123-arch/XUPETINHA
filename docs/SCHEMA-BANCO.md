# UPPI - Schema do Banco de Dados

**Atualizado:** 16/03/2026 | **Projeto:** ullmjdgppucworavoiia | **PostgreSQL 15+ com PostGIS**

---

## RESUMO GERAL

| Item | Quantidade | Status |
|------|------------|--------|
| Tabelas | 192 | OK |
| Tabelas com RLS | 192/192 (100%) | OK |
| Politicas RLS | 302 | OK |
| Tabelas Realtime | 36 | OK |
| Indices | 508 | OK |
| Storage Buckets | 5 | OK |
| Tabelas duplicadas removidas | 88 | FEITO |

---

## HISTORICO

| Fase | Tabelas | Descricao |
|------|---------|-----------|
| Migrations 001-038 | 164 | Core tables originais |
| Fase 2 — Auditoria | 74 | Tabelas faltantes |
| Fase 3 — Codigo | 20 | Tabelas que o app usava |
| Fase 4 — Final | 17 | Tabelas restantes |
| Fase 5 — 36 features | 17 | vehicles, payment_splits, refunds, cashback, badges... |
| Fase 6 — Limpeza | -88 | DROP de duplicatas |
| **Total atual** | **192** | **Banco limpo** |

---

## TABELAS POR CATEGORIA (192 no total)

### 1. USUARIOS E PERFIS (18)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `profiles` | Perfil principal do usuario | OK |
| `user_settings` | Configuracoes do usuario | OK |
| `user_2fa` | Autenticacao 2 fatores | OK |
| `user_sms_preferences` | Preferencias de SMS | OK |
| `user_recording_preferences` | Preferencias de gravacao | OK |
| `user_activity_log` | Log de atividades | OK |
| `user_achievements` | Conquistas desbloqueadas | OK |
| `user_devices` | Dispositivos registrados | OK |
| `user_sessions` | Sessoes ativas | OK |
| `user_wallets` | Carteira digital | OK |
| `wallet_transactions` | Transacoes da carteira | OK |
| `user_login_history` | Historico de login | OK |
| `trust_score` | Score de confianca | OK |
| `user_badges` | Badges conquistadas | OK |
| `badge_definitions` | Definicoes de badges | OK |
| `user_feedback` | Feedback enviado | OK |
| `avatars` | Fotos de perfil | OK |
| `blocked_users` | Usuarios bloqueados | OK |

### 2. MOTORISTAS (16)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `driver_profiles` | Perfil do motorista | OK |
| `driver_documents` | CNH, CRLV, antecedentes | OK |
| `driver_verifications` | Status de verificacao por etapa | OK |
| `driver_schedule` | Agenda do motorista | OK |
| `driver_earnings` | Ganhos por corrida | OK |
| `driver_bonuses` | Bonus e incentivos | OK |
| `driver_penalties` | Penalidades aplicadas | OK |
| `driver_performance` | Score de desempenho | OK |
| `driver_level_config` | Configuracao de niveis (Bronze→Diamante) | OK |
| `driver_level_tiers` | Beneficios por nivel | OK |
| `driver_levels` | Nivel atual de cada motorista | OK |
| `driver_shift_logs` | Registro de turnos online/offline | OK |
| `driver_route_segments` | Segmentos de rota para analise | OK |
| `driver_popular_routes` | Rotas mais frequentes | OK |
| `driver_withdrawals` | Solicitacoes de saque | OK |
| `driver_locations` | Localizacao em tempo real | OK |

### 3. VEICULOS (5)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `vehicles` | Dados do veiculo (placa, marca, modelo) | OK |
| `vehicle_inspections` | Inspecoes periodicas | OK |
| `vehicle_categories` | Categorias de veiculo | OK |
| `vehicle_types` | Tipos (economy, comfort, exec, moto, van) | OK |
| `driver_availability` | Status online/offline por motorista | OK |

### 4. CORRIDAS (14)
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `rides` | Corridas principais | OK | SIM |
| `ride_tracking` | GPS em tempo real | OK | SIM |
| `ride_offers` | Ofertas de preco | OK | SIM |
| `ride_stops` | Paradas intermediarias | OK | - |
| `ride_checkpoints` | Checkpoints de seguranca | OK | - |
| `ride_events` | Log de eventos da corrida | OK | - |
| `ride_photos` | Fotos de inicio/fim | OK | - |
| `ride_ratings` | Notas da corrida | OK | - |
| `ride_recordings` | Gravacoes de audio | OK | - |
| `ride_special_requests` | Pedidos especiais (AC, silencio) | OK | - |
| `ride_route_points` | Pontos GPS da rota percorrida | OK | - |
| `ride_experiences` | Avaliacao de experiencia especifica | OK | - |
| `scheduled_rides` | Corridas agendadas | OK | SIM |
| `price_offers` | Ofertas de preco negociadas | OK | SIM |

### 5. SERVICOS ESPECIAIS (5)
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `intercity_rides` | Viagens intermunicipais | OK | - |
| `intercity_bookings` | Reservas intermunicipais | OK | SIM |
| `delivery_orders` | Pedidos de entrega | OK | SIM |
| `group_rides` | Corridas em grupo | OK | SIM |
| `group_ride_participants` | Participantes do grupo | OK | SIM |

### 6. OPERACOES POS-CORRIDA (4)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `ride_cancellations` | Cancelamentos com motivo e taxa | OK |
| `ride_disputes` | Disputas abertas por passageiro/motorista | OK |
| `refunds` | Solicitacoes de reembolso | OK |
| `user_reports` | Denuncias feitas por usuarios | OK |

### 7. PAGAMENTOS E FINANCEIRO (10)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `payments` | Pagamentos processados | OK |
| `payment_splits` | Divisao de corrida entre amigos | OK |
| `payment_split_members` | Membros do split e status | OK |
| `scheduled_payments` | Pagamentos agendados/recorrentes | OK |
| `tax_records` | Registros fiscais para motoristas (IR) | OK |
| `invoices` | Faturas para usuarios e empresas | OK |
| `invoice_items` | Itens de fatura | OK |
| `trip_insurance` | Seguro opcional por corrida | OK |
| `insurance_claims` | Sinistros de seguro | OK |
| `corporate_accounts` | Contas corporativas (empresa paga) | OK |

### 8. CARTEIRA E RECOMPENSAS (6)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `wallets` | Carteira principal | OK |
| `transactions` | Transacoes gerais | OK |
| `user_points` | Pontos de fidelidade | OK |
| `cashback_earned` | Cashback ganho por corrida | OK |
| `cashback_rules` | Regras de cashback por tipo | OK |
| `corporate_invoices` | Faturas mensais corporativas | OK |

### 9. CUPONS E MARKETING (8)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `coupons` | Cupons de desconto | OK |
| `user_coupons` | Cupons do usuario | OK |
| `promo_codes` | Codigos promocionais | OK |
| `promo_code_uses` | Uso de codigos promo | OK |
| `promo_banners` | Banners promocionais | OK |
| `campaigns` | Campanhas de marketing | OK |
| `feature_flags` | Flags de features com rollout % | OK |
| `driver_incentives` | Incentivos criados para motoristas | OK |

### 10. COMUNICACAO (8)
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `messages` | Mensagens de chat | OK | SIM |
| `notifications` | Notificacoes push | OK | SIM |
| `notification_templates` | Templates de notificacao | OK | - |
| `email_templates` | Templates de email transacional | OK | - |
| `email_logs` | Log de emails enviados | OK | - |
| `announcements` | Comunicados importantes | OK | - |
| `in_app_banners` | Banners dentro de telas | OK | - |
| `in_app_messages` | Mensagens in-app contextuais | OK | SIM |

### 11. PUSH E SMS (6)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `fcm_tokens` | Tokens Firebase | OK |
| `push_log` | Log de push enviados | OK |
| `user_push_tokens` | Tokens push do usuario | OK |
| `sms_logs` | Logs de SMS | OK |
| `sms_deliveries` | Entregas de SMS | OK |
| `sms_templates` | Templates de SMS | OK |

### 12. SUPORTE (5)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `support_tickets` | Tickets de suporte | OK |
| `support_messages` | Mensagens de suporte | OK |
| `faqs` | Perguntas frequentes | OK |
| `knowledge_base_articles` | Artigos da central de ajuda | OK |
| `content_reports` | Denuncias de conteudo | OK |

### 13. SEGURANCA E EMERGENCIA (5)
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `emergency_contacts` | Contatos de emergencia | OK | - |
| `emergency_alerts` | Alertas SOS | OK | SIM |
| `sos_events` | Eventos SOS criticos | OK | SIM |
| `recording_consents` | Consentimento de gravacao | OK | - |
| `ride_recordings` | Gravacoes de seguranca | OK | - |

### 14. LOCALIZACAO (11)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `address_history` | Historico de enderecos | OK |
| `favorites` | Favoritos gerais | OK |
| `favorite_drivers` | Motoristas favoritos | OK |
| `favorite_locations` | Locais favoritos | OK |
| `hot_zones` | Zonas de alta demanda | OK |
| `popular_destinations` | Destinos populares da cidade | OK |
| `destination_suggestions` | Sugestoes por historico | OK |
| `city_zones` | Zonas da cidade | OK |
| `surge_pricing` | Tarifa dinamica | OK |
| `service_areas` | Areas de cobertura | OK |
| `airports` | Aeroportos com regras especiais | OK |

### 15. ZONAS AVANCADAS (5)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `geographic_zones` | Zonas geograficas com regras | OK |
| `zone_availability` | Disponibilidade por zona | OK |
| `zone_restrictions` | Restricoes por zona e horario | OK |
| `zone_stats` | Estatisticas por zona | OK |
| `city_configurations` | Configuracoes especificas por cidade | OK |

### 16. SOCIAL E GAMIFICACAO (9)
| Tabela | Descricao | RLS | Realtime |
|--------|-----------|-----|----------|
| `social_posts` | Posts sociais | OK | SIM |
| `social_post_likes` | Curtidas em posts | OK | - |
| `post_comments` | Comentarios | OK | SIM |
| `user_follows` | Seguidores | OK | - |
| `referrals` | Indicacoes | OK | - |
| `referral_achievements` | Conquistas de indicacao | OK | - |
| `achievements` | Catalogo de conquistas | OK | - |
| `leaderboard` | Ranking geral | OK | - |
| `driver_training` | Treinamentos para motoristas | OK | - |

### 17. ADMIN E SISTEMA (12)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `admin_roles` | Roles do admin | OK |
| `admin_permissions` | Permissoes granulares | OK |
| `admin_users` | Usuarios admin separados | OK |
| `admin_actions` | Log de acoes admin | OK |
| `admin_notifications` | Notificacoes internas admin | OK |
| `app_config` | Configuracoes do app | OK |
| `app_versions` | Versoes e force update | OK |
| `system_config` | Configuracoes do sistema | OK |
| `system_settings` | Settings do sistema | OK |
| `error_logs` | Logs de erro | OK |
| `legal_documents` | Documentos legais | OK |
| `pricing_rules` | Regras de precificacao | OK |

### 18. INTEGRACAO E LOGS (6)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `webhook_endpoints` | Endpoints de webhook | OK |
| `webhook_deliveries` | Entregas de webhook | OK |
| `audit_logs` | Log de auditoria geral | OK |
| `api_keys` | Chaves de API | OK |
| `live_activities` | Live Activities iOS | OK |
| `dashboard_metrics` | Metricas do dashboard admin | OK |

### 19. FAMILIA E PARCEIROS (4)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `family_members` | Membros da familia | OK |
| `partner_companies` | Empresas parceiras | OK |
| `hotels` | Hoteis parceiros | OK |
| `waitlist` | Lista de espera por cidade | OK |

### 20. ASSINATURAS E PREFERENCIAS (4)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `subscriptions` | Assinaturas dos usuarios | OK |
| `passenger_preferences` | Preferencias de viagem do passageiro | OK |
| `driver_ride_preferences` | Preferencias de corrida do motorista | OK |
| `driver_preferred_zones` | Zonas preferidas de trabalho | OK |

### 21. EXPERIMENTOS E CONFIGURACOES (4)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `ab_test_participants` | Usuarios em testes A/B | OK |
| `pricing_experiments` | Experimentos de precificacao | OK |
| `maintenance_windows` | Janelas de manutencao | OK |
| `onboarding_steps` | Etapas de onboarding | OK |

### 22. TERMOS E FEEDBACK (5)
| Tabela | Descricao | RLS |
|--------|-----------|-----|
| `terms_acceptances` | Aceite dos termos por versao | OK |
| `terms_versions` | Versoes dos termos de uso | OK |
| `feedback_categories` | Categorias de feedback | OK |
| `feedback_forms` | Formularios customizaveis | OK |
| `feedback_responses` | Respostas de formularios | OK |

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

## TABELAS COM REALTIME (36)

```
rides, ride_tracking, ride_offers, price_offers,
delivery_orders, intercity_bookings,
group_rides, group_ride_participants,
driver_locations,
messages, notifications, in_app_messages,
emergency_alerts, sos_events,
trust_score, hot_zones,
post_comments, social_posts,
scheduled_rides, support_messages,
+ 16 outras
```

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

### Row Level Security
- **192/192** tabelas com RLS ativo — 100%
- **302** politicas de seguranca configuradas
- Dados pessoais: apenas o dono acessa
- Tabelas lookup: leitura publica, escrita admin

### Criptografia
- `user_2fa.secret` — AES-256-GCM
- `profiles.cpf` — AES-256-GCM
- `webhook_endpoints.secret` — AES-256-GCM
- Chave: `ENCRYPTION_KEY` no Vercel

---

Atualizado em 16/03/2026 — Projeto Supabase ullmjdgppucworavoiia
