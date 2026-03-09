'use client'

import { useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { PushNotifications, type Token, type ActionPerformed, type PushNotificationSchema } from '@capacitor/push-notifications'

interface PushState {
  token: string | null
  isRegistered: boolean
  error: string | null
  loading: boolean
}

type NotificationHandler = (notification: PushNotificationSchema) => void
type ActionHandler = (action: ActionPerformed) => void

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
        PushNotifications.addListener('registration', (token: Token) => {
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
        PushNotifications.addListener('registrationError', (error) => {
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

    // Notificacao recebida com app em foreground
    const notificationListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('[Push] Notificacao recebida:', notification)
        options?.onNotification?.(notification)
      }
    )

    // Usuario tocou na notificacao
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action) => {
        console.log('[Push] Acao executada:', action)
        options?.onAction?.(action)
      }
    )

    return () => {
      notificationListener.then(l => l.remove())
      actionListener.then(l => l.remove())
    }
  }, [isNative, options])

  return {
    ...state,
    isNative,
    register,
    unregister,
  }
}
