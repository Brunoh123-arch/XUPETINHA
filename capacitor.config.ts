import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // Package name deve ser identico ao do google-services.json
  appId: 'app.uppi.mobile',
  appName: 'Uppi',

  // Onde o app web esta hospedado em producao
  // Em dev, usar livereload apontando para localhost
  webDir: 'out',

  server: {
    // Em producao, remove esta secao e usa webDir
    // Em desenvolvimento: npx cap run android --livereload --external
    androidScheme: 'https',
  },

  android: {
    // Habilita FCM via google-services.json (colocado em android/app/)
    useLegacyBridge: false,
    // Permite HTTP em dev (nao necessario em producao com HTTPS)
    allowMixedContent: false,
    // Cor da splash screen
    backgroundColor: '#007AFF',
  },

  plugins: {
    // Push Notifications (FCM nativo)
    PushNotifications: {
      // Apresentacao das notificacoes com o app em foreground
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // Geolocation - precisao alta para rastreamento de corridas
    Geolocation: {
      // Permissoes declaradas no AndroidManifest.xml
    },

    // SplashScreen
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#007AFF',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },

    // Status bar
    StatusBar: {
      overlaysWebView: true,
    },
  },
}

export default config
