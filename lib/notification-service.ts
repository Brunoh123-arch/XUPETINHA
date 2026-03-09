import { createClient } from '@/lib/supabase/client'

export interface CouponNotificationData {
  type: 'coupon' | 'cashback' | 'freeride' | 'discount'
  title: string
  description: string
  icon?: string
  couponId?: string
  amount?: number
}

export class NotificationService {
  private static instance: NotificationService
  private listeners: Array<(notification: CouponNotificationData) => void> = []

  private constructor() {
    this.setupRealtimeSubscription()
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  private async setupRealtimeSubscription() {
    const supabase = createClient()

    // Subscribe to notifications table
    supabase
      .channel('coupon-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: "type=in.(coupon_received,cashback_earned,free_ride)",
        },
        (payload) => {
          // New coupon notification received
          this.handleNewNotification(payload.new as any)
        }
      )
      .subscribe()
  }

  private handleNewNotification(notification: any) {
    let notificationData: CouponNotificationData

    switch (notification.type) {
      case 'coupon_received':
        notificationData = {
          type: 'coupon',
          title: notification.data?.title || 'Cupom de desconto',
          description: notification.data?.description || 'Válido em todas as corridas',
          icon: '🎟️',
          couponId: notification.data?.coupon_id,
        }
        break

      case 'cashback_earned':
        notificationData = {
          type: 'cashback',
          title: `R$ ${notification.data?.amount || 0} de volta`,
          description: 'Cashback creditado na sua carteira',
          icon: '💰',
          amount: notification.data?.amount,
        }
        break

      case 'free_ride':
        notificationData = {
          type: 'freeride',
          title: 'Corrida grátis',
          description: notification.data?.description || 'Use em sua próxima viagem',
          icon: '🚗',
        }
        break

      default:
        notificationData = {
          type: 'discount',
          title: notification.title || 'Você ganhou um presente!',
          description: notification.message || 'Confira os detalhes',
          icon: '🎁',
        }
    }

    // Notify all listeners
    this.listeners.forEach((listener) => listener(notificationData))
  }

  subscribe(callback: (notification: CouponNotificationData) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  // Manual trigger for testing
  async triggerTestNotification(userName: string = 'Usuário') {
    const testNotifications = [
      {
        type: 'coupon' as const,
        title: 'Entrega grátis',
        description: 'Em todas as corridas',
        icon: '🚗',
      },
      {
        type: 'cashback' as const,
        title: 'R$ 10 de volta',
        description: 'Cashback na sua carteira',
        icon: '💰',
        amount: 10,
      },
      {
        type: 'freeride' as const,
        title: 'Corrida grátis',
        description: 'Válido até R$ 20',
        icon: '🎁',
      },
      {
        type: 'discount' as const,
        title: '50% OFF',
        description: 'Na sua próxima corrida',
        icon: '🎉',
      },
    ]

    const randomNotification =
      testNotifications[Math.floor(Math.random() * testNotifications.length)]

    this.listeners.forEach((listener) => listener(randomNotification))
  }
}

export const notificationService = NotificationService.getInstance()
