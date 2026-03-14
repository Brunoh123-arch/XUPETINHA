# Deep Links — Configuracao Completa (Android + iOS)

## O que sao Deep Links

Deep Links permitem que URLs como `https://uppi.app/invite/ABC123` abram
diretamente uma tela especifica dentro do app Uppi, sem passar pelo browser.

- **Android App Links** — verificados pelo Google, abrem o app sem dialogo
- **iOS Universal Links** — verificados pela Apple, abrem o app silenciosamente
- **Esquema customizado** — `uppi://` como fallback (nao requer verificacao HTTPS)

---

## Arquitetura atual

```
URL recebida pelo OS
       |
App.addListener('appUrlOpen')          <- lib/capacitor.ts
       |
dispatchEvent('capacitor:deeplink')    <- evento custom no window
       |
useEffect no app/uppi/layout.tsx       <- escuta o evento
       |
handleDeepLink(url, router)            <- lib/utils/deep-links.ts
       |
router.push('/rota/correta')           <- Next.js App Router (SPA, sem reload)
```

---

## Rotas suportadas

| URL | Destino no app |
|-----|---------------|
| `https://uppi.app/share?type=ride&id=X` | `/uppi/ride/X/details` |
| `https://uppi.app/share?type=coupon&code=X` | `/uppi/promotions?code=X` |
| `https://uppi.app/uppi/ride/X/details` | `/uppi/ride/X/details` |
| `https://uppi.app/uppi/driver/ride/X/accept` | `/uppi/driver/ride/X/accept` |
| `https://uppi.app/uppi/driver/ride/X/active` | `/uppi/driver/ride/X/active` |
| `https://uppi.app/invite/CODE` | `/invite/CODE` |
| `https://uppi.app/driver/invite/CODE` | `/driver/invite/CODE` |

---

## Configuracao Android — App Links

### 1. Arquivo de verificacao (ja criado)

O arquivo `public/.well-known/assetlinks.json` ja esta em producao em:
`https://uppi.app/.well-known/assetlinks.json`

Voce precisa substituir `SUBSTITUIR_PELO_SHA256_DO_KEYSTORE_DE_PRODUCAO`
pelo SHA-256 real do seu keystore de release.

**Como obter o SHA-256:**
```bash
# Se estiver usando o keystore do Android Studio
keytool -list -v -keystore SEU_KEYSTORE.jks -alias SEU_ALIAS

# Se estiver usando Play App Signing (recomendado)
# Acesse: Play Console > Versoes > Integridade do app > Certificado de assinatura do app
# Copie o SHA-256 Fingerprint
```

### 2. Configurar AndroidManifest.xml

Em `android/app/src/main/AndroidManifest.xml`, dentro da `<activity>` principal,
adicione o intent-filter abaixo:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="uppi.app" />
</intent-filter>

<!-- Esquema customizado (fallback) -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="uppi" />
</intent-filter>
```

### 3. Verificar que esta funcionando

```bash
# Abre o app diretamente via adb
adb shell am start -a android.intent.action.VIEW \
  -d "https://uppi.app/invite/TEST123" app.uppi.mobile
```

---

## Configuracao iOS — Universal Links

### 1. Arquivo de verificacao (ja criado)

O arquivo `public/.well-known/apple-app-site-association` ja esta em producao.
Voce precisa substituir `TEAM_ID` pelo seu Apple Developer Team ID.

**Como obter o Team ID:**
Acesse developer.apple.com > Account > Membership > Team ID

### 2. Habilitar Associated Domains no Xcode

1. Abra `android/` ... na verdade abra o projeto iOS em Xcode:
   ```bash
   npx cap open ios
   ```
2. Selecione o target `App`
3. Va em `Signing & Capabilities`
4. Clique `+ Capability` e adicione `Associated Domains`
5. Adicione: `applinks:uppi.app`
6. Adicione tambem: `webcredentials:uppi.app` (para AutoFill de senhas)

### 3. Verificar que esta funcionando

No iOS Simulator:
```bash
# Simula abertura de universal link
xcrun simctl openurl booted "https://uppi.app/invite/TEST123"
```

---

## Configuracao do esquema customizado `uppi://`

Este e o fallback quando o usuario nao tem o app instalado ainda nao
verificou os App Links.

### Android — ja configurado via Capacitor

O Capacitor registra automaticamente o esquema `uppi://` no `AndroidManifest.xml`
quando voce adiciona o `appUrlScheme` no `capacitor.config.ts`.

Adicione ao `capacitor.config.ts`:
```typescript
server: {
  androidScheme: 'https',
},
```

### iOS — Info.plist

No Xcode, adicione em `Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>app.uppi.mobile</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>uppi</string>
    </array>
  </dict>
</array>
```

---

## Testar deep links em desenvolvimento

```bash
# Android — abre pelo esquema customizado
adb shell am start -a android.intent.action.VIEW \
  -d "uppi://uppi.app/invite/TEST123" app.uppi.mobile

# Android — abre pelo App Link HTTPS
adb shell am start -a android.intent.action.VIEW \
  -d "https://uppi.app/uppi/driver/ride/abc/accept" app.uppi.mobile

# iOS Simulator — universal link
xcrun simctl openurl booted "https://uppi.app/share?type=coupon&code=UPPI10"

# iOS Simulator — esquema customizado
xcrun simctl openurl booted "uppi://invite/TEST123"
```

---

## Push Notification deep link (tap na notificacao)

Quando o usuario toca numa notificacao push que contem um deep link,
o FCM entrega o `data.url` via `PushNotifications.addListener('pushNotificationActionPerformed')`.

Este listener ja esta configurado em `hooks/use-fcm-push-notifications.ts`.
Certifique-se de que o payload FCM inclui:

```json
{
  "data": {
    "url": "https://uppi.app/uppi/driver/ride/RIDE_ID/accept",
    "type": "ride_request"
  }
}
```
