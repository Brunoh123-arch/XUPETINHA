# Pagamentos PIX — Uppi

## Visao Geral

O Uppi usa a **Paradise Gateway** para processar pagamentos via PIX. O fluxo e totalmente automatico — o passageiro escaneia o QR Code e o sistema confirma o pagamento em segundos.

---

## Fluxo de Pagamento

```
1. Corrida finalizada (status = completed)
2. Frontend abre PixModal automaticamente
3. API POST /api/pix/create-charge
   → Paradise cria cobranca PIX
   → Retorna: qr_code, copy_paste, charge_id
4. PixModal exibe QR Code + valor
5. Frontend faz polling: GET /api/pix/status?charge_id=xxx (a cada 3s)
6. Passageiro paga no banco/app
7. Paradise chama webhook: POST /api/pix/webhook
8. Webhook confirma pagamento → atualiza rides.payment_status = paid
9. PixModal detecta pagamento → fecha e redireciona para /review
10. Wallet do motorista e creditada
```

---

## APIs de Pagamento

### POST `/api/pix/create-charge`
Cria uma cobranca PIX para uma corrida.

**Body:**
```json
{
  "ride_id": "uuid",
  "amount": 25.90
}
```

**Response:**
```json
{
  "charge_id": "paradise_charge_xxx",
  "qr_code": "data:image/png;base64,...",
  "copy_paste": "00020126580014BR.GOV...",
  "expires_at": "2026-03-09T15:30:00Z"
}
```

### GET `/api/pix/status`
Verifica o status de uma cobranca.

**Query:** `?charge_id=paradise_charge_xxx`

**Response:**
```json
{
  "status": "paid" | "pending" | "expired",
  "paid_at": "2026-03-09T15:25:00Z"
}
```

### POST `/api/pix/webhook`
Recebido pela Paradise quando o PIX e confirmado.
- Validado por assinatura HMAC
- Atualiza `rides.payment_status = paid`
- Credita carteira do motorista

---

## Carteira (Wallet)

### Tabelas
- `user_wallets` — saldo atual de cada usuario
- `wallet_transactions` — historico de todas as transacoes

### Tipos de transacao
| Tipo | Descricao |
|---|---|
| `ride_credit` | Motorista recebe valor da corrida |
| `ride_payment` | Passageiro paga via carteira |
| `withdrawal` | Motorista saca para conta bancaria |
| `bonus` | Bonus de performance/indicacao |
| `cashback` | Cashback do Club Uppi |
| `refund` | Reembolso de corrida cancelada |

---

## Saque de Motoristas

- Motoristas solicitam saque pelo app
- Admin aprova via painel `/admin/withdrawals`
- Transferencia manual ou integrada com banco

---

## Configuracao Paradise Gateway

```bash
PARADISE_API_KEY=pk_live_...
PARADISE_API_URL=https://api.paradisepay.com.br
```

Para testes, usar:
```bash
PARADISE_API_KEY=pk_test_...
PARADISE_API_URL=https://sandbox.paradisepay.com.br
```

---

## Tratamento de Erros

| Cenario | Tratamento |
|---|---|
| PIX expirado | PixModal oferece gerar novo QR |
| Webhook nao recebido | Polling no frontend detecta via API Paradise |
| Falha na Paradise | Retry automatico 3x, depois exibe erro ao usuario |
| Corrida cancelada apos pagamento | Reembolso manual via admin |
