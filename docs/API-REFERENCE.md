# UPPI - Documentacao das APIs

> Atualizado em: 16/03/2026
> Total: 99 endpoints

---

## Indice

1. [Autenticacao](#autenticacao)
2. [Perfil](#perfil)
3. [Corridas](#corridas)
4. [Motorista](#motorista)
5. [Ofertas/Negociacao](#ofertasnegociacao)
6. [Pagamentos](#pagamentos)
7. [Notificacoes](#notificacoes)
8. [Social](#social)
9. [Suporte](#suporte)
10. [Admin](#admin)
11. [Utilidades](#utilidades)

---

## Autenticacao

### POST /api/v1/auth/email-otp/send
Envia codigo OTP por email.

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Codigo enviado"
}
```

---

### POST /api/v1/auth/email-otp/verify
Verifica codigo OTP e autentica usuario.

**Body:**
```json
{
  "email": "usuario@email.com",
  "code": "123456"
}
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

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": { "id": "uuid", "email": "..." }
}
```

---

## Perfil

### GET /api/v1/profile
Retorna perfil do usuario autenticado.

**Response:**
```json
{
  "id": "uuid",
  "full_name": "Joao Silva",
  "email": "joao@email.com",
  "phone": "+5511999999999",
  "avatar_url": "https://...",
  "user_type": "passenger",
  "rating": 4.8
}
```

---

### PATCH /api/v1/profile
Atualiza perfil do usuario.

**Body:**
```json
{
  "full_name": "Joao Silva",
  "phone": "+5511999999999"
}
```

---

### DELETE /api/v1/profile/delete
Deleta conta do usuario (LGPD).

**Response:**
```json
{
  "success": true,
  "message": "Conta deletada"
}
```

---

### GET /api/v1/settings
Retorna configuracoes do usuario.

---

### PATCH /api/v1/settings
Atualiza configuracoes do usuario.

---

## Corridas

### POST /api/v1/rides
Cria nova solicitacao de corrida.

**Body:**
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

**Response:**
```json
{
  "id": "uuid",
  "status": "searching",
  "estimated_price": 25.50,
  "estimated_duration": 15
}
```

---

### GET /api/v1/rides
Lista corridas do usuario.

**Query:**
- `status`: pending, in_progress, completed, cancelled
- `limit`: numero de resultados
- `offset`: paginacao

---

### GET /api/v1/rides/estimate
Estima preco e tempo da corrida.

**Query:**
- `pickup_lat`, `pickup_lng`
- `dropoff_lat`, `dropoff_lng`
- `vehicle_type`: standard, premium, electric

**Response:**
```json
{
  "estimates": [
    { "vehicle_type": "standard", "price": 25.50, "duration": 15 },
    { "vehicle_type": "premium", "price": 35.00, "duration": 15 },
    { "vehicle_type": "electric", "price": 30.00, "duration": 15 }
  ]
}
```

---

### POST /api/v1/rides/{id}/accept
Motorista aceita a corrida.

---

### POST /api/v1/rides/{id}/start
Motorista inicia a corrida (passageiro embarcou).

---

### POST /api/v1/rides/{id}/complete
Motorista finaliza a corrida.

---

### POST /api/v1/rides/{id}/cancel
Cancela a corrida.

**Body:**
```json
{
  "reason": "Motivo do cancelamento"
}
```

---

### POST /api/v1/rides/{id}/rate
Avalia a corrida.

**Body:**
```json
{
  "rating": 5,
  "comment": "Otimo motorista!"
}
```

---

### GET /api/v1/rides/{id}/status
Retorna status atual da corrida (para polling).

---

### GET /api/v1/rides/{id}/receipt
Retorna recibo da corrida.

---

### POST /api/v1/rides/{id}/tip
Envia gorjeta ao motorista.

**Body:**
```json
{
  "amount": 5.00
}
```

---

### POST /api/v1/rides/{id}/report
Reporta problema na corrida.

**Body:**
```json
{
  "type": "safety",
  "description": "Descricao do problema"
}
```

---

### POST /api/v1/rides/{id}/retry-drivers
Busca novos motoristas para corrida pendente.

---

### POST /api/v1/scheduled-rides
Agenda corrida para data/hora futura.

**Body:**
```json
{
  "pickup_address": "...",
  "dropoff_address": "...",
  "scheduled_at": "2026-03-20T10:00:00Z"
}
```

---

## Motorista

### GET /api/v1/driver/earnings
Retorna ganhos do motorista.

**Query:**
- `period`: today, week, month

**Response:**
```json
{
  "total": 1500.00,
  "rides_count": 45,
  "tips": 150.00,
  "average_rating": 4.9
}
```

---

### POST /api/v1/driver/location
Atualiza localizacao do motorista.

**Body:**
```json
{
  "lat": -23.5505,
  "lng": -46.6333,
  "heading": 90
}
```

---

### POST /api/v1/driver/mode
Alterna modo online/offline do motorista.

**Body:**
```json
{
  "online": true
}
```

---

### POST /api/v1/driver/shift
Inicia/finaliza turno do motorista.

---

### GET /api/v1/driver/documents
Lista documentos do motorista.

---

### POST /api/v1/driver/documents
Envia documento para verificacao.

**Body (multipart/form-data):**
- `type`: cnh, crlv, antecedentes
- `file`: arquivo do documento

---

### POST /api/v1/driver/withdraw
Solicita saque dos ganhos.

**Body:**
```json
{
  "amount": 500.00,
  "pix_key": "email@email.com"
}
```

---

### GET /api/v1/driver/verifications
Status das verificacoes do motorista.

---

### GET /api/v1/drivers/nearby
Lista motoristas proximos (para mapa).

**Query:**
- `lat`, `lng`, `radius`

---

### GET /api/v1/drivers/hot-zones
Retorna zonas com alta demanda.

---

## Ofertas/Negociacao

### POST /api/v1/offers
Cria oferta de preco.

**Body:**
```json
{
  "ride_request_id": "uuid",
  "price": 30.00
}
```

---

### POST /api/v1/offers/{id}/accept
Passageiro aceita oferta.

---

### POST /api/v1/offers/{id}/reject
Passageiro rejeita oferta.

---

### POST /api/v1/offers/{id}/counter
Passageiro faz contra-oferta.

**Body:**
```json
{
  "price": 25.00
}
```

---

## Pagamentos

### GET /api/v1/wallet
Retorna saldo e dados da carteira.

**Response:**
```json
{
  "balance": 150.00,
  "pending": 25.00
}
```

---

### GET /api/v1/wallet/transactions
Historico de transacoes da carteira.

---

### POST /api/v1/payments/pix
Gera codigo PIX para pagamento.

**Body:**
```json
{
  "ride_id": "uuid",
  "amount": 25.50
}
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

---

### GET /api/v1/payments/history
Historico de pagamentos.

---

### POST /api/v1/payments/refund
Solicita reembolso.

**Body:**
```json
{
  "payment_id": "uuid",
  "reason": "Motivo"
}
```

---

## Notificacoes

### GET /api/v1/notifications
Lista notificacoes do usuario.

---

### POST /api/v1/notifications/read-all
Marca todas como lidas.

---

### POST /api/v1/push/fcm-register
Registra token FCM do dispositivo.

**Body:**
```json
{
  "token": "fcm_token_here"
}
```

---

### POST /api/v1/push/send
Envia push notification (admin).

---

### POST /api/v1/push/broadcast
Envia push para todos usuarios (admin).

---

## Social

### GET /api/v1/social/posts
Lista posts do feed social.

---

### POST /api/v1/social/posts
Cria novo post.

**Body:**
```json
{
  "content": "Texto do post",
  "image_url": "https://..."
}
```

---

### POST /api/v1/social/posts/{id}/like
Curtir post.

---

### GET /api/v1/social/posts/{id}/comments
Lista comentarios do post.

---

### POST /api/v1/social/posts/{id}/comments
Adiciona comentario.

---

### POST /api/v1/social/follows
Seguir usuario.

**Body:**
```json
{
  "user_id": "uuid"
}
```

---

### GET /api/v1/leaderboard
Ranking de motoristas.

---

## Suporte

### GET /api/v1/support/tickets
Lista tickets de suporte.

---

### POST /api/v1/support
Cria novo ticket de suporte.

**Body:**
```json
{
  "subject": "Problema com corrida",
  "message": "Descricao do problema",
  "ride_id": "uuid"
}
```

---

### GET /api/v1/support/messages
Mensagens de um ticket.

---

### POST /api/v1/support/messages
Envia mensagem no ticket.

---

### POST /api/v1/emergency
Dispara alerta de emergencia.

---

### POST /api/v1/sos
Botao SOS - emergencia.

---

## Admin

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

---

### GET /api/v1/admin/users
Lista usuarios (paginado).

---

### GET /api/v1/admin/withdrawals
Lista solicitacoes de saque.

---

### POST /api/v1/admin/withdrawals
Aprova/rejeita saque.

---

### POST /api/v1/admin/create-first
Cria primeiro admin do sistema.

---

## Utilidades

### GET /api/v1/geocode
Geocodificacao de endereco.

**Query:**
- `address`: endereco para geocodificar

---

### GET /api/v1/places/autocomplete
Autocomplete de enderecos (Google Places).

**Query:**
- `input`: texto digitado

---

### GET /api/v1/places/details
Detalhes de um lugar (Google Places).

**Query:**
- `place_id`: ID do lugar

---

### GET /api/v1/distance
Calcula distancia entre pontos.

---

### GET /api/v1/routes/alternatives
Rotas alternativas.

---

### GET /api/v1/coupons/available
Cupons disponiveis para o usuario.

---

### POST /api/v1/coupons/apply
Aplica cupom na corrida.

**Body:**
```json
{
  "code": "PROMO10",
  "ride_id": "uuid"
}
```

---

### GET /api/v1/favorites
Lista lugares favoritos.

---

### POST /api/v1/favorites
Adiciona favorito.

---

### GET /api/v1/referrals
Dados do programa de indicacao.

---

### POST /api/v1/recordings/upload
Upload de gravacao de seguranca.

---

### GET /api/v1/health
Health check da API.

---

## Webhooks

### POST /api/v1/webhooks
Registra webhook.

---

### POST /api/v1/webhooks/process
Processa eventos de webhook.

---

### POST /api/pix/webhook
Webhook do gateway PIX (Paradise/EfiPay).

---

## Autenticacao

Todas as rotas (exceto auth e health) requerem:

```
Authorization: Bearer <access_token>
```

O token e obtido apos autenticacao via `/api/v1/auth/email-otp/verify`.

---

## Erros

Formato padrao de erro:

```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "details": {}
}
```

Codigos HTTP:
- `200`: Sucesso
- `201`: Criado
- `400`: Requisicao invalida
- `401`: Nao autenticado
- `403`: Sem permissao
- `404`: Nao encontrado
- `429`: Rate limit
- `500`: Erro interno

---

## Rate Limiting

- 100 requests/minuto por IP
- 1000 requests/minuto por usuario autenticado

---

## Versionamento

API versionada via URL: `/api/v1/...`

Versao atual: **v1**
