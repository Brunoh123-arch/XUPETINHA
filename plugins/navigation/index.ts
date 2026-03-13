/**
 * CapacitorNavigationPlugin — Ponte TypeScript
 *
 * Expõe o Google Maps Navigation SDK nativo (Android / iOS) para o
 * front-end Capacitor sem precisar sair do app (experiência in-app).
 *
 * Uso:
 *   import { NavigationPlugin } from '@/plugins/navigation'
 *   await NavigationPlugin.startNavigation({ lat: -3.7, lng: -38.5, label: 'Destino' })
 */

import { registerPlugin } from '@capacitor/core'

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface NavigationDestination {
  /** Latitude do destino */
  lat: number
  /** Longitude do destino */
  lng: number
  /** Rótulo exibido na tela de navegação (ex: "Pegar passageiro") */
  label?: string
}

export interface NavigationStatus {
  /** true  → SDK inicializado com sucesso */
  initialized: boolean
  /** mensagem de erro, se houver */
  error?: string
}

export interface NavigationPluginInterface {
  /**
   * Verifica se o Navigation SDK está disponível no dispositivo.
   * Android: sempre disponível se o APK incluir a dependência.
   * iOS: requer que o pod esteja instalado.
   */
  isAvailable(): Promise<{ available: boolean }>

  /**
   * Inicia a tela de navegação turn-by-turn in-app.
   * No Android abre um NavigationActivity por cima do WebView.
   * No iOS apresenta um UIViewController com GMSNavigationMapView.
   */
  startNavigation(destination: NavigationDestination): Promise<NavigationStatus>

  /**
   * Encerra a navegação e volta para a tela do app.
   */
  stopNavigation(): Promise<void>
}

// ─── Registro do plugin ───────────────────────────────────────────────────────

export const NavigationPlugin = registerPlugin<NavigationPluginInterface>(
  'CapacitorNavigation',
  {
    /**
     * Fallback web: como o Navigation SDK não existe no browser,
     * simulamos uma abertura do Google Maps via deep link.
     */
    web: () =>
      import('./web').then((m) => new m.NavigationPluginWeb()),
  },
)
