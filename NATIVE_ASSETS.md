# Guia de Assets Nativos — Uppi

## Ícone do App

### Tamanhos necessários

| Plataforma | Tamanho | Arquivo |
|---|---|---|
| iOS — App Store | 1024×1024 | `ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png` |
| iOS — iPhone | 180×180 | `@3x` |
| iOS — iPad | 167×167 | `@2x` |
| Android — xxxhdpi | 192×192 | `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` |
| Android — xxhdpi | 144×144 | `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` |
| Android — xhdpi | 96×96 | `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` |
| Android — hdpi | 72×72 | `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` |
| Android — mdpi | 48×48 | `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` |

### Dark Mode (iOS 18+)

Crie uma variante escura do ícone em `AppIcon.appiconset/AppIcon-Dark-1024.png`.
Adicione a entrada `"idiom": "universal", "platform": "ios", "appearances": [{"appearance": "luminosity", "value": "dark"}]` no `Contents.json`.

### Geração automática

```bash
# Instale o @capacitor/assets e gere todos os tamanhos de uma vez:
npx @capacitor/assets generate \
  --iconBackgroundColor '#FF6B00' \
  --iconBackgroundColorDark '#1C1C1E' \
  --splashBackgroundColor '#FF6B00' \
  --splashBackgroundColorDark '#1C1C1E'
```

Coloque os arquivos fonte em:
- `resources/icon.png` — 1024×1024, fundo transparente
- `resources/icon-foreground.png` — 1024×1024, só o ícone (para Android Adaptive)
- `resources/splash.png` — 2732×2732, logo centralizada

---

## Splash Screen

### iOS — LaunchScreen.storyboard

O Capacitor já gera o `LaunchScreen.storyboard` automaticamente com base em `resources/splash.png`.

Configurações importantes (`capacitor.config.ts`):
- `launchAutoHide: false` — escondemos manualmente após o app carregar
- `backgroundColor: '#FF6B00'` — fundo laranja evita flash branco
- O hide manual acontece em `lib/capacitor.ts` → `initCapacitorApp()` → `SplashScreen.hide()`

### Android — Splash Resource

O arquivo `android/app/src/main/res/drawable/splash.png` (e variantes hdpi/xhdpi/etc.) é gerado pelo `@capacitor/assets generate`.

Para usar o Splash Screen nativo do Android 12+ (recomendado):
```xml
<!-- android/app/src/main/res/values/styles.xml -->
<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
  <item name="android:windowSplashScreenBackground">@color/splash_background</item>
  <item name="android:windowSplashScreenAnimatedIcon">@drawable/ic_launcher_foreground</item>
  <item name="android:windowSplashScreenIconBackgroundColor">@color/splash_background</item>
  <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
</style>
```

---

## Deep Links — Configuração final

### Android (App Links)

1. Substitua `SUBSTITUIR_PELO_SHA256_DO_KEYSTORE_DE_RELEASE` em `public/.well-known/assetlinks.json` com o SHA-256 do seu keystore de release:
   ```bash
   keytool -list -v -keystore release.keystore -alias uppi | grep SHA256
   ```

2. No `AndroidManifest.xml`, adicione dentro da `<activity>` principal:
   ```xml
   <intent-filter android:autoVerify="true">
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="https" android:host="uppi.app" />
   </intent-filter>
   ```

### iOS (Universal Links)

1. Substitua `TEAM_ID` em `public/.well-known/apple-app-site-association` com o seu Apple Team ID (encontrado em developer.apple.com).

2. No Xcode, em **Signing & Capabilities → Associated Domains**, adicione:
   ```
   applinks:uppi.app
   webcredentials:uppi.app
   ```

3. O arquivo AASA em `public/.well-known/apple-app-site-association` é servido automaticamente pelo Vercel — sem extensão `.json` e com `Content-Type: application/json`.
