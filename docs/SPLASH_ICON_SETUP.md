# Splash Screen e Icone do App — Guia Completo

## Ferramenta recomendada: `capacitor-assets`

O pacote oficial da Capacitor gera automaticamente todos os tamanhos de icone
e splash screen para Android e iOS a partir de dois arquivos de origem.

### Instalacao

```bash
npm install -D @capacitor/assets
```

---

## Arquivos de origem necessarios

Crie os seguintes arquivos na pasta `assets/` na raiz do projeto:

```
assets/
  icon.png          — 1024x1024px, fundo solido, sem transparencia no icone em si
  icon-foreground.png  — 1024x1024px, so o simbolo (sem fundo), para Adaptive Icon Android
  icon-background.png  — 1024x1024px, so o fundo (cor solida ou gradiente)
  splash.png        — 2732x2732px, imagem centralizada para splash
  splash-dark.png   — 2732x2732px, versao dark mode (opcional mas recomendado)
```

### Especificacoes do icone Uppi

- Cor de fundo: `#FF6B00` (laranja Uppi)
- Simbolo: logotipo branco centralizado
- Formato: PNG, sem camadas JPEG
- Raio de borda: NAO adicionar — o OS aplica o arredondamento automaticamente
- Tamanho do simbolo: ocupa ~60% do canvas (deixar margem de 20% em cada lado)

### Especificacoes da splash screen

- Resolucao: 2732x2732px (cobre todos os iPads Pro em landscape)
- Fundo: `#FF6B00`
- Conteudo: apenas o logo Uppi centralizado, ~400px de largura
- Formato: PNG

---

## Geracao automatica

```bash
# Gera todos os icones e splash screens para Android e iOS
npx capacitor-assets generate --assetPath assets/ --ios --android
```

Isso cria automaticamente:
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/` — todos os tamanhos iOS
- `ios/App/App/Assets.xcassets/Splash.imageset/` — splash iOS
- `android/app/src/main/res/` — icones e splash Android (mipmap-*, drawable-*)

---

## Configuracao Android — Adaptive Icons (Android 8+)

Os Adaptive Icons permitem que o launcher aplique formas diferentes ao icone
(circulo, squircle, etc). O `capacitor-assets` ja gera os arquivos corretos,
mas confirme em `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
```

---

## Configuracao iOS — LaunchScreen.storyboard

O Capacitor usa `LaunchScreen.storyboard` no iOS por padrao (nao imagem estatica).
Isso garante que a splash screen funciona em todos os tamanhos de tela sem distorcao.

Se quiser customizar ainda mais, abra o projeto no Xcode:
```bash
npx cap open ios
```
E edite o `LaunchScreen.storyboard` para adicionar o logo Uppi centralizado
com fundo `#FF6B00`.

---

## Configuracao atual no `capacitor.config.ts`

```typescript
SplashScreen: {
  launchShowDuration: 0,       // Escondemos manualmente em lib/capacitor.ts
  launchAutoHide: false,       // Controle manual via SplashScreen.hide()
  backgroundColor: '#FF6B00', // Cor de fundo — deve bater com o icone
  androidSplashResourceName: 'splash',
  iosSplashFullScreen: true,
  showSpinner: false,
  splashFullScreen: true,
  splashImmersive: true,       // Esconde as barras de sistema durante splash
  androidScaleType: 'CENTER_CROP',
},
```

O `SplashScreen.hide()` e chamado em `lib/capacitor.ts` dentro de `initCapacitorApp()`,
logo apos o app terminar de carregar. Isso garante que a splash fica visivel
ate o conteudo real estar pronto.

---

## Checklist antes de publicar

- [ ] `assets/icon.png` — 1024x1024px criado
- [ ] `assets/icon-foreground.png` — simbolo sem fundo criado
- [ ] `assets/icon-background.png` — fundo laranja criado
- [ ] `assets/splash.png` — 2732x2732px criado
- [ ] `npx capacitor-assets generate` executado com sucesso
- [ ] Verificar icone no Android Studio: `Run > Edit Configurations`
- [ ] Verificar icone no Xcode: `App > Assets.xcassets > AppIcon`
- [ ] Testar splash screen em dispositivo fisico (emulador pode ter comportamento diferente)

---

## Dica: testar splash screen no Android

```bash
# Forca o app a reiniciar e exibir a splash
adb shell am force-stop app.uppi.mobile && \
adb shell monkey -p app.uppi.mobile -c android.intent.category.LAUNCHER 1
```
