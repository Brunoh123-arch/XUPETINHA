# Publicar na Play Store — Guia Capacitor

**Atualizado em:** 10/03/2026  
**Package ID:** `app.uppi.mobile`

O Uppi usa **Capacitor 8** para gerar um APK/AAB nativo Android a partir do codigo Next.js.
NAO e TWA (Trusted Web Activity) — e um app nativo real com acesso a GPS, camera, push FCM e todos os sensores.

---

## Stack Nativa

| Plugin | Versao | Uso |
|---|---|---|
| `@capacitor/core` | 8.2.0 | Core do Capacitor |
| `@capacitor/android` | 8.2.0 | Build nativo Android |
| `@capacitor/geolocation` | 8.0.0 | GPS com 3 modos (idle/online/active_ride) |
| `@capacitor/push-notifications` | 8.0.2 | FCM nativo (sem web push) |
| `@capacitor/splash-screen` | 8.0.0 | Splash screen nativa |
| `@capacitor/status-bar` | 8.0.0 | Controle da barra de status |
| `@capacitor/app` | 8.0.0 | Back button, deep links, lifecycle |
| `@capacitor/google-maps` | opcional | Mapa nativo 60fps (opcional, fallback para Google Maps Web) |

---

## Configuracao Atual (`capacitor.config.ts`)

```ts
{
  appId: 'app.uppi.mobile',
  appName: 'Uppi',
  webDir: 'out',              // Build estático do Next.js
  android: {
    backgroundColor: '#FF6B00',
  },
  plugins: {
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    SplashScreen: { launchShowDuration: 2000, backgroundColor: '#FF6B00' },
    StatusBar: { style: 'DARK', backgroundColor: '#FF6B00' },
  }
}
```

---

## Passo a Passo para Gerar o APK/AAB

### Pre-requisitos
- Node.js 18+
- Java 17+ (JDK)
- Android Studio instalado
- Conta Google Play Console

### 1. Build do Next.js (exportacao estatica)

Adicionar ao `next.config.js`:
```js
output: 'export'
```

Depois:
```bash
pnpm run build
# Gera a pasta /out com os arquivos estaticos
```

### 2. Adicionar plataforma Android
```bash
npx cap add android
```

### 3. Copiar google-services.json
Baixar do Firebase Console e copiar para:
```
android/app/google-services.json
```

### 4. Sincronizar assets
```bash
npx cap sync android
# Copia /out para android/app/src/main/assets/public
# Instala plugins nativos
```

### 5. Abrir no Android Studio
```bash
npx cap open android
```

### 6. Configurar icones no Android Studio
- `res/mipmap-hdpi/` — 72x72
- `res/mipmap-xhdpi/` — 96x96
- `res/mipmap-xxhdpi/` — 144x144
- `res/mipmap-xxxhdpi/` — 192x192

Ou usar o **Image Asset Studio** do Android Studio:
`File > New > Image Asset`

### 7. Criar Keystore (apenas 1x)
```bash
keytool -genkey -v -keystore uppi-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias uppi
```

Guardar o arquivo `.jks` e as senhas em local seguro.

### 8. Configurar assinatura
Em `android/app/build.gradle`:
```gradle
android {
  signingConfigs {
    release {
      storeFile file('uppi-release.jks')
      storePassword 'SUA_SENHA'
      keyAlias 'uppi'
      keyPassword 'SUA_SENHA_KEY'
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
      minifyEnabled true
    }
  }
}
```

### 9. Gerar AAB para Play Store
No Android Studio:
`Build > Generate Signed Bundle/APK > Android App Bundle`

Ou via linha de comando:
```bash
cd android
./gradlew bundleRelease
# Gera: android/app/build/outputs/bundle/release/app-release.aab
```

### 10. Atualizar assetlinks.json
Pegar o SHA256 do keystore:
```bash
keytool -list -v -keystore uppi-release.jks -alias uppi
```

Atualizar `/public/.well-known/assetlinks.json` com o SHA256 e fazer deploy.

---

## AndroidManifest.xml — Permissoes

O Capacitor adiciona automaticamente via plugins, mas confirmar que existem:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

## Variaveis de Ambiente Necessarias

| Variavel | Onde Obter | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Banco de dados |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Admin APIs |
| `FIREBASE_SERVER_KEY` | Firebase Console > Project Settings | Push FCM |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Cloud Console | Mapas |
| `PARADISE_API_KEY` | Paradise Gateway | Pagamentos PIX |
| `PARADISE_API_URL` | Paradise Gateway | Endpoint PIX |

---

## Play Console — Configuracoes Recomendadas

| Campo | Valor |
|---|---|
| Package Name | `app.uppi.mobile` |
| Version Code | Incrementar a cada release |
| Target SDK | 34 (Android 14) |
| Min SDK | 23 (Android 6.0) |
| Categoria | Transporte |
| Classificacao | Livre (L) |

### Checklist para aprovacao
- [ ] Politica de privacidade publicada (disponivel em `/privacy`)
- [ ] Termos de uso publicados (disponivel em `/termos`)
- [ ] Screenshots de 1080x1920px (pelo menos 4)
- [ ] Icone 512x512px (PNG, sem alpha)
- [ ] Feature graphic 1024x500px
- [ ] Descricao completa em Portugues
- [ ] Permissao de localizacao justificada (ride-sharing)

---

## Atualizacoes Futuras

Para atualizar o app apos mudancas:
```bash
pnpm run build      # Gera /out
npx cap sync        # Sincroniza com Android
# Abrir Android Studio e gerar novo AAB
```

Incrementar `versionCode` no `android/app/build.gradle` a cada release.
