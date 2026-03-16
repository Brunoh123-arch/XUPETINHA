# UPPI - Variaveis de Ambiente

> Atualizado em: 16/03/2026

---

## Variaveis Obrigatorias

### Supabase (Ja configuradas)

```env
# URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ullmjdgppucworavoiia.supabase.co

# Chave publica (anon) — pode ser exposta no frontend
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Chave de servico (secreta) — NUNCA expor no frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Criptografia (OBRIGATORIO para producao)

```env
# Chave AES-256-GCM para criptografar CPF, 2FA secrets e webhook secrets
# Gerar com: openssl rand -base64 32
ENCRYPTION_KEY=sua_chave_base64_32_bytes
```

### Google Maps (OBRIGATORIO para mapas e geocoding)

```env
# Para o frontend (Capacitor Maps, autocomplete, rotas)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# Para o backend (Geocoding API server-side)
GOOGLE_MAPS_API_KEY=AIzaSy...
```

**APIs que precisam estar ativas no Google Cloud:**
- Maps JavaScript API
- Maps SDK for Android
- Places API (New)
- Directions API
- Geocoding API
- Distance Matrix API

---

## Variaveis Importantes

### Firebase (Push Notifications)

```env
# Server Key do Firebase Cloud Messaging (FCM)
# Firebase Console > Project Settings > Cloud Messaging > Server key
FIREBASE_SERVER_KEY=AAAA...
```

### Pagamentos PIX (Paradise/EfiPay)

```env
# Credenciais do gateway de pagamento PIX
PARADISE_API_KEY=your_api_key
PARADISE_API_URL=https://api.paradise.com.br
PARADISE_PRODUCT_HASH=your_product_hash
PARADISE_WEBHOOK_SECRET=your_webhook_secret
```

---

## Variaveis Opcionais

### Email (Resend)

```env
# API Key do Resend para envio de emails transacionais
# Criar em: https://resend.com/api-keys
RESEND_API_KEY=re_...
```

### SMS (Twilio)

```env
# Credenciais do Twilio para SMS de verificacao
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Seguranca e Cron

```env
# Secret para autenticar tarefas CRON (ex: /api/cron/process-scheduled-rides)
CRON_SECRET=your_cron_secret_uuid

# Secret para validar webhooks externos
WEBHOOK_SECRET=your_webhook_secret
```

### JWT (se necessario override)

```env
SUPABASE_JWT_SECRET=your_jwt_secret
```

---

## Configurar no Vercel

1. Acesse seu projeto no Vercel
2. Va em **Settings > Environment Variables** (icone de engrenagem no canto superior direito no v0)
3. Para cada variavel:
   - **Name:** nome exato da variavel
   - **Value:** valor
   - **Environment:** Production, Preview, Development (selecione todos)

---

## Tabela de Prioridade

| Variavel | Prioridade | Quando Configurar |
|----------|------------|-------------------|
| `ENCRYPTION_KEY` | **CRITICA** | Antes de qualquer dado real |
| `NEXT_PUBLIC_SUPABASE_URL` | **CRITICA** | Ja configurada |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **CRITICA** | Ja configurada |
| `SUPABASE_SERVICE_ROLE_KEY` | **CRITICA** | Ja configurada |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | **ALTA** | Antes de testar mapas |
| `GOOGLE_MAPS_API_KEY` | **ALTA** | Antes de testar geocoding |
| `FIREBASE_SERVER_KEY` | **ALTA** | Antes de push notifications |
| `PARADISE_API_KEY` | **ALTA** | Antes de testar PIX |
| `RESEND_API_KEY` | MEDIA | Antes de enviar emails |
| `TWILIO_*` | BAIXA | Apenas se usar SMS real |
| `CRON_SECRET` | BAIXA | Apenas para jobs automatizados |

---

## Verificar Configuracao

Acesse `/api/v1/health` para ver status das integracoes:

```json
{
  "status": "ok",
  "database": "connected",
  "encryption": "configured",
  "maps": "configured",
  "firebase": "not_configured"
}
```

---

## Seguranca

- **NUNCA** commite `.env` ou `.env.local` no Git
- `SUPABASE_SERVICE_ROLE_KEY` nao deve aparecer em nenhum arquivo client-side
- `ENCRYPTION_KEY` deve ser rotacionada a cada 6 meses em producao
- Variaveis com `NEXT_PUBLIC_` ficam expostas no bundle do browser — apenas dados realmente publicos
