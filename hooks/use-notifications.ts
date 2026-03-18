'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useCallback } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  data: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  action_url: string | null
  created_at: string
}

const fetchNotifications = async (): Promise<{ notifications: Notification[]; unread_count: number }> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { notifications: [], unread_count: 0 }

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return {
    notifications: (notifications as Notification[]) || [],
    unread_count: unreadCount || 0,
  }
}

export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR(
    'user-notifications',
    fetchNotifications,
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  )

  // Realtime subscription para novas notificacoes
  useEffect(() => {
    const supabase = createClient()
    
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            mutate()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupSubscription()
    return () => {
      cleanup.then(fn => fn?.())
    }
  }, [mutate])

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    const supabase = createClient()
    
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', notificationIds)

    mutate()
  }, [mutate])

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false)

    mutate()
  }, [mutate])

  const deleteNotification = useCallback(async (notificationId: string) => {
    const supabase = createClient()
    
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    mutate()
  }, [mutate])

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unread_count || 0,
    isLoading,
    isError: error,
    mutate,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
