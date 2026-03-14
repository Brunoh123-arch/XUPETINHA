/**
 * Live Activities Plugin — interface TypeScript / Capacitor
 *
 * Controla a Dynamic Island e a tela de bloqueio do iOS 16.1+ via ActivityKit.
 * No Android e no web é no-op silencioso (retorna { available: false }).
 *
 * Uso:
 *   import { LiveActivityPlugin } from '@/plugins/live-activity'
 *
 *   // Inicia ao aceitar a corrida
 *   await LiveActivityPlugin.startActivity({
 *     rideId: '...',
 *     passengerName: 'Maria',
 *     passengerAvatarUrl: 'https://...',
 *     status: 'accepted',
 *     originAddress: 'Rua A, 100',
 *     destinationAddress: 'Rua B, 200',
 *     etaMinutes: 8,
 *   })
 *
 *   // Atualiza ao mudar de status
 *   await LiveActivityPlugin.updateActivity({ status: 'driver_arrived', etaMinutes: 0 })
 *
 *   // Encerra ao completar/cancelar
 *   await LiveActivityPlugin.endActivity()
 */

import { registerPlugin } from '@capacitor/core'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type RideActivityStatus =
  | 'accepted'       // Motorista a caminho do embarque
  | 'driver_arrived' // Motorista chegou ao local
  | 'in_progress'    // Corrida em andamento
  | 'completed'      // Corrida finalizada
  | 'cancelled'      // Corrida cancelada

export interface StartActivityOptions {
  /** ID da corrida — usado como chave de dedup (só uma atividade por corrida) */
  rideId: string
  /** Nome do passageiro exibido na Dynamic Island */
  passengerName: string
  /** URL do avatar do passageiro (HTTPS, PNG/JPEG, máx 128×128) */
  passengerAvatarUrl?: string
  /** Status atual da corrida */
  status: RideActivityStatus
  /** Endereço de origem (embarque) */
  originAddress: string
  /** Endereço de destino */
  destinationAddress: string
  /** ETA em minutos até o próximo ponto chave */
  etaMinutes: number
}

export interface UpdateActivityOptions {
  /** Novo status */
  status?: RideActivityStatus
  /** ETA atualizado em minutos */
  etaMinutes?: number
  /** Instrução turn-by-turn atual (exibida na Dynamic Island expandida) */
  navigationInstruction?: string
}

export interface LiveActivityResult {
  /** true se o dispositivo suporta Live Activities e a atividade foi iniciada/atualizada */
  available: boolean
  /** ID da atividade retornado pelo ActivityKit (usado internamente) */
  activityId?: string
}

// ─── Plugin Interface ─────────────────────────────────────────────────────────

export interface LiveActivityPluginDef {
  /** Verifica se o dispositivo suporta Live Activities (iOS 16.1+) */
  isAvailable(): Promise<{ available: boolean }>

  /** Inicia uma nova Live Activity para a corrida */
  startActivity(options: StartActivityOptions): Promise<LiveActivityResult>

  /** Atualiza status, ETA ou instrução de navegação */
  updateActivity(options: UpdateActivityOptions): Promise<LiveActivityResult>

  /** Encerra a Live Activity (chame ao completar/cancelar) */
  endActivity(): Promise<{ success: boolean }>
}

// ─── Registro do plugin ───────────────────────────────────────────────────────

export const LiveActivityPlugin = registerPlugin<LiveActivityPluginDef>(
  'CapacitorLiveActivity',
  {
    // Web fallback: no-op silencioso
    web: () =>
      import('./web').then((m) => new m.LiveActivityPluginWeb()),
  }
)
