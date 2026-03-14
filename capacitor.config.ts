import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.uppi.mobile',
  appName: 'Uppi',

  // App NATIVO — next export gera arquivos estáticos em 'out'
  // Após 'npx cap sync', esses arquivos vão para android/app/src/main/assets/www
  webDir: 'out',

  // ─── iOS ──────────────────────────────────────────────────────────────────
  ios: {
    // Permite que o WebView se estenda sob o notch/Dynamic Island.
    // O app controla os safe-areas via CSS env(safe-area-inset-*).
    contentInset: 'always',
    // Scroll da WKWebView desabilitado — cada tela gerencia seu próprio scroll.
    scrollEnabled: false,
    // Limpa cookies ao encerrar processo (segurança)
    limitsNavigationsToAppBoundDomains: true,
  },

  // ─── Android ──────────────────────────────────────────────────────────────
  android: {
    useLegacyBridge: false,
    allowMixedContent: false,
    backgroundColor: '#FF6B00',
    // Renderização via hardware (melhor performance em mapas e animações)
    captureInput: false,
  },

  // ─── Plugins ──────────────────────────────────────────────────────────────
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    Geolocation: {
      // Pede "Always Allow" no iOS para background geolocation funcionar
    },

    SplashScreen: {
      // Duração mínima — escondemos manualmente após o app carregar (lib/capacitor.ts)
      launchShowDuration: 0,
      launchAutoHide: false,
      // Cor igual ao fundo da splash image — evita flash branco
      backgroundColor: '#FF6B00',
      androidSplashResourceName: 'splash',
      // iOS: usa LaunchScreen.storyboard — não usa imagem estática
      iosSplashFullScreen: true,
      iosSpinnerStyle: 'small',
      spinnerColor: '#FFFFFF',
      showSpinner: false,
      // Fade-out suave ao esconder
      splashFullScreen: true,
      splashImmersive: true,
      androidScaleType: 'CENTER_CROP',
    },

    StatusBar: {
      // overlaysWebView: true para que o WebView fique sob a status bar
      // e o app controle a cor via @capacitor/status-bar (use-status-bar.ts)
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#00000000',
    },

    // Configuração do @capacitor-community/background-geolocation
    BackgroundGeolocation: {
      // Notificação persistente Android (obrigatória para background)
      backgroundTitle: 'Uppi — Localização ativa',
      backgroundMessage: 'Rastreamento de corrida em andamento.',
    },

    Keyboard: {
      // No iOS, o teclado não empurra o WebView — o app lida com isso via CSS
      resize: 'ionic',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
}

export default config
