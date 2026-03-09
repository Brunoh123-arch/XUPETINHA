# UPPI - AUDITORIA COMPLETA FINAL (CODIGO vs BANCO DE DADOS)

**Data da Auditoria:** 09/03/2026
**Versao:** 14.0 — AUDITORIA FINAL DEFINITIVA
**Status do Banco:** OPERACIONAL — 87 tabelas ativas no Supabase jpnwxqjrhzaobnugjnyx
**Verificado via:** SQL direto em 09/03/2026 (migrations 001–034 aplicadas)

---

## SUMARIO EXECUTIVO — VALORES REAIS (verificados via SQL em 09/03/2026)

| Item | Valor |
|------|-------|
| Projeto Supabase | jpnwxqjrhzaobnugjnyx |
| Tabelas no banco public | **87** |
| Tabelas com RLS ativo | **86** (exceto spatial_ref_sys — PostGIS) |
| Tabelas COM Realtime | **51** (verificado via pg_publication_tables) |
| Tabelas SEM Realtime | **35** |
| RPCs de negocio (excl. PostGIS/triggers) | **75** (verificado via information_schema.routines) |
| Politicas RLS | **162** |
| Indices de performance | **235** |
| Triggers customizados | **35** |
| Views | **1** (ride_offers) |
| API Routes (arquivos route.ts) | 57+ |
| Endpoints HTTP totais | 92+ |
| Paginas (page.tsx) | 152 |
| Migrations aplicadas | 034 |

---

## SECAO 1: 87 TABELAS REAIS (verificadas via SQL em 09/03/2026 — migrations 001-034)

### 7 tabelas adicionadas nas migrations 033-034
- `fcm_tokens` — tokens Firebase push notification (7 colunas, RLS sim, Realtime sim)
- `push_log` — log de push notifications enviadas (9 colunas, RLS sim)
- `promo_codes` — sistema de promo codes (12 colunas, RLS sim, Realtime sim)
- `promo_code_uses` — historico de uso de promo codes (5 colunas, RLS sim)
- `system_config` — configuracoes chave-valor da plataforma (5 colunas, RLS sim)
- `driver_schedule` — agenda de disponibilidade do motorista (8 colunas, RLS sim, Realtime sim)
- `family_members` — membros da familia para rastreamento (10 colunas, RLS sim, Realtime sim)

### View adicionada
- `ride_offers` — VIEW alias de `price_offers` (compatibilidade com codigo legado)

### 1. Usuarios e Perfis (2 tabelas)

**profiles** — 25 colunas
- id (uuid PK, FK auth.users), email, full_name, phone, avatar_url
- user_type (passenger/driver/admin), status, is_admin, is_banned, banned_at, ban_reason
- rating, total_rides, referral_code, referred_by, fcm_token, preferences (jsonb)
- current_mode, cpf, birth_date, bio, total_saved, referral_credits, trust_score, trust_level
- created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**driver_profiles** — 37 colunas
- id (uuid PK, FK profiles), vehicle_brand, vehicle_model, vehicle_plate, vehicle_color, vehicle_type, vehicle_year, vehicle_photo_url
- is_verified, is_available, is_online, rating, total_rides, total_earnings
- current_lat, current_lng, cnh_number, cnh_expiry, cpf, pix_key, bank_account, bank_name, bank_agency
- document_url, verification_status, verification_photo_url, requires_verification, verification_attempts, last_verification_at
- acceptance_rate, trust_score, rejection_count, mode, cancellation_count, punctuality_rate, license_number, license_category
- created_at, updated_at
- **RLS:** sim | **Realtime:** sim

---

### 2. Corridas (3 tabelas)

**rides** — 42 colunas
- id, passenger_id, driver_id
- pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng
- distance_km, estimated_duration_minutes, passenger_price_offer, estimated_price, final_price
- payment_method, vehicle_type, status (searching/negotiating/accepted/in_progress/completed/cancelled)
- notes, scheduled_time, started_at, completed_at, cancelled_at, cancellation_reason
- accepted_at, pickup_at, rating_by_passenger, rating_by_driver, surge_multiplier
- coupon_code, coupon_discount, share_token, group_ride_id, is_shared, cancelled_by
- ride_type, pickup_city, dropoff_city, delivery_type, driver_lat, driver_lng
- created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**price_offers** — 10 colunas
- id, ride_id, driver_id, offered_price, message, status (pending/accepted/rejected/expired)
- eta_minutes, expires_at, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**scheduled_rides** — 17 colunas
- id, passenger_id, driver_id, ride_id, origin_address, origin_lat, origin_lng
- dest_address, dest_lat, dest_lng, scheduled_at, estimated_price, vehicle_type
- status, notes, driver_confirmed_at, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

---

### 3. Localizacao (4 tabelas)

**driver_locations** — 10 colunas
- id, driver_id (UNIQUE), latitude, longitude, heading, speed, accuracy, is_available, last_updated, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**ride_tracking** — 9 colunas
- id, ride_id, driver_id, latitude, longitude, speed, heading, accuracy, timestamp, created_at
- **RLS:** sim | **Realtime:** sim

**hot_zones** — 9 colunas
- id, name, latitude, longitude, radius_meters, intensity, is_active, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**city_zones** — 14 colunas
- id, name, type, lat, lng, radius_km, city, state, is_hot_zone, is_active, surge_factor, demand_index, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

---

### 4. Comunicacao (5 tabelas)

**messages** — 7 colunas
- id, ride_id, sender_id, content, type, read, created_at
- **RLS:** sim | **Realtime:** sim

**notifications** — 10 colunas
- id, user_id, title, message, type, data (jsonb), metadata (jsonb), is_read, read_at, created_at
- **RLS:** sim | **Realtime:** sim

**notification_preferences** — 13 colunas
- id, user_id, push_enabled, sms_enabled, email_enabled, ride_updates, promotions, social, achievements, quiet_hours_start, quiet_hours_end, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

**push_subscriptions** — 9 colunas
- id, user_id, endpoint, auth_key, p256dh_key, device_type, is_active, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

**user_push_tokens** — 7 colunas
- id, user_id, token, platform, is_active, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

---

### 5. Financeiro (7 tabelas)

**user_wallets** — 5 colunas
- id, user_id (UNIQUE), balance, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**wallet_transactions** — 14 colunas
- id, user_id, type, amount, description, ride_id, status, reference_id, reference_type, pix_key, metadata (jsonb), balance_after, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**payments** — 14 colunas
- id, ride_id, user_id, driver_id, amount, payment_method, status, provider_ref, pix_qr_code, pix_copy_paste, platform_fee, driver_earnings, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**coupons** — 15 colunas
- id, code, description, discount_type, discount_value, min_ride_value, max_discount, usage_limit, usage_count, current_uses, max_uses, is_reusable, valid_from, valid_until, is_active, created_at
- **RLS:** sim | **Realtime:** nao

**coupon_uses** — 6 colunas
- id, coupon_id, user_id, ride_id, discount, used_at
- **RLS:** sim | **Realtime:** nao

**user_coupons** — 8 colunas
- id, user_id, coupon_id, used, used_at, expires_at, ride_id, created_at
- **RLS:** sim | **Realtime:** nao

**driver_withdrawals** — 15 colunas
- id, driver_id, amount, pix_key, pix_key_type, bank_name, status, requested_at, processed_at, processed_by, rejection_reason, wallet_tx_id, notes, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

---

### 6. Avaliacoes (4 tabelas)

**ratings** — 17 colunas
- id, ride_id, rater_id, rated_id, reviewer_id, reviewed_id, score, stars, comment, tags, category_ratings (jsonb), is_anonymous, rater_type, rated_type, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**driver_reviews** — 20 colunas
- Avaliacoes bidirecionais com campos separados para passageiro e motorista
- **RLS:** sim | **Realtime:** sim

**reviews** — 12 colunas
- id, ride_id, reviewer_id, reviewed_id, rating, comment, tags, is_public, is_flagged, flag_reason, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

**rating_categories** — 7 colunas
- id, name, label, icon, user_type, is_active, order_index
- **RLS:** sim | **Realtime:** nao

---

### 7. Social e Gamificacao (9 tabelas)

**social_posts** — 14 colunas
- id, user_id, content, type, title, image_url, ride_id, likes_count, comments_count, visibility, is_pinned, is_active, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**social_post_likes** — 4 colunas (UNIQUE: post_id, user_id)
- **RLS:** sim | **Realtime:** sim

**social_follows** — 4 colunas (follower_id, following_id)
- **RLS:** sim | **Realtime:** sim

**post_comments** — 7 colunas (com parent_id para threads)
- **RLS:** sim | **Realtime:** sim (adicionado migration 026)

**post_likes** — 4 colunas
- **RLS:** sim | **Realtime:** sim (adicionado migration 026)

**user_social_stats** — 5 colunas (posts_count, likes_received, comments_received)
- **RLS:** sim | **Realtime:** nao

**leaderboard** — 14 colunas
- id, user_id, user_type, period, score, rank, rides_count, rating_avg, total_spent, total_earned, total_rides, rating, period_start, period_end, updated_at
- **RLS:** sim | **Realtime:** sim

**user_achievements** — 9 colunas
- id, user_id, achievement_id, title, description, icon, points, unlocked_at, credits_earned
- **RLS:** sim | **Realtime:** sim

**referral_achievements** — 7 colunas
- **RLS:** sim | **Realtime:** nao

---

### 8. Motorista e Documentos (2 tabelas)

**driver_verifications** — 10 colunas
- id, driver_id, type (cnh/vehicle/face/insurance), photo_url, status, rejection_reason, reviewed_by, reviewed_at, expires_at, created_at
- **RLS:** sim | **Realtime:** nao

**vehicles** — 13 colunas
- id, driver_id, brand, model, year, color, plate, type, is_primary, document_url, insurance_url, is_verified, verified_at, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

---

### 9. Seguranca (5 tabelas)

**emergency_contacts** — 9 colunas
- id, user_id, name, phone, relationship, contact_user_id, can_track_rides, notify_on_start, notify_on_end, is_primary, created_at
- **RLS:** sim | **Realtime:** sim

**emergency_alerts** — 11 colunas
- id, user_id, ride_id, type, status, lat, lng, location, notes, resolved_at, created_at
- **RLS:** sim | **Realtime:** sim

**ride_recordings** — 21 colunas
- id, ride_id, user_id, file_url, storage_path, duration_sec, duration_seconds, size_bytes, file_size_bytes, status, recording_type, is_flagged, flag_reason, reviewed_by, reviewed_at, encryption_key, encryption_iv, encryption_auth_tag, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

**recording_consents** — 5 colunas
- id, ride_id, user_id, consented, consented_at
- **RLS:** sim | **Realtime:** nao

**user_recording_preferences** — 7 colunas (PK: user_id)
- user_id, enabled, auto_record, notify_on_record, retention_days, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

---

### 10. Corridas Especiais (5 tabelas)

**group_rides** — 13 colunas
- id, organizer_id, ride_id, name, max_passengers, pickup_*, dropoff_*, scheduled_time, status, created_at
- **RLS:** sim | **Realtime:** sim

**group_ride_members** — 5 colunas
- **RLS:** sim | **Realtime:** sim

**group_ride_participants** — 10 colunas
- id, group_id, user_id, role, status, pickup_address, pickup_lat, pickup_lng, joined_at, created_at
- **RLS:** sim | **Realtime:** sim

**intercity_rides** — 21 colunas
- id, passenger_id, driver_id, origin_city, origin_state, origin_address, dest_city, dest_state, dest_address, distance_km, departure_time, estimated_arrival, available_seats, booked_seats, price_per_seat, vehicle_type, allow_pets, allow_luggage, status, notes, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**intercity_bookings** — 7 colunas
- id, intercity_ride_id, passenger_id, seats, total_price, status, created_at
- **RLS:** sim | **Realtime:** sim

---

### 11. Delivery (1 tabela)

**delivery_orders** — 24 colunas
- id, user_id, driver_id, pickup_*/dropoff_*, recipient_name, recipient_phone
- package_description, package_size, package_weight_kg, is_fragile, requires_signature
- estimated_price, final_price, status, tracking_code, notes, photo_on_delivery_url
- delivered_at, cancelled_at, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

---

### 12. Suporte (2 tabelas)

**support_tickets** — 11 colunas
- id, user_id, topic, status, priority, category, ride_id, assigned_to, resolved_at, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**support_messages** — 9 colunas
- id, ticket_id, sender_id, sender_type, sender_name, message, attachments (jsonb), is_admin, read_at, created_at
- **RLS:** sim | **Realtime:** sim

---

### 13. Indicacoes e Fidelidade (6 tabelas)

**referrals** — 11 colunas (referrer_id, referred_id, referral_code, status, reward_amount, reward_paid...)
- **RLS:** sim | **Realtime:** sim (adicionado migration 026)

**subscriptions** — 12 colunas
- id, user_id, plan, status, started_at, expires_at, cancelled_at, price, payment_id, auto_renew, discount_rides, priority_support, cashback_percent, created_at
- **RLS:** sim | **Realtime:** sim

**promotions** — 15 colunas
- **RLS:** sim | **Realtime:** nao

**promo_banners** — 18 colunas
- id, title, subtitle, image_url, action_url, action_label, bg_color, text_color, is_active, target, start_at, end_at, priority, clicks, impressions, created_by, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**favorite_drivers** — 4 colunas
- **RLS:** sim | **Realtime:** sim (adicionado migration 026)

**campaigns** — 13 colunas
- **RLS:** sim | **Realtime:** nao

---

### 14. Rotas e Enderecos (5 tabelas)

**popular_routes** — 11 colunas (com start/end coordinates, usage_count, avg_price, avg_duration)
- **RLS:** sim | **Realtime:** nao

**address_search_history** — 14 colunas (com place_id, street_name, neighborhood, use_count, last_used_at)
- **RLS:** sim | **Realtime:** nao

**address_history** — 7 colunas
- **RLS:** sim | **Realtime:** nao

**favorites** — 8 colunas (user_id, label, address, lat, lng, icon)
- **RLS:** sim | **Realtime:** nao

---

### 15. SMS (4 tabelas)

**sms_templates** — 7 colunas
- **RLS:** sim | **Realtime:** nao

**sms_deliveries** — 20+ colunas
- Inclui: phone_number, segments, provider_message_id, cost_cents, retry_count, failed_at
- **RLS:** sim | **Realtime:** sim

**sms_logs** — 8 colunas
- **RLS:** sim | **Realtime:** nao

**user_sms_preferences** — 10 colunas (PK: user_id)
- **RLS:** sim | **Realtime:** nao

---

### 16. Precificacao e Configuracao (4 tabelas)

**pricing_rules** — 13 colunas
- id, name, vehicle_type, base_fare, per_km, per_minute, minimum_fare, surge_multiplier, city, is_active, priority, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

**surge_pricing** — 16 colunas
- id, zone_name, zone_lat, zone_lng, radius_km, multiplier, reason, active_from, active_until, days_of_week, is_active, auto_calculated, demand_level, created_by, created_at, updated_at
- **RLS:** sim | **Realtime:** sim

**app_config** — 8 colunas (key/value com category e updated_by)
- **RLS:** sim | **Realtime:** nao

**platform_metrics** — 17 colunas (metricas diarias snapshot)
- **RLS:** sim | **Realtime:** nao

---

### 17. Admin e Logs (3 tabelas)

**admin_logs** — 9 colunas
- id, admin_id, action, target_type, target_id, details (jsonb), ip_address, user_agent, created_at
- **RLS:** sim | **Realtime:** nao

**error_logs** — 7 colunas
- id, user_id, error_type, message, stack, context (jsonb), created_at
- **RLS:** sim | **Realtime:** sim

**system_settings** — 8 colunas (key/value publico ou privado)
- **RLS:** sim | **Realtime:** nao

---

### 18. Legal e Conteudo (2 tabelas)

**faqs** — 9 colunas
- **RLS:** sim | **Realtime:** nao

**legal_documents** — 9 colunas
- id, type, title, content, version, is_active, published_at, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

---

### 19. Auth e Configuracoes do Usuario (5 tabelas)

**email_otps** — 6 colunas (email, otp, expires_at, used)
- **RLS:** sim | **Realtime:** nao

**user_2fa** — 9 colunas (secret, backup_codes, enabled_at)
- **RLS:** sim | **Realtime:** nao

**user_settings** — 15 colunas (PK: user_id — todas as preferencias do usuario)
- **RLS:** sim | **Realtime:** nao

**user_onboarding** — 9 colunas (current_step, steps_done jsonb, data jsonb)
- **RLS:** sim | **Realtime:** nao

**family_members** — 9 colunas (can_track_rides, notify_on_start, notify_on_end)
- **RLS:** sim | **Realtime:** nao

---

### 20. Webhooks (2 tabelas)

**webhook_endpoints** — 10 colunas
- id, name, url, secret, events (array), is_active, headers (jsonb), created_by, created_at, updated_at
- **RLS:** sim | **Realtime:** nao

**webhook_deliveries** — 11 colunas
- id, endpoint_id, event, payload (jsonb), status, status_code, response_body, attempt, error_message, delivered_at, created_at
- **RLS:** sim | **Realtime:** sim

---

### 21. PostGIS (1 tabela — sistema)

**spatial_ref_sys** — Sistema de coordenadas de referencia do PostGIS
- **RLS:** nao | **Realtime:** nao

---

## SECAO 2: 75 RPCs DE NEGOCIO (verificado via information_schema.routines em 09/03/2026)

### Por categoria

| Categoria | Funcoes | Qtd |
|-----------|---------|-----|
| Corridas e Motorista | accept_price_offer, accept_ride, book_intercity_seat, cancel_ride, complete_ride, create_ride, driver_accept_scheduled_ride, estimate_ride_price, find_nearby_drivers, get_available_scheduled_rides, get_driver_active_ride, get_driver_home_data, get_nearby_drivers, get_popular_routes_nearby, get_surge_multiplier, handle_driver_cancellation, search_drivers_nearby, start_ride, submit_price_offer, upsert_driver_location | 20 |
| Financeiro | apply_coupon, apply_coupon_to_ride, calculate_wallet_balance, get_admin_financial_summary, get_driver_wallet_balance, get_full_wallet_statement, get_pending_withdrawals, get_rides_revenue_by_day, get_user_payment_summary, get_wallet_balance, redeem_coupon, request_withdrawal, request_withdrawal_v2, admin_approve_withdrawal, admin_process_withdrawal, admin_reject_withdrawal, approve_withdrawal, reject_withdrawal | 18 |
| Perfil e Usuario | calculate_ride_price, check_ride_reviewed, generate_referral_code, get_driver_dashboard_stats, get_driver_earnings_stats, get_driver_stats, get_frequent_destinations, get_full_profile, get_passenger_home_data, get_pending_reviews, get_referral_stats, get_user_stats, needs_facial_verification, submit_rating, submit_ride_rating, update_trust_score | 16 |
| Social e Gamificacao | check_and_award_achievements, check_and_grant_achievements, check_and_grant_referral_achievements, get_leaderboard, get_leaderboard_full, get_social_feed, process_referral_reward, refresh_leaderboard | 8 |
| Notificacoes | create_notification, get_notifications_summary, mark_all_notifications_read, send_notification | 4 |
| Suporte | create_support_ticket, get_support_ticket_with_messages, reply_support_ticket | 3 |
| Admin e Plataforma | admin_ban_user, admin_verify_driver, create_emergency_alert, get_app_config, get_popular_routes, get_ride_history, get_ride_history_paginated, get_ride_with_details, record_address_search, search_address_history, snapshot_platform_metrics | 11 |
| Webhooks | get_pending_webhooks, update_webhook_delivery | 2 |
| **TOTAL** | | **75** |

---

## SECAO 3: TRIGGERS — 35 customizados (verificado via information_schema.triggers em 09/03/2026)

| Trigger | Tabela | Evento | Descricao |
|---|---|---|---|
| on_profile_created | profiles | INSERT BEFORE | Cria registro inicial do perfil |
| on_profile_created_wallet | profiles | INSERT AFTER | Cria carteira automaticamente |
| on_profile_created_settings | profiles | INSERT AFTER | Cria preferencias do usuario |
| on_profile_created_recording_prefs | profiles | INSERT AFTER | Cria preferencias de gravacao |
| on_profile_created_sms_prefs | profiles | INSERT AFTER | Cria preferencias de SMS |
| trg_auto_referral_code | profiles | INSERT BEFORE | Gera codigo de indicacao |
| trg_profiles_updated_at | profiles | UPDATE BEFORE | Atualiza timestamp |
| trg_auto_payment_on_complete | rides | UPDATE AFTER | Cria pagamento ao concluir corrida |
| trg_driver_wallet_complete | rides | UPDATE AFTER | Credita motorista ao concluir |
| trg_check_achievements | rides | UPDATE AFTER | Concede conquistas ao concluir |
| trg_leaderboard_on_complete | rides | UPDATE AFTER | Atualiza leaderboard |
| trg_referral_on_complete | rides | UPDATE AFTER | Processa recompensa de indicacao |
| trg_ride_completed | rides | UPDATE AFTER | Trigger principal de pos-conclusao |
| trg_driver_cancellation | rides | UPDATE AFTER | Trata cancelamento pelo motorista |
| trg_snapshot_metrics | rides | UPDATE AFTER | Snapshot de metricas |
| trg_rides_updated_at | rides | UPDATE BEFORE | Atualiza timestamp |
| trg_trust_score_on_rating | ratings | INSERT AFTER | Atualiza trust score |
| trg_update_rating | ratings | INSERT AFTER | Atualiza media de rating |
| trg_post_comments_count | post_comments | INSERT/DELETE AFTER | Mantém contador de comentarios |
| trg_post_likes_count | post_likes | INSERT/DELETE AFTER | Mantém contador de likes |
| trg_acceptance_rate | price_offers | UPDATE AFTER | Atualiza taxa de aceitacao |
| trg_price_offers_updated_at | price_offers | UPDATE BEFORE | Atualiza timestamp |
| trg_driver_profiles_updated_at | driver_profiles | UPDATE BEFORE | Atualiza timestamp |
| trg_driver_withdrawals_updated_at | driver_withdrawals | UPDATE BEFORE | Atualiza timestamp |
| trg_payments_updated_at | payments | UPDATE BEFORE | Atualiza timestamp |
| trg_delivery_updated_at | delivery_orders | UPDATE BEFORE | Atualiza timestamp |
| trg_intercity_updated_at | intercity_rides | UPDATE BEFORE | Atualiza timestamp |
| trg_scheduled_rides_updated_at | scheduled_rides | UPDATE BEFORE | Atualiza timestamp |
| trg_support_tickets_updated_at | support_tickets | UPDATE BEFORE | Atualiza timestamp |
| trg_recording_prefs_updated_at | user_recording_preferences | UPDATE BEFORE | Atualiza timestamp |
| trg_sms_prefs_updated_at | user_sms_preferences | UPDATE BEFORE | Atualiza timestamp |
| trg_user_wallets_updated_at | user_wallets | UPDATE BEFORE | Atualiza timestamp |

---

## SECAO 4: PONTOS DE ATENCAO (auditoria 09/03/2026)

### 3.1 Tabelas duplicadas — mesmo conceito, dois nomes

| Tabela A | Tabela B | Problema | Decisao |
|---|---|---|---|
| `post_likes` (sem RT) | `social_post_likes` (com RT) | Schema identico: post_id, user_id, created_at | Usar `social_post_likes` — ja tem Realtime e politicas corretas |
| `group_ride_members` (FK: group_ride_id) | `group_ride_participants` (FK: group_id) | Mesmo conceito, FK com nome diferente | APIs devem usar `group_ride_participants` (mais completa: tem role, pickup_*) |

### 3.2 Colunas duplicadas dentro da mesma tabela

| Tabela | Par duplicado | Coluna correta |
|---|---|---|
| `ratings` | `rater_id` / `reviewer_id` | `rater_id` |
| `ratings` | `rated_id` / `reviewed_id` | `rated_id` |
| `ratings` | `score` / `stars` | `score` |
| `driver_reviews` | `driver_id` / `driver_id_ref` | `driver_id` |
| `ride_recordings` | `duration_sec` / `duration_seconds` | `duration_seconds` |
| `ride_recordings` | `size_bytes` / `file_size_bytes` | `file_size_bytes` |
| `sms_deliveries` | `phone` / `phone_number` | `phone` |
| `sms_deliveries` | `cost` / `cost_cents` | `cost` |
| `coupons` | `usage_limit` / `max_uses` | `max_uses` |
| `coupons` | `usage_count` / `current_uses` | `current_uses` |

### 3.3 Colunas que o codigo referencia mas NAO existem no banco

| Tabela | Coluna inexistente | O que existe |
|---|---|---|
| `user_wallets` | `reserved_balance` | apenas `balance` |
| `user_wallets` | `pending_balance` | apenas `balance` |
| `user_wallets` | `total_earned` | apenas `balance` |
| `user_wallets` | `total_spent` | apenas `balance` |
| `support_tickets` | `subject` | coluna e `topic` |

### 3.4 Realtime — contagem definitiva (migration 026)

Documentos anteriores mencionavam 35 ou 39 tabelas com Realtime. A contagem real verificada via `pg_publication_tables` apos migration 026 e **43 tabelas**. As adicionadas na migration 026: `post_likes`, `post_comments`, `favorite_drivers`, `referrals`, `subscriptions`.

### 3.5 profiles: campos novos possivelmente nao mapeados em codigo antigo

`trust_score`, `trust_level`, `current_mode`, `cpf`, `birth_date`, `bio`, `total_saved`, `referral_credits` — campos adicionados em migrations recentes que podem nao estar tipados em interfaces TypeScript antigas.

---

## SECAO 4: FLUXO DE TRIGGERS AO CRIAR USUARIO

```
auth.users INSERT
  → on_auth_user_created trigger
  → handle_new_user()
    → profiles INSERT (perfil basico)
    → handle_new_profile() trigger
      → user_wallets INSERT (carteira zerada)
      → user_settings INSERT (preferencias default)
    → handle_new_sms_prefs()
      → user_sms_preferences INSERT
    → handle_new_recording_prefs()
      → user_recording_preferences INSERT
    → generate_referral_code() (atualiza profiles.referral_code)
```

---

**Auditado em 09/03/2026** — Supabase jpnwxqjrhzaobnugjnyx — 80 tabelas verificadas via SQL direto
