'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  cpf: string | null
  birth_date: string | null
  bio: string | null
  user_type: string
  current_mode: string
  rating: number
  total_rides: number
  total_saved: number
  referral_code: string | null
  is_admin: boolean
  status: string
  wallet?: {
    balance: number
    bonus_balance: number
  } | null
  loyalty?: {
    points: number
    tier: string
  } | null
  driver_profile?: {
    id: string
    is_verified: boolean
    is_online: boolean
    is_available: boolean
    rating: number
    total_trips: number
  } | null
}

const fetcher = async (): Promise<Profile | null> => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      wallet:wallet(balance, bonus_balance),
      loyalty:loyalty_points(points, tier),
      driver_profile:driver_profiles(
        id, is_verified, is_online, is_available, rating, total_trips
      )
    `)
    .eq('id', user.id)
    .single()

  return profile as Profile | null
}

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<Profile | null>(
    'user-profile',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 segundos
    }
  )

  return {
    profile: data,
    isLoading,
    isError: error,
    mutate,
    isDriver: !!data?.driver_profile?.is_verified,
    isAdmin: !!data?.is_admin,
    isOnline: !!data?.driver_profile?.is_online,
  }
}
