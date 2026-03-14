'use client'

import { useCallback } from 'react'
import { Capacitor } from '@capacitor/core'

/**
 * Hook de notificações locais 100% nativo via @capacitor/local-notifications.
 *
 * Casos de uso no Uppi:
 *   - Lembrete 15min antes de corrida agendada
 *   - Lembrete de embarque (motorista chegou)
 *   - Notificação de corrida concluída quando app está em background
 *
 * Não faz nada em ambiente web (Next.js preview) — silencioso e seguro.
 */
export function useLocalNotifications() {
  /**
   * Solicita permissão para notificações locais.
   * Deve ser chamado uma vez, na primeira abertura do app.
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const result = await LocalNotifications.requestPermissions()
      return result.display === 'granted'
    } catch {
      return false
    }
  }, [])

  /**
   * Agenda um lembrete para corrida agendada.
   * Dispara 15 minutos antes do horário marcado.
   *
   * @param rideId   UUID da corrida
   * @param at       Data/hora da corrida
   * @param origin   Endereço de origem (para exibir no corpo)
   */
  const scheduleRideReminder = useCallback(async (
    rideId: string,
    at: Date,
    origin: string,
  ): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')

      // 15 minutos antes
      const reminderAt = new Date(at.getTime() - 15 * 60 * 1000)
      if (reminderAt <= new Date()) return // Já passou

      await LocalNotifications.schedule({
        notifications: [
          {
            id: hashId(rideId, 'reminder'),
            title: 'Sua corrida começa em 15 minutos',
            body: `Embarque em: ${origin}`,
            schedule: { at: reminderAt },
            sound: 'default',
            extra: { rideId, type: 'ride_reminder' },
            channelId: 'ride-reminders',
          },
        ],
      })
    } catch (err) {
      console.error('[LocalNotifications] scheduleRideReminder:', err)
    }
  }, [])

  /**
   * Notifica o passageiro que o motorista chegou.
   * Dispara imediatamente (sem agendamento futuro).
   *
   * @param rideId     UUID da corrida
   * @param driverName Nome do motorista
   * @param plate      Placa do veículo
   */
  const notifyDriverArrived = useCallback(async (
    rideId: string,
    driverName: string,
    plate: string,
  ): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')

      await LocalNotifications.schedule({
        notifications: [
          {
            id: hashId(rideId, 'arrived'),
            title: 'Motorista chegou!',
            body: `${driverName} — ${plate} — esta esperando voce`,
            schedule: { at: new Date(Date.now() + 100) }, // disparo imediato
            sound: 'default',
            extra: { rideId, type: 'driver_arrived' },
            channelId: 'ride-active',
          },
        ],
      })
    } catch (err) {
      console.error('[LocalNotifications] notifyDriverArrived:', err)
    }
  }, [])

  /**
   * Cancela todas as notificações agendadas de uma corrida.
   * Deve ser chamado ao cancelar ou concluir a corrida.
   */
  const cancelRideNotifications = useCallback(async (rideId: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')

      await LocalNotifications.cancel({
        notifications: [
          { id: hashId(rideId, 'reminder') },
          { id: hashId(rideId, 'arrived') },
        ],
      })
    } catch (err) {
      console.error('[LocalNotifications] cancelRideNotifications:', err)
    }
  }, [])

  /**
   * Configura os canais de notificação Android (obrigatório para Android 8+).
   * Deve ser chamado uma vez na inicialização do app.
   */
  const createAndroidChannels = useCallback(async (): Promise<void> => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')

      await LocalNotifications.createChannel({
        id: 'ride-reminders',
        name: 'Lembretes de corrida',
        description: 'Avisos antes da corrida agendada',
        importance: 4, // HIGH
        sound: 'default',
        vibration: true,
      })

      await LocalNotifications.createChannel({
        id: 'ride-active',
        name: 'Corrida em andamento',
        description: 'Avisos sobre corridas em andamento',
        importance: 5, // MAX
        sound: 'default',
        vibration: true,
      })
    } catch (err) {
      console.error('[LocalNotifications] createAndroidChannels:', err)
    }
  }, [])

  return {
    requestPermission,
    scheduleRideReminder,
    notifyDriverArrived,
    cancelRideNotifications,
    createAndroidChannels,
  }
}

/**
 * Gera um ID numérico estável a partir de um UUID + sufixo.
 * LocalNotifications exige IDs inteiros.
 */
function hashId(uuid: string, suffix: string): number {
  const str = `${uuid}-${suffix}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Converte para int32
  }
  return Math.abs(hash)
}
