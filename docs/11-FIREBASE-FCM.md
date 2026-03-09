# Firebase FCM — Push Notifications Nativas

## Visao Geral

O Uppi usa **Firebase Cloud Messaging (FCM)** para push notifications nativas no Android via `@capacitor/push-notifications`. O token FCM de cada dispositivo e salvo no banco e usado pelo backend para enviar notificacoes direcionadas.

---

## Fluxo de Registro

```
1. App inicia no Android
2. CapacitorProvider inicializa NativePushInitializer
3. PushNotifications.requestPermissions() — solicita permissao ao usuario
4. PushNotifications.register() — registra no FCM
5. FCM retorna token do dispositivo
6. Token enviado para POST /api/v1/push/fcm-register
7. Token salvo na tabela fcm_tokens com user_id
```

---

## Tabela fcm_tokens

```sql
CREATE TABLE fcm_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  platform TEXT DEFAULT 'android',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## APIs de Push

### POST `/api/v1/push/fcm-register`
Salva ou atualiza o token FCM do dispositivo.

```json
{ "token": "fcm_token_xxx", "platform": "android" }
```

### DELETE `/api/v1/push/fcm-register`
Remove o token ao fazer logout.

### POST `/api/v1/push/send`
Envia push para um usuario especifico.

```json
{
  "user_id": "uuid",
  "title": "Motorista a caminho",
  "body": "Joao esta a 3 minutos de distancia",
  "data": { "ride_id": "uuid", "route": "/uppi/ride/tracking" }
}
```

### POST `/api/v1/push/broadcast`
Envia push para todos os motoristas online.

```json
{
  "title": "Nova corrida disponivel",
  "body": "Corrida em Copacabana — R$ 25,00",
  "filter": { "type": "driver", "city": "Rio de Janeiro" }
}
```

---

## Notificacoes Disparadas Automaticamente

| Evento | Destinatario | Titulo | Dados |
|---|---|---|---|
| Corrida criada | Motoristas proximos | "Nova corrida!" | ride_id, preco, origem |
| Corrida aceita | Passageiro | "Motorista encontrado" | driver_name, eta |
| Motorista chegou | Passageiro | "Motorista chegou" | driver_name |
| Corrida iniciada | Passageiro | "Corrida iniciada" | ride_id |
| Corrida finalizada | Passageiro | "Corrida concluida" | valor, ride_id |
| Pagamento confirmado | Motorista | "Pagamento recebido" | valor |
| Mensagem de suporte | Usuario | "Suporte respondeu" | ticket_id |

---

## Configuracao Firebase

1. Acessar [console.firebase.google.com](https://console.firebase.google.com)
2. Criar projeto "Uppi"
3. Adicionar app Android com package `app.uppi.mobile`
4. Baixar `google-services.json`
5. Copiar para `android/app/google-services.json` apos `npx cap add android`
6. Obter **Server Key** em: Configuracoes > Cloud Messaging
7. Adicionar ao `.env`: `FIREBASE_SERVER_KEY=AAAAxxxxxxx`

---

## Deep Links via Push

Quando o usuario toca na notificacao, o app navega automaticamente para a tela correta:

```typescript
// Em NativePushInitializer (capacitor-provider.tsx)
PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
  const data = action.notification.data
  if (data?.route) {
    router.push(data.route)          // Ex: /uppi/ride/tracking
  } else if (data?.ride_id) {
    router.push(`/uppi/ride/${data.ride_id}/tracking`)
  }
})
```

---

## Troubleshooting

| Problema | Solucao |
|---|---|
| Token nao gerado | Verificar google-services.json em android/app/ |
| Notificacoes nao chegam | Verificar FIREBASE_SERVER_KEY no .env |
| Push em background nao funciona | Verificar permissoes no AndroidManifest.xml |
| Token invalido no banco | DELETE /api/v1/push/fcm-register e registrar novamente |
