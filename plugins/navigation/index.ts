/**
 * CapacitorNavigationPlugin — Ponte TypeScript
 *
 * Expõe o Google Maps Navigation SDK nativo (Android / iOS) para o
 * front-end Capacitor sem precisar sair do app (experiência in-app).
 *
 * Uso:
 *   import { NavigationPlugin } from '@/plugins/navigation'
 *   await NavigationPlugin.startNavigation({ lat: -3.7, lng: -38.5, label: 'Destino' })
 *
 *   // Ouvir progresso turn-by-turn
 *   NavigationPlugin.addListener('navigationProgress', (e) => {
 *     console.log(e.nextStepInstruction, e.distanceToNextStepMeters)
 *   })
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

/**
 * Dados enviados pelo Navigation SDK a cada atualização de rota.
 * Emitido pelo evento "navigationProgress".
 */
export interface NavigationProgress {
  /** Instrução da próxima manobra (ex: "Vire à direita na Rua X") */
  nextStepInstruction: string
  /** Distância até a próxima manobra, em metros */
  distanceToNextStepMeters: number
  /** Tempo estimado até o destino final, em segundos */
  timeToDestinationSeconds: number
  /** Distância total restante até o destino, em metros */
  distanceToDestinationMeters: number
  /** Nome da via atual */
  currentRoadName?: string
  /**
   * Tipo de manobra para renderizar o ícone correto na UI.
   * Valores possíveis: 'turn_left' | 'turn_right' | 'turn_slight_left' |
   * 'turn_slight_right' | 'turn_sharp_left' | 'turn_sharp_right' |
   * 'uturn' | 'roundabout' | 'straight' | 'destination' | 'unknown'
   */
  maneuverType:
    | 'turn_left'
    | 'turn_right'
    | 'turn_slight_left'
    | 'turn_slight_right'
    | 'turn_sharp_left'
    | 'turn_sharp_right'
    | 'uturn'
    | 'roundabout'
    | 'straight'
    | 'destination'
    | 'unknown'
  /** Latitude atual do dispositivo (reportada pelo SDK) */
  currentLat?: number
  /** Longitude atual do dispositivo (reportada pelo SDK) */
  currentLng?: number
  /** Heading atual em graus (0 = norte) */
  currentHeading?: number
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
   *
   * Após chamar este método, ouça o evento "navigationProgress" para
   * receber atualizações de instrução e distância em tempo real.
   */
  startNavigation(destination: NavigationDestination): Promise<NavigationStatus>

  /**
   * Encerra a navegação e volta para a tela do app.
   */
  stopNavigation(): Promise<void>

  /**
   * Registra um listener para um evento do plugin.
   *
   * Eventos disponíveis:
   * - "navigationProgress"  → NavigationProgress (a cada update do SDK)
   * - "arrivedAtDestination" → void (quando o SDK detecta chegada)
   * - "navigationStopped"   → void (quando o usuário fecha a tela nativa)
   */
  addListener(
    event: 'navigationProgress',
    handler: (data: NavigationProgress) => void
  ): Promise<{ remove: () => void }>

  addListener(
    event: 'arrivedAtDestination' | 'navigationStopped',
    handler: () => void
  ): Promise<{ remove: () => void }>

  /**
   * Remove todos os listeners registrados.
   */
  removeAllListeners(): Promise<void>
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
