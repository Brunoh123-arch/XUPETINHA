# UPPI - Documentacao das APIs

> Atualizado em: 16/03/2026
> Total: **100 endpoints**

---

## Indice

1. [Autenticacao](#1-autenticacao)
2. [Perfil e Configuracoes](#2-perfil-e-configuracoes)
3. [Corridas](#3-corridas)
4. [Corridas Especiais](#4-corridas-especiais)
5. [Motorista](#5-motorista)
6. [Ofertas e Negociacao](#6-ofertas-e-negociacao)
7. [Pagamentos e Carteira](#7-pagamentos-e-carteira)
8. [Cupons](#8-cupons)
9. [Notificacoes e Push](#9-notificacoes-e-push)
10. [Social e Gamificacao](#10-social-e-gamificacao)
11. [Suporte e Emergencia](#11-suporte-e-emergencia)
12. [Admin](#12-admin)
13. [Integracao e Utilidades](#13-integracao-e-utilidades)
14. [Webhooks](#14-webhooks)
15. [SMS](#15-sms)
16. [Familia, Favoritos, Assinaturas](#16-familia-favoritos-assinaturas)
17. [Avaliacoes](#17-avaliacoes)
18. [PIX e Pagamentos Externos](#18-pix-e-pagamentos-externos)
19. [Sistema](#19-sistema)

---

## 1. Autenticacao

### POST /api/v1/auth/email-otp/send
Envia codigo OTP por email.

**Body:**
```json
{ "email": "usuario@email.com" }
```

---

### POST /api/v1/auth/email-otp/verify
Verifica OTP e autentica o usuario.

**Body:**
```json
{ "email": "usuario@email.com", "code": "123456" }
```

**Response:**
```json
{
  "success": true,
  "user": { "id": "uuid", "email": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

---

### GET /api/v1/auth/verify
Verifica se o token JWT e valido.

**Headers:** `Authorization: Bearer <token>`

---

## 2. Perfil e Configuracoes

### GET | PATCH /api/v1/profile
Retorna ou atualiza o perfil do usuario autenticado.

### DELETE /api/v1/profile/delete
Deleta a conta do usuario (LGPD).

### GET | PATCH /api/v1/settings
Retorna ou atualiza configuracoes do usuario.

---

## 3. Corridas

### GET | POST /api/v1/rides
Lista corridas do usuario ou cria nova solicitacao.

**POST Body:**
```json
{
  "pickup_address": "Rua A, 123",
  "pickup_lat": -23.5505,
  "pickup_lng": -46.6333,
  "dropoff_address": "Rua B, 456",
  "dropoff_lat": -23.5605,
  "dropoff_lng": -46.6433,
  "vehicle_type": "standard",
  "payment_method": "pix"
}
```

---

### GET /api/v1/rides/estimate
Estima preco e tempo.

**Query:** `pickup_lat`, `pickup_lng`, `dropoff_lat`, `dropoff_lng`, `vehicle_type`

**Response:**
```json
{
  "estimates": [
    { "vehicle_type": "standard", "price": 25.50, "duration": 15 },
    { "vehicle_type": "premium", "price": 35.00, "duration": 15 }
  ]
}
```

---

### POST /api/v1/rides/{id}/accept
Motorista aceita a corrida.

### POST /api/v1/rides/{id}/start
Motorista inicia a corrida.

### POST /api/v1/rides/{id}/complete
Motorista finaliza a corrida.

### POST /api/v1/rides/{id}/cancel
Cancela a corrida. **Body:** `{ "reason": "motivo" }`

### POST /api/v1/rides/{id}/rate
Avalia a corrida. **Body:** `{ "rating": 5, "comment": "Otimo!" }`

### GET /api/v1/rides/{id}/status
Status atual da corrida (polling).

### GET /api/v1/rides/{id}/receipt
Recibo da corrida.

### POST /api/v1/rides/{id}/tip
Gorjeta ao motorista. **Body:** `{ "amount": 5.00 }`

### POST /api/v1/rides/{id}/report
Reportar problema. **Body:** `{ "type": "safety", "description": "..." }`

### POST /api/v1/rides/{id}/retry-drivers
Re-busca motoristas para corrida pendente.

---

## 4. Corridas Especiais

### GET | POST /api/v1/scheduled-rides
Lista ou agenda corridas futuras.

**POST Body:**
```json
{
  "pickup_address": "...",
  "dropoff_address": "...",
  "scheduled_at": "2026-03-20T10:00:00Z"
}
```

---

### GET | POST /api/v1/group-rides
Lista ou cria corrida em grupo.

### POST /api/v1/group-rides/join
Entrar em corrida de grupo. **Body:** `{ "group_ride_id": "uuid" }`

### POST /api/v1/group-rides/{id}/leave
Sair de corrida de grupo.

---

### GET /api/v1/intercity
Lista rotas intermunicipais disponíveis.

### POST /api/v1/intercity/book
Reservar assento em viagem intermunicipal.

**Body:**
```json
{
  "ride_id": "uuid",
  "seats": 2,
  "passenger_info": { "name": "...", "phone": "..." }
}
```

---

### GET | POST /api/v1/delivery
Lista ou cria pedido de entrega.

**POST Body:**
```json
{
  "pickup_address": "...",
  "delivery_address": "...",
  "recipient_name": "...",
  "recipient_phone": "+55...",
  "item_description": "...",
  "item_size": "small"
}
```

---

## 5. Motorista

### GET | POST /api/v1/driver/documents
Lista ou envia documentos do motorista.

**POST:** `multipart/form-data` com `type` (cnh, crlv, antecedentes) e `file`.

### GET /api/v1/driver/earnings
Ganhos do motorista. **Query:** `period` (today, week, month)

### POST /api/v1/driver/location
Atualiza localizacao do motorista.

**Body:**
```json
{ "lat": -23.5505, "lng": -46.6333, "heading": 90 }
```

### POST /api/v1/driver/mode
Alterna modo online/offline. **Body:** `{ "online": true }`

### POST /api/v1/driver/shift
Inicia/finaliza turno.

### GET /api/v1/driver/verifications
Status das verificacoes do motorista.

### POST /api/v1/driver/verify
Envia para verificacao admin.

### POST /api/v1/driver/withdraw
Solicita saque. **Body:** `{ "amount": 500.00, "pix_key": "email@..." }`

### GET /api/v1/drivers/nearby
Motoristas proximos. **Query:** `lat`, `lng`, `radius`

### GET /api/v1/drivers/hot-zones
Zonas com alta demanda.

---

## 6. Ofertas e Negociacao

### GET | POST /api/v1/offers
Lista ou cria oferta de preco.

**POST Body:**
```json
{ "ride_request_id": "uuid", "price": 30.00 }
```

### POST /api/v1/offers/{id}/accept
Passageiro aceita oferta.

### POST /api/v1/offers/{id}/reject
Passageiro rejeita oferta.

### POST /api/v1/offers/{id}/counter
Passageiro faz contra-oferta. **Body:** `{ "price": 25.00 }`

---

## 7. Pagamentos e Carteira

### GET /api/v1/wallet
Saldo e dados da carteira.

**Response:**
```json
{ "balance": 150.00, "pending": 25.00 }
```

### GET /api/v1/wallet/transactions
Historico de transacoes da carteira.

### GET /api/v1/payments/history
Historico de pagamentos.

### POST /api/v1/payments/pix
Gera codigo PIX para pagamento.

**Body:**
```json
{ "ride_id": "uuid", "amount": 25.50 }
```

**Response:**
```json
{
  "qr_code": "00020126...",
  "qr_code_base64": "data:image/png;base64,...",
  "pix_key": "...",
  "expiration": "2026-03-16T12:00:00Z"
}
```

### POST /api/v1/payments/refund
Solicita reembolso. **Body:** `{ "payment_id": "uuid", "reason": "..." }`

---

## 8. Cupons

### GET /api/v1/coupons
Lista todos os cupons ativos.

### GET /api/v1/coupons/available
Cupons disponiveis para o usuario autenticado.

### POST /api/v1/coupons/apply
Aplica cupom. **Body:** `{ "code": "PROMO10", "ride_id": "uuid" }`

---

## 9. Notificacoes e Push

### GET /api/v1/notifications
Lista notificacoes do usuario.

### POST /api/v1/notifications/read-all
Marca todas como lidas.

### POST /api/v1/notifications/send
Envia notificacao (admin). **Body:** `{ "user_id": "uuid", "title": "...", "body": "..." }`

### POST /api/v1/push/fcm-register
Registra token FCM. **Body:** `{ "token": "fcm_token_here", "platform": "android" }`

### POST /api/v1/push/send
Envia push notification (admin).

### POST /api/v1/push/broadcast
Envia push para todos usuarios (admin).

### POST /api/v1/push/subscribe
Subscreve para topico de push.

---

## 10. Social e Gamificacao

### GET | POST /api/v1/social/posts
Lista ou cria post no feed.

**POST Body:**
```json
{ "content": "Texto do post", "image_url": "https://..." }
```

### POST /api/v1/social/posts/{id}/like
Curtir post.

### GET | POST /api/v1/social/posts/{id}/comments
Lista ou adiciona comentario.

### GET | POST /api/v1/social/follows
Lista follows ou segue usuario. **POST Body:** `{ "user_id": "uuid" }`

### GET /api/v1/leaderboard
Ranking de usuarios/motoristas.

### GET /api/v1/achievements
Lista conquistas do usuario.

### GET /api/v1/referrals
Dados do programa de indicacao.

### GET /api/v1/ratings
Lista notas do usuario.

---

## 11. Suporte e Emergencia

### GET | POST /api/v1/support
Lista tickets ou cria novo ticket.

**POST Body:**
```json
{
  "subject": "Problema com corrida",
  "message": "Descricao...",
  "ride_id": "uuid"
}
```

### GET | POST /api/v1/support/messages
Lista ou envia mensagens de suporte.

### GET | POST /api/v1/support/tickets
Lista ou cria tickets.

### POST /api/v1/emergency
Dispara alerta de emergencia.

### POST /api/v1/sos
Botao SOS — emergencia critica.

---

## 12. Admin

### GET /api/v1/admin/stats
Estatisticas do sistema.

**Response:**
```json
{
  "total_users": 15000,
  "total_drivers": 3000,
  "total_rides": 50000,
  "revenue_today": 25000.00
}
```

### GET /api/v1/admin/users
Lista usuarios (paginado).

### GET | POST /api/v1/admin/withdrawals
Lista ou aprova/rejeita saques.

### POST /api/v1/admin/create-first
Cria primeiro admin do sistema.

### POST /api/v1/admin/setup
Executa setup inicial da plataforma.

### POST /api/v1/admin/migrate-encryption
Executa migracao de criptografia.

---

## 13. Integracao e Utilidades

### GET /api/v1/geocode
Geocodificacao. **Query:** `address`

### GET /api/v1/places/autocomplete
Autocomplete Google Places. **Query:** `input`

### GET /api/v1/places/details
Detalhes de lugar. **Query:** `place_id`

### GET /api/v1/distance
Distancia entre pontos. **Query:** `origin_lat`, `origin_lng`, `dest_lat`, `dest_lng`

### GET /api/v1/routes/alternatives
Rotas alternativas.

### POST /api/v1/recordings/upload
Upload de gravacao de seguranca. **Body:** `multipart/form-data`

### GET /api/v1/stats
Estatisticas publicas do app.

### POST /api/v1/logs/error
Registra erro do cliente.

---

## 14. Webhooks

### GET | POST /api/v1/webhooks
Lista ou registra webhook.

**POST Body:**
```json
{
  "url": "https://meusite.com/webhook",
  "events": ["ride.completed", "payment.received"],
  "secret": "meu_secret"
}
```

### POST /api/v1/webhooks/process
Processa evento de webhook recebido.

---

## 15. SMS

### POST /api/v1/sms/send
Envia SMS. **Body:** `{ "phone": "+55...", "message": "...", "type": "otp" }`

### GET /api/v1/sms/status
Status de entrega de SMS. **Query:** `message_id`

---

## 16. Familia, Favoritos, Assinaturas

### GET | POST /api/v1/family
Lista ou adiciona membro da familia.

### GET | POST /api/v1/favorites
Lista ou adiciona favorito.

### GET | POST /api/v1/messages
Lista mensagens de chat.

### GET | POST /api/v1/subscriptions
Lista ou cria assinatura.

---

## 17. Avaliacoes

### GET | POST /api/v1/reviews
Lista ou cria avaliacao.

### POST /api/v1/reviews/enhanced
Avaliacao detalhada por categorias.

**Body:**
```json
{
  "ride_id": "uuid",
  "overall_rating": 5,
  "category_scores": { "seguranca": 5, "pontualidade": 4, "limpeza": 5 },
  "comment": "...",
  "tags": ["pontual", "simpatico"]
}
```

### GET | POST /api/v1/reviews/driver
Avaliacoes especificas do motorista.

---

## 18. PIX e Pagamentos Externos

### POST /api/pix/webhook
Webhook do gateway PIX (Paradise/EfiPay) — notificacao de pagamento.

### GET /api/pix/status
Status de transacao PIX. **Query:** `transaction_id`

---

## 19. Sistema

### GET /api/v1/health
Health check da API com status das integracoes.

### GET /api/health
Health check geral.

### GET /api/admin/check
Verifica se usuario atual e admin.

### POST /api/email/auth
Envia email de autenticacao.

### POST /api/email/test
Testa envio de email (dev only).

---

## Autenticacao

Todas as rotas (exceto auth, health e webhooks externos) requerem:

```
Authorization: Bearer <access_token>
```

O token e obtido apos autenticacao via `/api/v1/auth/email-otp/verify`.

---

## Formato de Erros

```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "details": {}
}
```

Codigos HTTP:
- `200` — Sucesso
- `201` — Criado
- `400` — Requisicao invalida
- `401` — Nao autenticado
- `403` — Sem permissao
- `404` — Nao encontrado
- `429` — Rate limit excedido
- `500` — Erro interno

---

## Rate Limiting

- 100 requests/minuto por IP (rotas publicas)
- 1000 requests/minuto por usuario autenticado
- 10 requests/minuto para rotas de auth

---

## Versionamento

URL: `/api/v1/...` — Versao atual: **v1**
