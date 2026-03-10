# Documentacao de APIs — Uppi

Base URL: `https://uppi.vercel.app/api`
Autenticacao: Cookie de sessao Supabase (SSR) em todos os endpoints protegidos.

Total: **83 endpoints** em **79 arquivos route.ts**

---

## Auth

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/api/v1/auth/verify` | Verifica sessao ativa |
| POST | `/api/v1/auth/email-otp/send` | Envia OTP por email |
| POST | `/api/v1/auth/email-otp/verify` | Verifica OTP de email |

---

## Corridas

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/rides` | Listar / criar corrida |
| POST | `/api/v1/rides/estimate` | Estimar preco e tempo |
| PATCH | `/api/v1/rides/[id]/status` | Atualizar status da corrida |
| POST | `/api/v1/rides/[id]/accept` | Motorista aceita corrida |
| POST | `/api/v1/rides/[id]/start` | Iniciar corrida |
| POST | `/api/v1/rides/[id]/cancel` | Cancelar corrida |
| POST | `/api/v1/rides/[id]/rate` | Avaliar corrida |
| POST | `/api/v1/rides/[id]/report` | Reportar problema |
| POST | `/api/v1/rides/[id]/retry-drivers` | Tentar novos motoristas |

---

## Motorista

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/driver/location` | Obter/atualizar localizacao |
| GET/PATCH | `/api/v1/driver/mode` | Modo online/offline |
| GET/POST | `/api/v1/driver/documents` | Documentos do motorista |
| POST | `/api/v1/driver/verify` | Verificacao facial |
| GET/POST | `/api/v1/driver/verifications` | Status de verificacoes |
| POST | `/api/v1/driver/withdraw` | Solicitar saque |
| GET | `/api/v1/drivers/nearby` | Motoristas proximos |
| GET | `/api/v1/drivers/hot-zones` | Zonas quentes para motoristas |

---

## Pagamentos e Carteira

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/api/v1/payments/pix` | Gerar cobranca PIX (Paradise) |
| GET | `/api/pix/status` | Verificar status do PIX |
| POST | `/api/pix/webhook` | Webhook confirmacao Paradise |
| GET/POST | `/api/v1/wallet` | Saldo e transacoes da carteira |

---

## Push Notifications (FCM)

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/push/subscribe` | Subscribes push (web) |
| POST/DELETE | `/api/v1/push/fcm-register` | Registrar/remover token FCM nativo |
| POST | `/api/v1/push/send` | Enviar push para usuario |
| POST | `/api/v1/push/broadcast` | Broadcast para todos os usuarios |

---

## Perfil e Configuracoes

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/PATCH | `/api/v1/profile` | Obter/atualizar perfil |
| GET/PATCH | `/api/v1/settings` | Configuracoes do usuario |

---

## Notificacoes

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST/PATCH | `/api/v1/notifications` | Listar/criar/marcar como lida |
| POST | `/api/v1/notifications/send` | Enviar notificacao |

---

## Mensagens

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/messages` | Mensagens de chat da corrida |

---

## Mapas e Localizacao

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/v1/places/autocomplete` | Autocomplete de enderecos (Google) |
| GET | `/api/v1/places/details` | Detalhes de um lugar |
| GET | `/api/v1/geocode` | Geocodificacao reversa |
| GET | `/api/v1/distance` | Calcular distancia |
| GET | `/api/v1/routes/alternatives` | Rotas alternativas |

---

## Reviews e Ratings

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/reviews` | Avaliacoes de usuarios |
| GET/POST | `/api/v1/reviews/enhanced` | Avaliacoes detalhadas |
| GET/POST | `/api/v1/reviews/driver` | Avaliacoes do motorista |
| GET/POST | `/api/v1/ratings` | Ratings gerais |

---

## Subscricoes e Club

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST/DELETE | `/api/v1/subscriptions` | Assinaturas Club Uppi |

---

## Cupons e Promocoes

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/coupons` | Cupons de desconto |
| POST | `/api/v1/coupons/apply` | Aplicar cupom em corrida |

---

## Favoritos

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST/DELETE | `/api/v1/favorites` | Lugares e motoristas favoritos |

---

## Referrals

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/referrals` | Programa de indicacao |

---

## Conquistas e Leaderboard

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/achievements` | Conquistas do usuario |
| GET | `/api/v1/leaderboard` | Ranking geral |

---

## Corridas Especiais

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/scheduled-rides` | Corridas agendadas |
| GET/POST | `/api/v1/group-rides` | Corridas em grupo |
| POST | `/api/v1/group-rides/join` | Entrar em corrida em grupo |
| GET/POST | `/api/v1/offers` | Ofertas de preco (leilao) |
| POST | `/api/v1/offers/[id]/accept` | Aceitar oferta |
| POST | `/api/v1/offers/[id]/counter` | Contra-oferta |
| GET/POST | `/api/v1/intercity` | Viagens intermunicipais |
| POST | `/api/v1/intercity/book` | Reservar viagem intermunicipal |
| GET/POST/DELETE | `/api/v1/delivery` | Servico de entregas |

---

## Social

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/social/posts` | Posts do feed social |
| POST/DELETE | `/api/v1/social/posts/[id]/like` | Curtir/descurtir post |
| GET/POST | `/api/v1/social/posts/[id]/comments` | Comentarios |

---

## Emergencia e Seguranca

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST/PATCH | `/api/v1/emergency` | Eventos de emergencia |
| GET | `/api/v1/stats` | Estatisticas do usuario |

---

## SMS

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/api/v1/sms/send` | Enviar SMS |
| GET | `/api/v1/sms/status` | Status de entrega do SMS |

---

## Suporte

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/support` | Tickets de suporte |
| GET/POST | `/api/v1/support/tickets` | Gestao de tickets |
| GET/POST | `/api/v1/support/messages` | Mensagens de ticket |

---

## Familia

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST/DELETE/PATCH | `/api/v1/family` | Conta familia |

---

## Gravacoes

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/api/v1/recordings/upload` | Upload de gravacao de corrida |

---

## Webhooks

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET/POST | `/api/v1/webhooks` | Gestao de webhooks |
| POST | `/api/v1/webhooks/process` | Processar webhook recebido |

---

## Admin

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/admin/check` | Verificar permissao de admin |
| GET | `/api/v1/admin/stats` | Estatisticas do sistema |
| GET/POST | `/api/v1/admin/users` | Gestao de usuarios (admin) |
| GET/PATCH | `/api/v1/admin/withdrawals` | Aprovar/rejeitar saques |
| POST | `/api/v1/admin/setup` | Setup inicial do admin |
| POST | `/api/v1/admin/create-first` | Criar primeiro admin |

---

## Health e Logs

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/v1/health` | Health check v1 |
| POST | `/api/v1/logs/error` | Log de erros do cliente |

---

## Formato de Resposta Padrao

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Erros:
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE"
}
```

HTTP Status Codes:
- `200` — Sucesso
- `201` — Criado
- `400` — Bad Request
- `401` — Nao autenticado
- `403` — Sem permissao
- `404` — Nao encontrado
- `429` — Rate limit
- `500` — Erro interno
