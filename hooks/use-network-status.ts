'use client'

import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

type ConnectionType = 'wifi' | 'cellular' | 'none' | 'unknown'

interface NetworkStatus {
  /** true = dispositivo tem acesso à internet */
  isOnline: boolean
  /** Tipo de conexão: wifi, cellular, none, unknown */
  connectionType: ConnectionType
  /** true = conexão lenta (2G / cellular com sinal fraco) */
  isSlowConnection: boolean
}

/**
 * Hook de status de rede 100% nativo via @capacitor/network.
 *
 * No iOS/Android usa o plugin nativo que verifica o estado real da interface
 * de rede (não apenas navigator.onLine que é sempre true no WebView).
 * Em ambiente web faz fallback seguro para navigator.onLine.
 *
 * Uso:
 *   const { isOnline, connectionType, isSlowConnection } = useNetworkStatus()
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    connectionType: 'unknown',
    isSlowConnection: false,
  })

  useEffect(() => {
    let listenerHandle: { remove: () => void } | null = null

    async function init() {
      if (Capacitor.isNativePlatform()) {
        const { Network } = await import('@capacitor/network')

        // Estado inicial
        const current = await Network.getStatus()
        setStatus({
          isOnline: current.connected,
          connectionType: current.connectionType as ConnectionType,
          isSlowConnection: current.connectionType === 'cellular',
        })

        // Listener de mudanças
        listenerHandle = await Network.addListener('networkStatusChange', (s) => {
          setStatus({
            isOnline: s.connected,
            connectionType: s.connectionType as ConnectionType,
            isSlowConnection: s.connectionType === 'cellular',
          })
        })
      } else {
        // Fallback web: usa navigator.onLine + eventos do browser
        const updateFromBrowser = () => {
          setStatus({
            isOnline: navigator.onLine,
            connectionType: navigator.onLine ? 'unknown' : 'none',
            isSlowConnection: false,
          })
        }

        updateFromBrowser()
        window.addEventListener('online', updateFromBrowser)
        window.addEventListener('offline', updateFromBrowser)

        // Retorna cleanup para o bloco web
        return () => {
          window.removeEventListener('online', updateFromBrowser)
          window.removeEventListener('offline', updateFromBrowser)
        }
      }
    }

    const cleanupPromise = init()

    return () => {
      cleanupPromise.then((webCleanup) => {
        webCleanup?.()
        listenerHandle?.remove()
      })
    }
  }, [])

  return status
}
