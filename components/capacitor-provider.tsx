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
      {/* Componente separado para push notifications */}
      {isNative && <NativePushInitializer setPushToken={setPushToken} onAction={(action) => {
        const data = action.notification.data
        if (data?.route) {
          router.push(data.route)
        } else if (data?.ride_id) {
          router.push(`/uppi/ride/${data.ride_id}/tracking`)
        }
      }} />}
      {children}
    </CapacitorContext.Provider>
  )
}

/**
 * Componente separado que inicializa push notifications
 * Roda APENAS em Android
 */
function NativePushInitializer({ 
  setPushToken,
  onAction 
}: { 
  setPushToken: (token: string) => void
  onAction: (action: any) => void
}) {
  useEffect(() => {
    let ignore = false

    async function registerPush() {
      try {
        const { useNativePush } = await import('@/hooks/use-native-push')
        // Nota: Nao pode usar hook dentro de funcao async
        // Criar uma versao standalone
        const { Capacitor } = await import('@capacitor/core')
        
        if (!Capacitor.isNativePlatform()) {
          console.log('[Push] Web platform — skip')
          return
        }

        const { PushNotifications } = await import('@capacitor/push-notifications')

        // Solicitar permissao
        const perm = await PushNotifications.requestPermissions()
        if (perm.receive !== 'granted') {
          console.log('[Push] Permissao negada')
          return
        }

        // Registrar
        await PushNotifications.register()

        // Listener para token
        await PushNotifications.addListener('registration', (token: any) => {
          if (!ignore) {
            setPushToken(token.value)
            console.log('[Push] Token recebido:', token.value)

            // Enviar para backend
            fetch('/api/v1/push/fcm-register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token.value, platform: 'android' }),
            }).catch(err => console.error('[Push] Erro ao enviar token:', err))
          }
        })

        // Listener para notificacoes recebidas
        await PushNotifications.addListener('pushNotificationReceived', (notif: any) => {
          if (!ignore) {
            console.log('[Push] Notificacao recebida:', notif)
          }
        })

        // Listener para acoes
        await PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
          if (!ignore) {
            console.log('[Push] Acao:', action)
            onAction(action)
          }
        })

        console.log('[Push] Registrado com sucesso')
      } catch (err) {
        console.error('[Push] Erro ao registrar:', err)
      }
    }

    registerPush()

    return () => {
      ignore = true
    }
  }, [setPushToken, onAction])

  return null
}
