import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'

/**
 * Verifica se esta rodando como app nativo (Capacitor)
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

/**
 * Retorna a plataforma atual
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
}

/**
 * Inicializa o app Capacitor (chamar no layout principal)
 */
export async function initCapacitorApp() {
  if (!isNativePlatform()) return

  try {
    // Esconder splash screen apos carregar
    await SplashScreen.hide()

    // Configurar status bar
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#FF6B00' })

    // Listener para back button (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      } else {
        // Confirmar saida do app
        // App.exitApp() // Descomente se quiser sair direto
      }
    })

    // Listener para app state (foreground/background)
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('[Capacitor] App state:', isActive ? 'foreground' : 'background')
      // Pode pausar/retomar tracking, etc.
    })

    // Listener para deep links
    App.addListener('appUrlOpen', ({ url }) => {
      console.log('[Capacitor] Deep link:', url)
      // Navegar para a rota correta baseado na URL
      const path = new URL(url).pathname
      if (path) {
        window.location.href = path
      }
    })

    console.log('[Capacitor] App inicializado com sucesso')
  } catch (err) {
    console.error('[Capacitor] Erro ao inicializar:', err)
  }
}

/**
 * Mostra a splash screen (util para loading states)
 */
export async function showSplash() {
  if (!isNativePlatform()) return
  await SplashScreen.show({ autoHide: false })
}

/**
 * Esconde a splash screen
 */
export async function hideSplash() {
  if (!isNativePlatform()) return
  await SplashScreen.hide()
}

/**
 * Configura a status bar
 */
export async function setStatusBar(options: {
  style?: 'light' | 'dark'
  backgroundColor?: string
  overlay?: boolean
}) {
  if (!isNativePlatform()) return

  if (options.style) {
    await StatusBar.setStyle({
      style: options.style === 'light' ? Style.Light : Style.Dark,
    })
  }
  if (options.backgroundColor) {
    await StatusBar.setBackgroundColor({ color: options.backgroundColor })
  }
  if (options.overlay !== undefined) {
    await StatusBar.setOverlaysWebView({ overlay: options.overlay })
  }
}

/**
 * Obtem informacoes do app
 */
export async function getAppInfo() {
  if (!isNativePlatform()) return null
  return await App.getInfo()
}
