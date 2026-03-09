import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.uppi.mobile',
  appName: 'Uppi',

  // Aponta para a URL de producao (Vercel)
  // O Capacitor carrega o site remoto em vez de arquivos locais
  webDir: 'public',

  server: {
    // URL do app em producao — substitua pelo dominio real
    url: process.env.CAPACITOR_SERVER_URL || 'https://uppi.vercel.app',
    cleartext: false,
    androidScheme: 'https',
  },

  android: {
    useLegacyBridge: false,
    allowMixedContent: false,
    backgroundColor: '#FF6B00',
    // Habilita deep links
    appendUserAgent: 'UppiApp/1.0',
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
