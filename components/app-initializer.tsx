'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { initApp } from '@/lib/utils/init-app'

/**
 * AppInitializer — montado uma única vez no layout raiz.
 *
 * Responsabilidades:
 *   1. Inicializa Service Worker e Status Bar via initApp()
 *   2. Registra Push Notifications nativas (FCM no Android, APNs no iOS)
 *   3. Configura listener de tap em notificação para roteamento automático
 *      - ride_id   → /uppi/driver/ride/[id]/active  (motorista)
 *      - ride_id   → /uppi/passenger/ride/[id]       (passageiro)
 *      - type=chat → /uppi/chat/[id]
 */
export function AppInitializer() {
  const router = useRouter()

  useEffect(() => {
    initApp()

    if (!Capacitor.isNativePlatform()) return

    setupPushNotifications(router)

    // Escuta taps de notificação que vêm do use-fcm-push-notifications
    // (evita duplicação de listeners: só este componente faz o roteamento)
    const handleFcmTap = (e: Event) => {
      const action = (e as CustomEvent).detail
      const data = action?.notification?.data ?? {}
      routeFromPushData(data, router)
    }
    window.addEventListener('fcm-notification-tap', handleFcmTap)

    return () => {
      window.removeEventListener('fcm-notification-tap', handleFcmTap)
    }
  }, [])

  return null
}

// ─── Push Notifications ───────────────────────────────────────────────────────

async function setupPushNotifications(router: ReturnType<typeof useRouter>) {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // 1. Solicita permissão
    const permission = await PushNotifications.requestPermissions()
    if (permission.receive !== 'granted') return

    // 2. Registra no FCM / APNs
    await PushNotifications.register()

    // 3. Recebe token e envia para o backend
    await PushNotifications.addListener('registration', async (token) => {
      const platform = Capacitor.getPlatform() // 'ios' | 'android'
      try {
        await fetch('/api/v1/push/fcm-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value, platform }),
        })
      } catch {
        // Silently fail — não crítico para o usuário
      }
    })

    // 4. Erro de registro
    await PushNotifications.addListener('registrationError', () => {
      // Silently fail
    })

    // 5. Notificação recebida com app em FOREGROUND — exibe como in-app toast
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      const { title, body, data } = notification
      // Importa iosToast dinamicamente para evitar ciclo de dependência
      import('@/lib/utils/ios-toast').then(({ iosToast }) => {
        iosToast(`${title ?? ''} ${body ?? ''}`.trim(), 'info')
      }).catch(() => {})

      // Se for notificação de nova corrida disponível, já navega pro accept
      if (data?.type === 'ride_request' && data?.ride_id) {
        router.push(`/uppi/driver/ride/${data.ride_id}/accept`)
      }
    })

    // 6. Usuário TOCOU na notificação (app em background ou fechado)
    await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const data = action.notification.data ?? {}
      routeFromPushData(data, router)
    })
  } catch {
    // Plugin não disponível — silently fail
  }
}

/** Roteia para a tela correta com base nos dados da notificação push */
function routeFromPushData(
  data: Record<string, string>,
  router: ReturnType<typeof useRouter>
) {
  if (!data) return

  const { type, ride_id, chat_id, user_role } = data

  switch (type) {
    case 'ride_request':
      if (ride_id) router.push(`/uppi/driver/ride/${ride_id}/accept`)
      break
    case 'ride_accepted':
    case 'driver_arrived':
    case 'ride_started':
    case 'ride_completed':
      if (ride_id) {
        const base =
          user_role === 'driver'
            ? `/uppi/driver/ride/${ride_id}/active`
            : `/uppi/passenger/ride/${ride_id}`
        router.push(base)
      }
      break
    case 'chat':
      if (chat_id) router.push(`/uppi/chat/${chat_id}`)
      else if (ride_id) router.push(`/uppi/driver/ride/${ride_id}/active`)
      break
    default:
      // Tipo desconhecido — vai para home do motorista
      if (ride_id) router.push(`/uppi/driver/ride/${ride_id}/active`)
      break
  }
}
