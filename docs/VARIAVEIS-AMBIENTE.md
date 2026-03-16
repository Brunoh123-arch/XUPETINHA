# UPPI - Variaveis de Ambiente

> Atualizado em: 16/03/2026

---

## Variaveis Obrigatorias

### Supabase (Ja configuradas)

```env
# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ullmjdgppucworavoiia.supabase.co

# Chave publica (anon) - pode ser exposta no frontend
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Chave de servico (secreta) - NUNCA expor no frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# JWT Secret para validacao de tokens
SUPABASE_JWT_SECRET=your_jwt_secret
```

### Criptografia (OBRIGATORIO para producao)

```env
# Chave de criptografia para dados sensiveis (CPF, 2FA, webhooks)
# Gerar com: openssl rand -base64 32
ENCRYPTION_KEY=sua_chave_base64_32_bytes
```

**Como gerar:**
```bash
openssl rand -base64 32
```

### Google Maps (OBRIGATORIO para mapas)

```env
# API Key do Google Maps
# Criar em: https://console.cloud.google.com/apis/credentials
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

**APIs que precisam estar ativas no Google Cloud:**
- Maps JavaScript API
- Places API
- Directions API
- Geocoding API
- Distance Matrix API

---

## Variaveis Opcionais

### Firebase (Push Notifications)

```env
# Server Key do Firebase Cloud Messaging
# Encontrar em: Firebase Console > Project Settings > Cloud Messaging
FIREBASE_SERVER_KEY=AAAA...
```

### Email (Resend)

```env
# API Key do Resend para envio de emails
# Criar em: https://resend.com/api-keys
RESEND_API_KEY=re_...
```

### Pagamentos (Paradise/EfiPay)

```env
# Credenciais do gateway de pagamento PIX
PARADISE_API_KEY=your_api_key
PARADISE_WEBHOOK_SECRET=your_webhook_secret
```

### SMS (Twilio)

```env
# Credenciais do Twilio para SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Seguranca

```env
# Secret para tarefas CRON
CRON_SECRET=your_cron_secret

# Secret para webhooks
WEBHOOK_SECRET=your_webhook_secret
```

---

## Configurar no Vercel

1. Acesse seu projeto no Vercel
2. Va em **Settings > Environment Variables**
3. Adicione cada variavel:
   - Name: nome da variavel (ex: ENCRYPTION_KEY)
   - Value: valor da variavel
   - Environment: Production, Preview, Development

---

## Prioridade de Configuracao

| Variavel | Prioridade | Quando Configurar |
|----------|------------|-------------------|
| ENCRYPTION_KEY | ALTA | Antes de ir para producao |
| GOOGLE_MAPS_API_KEY | ALTA | Antes de testar mapas |
| FIREBASE_SERVER_KEY | MEDIA | Antes de testar push notifications |
| RESEND_API_KEY | MEDIA | Antes de testar envio de emails |
| PARADISE_API_KEY | MEDIA | Antes de testar pagamentos PIX |
| TWILIO_* | BAIXA | Apenas se usar SMS |

---

## Verificar Configuracao

Apos configurar, verifique se todas estao definidas:

```bash
# No terminal do Vercel CLI
vercel env ls
```

Ou acesse `/api/v1/health` para ver status das integracoes.
