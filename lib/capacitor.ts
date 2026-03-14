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
        // history.go(-1) é seguro aqui pois estamos no contexto Capacitor WebView
        history.go(-1)
      } else {
        App.exitApp()
      }
    })

    // Listener para app state (foreground/background)
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('[Capacitor] App state:', isActive ? 'foreground' : 'background')
    })

    // Listener para deep links / Universal Links (iOS) / App Links (Android)
    // Usa handleDeepLink do deep-links.ts para navegacao SPA real via Next.js router
    App.addListener('appUrlOpen', ({ url }) => {
      import('next/navigation').then(({ useRouter: _unused }) => {}).catch(() => {})
      // Dispara evento para que o componente DeepLinkHandler (no layout) processe
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('capacitor:deeplink', { detail: { url } }))
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
 * Hook React para processar deep links recebidos pelo Capacitor.
 * Deve ser montado no layout raiz (app/uppi/layout.tsx ou app/layout.tsx).
 * Escuta o evento 'capacitor:deeplink' despachado pelo initCapacitorApp()
 * e navega via router do Next.js sem reload.
 *
 * Rotas suportadas:
 *  /share?type=ride&id=...      → corrida compartilhada
 *  /share?type=coupon&code=...  → cupom recebido
 *  /uppi/ride/:id/*             → tela de corrida
 *  /uppi/driver/ride/:id/accept → aceitar corrida (motorista)
 *  /invite/:code                → convite de passageiro
 *  /driver/invite/:code         → convite de motorista
 */
export function useDeepLinkListener() {
  // Importado inline para evitar import circular (este arquivo nao pode importar React no topo)
  // O componente que usa este hook deve importar de 'react'
  if (typeof window === 'undefined') return

  return (router: Parameters<typeof import('@/lib/utils/deep-links')['handleDeepLink']>[1]) => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent<{ url: string }>).detail?.url
      if (!url) return
      import('@/lib/utils/deep-links').then(({ handleDeepLink }) => {
        handleDeepLink(url, router)
      }).catch(() => {})
    }
    window.addEventListener('capacitor:deeplink', handler)
    return () => window.removeEventListener('capacitor:deeplink', handler)
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
