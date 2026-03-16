# UPPI - Schema do Banco de Dados

**Ultima Atualizacao:** 16/03/2026
**Projeto Supabase:** ullmjdgppucworavoiia
**Banco:** PostgreSQL 15+ com PostGIS

---

## Resumo

| Item | Quantidade |
|------|------------|
| Tabelas | 164 |
| Tabelas com RLS | 163 |
| Politicas RLS | 280 |
| Tabelas Realtime | 22 |
| Indices | 483 |
| CHECK Constraints | 579 |
| Foreign Keys | 222 |
| Triggers | 52 |
| Funcoes | 762 |
| Storage Buckets | 5 |

---

## Tabelas por Categoria

### Usuarios e Perfis (10)
| Tabela | Descricao |
|--------|-----------|
| profiles | Perfil do usuario |
| driver_profiles | Perfil do motorista |
| driver_availability | Status online |
| driver_documents | Documentos enviados |
| driver_verifications | Verificacoes |
| user_sessions | Sessoes ativas |
| user_devices | Dispositivos |
| user_2fa | Autenticacao 2FA |
| user_preferences | Preferencias |
| user_settings | Configuracoes |

### Corridas (14)
| Tabela | Descricao |
|--------|-----------|
| rides | Corridas |
| ride_requests | Solicitacoes |
| ride_locations | Localizacao GPS |
| ride_tracking | Rastreamento |
| ride_route_points | Pontos da rota |
| ride_recordings | Gravacoes |
| ride_reviews | Avaliacoes |
| ride_disputes | Disputas |
| ride_cancellations | Cancelamentos |
| scheduled_rides | Agendadas |
| group_rides | Em grupo |
| group_ride_members | Membros do grupo |
| delivery_rides | Entregas |
| ride_share_passengers | Caronas |

### Negociacao (2)
| Tabela | Descricao |
|--------|-----------|
| price_offers | Ofertas de preco |
| price_negotiations | Negociacoes |

### Financeiro (10)
| Tabela | Descricao |
|--------|-----------|
| wallets | Carteiras |
| wallet_transactions | Transacoes da carteira |
| transactions | Transacoes gerais |
| payments | Pagamentos |
| withdrawals | Saques |
| driver_earnings | Ganhos do motorista |
| tip_transactions | Gorjetas |
| refunds | Reembolsos |
| payment_methods_saved | Metodos salvos |
| payment_splits | Divisao de pagamento |

### Comunicacao (8)
| Tabela | Descricao |
|--------|-----------|
| messages | Mensagens do chat |
| conversations | Conversas |
| notifications | Notificacoes |
| push_logs | Log de push |
| fcm_tokens | Tokens FCM |
| sms_logs | Log de SMS |
| sms_fallback_log | SMS fallback |
| email_logs | Log de email |

### Suporte (5)
| Tabela | Descricao |
|--------|-----------|
| support_tickets | Tickets |
| support_conversations | Conversas de suporte |
| support_messages | Mensagens de suporte |
| faq_categories | Categorias FAQ |
| faq_items | Items FAQ |

### Emergencia (5)
| Tabela | Descricao |
|--------|-----------|
| emergency_contacts | Contatos de emergencia |
| emergency_alerts | Alertas |
| sos_events | Eventos SOS |
| incident_reports | Relatorios |
| insurance_claims | Sinistros |

### Avaliacoes (4)
| Tabela | Descricao |
|--------|-----------|
| ratings | Notas |
| reviews | Avaliacoes |
| review_tags | Tags |
| driver_rating_breakdown | Detalhamento |

### Social (6)
| Tabela | Descricao |
|--------|-----------|
| social_posts | Posts |
| social_post_likes | Curtidas |
| post_comments | Comentarios |
| user_follows | Seguidores |
| user_blocks | Bloqueios |
| user_reports | Denuncias |

### Gamificacao (6)
| Tabela | Descricao |
|--------|-----------|
| achievements | Conquistas |
| user_achievements | Conquistas do usuario |
| leaderboard_entries | Ranking |
| user_points | Pontos |
| driver_levels | Niveis do motorista |
| driver_level_tiers | Faixas de nivel |

### Marketing (9)
| Tabela | Descricao |
|--------|-----------|
| coupons | Cupons |
| coupon_uses | Uso de cupons |
| user_coupons | Cupons do usuario |
| promo_codes | Codigos promocionais |
| campaigns | Campanhas |
| campaign_analytics | Analytics |
| promotions | Promocoes |
| in_app_banners | Banners |
| announcements | Anuncios |

### Referral (2)
| Tabela | Descricao |
|--------|-----------|
| referrals | Indicacoes |
| referral_rewards | Recompensas |

### Configuracao (6)
| Tabela | Descricao |
|--------|-----------|
| system_config | Config do sistema |
| app_versions | Versoes do app |
| feature_flags | Feature flags |
| maintenance_windows | Manutencao |
| terms_versions | Versoes dos termos |
| terms_acceptances | Aceites |

### Localizacao (10)
| Tabela | Descricao |
|--------|-----------|
| driver_locations | Localizacao atual |
| driver_location_history | Historico |
| hot_zones | Zonas quentes |
| geographic_zones | Zonas geograficas |
| service_areas | Areas de servico |
| popular_destinations | Destinos populares |
| saved_addresses | Enderecos salvos |
| addresses | Enderecos |
| airports | Aeroportos |
| hotels | Hoteis |

### Precos (6)
| Tabela | Descricao |
|--------|-----------|
| ride_pricing_rules | Regras de preco |
| surge_pricing | Preco dinamico |
| zone_pricing | Preco por zona |
| pricing_experiments | Experimentos |
| cashback_rules | Regras de cashback |
| cashback_earned | Cashback ganho |

### Admin (9)
| Tabela | Descricao |
|--------|-----------|
| admin_actions | Acoes admin |
| admin_logs | Logs admin |
| audit_logs | Auditoria |
| error_logs | Erros |
| api_keys | Chaves API |
| webhooks | Webhooks |
| webhook_logs | Logs webhook |
| blocked_ips | IPs bloqueados |
| ban_history | Historico de ban |

### Outros (62)
Tabelas adicionais de veiculos, treinamento, estatisticas, feedback, seguranca, parceiros, assinaturas, etc.

---

## Realtime (22 tabelas)

```
rides, ride_locations, ride_requests, driver_availability,
driver_profiles, messages, conversations, notifications,
price_negotiations, price_offers, emergency_alerts, sos_events,
group_rides, group_ride_members, scheduled_rides, delivery_rides,
ride_share_passengers, payment_splits, ride_disputes,
support_conversations, support_messages, tip_transactions
```

---

## Storage Buckets (5)

| Bucket | Publico | Uso |
|--------|---------|-----|
| avatars | Sim | Fotos de perfil |
| driver-documents | Nao | CNH, CRLV |
| vehicle-photos | Nao | Fotos do veiculo |
| ride-recordings | Nao | Gravacoes |
| support-attachments | Nao | Anexos de suporte |

---

## Funcoes Principais (RPCs)

| Funcao | Descricao |
|--------|-----------|
| find_nearby_drivers | Busca motoristas proximos |
| accept_ride | Aceita corrida |
| complete_ride | Completa corrida |
| calculate_ride_price | Calcula preco |
| upsert_driver_location | Atualiza GPS |
| get_wallet_balance | Retorna saldo |
| request_withdrawal | Solicita saque |
| create_notification | Cria notificacao |

---

## Extensoes

- uuid-ossp
- pgcrypto
- postgis
- pg_graphql
- pg_stat_statements
- supabase_vault
- plpgsql

---

**Para mais detalhes, consulte os arquivos de migracao em `scripts/`**
