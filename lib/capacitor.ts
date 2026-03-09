import { Capacitor } from '@capacitor/core'

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
    // Imports dinamicos — so rodam se for nativo
    const { SplashScreen } = await import('@capacitor/splash-screen')
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { App } = await import('@capacitor/app')

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
        // Sair do app
        App.exitApp()
      }
    })

    // Listener para app state (foreground/background)
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('[Capacitor] App state:', isActive ? 'foreground' : 'background')
    })

    // Listener para deep links
    App.addListener('appUrlOpen', ({ url }) => {
      console.log('[Capacitor] Deep link:', url)
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
 * Mostra a splash screen
 */
export async function showSplash() {
  if (!isNativePlatform()) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.show({ autoHide: false })
  } catch (err) {
    console.error('[Capacitor] Erro ao mostrar splash:', err)
  }
}

/**
 * Esconde a splash screen
 */
export async function hideSplash() {
  if (!isNativePlatform()) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch (err) {
    console.error('[Capacitor] Erro ao esconder splash:', err)
  }
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

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')

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
  } catch (err) {
    console.error('[Capacitor] Erro ao configurar status bar:', err)
  }
}

/**
 * Obtem informacoes do app
 */
export async function getAppInfo() {
  if (!isNativePlatform()) return null
  try {
    const { App } = await import('@capacitor/app')
    return await App.getInfo()
  } catch (err) {
    console.error('[Capacitor] Erro ao obter info do app:', err)
    return null
  }
}
