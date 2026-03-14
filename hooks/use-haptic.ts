'use client'

/**
 * Haptic feedback com @capacitor/haptics em plataformas nativas.
 * Em web, cai no navigator.vibrate como fallback.
 *
 * Usos recomendados:
 *   light     → toques comuns, seleção de item
 *   medium    → confirmação, botão primário
 *   heavy     → ação destructiva, alerta importante
 *   success   → corrida aceita, embarque confirmado, chegada
 *   warning   → atenção, confirmação antes de ação irreversível
 *   error     → falha, negação
 *   selection → scroll, picker, toggle
 */

import { Capacitor } from '@capacitor/core'

export type HapticStyle =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'

// Fallback web: padrões de vibração em ms
const WEB_PATTERNS: Record<HapticStyle, number | number[]> = {
  light:     10,
  medium:    20,
  heavy:     40,
  success:   [10, 30, 10],
  warning:   [20, 40, 20],
  error:     [40, 30, 40, 30, 40],
  selection: 5,
}

async function triggerHaptic(style: HapticStyle = 'light'): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      // Usa @capacitor/haptics em iOS/Android para haptic real
      const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')

      switch (style) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light })
          break
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium })
          break
        case 'heavy':
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
    }
  } catch {
    // Silently fail — haptics nunca devem quebrar o app
  }
}

export function useHaptic() {
  return {
    light:     () => triggerHaptic('light'),
    medium:    () => triggerHaptic('medium'),
    heavy:     () => triggerHaptic('heavy'),
    success:   () => triggerHaptic('success'),
    warning:   () => triggerHaptic('warning'),
    error:     () => triggerHaptic('error'),
    selection: () => triggerHaptic('selection'),
    trigger:   triggerHaptic,
  }
}

// Standalone para uso fora de componentes React
export { triggerHaptic }
