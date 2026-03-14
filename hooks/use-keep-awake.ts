'use client'

import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'

/**
 * Mantém a tela acesa enquanto o componente estiver montado.
 * Usa @capacitor-community/keep-awake em plataformas nativas e
 * a WakeLock API do navegador como fallback em ambiente web.
 *
 * Uso:
 *   // Sempre ativo
 *   useKeepAwake()
 *
 *   // Só ativo quando corrida estiver em andamento
 *   useKeepAwake(rideStatus === 'in_progress')
 */
export function useKeepAwake(enabled: boolean = true) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function acquireWakeLock() {
      // ── NATIVO ────────────────────────────────────────────────────────
      if (isNative) {
        try {
          const { KeepAwake } = await import('@capacitor-community/keep-awake')
          await KeepAwake.keepAwake()
        } catch (err) {
          console.error('[KeepAwake] Erro ao ativar (nativo):', err)
        }
        return
      }

      // ── WEB (WakeLock API) ─────────────────────────────────────────────
      if (!('wakeLock' in navigator)) return

      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch (err) {
        // Falha silenciosa — ex: página em background ou permissão negada
        if (!cancelled) {
          console.error('[KeepAwake] Erro ao ativar (web):', err)
        }
      }
    }

    acquireWakeLock()

    return () => {
      cancelled = true

      // ── LIBERAR NATIVO ─────────────────────────────────────────────────
      if (isNative) {
        import('@capacitor-community/keep-awake')
          .then(({ KeepAwake }) => KeepAwake.allowSleep())
          .catch(() => {/* ignora erro no cleanup */})
        return
      }

      // ── LIBERAR WEB ────────────────────────────────────────────────────
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {/* ignora */})
        wakeLockRef.current = null
      }
    }
  }, [enabled, isNative])
}
