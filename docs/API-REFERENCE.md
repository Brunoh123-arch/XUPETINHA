# API Reference — Uppi

> Versao 31.0 — 98 endpoints documentados — 16/03/2026

Base URL: `https://uppi.app` (web) ou `http://localhost:3000` (dev)

Autenticacao: Bearer token via Supabase Auth no header `Authorization`.

---

## Sumario de Endpoints

| Grupo | Qtd | Prefixo |
|-------|-----|---------|
| Corridas | 14 | /api/v1/rides |
| Ofertas de Preco | 4 | /api/v1/offers |
| Pagamentos | 3 | /api/v1/payments |
| Motoristas | 9 | /api/v1/driver, /api/v1/drivers |
| Avaliacoes | 3 | /api/v1/reviews, /api/v1/ratings |
| Notificacoes / Push | 4 | /api/v1/notifications, /api/v1/push |
| Social | 4 | /api/v1/social |
| Mapas / Localização | 4 | /api/v1/geocode, /api/v1/places, /api/v1/distance |
| Cupons | 3 | /api/v1/coupons |
| Carteira | 3 | /api/v1/wallet |
| Suporte | 3 | /api/v1/support |
| Autenticacao | 3 | /api/v1/auth |
| Corridas Especiais | 8 | /api/v1/intercity, /api/v1/group-rides, /api/v1/scheduled-rides, /api/v1/delivery |
| Seguranca | 3 | /api/v1/sos, /api/v1/emergency, /api/v1/recordings |
| Admin | 6 | /api/v1/admin, /api/admin |
| Outros | 13 | notifications, social, favorites, webhooks, etc |

---

## Corridas

### POST /api/v1/rides
Cria nova solicitacao de corrida.
```json
{ "origin_lat": -23.5, "origin_lng": -46.6, "destination_lat": -23.6, "destination_lng": -46.7, "ride_type": "standard" }
```

### GET /api/v1/rides/estimate
Estima preco antes de confirmar a corrida.
Params: `origin_lat`, `origin_lng`, `destination_lat`, `destination_lng`, `ride_type`

### GET /api/v1/rides/[id]/status
Retorna status em tempo real da corrida.

### POST /api/v1/rides/[id]/accept
Motorista aceita a corrida.

### POST /api/v1/rides/[id]/start
Motorista inicia a corrida (passageiro embarcou).

### POST /api/v1/rides/[id]/complete
Finaliza a corrida.

### POST /api/v1/rides/[id]/cancel
Cancela a corrida com motivo.
```json
{ "reason": "motorista_nao_chegou" }
```

### POST /api/v1/rides/[id]/rate
Avalia a corrida.
```json
{ "rating": 5, "comment": "Excelente motorista" }
```

### GET /api/v1/rides/[id]/receipt
Retorna recibo detalhado da corrida (PDF-ready).

### POST /api/v1/rides/[id]/report
Reporta problema com a corrida.
```json
{ "type": "comportamento", "description": "..." }
```

### POST /api/v1/rides/[id]/tip
Adiciona gorjeta ao motorista.
```json
{ "amount": 5.00 }
```

### POST /api/v1/rides/[id]/retry-drivers
Reemite a corrida para novos motoristas quando ninguem aceita.

### GET /api/v1/routes/alternatives
Retorna rotas alternativas para o destino.
Params: `origin_lat`, `origin_lng`, `destination_lat`, `destination_lng`

---

## Ofertas de Preco

### POST /api/v1/offers
Passageiro cria oferta de preco customizado.
```json
{ "ride_id": "uuid", "amount": 25.00 }
```

### POST /api/v1/offers/[id]/accept
Motorista aceita a oferta de preco.

### POST /api/v1/offers/[id]/reject
Motorista rejeita a oferta.

### POST /api/v1/offers/[id]/counter
Motorista faz contra-oferta.
```json
{ "amount": 30.00 }
```

---

## Pagamentos

### GET /api/v1/payments/history
Historico de pagamentos do usuario.

### POST /api/v1/payments/pix
Gera cobranca PIX para uma corrida.
```json
{ "ride_id": "uuid", "amount": 25.00 }
```

### POST /api/v1/payments/refund
Solicita reembolso de uma corrida.
```json
{ "ride_id": "uuid", "reason": "corrida_cancelada", "amount": 25.00 }
```

### POST /api/pix/webhook
Webhook do gateway PIX (Paradise/EfiPay). Uso interno.

### GET /api/pix/status
Verifica status de um pagamento PIX.

---

## Motoristas

### POST /api/v1/driver/mode
Ativa ou desativa modo online do motorista.
```json
{ "online": true, "lat": -23.5, "lng": -46.6 }
```

### POST /api/v1/driver/location
Atualiza posicao GPS do motorista (polling a cada 3s).
```json
{ "lat": -23.5, "lng": -46.6, "heading": 180 }
```

### GET /api/v1/driver/earnings
Retorna ganhos do motorista por periodo.
Params: `period` (day|week|month)

### POST /api/v1/driver/withdraw
Solicita saque PIX.
```json
{ "amount": 100.00, "pix_key": "cpf|email|celular|chave" }
```

### POST /api/v1/driver/documents
Upload de documento do motorista.
Multipart: `type` (cnh|crlv|foto), `file`

### POST /api/v1/driver/verify
Envia documentos para verificacao pelo admin.

### POST /api/v1/driver/verifications
Retorna status de verificacao dos documentos.

### POST /api/v1/driver/shift
Registra inicio/fim de turno do motorista.
```json
{ "action": "start" | "end" }
```

### GET /api/v1/drivers/nearby
Retorna motoristas proximos (uso interno do match).
Params: `lat`, `lng`, `radius_km`

### GET /api/v1/drivers/hot-zones
Retorna zonas com maior demanda no momento.

---

## Avaliacoes e Reviews

### POST /api/v1/reviews
Cria review de uma corrida.
```json
{ "ride_id": "uuid", "rating": 5, "comment": "..." }
```

### POST /api/v1/reviews/driver
Review especifico do motorista (categorias detalhadas).

### POST /api/v1/reviews/enhanced
Review avancado com tags e categorias multiplas.

### POST /api/v1/ratings
Avaliacao numerica simples.

---

## Notificacoes

### GET /api/v1/notifications
Lista notificacoes do usuario.

### POST /api/v1/notifications/read-all
Marca todas as notificacoes como lidas.

### POST /api/v1/notifications/send
Envia notificacao (uso admin/interno).
```json
{ "user_id": "uuid", "title": "...", "body": "..." }
```

### POST /api/v1/push/send
Envia push notification via FCM.

### POST /api/v1/push/broadcast
Broadcast para grupo de usuarios.

### POST /api/v1/push/fcm-register
Registra token FCM do dispositivo.
```json
{ "token": "fcm_token", "platform": "android" }
```

### POST /api/v1/push/subscribe
Inscreve em topico de push.

---

## Social

### GET/POST /api/v1/social/posts
Lista ou cria post no feed social.

### POST /api/v1/social/posts/[id]/like
Curte ou descurte um post.

### GET/POST /api/v1/social/posts/[id]/comments
Lista ou adiciona comentario em post.

### POST/DELETE /api/v1/social/follows
Seguir ou deixar de seguir usuario.

---

## Mapas e Localizacao

### GET /api/v1/geocode
Converte endereco em coordenadas.
Params: `address`

### GET /api/v1/places/autocomplete
Autocomplete de enderecos via Google Places.
Params: `input`, `lat`, `lng`

### GET /api/v1/places/details
Detalhes de um local pelo place_id.
Params: `place_id`

### GET /api/v1/distance
Distancia entre dois pontos.
Params: `origin_lat`, `origin_lng`, `dest_lat`, `dest_lng`

---

## Cupons

### GET /api/v1/coupons
Lista cupons disponiveis para o usuario.

### GET /api/v1/coupons/available
Cupons aplicaveis a uma corrida especifica.

### POST /api/v1/coupons/apply
Aplica cupom numa corrida.
```json
{ "ride_id": "uuid", "code": "PROMO10" }
```

---

## Carteira Digital

### GET /api/v1/wallet
Saldo e informacoes da carteira.

### GET /api/v1/wallet/transactions
Extrato de transacoes.

### POST /api/v1/wallet
Adiciona creditos via PIX.

---

## Suporte

### GET/POST /api/v1/support
Lista ou cria ticket de suporte.

### POST /api/v1/support/tickets
Cria ticket detalhado.
```json
{ "subject": "...", "description": "...", "category": "corrida" }
```

### POST /api/v1/support/messages
Envia mensagem em ticket existente.

---

## Autenticacao

### POST /api/v1/auth/email-otp/send
Envia OTP por email.
```json
{ "email": "user@example.com" }
```

### POST /api/v1/auth/email-otp/verify
Verifica OTP e autentica.
```json
{ "email": "user@example.com", "token": "123456" }
```

### POST /api/v1/auth/verify
Verifica token de sessao.

---

## Corridas Especiais

### GET/POST /api/v1/intercity
Lista ou cria rotas intermunicipais.

### POST /api/v1/intercity/book
Reserva assento em corrida intermunicipal.

### GET/POST /api/v1/group-rides
Lista ou cria corrida em grupo.

### POST /api/v1/group-rides/join
Entra em corrida em grupo existente.

### POST /api/v1/group-rides/[id]/leave
Sai de corrida em grupo.

### GET/POST /api/v1/scheduled-rides
Lista ou agenda corrida futura.

### POST /api/v1/delivery
Cria pedido de entrega.

---

## Seguranca

### POST /api/v1/sos
Dispara alerta SOS de emergencia.
```json
{ "lat": -23.5, "lng": -46.6, "ride_id": "uuid" }
```

### POST /api/v1/emergency
Cria contato ou alerta de emergencia.

### POST /api/v1/recordings/upload
Faz upload de gravacao de corrida (audio).

---

## Perfil e Configuracoes

### GET/PATCH /api/v1/profile
Lê ou atualiza perfil do usuario.

### DELETE /api/v1/profile/delete
Deleta conta (LGPD — direito ao esquecimento).

### GET/PATCH /api/v1/settings
Configuracoes do usuario (notificacoes, privacidade).

---

## Outros

### GET/POST /api/v1/favorites
Enderecos e motoristas favoritos.

### GET /api/v1/leaderboard
Ranking de pontos.

### GET /api/v1/achievements
Conquistas do usuario.

### GET/POST /api/v1/referrals
Codigo de indicacao e historico.

### GET/POST /api/v1/messages
Mensagens diretas entre usuario e motorista.

### GET/POST /api/v1/subscriptions
Assinatura do Clube Uppi.

### POST /api/v1/sms/send
Envia SMS (uso interno).

### GET /api/v1/sms/status
Status de entrega do SMS.

### GET/POST /api/v1/family
Membros da conta familia.

### GET /api/v1/stats
Estatisticas pessoais do usuario.

### POST /api/v1/logs/error
Registra erro do app (uso do frontend).

### GET/POST /api/v1/webhooks
Gerencia webhooks externos.

### POST /api/v1/webhooks/process
Processa payload de webhook recebido.

---

## Admin

### GET /api/v1/admin/stats
Estatisticas gerais do sistema.

### GET/POST /api/v1/admin/users
Lista ou gerencia usuarios (admin only).

### GET/POST /api/v1/admin/withdrawals
Lista ou aprova/rejeita saques (admin only).

### POST /api/v1/admin/setup
Setup inicial do sistema.

### POST /api/v1/admin/create-first
Cria primeiro admin.

### POST /api/v1/admin/migrate-encryption
Migra dados para criptografia AES-256.

### GET /api/admin/check
Verifica se usuario e admin.

---

## Infraestrutura

### GET /api/health
Health check geral do sistema.

### GET /api/v1/health
Health check versionado.

### POST /api/email/auth
Envia email de autenticacao.

### POST /api/email/test
Testa envio de email.

---

## Codigos de Erro

| Codigo | Significado |
|--------|-------------|
| 400 | Dados invalidos na requisicao |
| 401 | Nao autenticado |
| 403 | Sem permissao (nao e admin) |
| 404 | Recurso nao encontrado |
| 409 | Conflito (corrida ja aceita, etc) |
| 422 | Entidade nao processavel |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

---

## Notas de Seguranca

- Todos os endpoints de escrita exigem autenticacao Supabase Auth
- CPF e dados sensiveis sao criptografados em AES-256-GCM antes de salvar
- RLS ativo em 100% das tabelas — usuarios so acessam seus proprios dados
- Admin endpoints verificam `is_admin = true` no perfil
- Rate limiting aplicado em endpoints de autenticacao e pagamento
