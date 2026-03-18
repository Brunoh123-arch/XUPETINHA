'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateRideInput {
  pickup_address: string
  pickup_latitude: number
  pickup_longitude: number
  dropoff_address: string
  dropoff_latitude: number
  dropoff_longitude: number
  category_id?: string
  estimated_distance?: number
  estimated_duration?: number
  estimated_price?: number
  payment_method?: string
  notes?: string
  scheduled_for?: string
}

export async function createRide(input: CreateRideInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { data: ride, error } = await supabase
    .from('rides')
    .insert({
      passenger_id: user.id,
      pickup_address: input.pickup_address,
      pickup_latitude: input.pickup_latitude,
      pickup_longitude: input.pickup_longitude,
      dropoff_address: input.dropoff_address,
      dropoff_latitude: input.dropoff_latitude,
      dropoff_longitude: input.dropoff_longitude,
      category_id: input.category_id,
      estimated_distance: input.estimated_distance,
      estimated_duration: input.estimated_duration,
      estimated_price: input.estimated_price,
      payment_method: input.payment_method || 'cash',
      notes: input.notes,
      scheduled_for: input.scheduled_for,
      is_scheduled: !!input.scheduled_for,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating ride:', error)
    return { error: 'Erro ao criar corrida' }
  }

  revalidatePath('/uppi/rides')
  return { ride }
}

export async function cancelRide(rideId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  // Verifica se e o passageiro da corrida
  const { data: ride } = await supabase
    .from('rides')
    .select('passenger_id, status, driver_id')
    .eq('id', rideId)
    .single()

  if (!ride) {
    return { error: 'Corrida nao encontrada' }
  }

  if (ride.passenger_id !== user.id) {
    return { error: 'Sem permissao' }
  }

  if (!['pending', 'accepted', 'arrived'].includes(ride.status)) {
    return { error: 'Corrida nao pode ser cancelada neste status' }
  }

  const { error } = await supabase
    .from('rides')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: 'passenger',
      cancellation_reason: reason,
    })
    .eq('id', rideId)

  if (error) {
    console.error('Error cancelling ride:', error)
    return { error: 'Erro ao cancelar corrida' }
  }

  // Notifica motorista se houver
  if (ride.driver_id) {
    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('user_id')
      .eq('id', ride.driver_id)
      .single()

    if (driverProfile) {
      await supabase.from('notifications').insert({
        user_id: driverProfile.user_id,
        type: 'ride_cancelled',
        title: 'Corrida cancelada',
        body: 'O passageiro cancelou a corrida',
        data: { ride_id: rideId },
      })

      // Libera motorista
      await supabase
        .from('driver_profiles')
        .update({ is_available: true })
        .eq('id', ride.driver_id)
    }
  }

  revalidatePath('/uppi/rides')
  return { success: true }
}

export async function rateRide(rideId: string, rating: number, comment?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { data: ride } = await supabase
    .from('rides')
    .select('passenger_id, driver_id, status')
    .eq('id', rideId)
    .single()

  if (!ride || ride.status !== 'completed') {
    return { error: 'Corrida nao encontrada ou nao finalizada' }
  }

  const isPassenger = ride.passenger_id === user.id

  if (!isPassenger) {
    return { error: 'Sem permissao para avaliar' }
  }

  // Atualiza corrida com rating
  const { error } = await supabase
    .from('rides')
    .update({
      driver_rating: rating,
      driver_comment: comment,
    })
    .eq('id', rideId)

  if (error) {
    console.error('Error rating ride:', error)
    return { error: 'Erro ao avaliar' }
  }

  // Cria registro de rating
  if (ride.driver_id) {
    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('user_id')
      .eq('id', ride.driver_id)
      .single()

    if (driverProfile) {
      await supabase.from('ratings').insert({
        ride_id: rideId,
        rater_id: user.id,
        rated_id: driverProfile.user_id,
        rating,
        comment,
      })

      // Atualiza media do motorista
      const { data: allRatings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('rated_id', driverProfile.user_id)

      if (allRatings && allRatings.length > 0) {
        const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        await supabase
          .from('driver_profiles')
          .update({ rating: Math.round(avgRating * 10) / 10 })
          .eq('id', ride.driver_id)
      }
    }
  }

  revalidatePath('/uppi/rides')
  return { success: true }
}

export async function getUserRides(status?: string, limit = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { rides: [] }
  }

  let query = supabase
    .from('rides')
    .select(`
      *,
      vehicle_categories(name, display_name, icon),
      driver:driver_profiles(
        id, rating, 
        user:profiles(full_name, avatar_url)
      )
    `)
    .eq('passenger_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: rides, error } = await query

  if (error) {
    console.error('Error fetching rides:', error)
    return { rides: [] }
  }

  return { rides: rides || [] }
}

export async function getActiveRide() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: ride } = await supabase
    .from('rides')
    .select(`
      *,
      vehicle_categories(name, display_name, icon, base_price, price_per_km),
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

  return ride
}
