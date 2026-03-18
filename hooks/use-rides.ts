'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

interface Ride {
  id: string
  status: string
  pickup_address: string
  pickup_latitude: number
  pickup_longitude: number
  dropoff_address: string
  dropoff_latitude: number
  dropoff_longitude: number
  estimated_price: number | null
  final_price: number | null
  estimated_distance: number | null
  estimated_duration: number | null
  payment_method: string
  driver_rating: number | null
  created_at: string
  accepted_at: string | null
  completed_at: string | null
  vehicle_categories?: {
    name: string
    display_name: string
    icon: string
  } | null
  driver?: {
    id: string
    rating: number
    current_latitude: number | null
    current_longitude: number | null
    user?: {
      full_name: string
      avatar_url: string | null
      phone: string | null
    }
  } | null
  vehicle?: {
    brand: string
    model: string
    color: string
    plate: string
    photo_url: string | null
  } | null
}

const fetchRides = async (status?: string): Promise<Ride[]> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  let query = supabase
    .from('rides')
    .select(`
      *,
      vehicle_categories(name, display_name, icon),
      driver:driver_profiles(
        id, rating, current_latitude, current_longitude,
        user:profiles(full_name, avatar_url, phone)
      ),
      vehicle:vehicles(brand, model, color, plate, photo_url)
    `)
    .eq('passenger_id', user.id)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data } = await query.limit(50)
  return (data as Ride[]) || []
}

const fetchActiveRide = async (): Promise<Ride | null> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('rides')
    .select(`
      *,
      vehicle_categories(name, display_name, icon),
      driver:driver_profiles(
        id, rating, current_latitude, current_longitude,
        user:profiles(full_name, avatar_url, phone)
      ),
      vehicle:vehicles(brand, model, color, plate, photo_url)
    `)
    .eq('passenger_id', user.id)
    .in('status', ['pending', 'accepted', 'arrived', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data as Ride | null
}

export function useRides(status?: string) {
  const { data, error, isLoading, mutate } = useSWR<Ride[]>(
    ['user-rides', status],
    () => fetchRides(status),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  return {
    rides: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useActiveRide() {
  const { data, error, isLoading, mutate } = useSWR<Ride | null>(
    'active-ride',
    fetchActiveRide,
    {
      refreshInterval: 5000, // Atualiza a cada 5 segundos quando tem corrida ativa
      revalidateOnFocus: true,
    }
  )

  // Realtime subscription para atualizacoes
  useEffect(() => {
    if (!data?.id) return

    const supabase = createClient()
    const channel = supabase
      .channel(`ride-${data.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rides',
          filter: `id=eq.${data.id}`,
        },
        () => {
          mutate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [data?.id, mutate])

  return {
    ride: data,
    isLoading,
    isError: error,
    mutate,
    hasActiveRide: !!data,
  }
}
