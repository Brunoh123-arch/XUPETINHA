'use client'

import { useEffect, createContext, useContext, useState, type ReactNode } from 'react'
import { initCapacitorApp, isNativePlatform, getPlatform } from '@/lib/capacitor'
import { useNativePush } from '@/hooks/use-native-push'
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
  const router = useRouter()
  
  const isNative = isNativePlatform()
  const platform = getPlatform()

  // Push notifications nativas
  const { token: pushToken, register: registerPush } = useNativePush({
    onAction: (action) => {
      // Navegar para a tela correta quando usuario toca na notificacao
      const data = action.notification.data
      if (data?.route) {
        router.push(data.route)
      } else if (data?.ride_id) {
        router.push(`/uppi/ride/${data.ride_id}/tracking`)
      }
    },
  })

  useEffect(() => {
    async function init() {
      // Inicializar Capacitor
      await initCapacitorApp()

      // Registrar para push se for nativo
      if (isNative) {
        await registerPush()
      }

      setIsReady(true)
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
