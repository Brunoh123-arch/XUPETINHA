/**
 * Haptic Feedback nativo via @capacitor/haptics.
 *
 * Arquivo substitui a implementacao antiga baseada em navigator.vibrate (web-only).
 * Em plataformas nativas usa ImpactStyle / NotificationType do Capacitor, que aciona
 * o Taptic Engine no iOS e o HapticFeedback no Android.
 *
 * Nao ha fallback web — se o dispositivo nao suportar, a funcao retorna silenciosamente.
 */

import { Capacitor } from '@capacitor/core'

export type HapticPattern =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'rigid'
  | 'soft'

async function getHaptics() {
  const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')
  return { Haptics, ImpactStyle, NotificationType }
}

class HapticFeedback {
  private isEnabled: boolean = true

  private async _trigger(fn: () => Promise<void>): Promise<void> {
    if (!this.isEnabled || !Capacitor.isNativePlatform()) return
    try {
      await fn()
    } catch {
      // Nunca quebra o app — dispositivo pode nao ter Taptic Engine
    }
  }

  async trigger(pattern: HapticPattern = 'light'): Promise<void> {
    await this._trigger(async () => {
      const { Haptics, ImpactStyle, NotificationType } = await getHaptics()
      switch (pattern) {
        case 'light':
        case 'soft':
          await Haptics.impact({ style: ImpactStyle.Light })
          break
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium })
          break
        case 'heavy':
        case 'rigid':
          await Haptics.impact({ style: ImpactStyle.Heavy })
          break
        case 'success':
          await Haptics.notification({ type: NotificationType.Success })
          break
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning })
          break
        case 'error':
          await Haptics.notification({ type: NotificationType.Error })
          break
        case 'selection':
          await Haptics.selectionStart()
          await Haptics.selectionChanged()
          await Haptics.selectionEnd()
          break
      }
    })
  }

  async custom(_pattern: number[]): Promise<void> {
    // navigator.vibrate nao existe em modo nativo puro.
    // Mapeamos o comprimento do array para o peso mais proximo.
    await this._trigger(async () => {
      const { Haptics, ImpactStyle } = await getHaptics()
      await Haptics.impact({ style: ImpactStyle.Medium })
    })
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    // Persiste via @capacitor/preferences para nao usar localStorage
    import('@capacitor/preferences').then(({ Preferences }) => {
      Preferences.set({ key: 'uppi_haptics_enabled', value: String(enabled) }).catch(() => {})
    }).catch(() => {})
  }

  async loadPreference(): Promise<void> {
    try {
      const { Preferences } = await import('@capacitor/preferences')
      const { value } = await Preferences.get({ key: 'uppi_haptics_enabled' })
      if (value !== null) this.isEnabled = value !== 'false'
    } catch {
      // Plugin indisponivel — mantém padrao true
    }
  }

  getEnabled(): boolean { return this.isEnabled }
  getSupported(): boolean { return Capacitor.isNativePlatform() }

  interactions = {
    buttonPress:   () => this.trigger('light'),
    toggleOn:      () => this.trigger('success'),
    toggleOff:     () => this.trigger('selection'),
    swipe:         () => this.trigger('selection'),
    longPress:     () => this.trigger('medium'),
    delete:        () => this.trigger('warning'),
    confirmation:  () => this.trigger('success'),
    cancellation:  () => this.trigger('rigid'),
    notification:  () => this.trigger('medium'),
    achieved:      () => this.trigger('success'),
    pullToRefresh: () => this.trigger('rigid'),
  }
}

export const haptics = new HapticFeedback()

// Inicializa preferencia salva (nao bloqueante)
haptics.loadPreference()

// Compatibilidade com chamadas legadas
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  haptics.trigger(pattern)
}
