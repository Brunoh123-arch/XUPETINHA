'use client'

import { useEffect, createContext, useContext, useState, type ReactNode } from 'react'
import { initCapacitorApp, isNativePlatform, getPlatform } from '@/lib/capacitor'
import { useRouter } from 'next/navigation'

interface CapacitorContextValue {
  isNative: boolean
  platform: 'ios' | 'android' | 'web'
  pushToken: string | null
  isReady: boolean
}

const CapacitorContext = createContext<CapacitorContextValue>({
  isNative: false,
  platform: 'web',
  pushToken: null,
  isReady: false,
})

export function useCapacitor() {
  return useContext(CapacitorContext)
}

interface CapacitorProviderProps {
  children: ReactNode
}

export function CapacitorProvider({ children }: CapacitorProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [pushToken, setPushToken] = useState<string | null>(null)
  const router = useRouter()
  
  const isNative = isNativePlatform()
  const platform = getPlatform()

  useEffect(() => {
    async function init() {
      // Inicializar Capacitor (splash screen, status bar, etc)
      await initCapacitorApp()

      // Registrar para push notifications — APENAS se for nativo
      if (isNative && platform === 'android') {
        try {
          const { useNativePush } = await import('@/hooks/use-native-push')
          // Nao pode usar hook aqui — e async. Fazer em componente separado
          console.log('[Capacitor] Push setup delegado para componente')
        } catch (err) {
          console.error('[Capacitor] Erro ao carregar push hook:', err)
        }
      }

      setIsReady(true)
    }

    init()
  }, [isNative, platform])

  return (
    <CapacitorContext.Provider
      value={{
        isNative,
        platform,
        pushToken,
        isReady,
      }}
    >
      {children}
    </CapacitorContext.Provider>
  )
}
