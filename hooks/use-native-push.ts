'use client'

import { useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'

interface PushState {
  token: string | null
  isRegistered: boolean
  error: string | null
  loading: boolean
}

type NotificationHandler = (notification: any) => void
type ActionHandler = (action: any) => void

/**
 * Hook para Push Notifications nativas via Capacitor (FCM)
 * No browser, retorna estado vazio (usa Web Push separadamente)
 */
export function useNativePush(options?: {
  onNotification?: NotificationHandler
  onAction?: ActionHandler
}) {
  const [state, setState] = useState<PushState>({
    token: null,
    isRegistered: false,
    error: null,
    loading: false,
  })

  const isNative = Capacitor.isNativePlatform()

  // Registrar para push notifications
  const register = useCallback(async () => {
    if (!isNative) {
      console.log('[Push] Nao e plataforma nativa, ignorando registro')
      return null
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Import dinamico so em plataforma nativa
      const { PushNotifications } = await import('@capacitor/push-notifications')

      // Solicitar permissao
      const permission = await PushNotifications.requestPermissions()
      
      if (permission.receive !== 'granted') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Permissao negada para notificacoes',
        }))
        return null
      }

      // Registrar no FCM
      await PushNotifications.register()

      return new Promise<string>((resolve, reject) => {
        // Listener para token
        PushNotifications.addListener('registration', (token: any) => {
          setState({
            token: token.value,
            isRegistered: true,
            error: null,
            loading: false,
          })
          
          // Enviar token para o backend
          sendTokenToBackend(token.value)
          resolve(token.value)
        })

        // Listener para erro
        PushNotifications.addListener('registrationError', (error: any) => {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.error || 'Erro ao registrar push',
          }))
          reject(new Error(error.error))
        })
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setState(prev => ({
        ...prev,
        loading: false,
        error: message,
      }))
      return null
    }
  }, [isNative])

  // Enviar token para o backend
  const sendTokenToBackend = async (token: string) => {
    try {
      await fetch('/api/v1/push/fcm-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'android' }),
      })
    } catch (err) {
      console.error('[Push] Erro ao enviar token para backend:', err)
    }
  }

  // Remover registro
  const unregister = useCallback(async () => {
    if (!isNative) return

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')

      // Remover token do backend
      if (state.token) {
        await fetch('/api/v1/push/fcm-register', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: state.token }),
        })
      }

      // Remover listeners
      await PushNotifications.removeAllListeners()

      setState({
        token: null,
        isRegistered: false,
        error: null,
        loading: false,
      })
    } catch (err) {
      console.error('[Push] Erro ao remover registro:', err)
    }
  }, [isNative, state.token])

  // Configurar listeners
  useEffect(() => {
    if (!isNative) return

    let ignore = false

    async function setupListeners() {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')

        // Notificacao recebida com app em foreground
        const notificationListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: any) => {
            if (!ignore) {
              console.log('[Push] Notificacao recebida:', notification)
              options?.onNotification?.(notification)
            }
          }
        )

        // Usuario tocou na notificacao
        const actionListener = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action: any) => {
            if (!ignore) {
              console.log('[Push] Acao executada:', action)
              options?.onAction?.(action)
            }
          }
        )

        return () => {
          notificationListener.remove()
          actionListener.remove()
        }
      } catch (err) {
        console.error('[Push] Erro ao setup listeners:', err)
      }
    }

    setupListeners()

    return () => {
      ignore = true
    }
  }, [isNative, options])

  return {
    ...state,
    isNative,
    register,
    unregister,
  }
}
