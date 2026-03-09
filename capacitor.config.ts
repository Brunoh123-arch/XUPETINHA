import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.uppi.mobile',
  appName: 'Uppi',

  // App NATIVO - carrega apenas localmente
  // next export gera arquivos estáticos em 'out'
  // Após 'npx cap sync', esses arquivos vão para android/app/src/main/assets/www
  webDir: 'out',

  android: {
    useLegacyBridge: false,
    allowMixedContent: false,
    backgroundColor: '#FF6B00',
  },

  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {},
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FF6B00',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#FF6B00',
    },
  },
}

export default config
