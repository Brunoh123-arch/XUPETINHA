/**
 * Initialize app on mount
 * Call this in layout.tsx or root component
 */

import { Capacitor } from '@capacitor/core'

export function initApp() {
  if (typeof window === 'undefined') return

  // Service Worker nao se aplica em Capacitor (WKWebView/WebView) — registro omitido

  // Handle app visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Could trigger data refresh here
    }
  })

  // Status bar: configurar ícones escuros ao iniciar (fundo claro padrão)
  if (Capacitor.isNativePlatform()) {
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
    }).catch(() => {})
  }
}
