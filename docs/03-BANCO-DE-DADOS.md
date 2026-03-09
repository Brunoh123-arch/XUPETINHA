# Banco de Dados — Uppi

Supabase (PostgreSQL) com RLS em todas as tabelas.

**Total: 101 tabelas | 188 RLS policies | 288+ indices**

---

## Tabelas por Categoria

### Usuarios e Perfis
| Tabela | Colunas | Descricao |
|---|---|---|
| `profiles` | 29 | Perfil principal de todos os usuarios |
| `driver_profiles` | 42 | Perfil completo do motorista (CNH, veiculo, notas) |
| `vehicles` | 15 | Veiculos cadastrados pelos motoristas |
| `user_settings` | 15 | Configuracoes pessoais do usuario |
| `user_onboarding` | 9 | Status de onboarding por etapa |
| `user_2fa` | 8 | Configuracao de autenticacao em 2 fatores |

### Corridas
| Tabela | Colunas | Descricao |
|---|---|---|
| `rides` | 43 | Corridas principais (a tabela central do app) |
| `ride_tracking` | 10 | Pontos de rastreamento GPS em tempo real |
| `ride_offers` | 10 | Ofertas de preco negociadas |
| `ride_recordings` | 20 | Gravacoes de audio/video das corridas |
| `scheduled_rides` | 18 | Corridas agendadas para data futura |
| `price_offers` | 10 | Propostas de valor motorista/passageiro |
| `popular_routes` | 12 | Rotas mais usadas para sugestao |
| `address_history` | 7 | Historico de enderecos usados |
| `address_search_history` | 14 | Historico de buscas de endereco |

### Corridas em Grupo e Intercity
| Tabela | Colunas | Descricao |
|---|---|---|
| `group_rides` | 14 | Corridas compartilhadas em grupo |
| `group_ride_members` | 5 | Membros de cada corrida em grupo |
| `group_ride_participants` | 10 | Participantes detalhados |
| `intercity_rides` | 22 | Corridas cidade a cidade |
| `intercity_routes` | 8 | Rotas intercity disponiveis |
| `intercity_bookings` | 7 | Reservas de corridas intercity |

### Pagamentos e Carteira
| Tabela | Colunas | Descricao |
|---|---|---|
| `payments` | 14 | Pagamentos realizados |
| `user_wallets` | 5 | Saldo da carteira digital |
| `wallet_transactions` | 14 | Historico de transacoes da carteira |
| `user_payment_methods` | 9 | Metodos de pagamento salvos (cartao, PIX) |
| `driver_withdrawals` | 15 | Saques de motoristas |
| `subscriptions` | 14 | Assinaturas ativas do Club Uppi |
| `subscription_plans` | 10 | Planos disponiveis (Basic, Premium, VIP) |

### Avaliacoes e Reviews
| Tabela | Colunas | Descricao |
|---|---|---|
| `reviews` | 12 | Avaliacoes gerais |
| `ratings` | 15 | Notas detalhadas por categoria |
| `driver_reviews` | 20 | Reviews especificos de motoristas |
| `rating_categories` | 7 | Categorias de avaliacao |

### Social
| Tabela | Colunas | Descricao |
|---|---|---|
| `social_posts` | 14 | Posts do feed social |
| `social_likes` | 4 | Curtidas nos posts |
| `social_comments` | 6 | Comentarios nos posts |
| `social_follows` | 4 | Seguidores entre usuarios |
| `post_likes` | 4 | Curtidas alternativas |
| `post_comments` | 8 | Comentarios alternativos |
| `user_social_stats` | 5 | Estatisticas sociais do usuario |
| `messages` | 7 | Mensagens entre usuarios |

### Promocoes e Cupons
| Tabela | Colunas | Descricao |
|---|---|---|
| `promotions` | 16 | Promocoes ativas |
| `user_promotions` | 6 | Promocoes usadas por usuario |
| `coupons` | 16 | Cupons de desconto |
| `coupon_uses` | 6 | Historico de uso de cupons |
| `promo_codes` | 12 | Codigos promocionais |
| `promo_code_uses` | 5 | Uso de codigos promo |
| `promo_banners` | 18 | Banners de promocao no app |
| `user_coupons` | 9 | Cupons por usuario |
| `campaigns` | 15 | Campanhas de marketing |

### Gamificacao e Conquistas
| Tabela | Colunas | Descricao |
|---|---|---|
| `achievements` | 9 | Catalogo de conquistas disponiveis |
| `user_achievements` | 9 | Conquistas desbloqueadas por usuario |
| `leaderboard` | 18 | Ranking de usuarios/motoristas |
| `referrals` | 11 | Indicacoes de novos usuarios |
| `referral_achievements` | 8 | Conquistas por indicacao |

### Notificacoes e Push
| Tabela | Colunas | Descricao |
|---|---|---|
| `notifications` | 11 | Notificacoes in-app |
| `notification_preferences` | 13 | Preferencias de notificacao por usuario |
| `fcm_tokens` | 7 | Tokens FCM para push nativo (Android) |
| `user_push_tokens` | 7 | Tokens push alternativos |
| `push_subscriptions` | 9 | Inscricoes push |
| `push_log` | 9 | Log de envios push |

### SMS
| Tabela | Colunas | Descricao |
|---|---|---|
| `sms_deliveries` | 20 | Entregas de SMS |
| `sms_logs` | 8 | Log de SMS enviados |
| `sms_templates` | 8 | Templates de mensagens SMS |
| `user_sms_preferences` | 10 | Preferencias de SMS do usuario |
| `email_otps` | 6 | OTPs de email para verificacao |

### Suporte
| Tabela | Colunas | Descricao |
|---|---|---|
| `support_tickets` | 11 | Tickets de suporte abertos |
| `support_messages` | 10 | Mensagens dos tickets |
| `faqs` | 9 | Perguntas frequentes |

### Seguranca e Emergencia
| Tabela | Colunas | Descricao |
|---|---|---|
| `emergency_contacts` | 8 | Contatos de emergencia do usuario |
| `emergency_alerts` | 11 | Alertas de SOS disparados |
| `emergency_events` | 10 | Eventos de emergencia registrados |
| `driver_verifications` | 10 | Verificacoes de identidade do motorista |
| `recording_consents` | 5 | Consentimentos de gravacao |
| `trip_recordings` | 8 | Gravacoes de viagem |
| `user_recording_preferences` | 7 | Preferencias de gravacao |

### Familia
| Tabela | Colunas | Descricao |
|---|---|---|
| `family_groups` | 4 | Grupos familiares |
| `family_group_members` | 5 | Membros do grupo familiar |
| `family_members` | 10 | Membros familiares detalhados |

### Favoritos
| Tabela | Colunas | Descricao |
|---|---|---|
| `favorites` | 8 | Favoritos gerais |
| `favorite_places` | 8 | Lugares favoritos |
| `favorite_drivers` | 4 | Motoristas favoritos |

### Motoristas e Operacao
| Tabela | Colunas | Descricao |
|---|---|---|
| `driver_locations` | 11 | Localizacao em tempo real dos motoristas |
| `driver_schedule` | 8 | Agenda de disponibilidade do motorista |
| `hot_zones` | 9 | Zonas de alta demanda |
| `surge_pricing` | 16 | Precificacao dinamica por zona |
| `pricing_rules` | 13 | Regras de precificacao |
| `city_zones` | 14 | Zonas da cidade |

### Entregas
| Tabela | Colunas | Descricao |
|---|---|---|
| `delivery_orders` | 26 | Pedidos de entrega |

### Webhooks
| Tabela | Colunas | Descricao |
|---|---|---|
| `webhooks` | 10 | Endpoints de webhook configurados |
| `webhook_endpoints` | 10 | Endpoints alternativos |
| `webhook_deliveries` | 11 | Historico de entregas de webhook |

### Configuracoes e Admin
| Tabela | Colunas | Descricao |
|---|---|---|
| `app_config` | 8 | Configuracoes do app |
| `system_config` | 5 | Configuracoes do sistema |
| `system_settings` | 8 | Settings globais |
| `legal_documents` | 9 | Documentos legais (termos, privacidade) |
| `admin_logs` | 9 | Log de acoes dos administradores |
| `error_logs` | 7 | Log de erros do sistema |
| `platform_metrics` | 16 | Metricas da plataforma |

---

## RPCs Principais (Funcoes PostgreSQL)

| RPC | Descricao |
|---|---|
| `get_trust_score(user_id)` | Retorna score de confianca (0-100) |
| `get_ride_eta(ride_id)` | ETA e posicao do motorista |
| `calculate_fare(lat, lng, dest_lat, dest_lng, type)` | Calcula tarifa com surge |
| `calculate_surge_price(lat, lng)` | Multiplicador de preco dinamico |
| `get_hot_zones_for_driver(driver_id)` | Zonas quentes para motorista |
| `get_user_achievements(user_id)` | Conquistas do usuario |
| `get_driver_earnings_stats(driver_id)` | Estatisticas de ganhos |
| `get_referral_stats(user_id)` | Estatisticas de indicacoes |
| `get_leaderboard(type, limit)` | Ranking de usuarios |

---

## Seguranca

- **RLS ativo em 100% das tabelas**
- Cada usuario acessa apenas seus proprios dados
- Admins tem policies separadas via `user_type = 'admin'`
- Drivers tem policies via `driver_profiles`
- Queries parametrizadas em todas as APIs (sem SQL injection)
