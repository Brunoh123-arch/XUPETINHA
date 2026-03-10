# Variaveis de Ambiente — Uppi

Todas as variaveis de ambiente necessarias para rodar o projeto em desenvolvimento e producao.

---

## Obrigatorias

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://jpnwxqjrhzaobnugjnyx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
- `NEXT_PUBLIC_SUPABASE_URL` — URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Chave anonima (publica, segura para expor)
- `SUPABASE_SERVICE_ROLE_KEY` — Chave de servico (SECRETA, apenas server-side)

### Google Maps
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_MAPS_API_KEY=AIza...
```
- Usada para: Mapas, Autocomplete de enderecos, Geocoding, Directions
- APIs necessarias no Google Cloud Console:
  - Maps JavaScript API
  - Places API
  - Geocoding API
  - Directions API

### Firebase FCM (Push Notifications)
```bash
FIREBASE_SERVER_KEY=AAAAxxxxxx...
```
- Obter em: Firebase Console > Configuracoes do Projeto > Cloud Messaging > Chave do servidor legada
- Usada para enviar push notifications para dispositivos Android

### Paradise Gateway (PIX)
```bash
PARADISE_API_KEY=pk_live_...
PARADISE_API_URL=https://api.paradisepay.com.br
```
- Gateway de pagamento PIX
- Usado para: cobrancas PIX, polling de status, webhook de confirmacao

---

## Opcionais

### SMS OTP
```bash
SMS_API_KEY=
SMS_SENDER_ID=UPPI
```
- Para verificacao por SMS no cadastro
- Compativel com: Zenvia, Twilio, AWS SNS

### Capacitor (Android)
```bash
CAPACITOR_SERVER_URL=https://uppi.vercel.app
```
- Apenas necessario se usar servidor remoto no Capacitor
- Em producao com build estatico, nao e necessario

---

## Como Configurar no Vercel

1. Acessar: vercel.com > Projeto Uppi > Settings > Environment Variables
2. Adicionar cada variavel acima
3. Selecionar os ambientes: Production, Preview, Development
4. Fazer redeploy apos adicionar

---

## .env.example

O arquivo `.env.example` na raiz do projeto contem o template com todas as variaveis.
Copiar para `.env.local` ao desenvolver localmente:

```bash
cp .env.example .env.local
```

---

## Seguranca

- NUNCA commitar `.env.local` ou `.env` com valores reais
- `SUPABASE_SERVICE_ROLE_KEY` e `FIREBASE_SERVER_KEY` NUNCA devem ser expostos no cliente
- Todas as variaveis sem `NEXT_PUBLIC_` sao automaticamente server-only no Next.js
