# UPPI - Configuracao Capacitor Android

> Atualizado em: 16/03/2026

---

## Estrutura do Projeto Android

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/uppi/app/
│   │   │   └── MainActivity.java
│   │   ├── res/
│   │   │   ├── drawable/         # Icones e splash
│   │   │   ├── mipmap-*/         # Icones do app
│   │   │   ├── values/           # Strings, cores, temas
│   │   │   └── xml/              # Configuracoes
│   │   └── AndroidManifest.xml
│   ├── build.gradle              # Configuracao do app
│   └── google-services.json      # Firebase
├── build.gradle                  # Configuracao do projeto
├── gradle.properties
└── settings.gradle
```

---

## Configuracoes Atuais

### capacitor.config.ts

```typescript
{
  appId: 'com.uppi.app',
  appName: 'UPPI',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'app.uppi.com.br'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    }
  }
}
```

### AndroidManifest.xml - Permissoes

```xml
<!-- Internet -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Localizacao -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- Camera e Arquivos -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Audio -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<!-- Push Notifications -->
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Telefone -->
<uses-permission android:name="android.permission.CALL_PHONE" />
```

---

## Plugins Capacitor Instalados

| Plugin | Versao | Funcao |
|--------|--------|--------|
| @capacitor/core | 6.x | Core do Capacitor |
| @capacitor/android | 6.x | Plataforma Android |
| @capacitor/push-notifications | 6.x | Push notifications |
| @capacitor/geolocation | 6.x | GPS |
| @capacitor/camera | 6.x | Camera |
| @capacitor/filesystem | 6.x | Arquivos |
| @capacitor/splash-screen | 6.x | Splash screen |
| @capacitor/keyboard | 6.x | Teclado |
| @capacitor/app | 6.x | Ciclo de vida |
| @capacitor/haptics | 6.x | Vibracoes |
| @capacitor/status-bar | 6.x | Barra de status |
| @capacitor/network | 6.x | Status da rede |

---

## Comandos Uteis

### Sincronizar projeto

```bash
npx cap sync android
```

### Abrir no Android Studio

```bash
npx cap open android
```

### Build de debug

```bash
cd android
./gradlew assembleDebug
```

### Build de release

```bash
cd android
./gradlew assembleRelease
```

### Gerar AAB (para Play Store)

```bash
cd android
./gradlew bundleRelease
```

---

## Deep Links Configurados

```xml
<!-- AndroidManifest.xml -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="app.uppi.com.br" />
    <data android:scheme="uppi" android:host="app" />
</intent-filter>
```

Links suportados:
- `https://app.uppi.com.br/ride/{id}`
- `https://app.uppi.com.br/driver/{id}`
- `https://app.uppi.com.br/promo/{code}`
- `uppi://app/ride/{id}`

---

## Firebase

O arquivo `google-services.json` ja esta configurado em:
```
android/app/google-services.json
```

Se precisar atualizar:
1. Acesse Firebase Console
2. Project Settings > Your apps > Android
3. Baixe o novo `google-services.json`
4. Substitua o arquivo

---

## Solucao de Problemas

### Erro: SDK not found

```bash
# Definir ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Erro: Gradle sync failed

```bash
cd android
./gradlew clean
./gradlew --refresh-dependencies
```

### Erro: Plugin not found

```bash
npm install @capacitor/plugin-name
npx cap sync android
```

### Erro: Build failed

```bash
# Limpar cache
cd android
./gradlew clean
rm -rf app/build
rm -rf .gradle

# Rebuild
./gradlew assembleDebug
```

---

## Proximos Passos

1. [ ] Gerar keystore de assinatura
2. [ ] Configurar assinatura no build.gradle
3. [ ] Testar push notifications
4. [ ] Testar deep links
5. [ ] Gerar AAB para Play Store
