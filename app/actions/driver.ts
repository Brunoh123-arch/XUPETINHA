'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDriverProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: driverProfile } = await supabase
    .from('driver_profiles')
    .select(`
      *,
      user:profiles(full_name, email, phone, avatar_url),
      vehicles:vehicles(
        id, brand, model, year, color, plate, photo_url,
        is_active, is_primary, is_verified,
        category:vehicle_categories(name, display_name, icon)
      )
    `)
    .eq('user_id', user.id)
    .single()

  return driverProfile
}

export async function toggleOnlineStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { data: driver } = await supabase
    .from('driver_profiles')
    .select('id, is_online, is_verified')
    .eq('user_id', user.id)
    .single()

  if (!driver) {
    return { error: 'Perfil de motorista nao encontrado' }
  }

  if (!driver.is_verified) {
    return { error: 'Motorista nao verificado' }
  }

  const newStatus = !driver.is_online

  const { error } = await supabase
    .from('driver_profiles')
    .update({
      is_online: newStatus,
      is_available: newStatus, // Tambem fica disponivel quando fica online
      updated_at: new Date().toISOString(),
    })
    .eq('id', driver.id)

  if (error) {
    console.error('Error toggling online status:', error)
    return { error: 'Erro ao alterar status' }
  }

  revalidatePath('/uppi/driver')
  return { is_online: newStatus }
}

export async function updateDriverLocation(latitude: number, longitude: number, heading?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { error } = await supabase
    .from('driver_profiles')
    .update({
      current_latitude: latitude,
      current_longitude: longitude,
      current_heading: heading,
      last_location_update: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating location:', error)
    return { error: 'Erro ao atualizar localizacao' }
  }

  return { success: true }
}

export async function acceptRide(rideId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  // Busca driver profile
  const { data: driverProfile } = await supabase
    .from('driver_profiles')
    .select('id, is_verified, is_online, is_available')
    .eq('user_id', user.id)
    .single()

  if (!driverProfile || !driverProfile.is_verified) {
    return { error: 'Motorista nao verificado' }
  }

  if (!driverProfile.is_online || !driverProfile.is_available) {
    return { error: 'Motorista nao esta disponivel' }
  }

  // Busca veiculo ativo
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('driver_id', driverProfile.id)
    .eq('is_active', true)
    .eq('is_primary', true)
    .single()

  // Verifica se corrida esta disponivel
  const { data: ride } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .eq('status', 'pending')
    .is('driver_id', null)
    .single()

  if (!ride) {
    return { error: 'Corrida nao disponivel' }
  }

  // Aceita corrida
  const { data: updatedRide, error } = await supabase
    .from('rides')
    .update({
      driver_id: driverProfile.id,
      vehicle_id: vehicle?.id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', rideId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error || !updatedRide) {
    return { error: 'Corrida ja foi aceita por outro motorista' }
  }

  // Marca como nao disponivel
  await supabase
    .from('driver_profiles')
    .update({ is_available: false })
    .eq('id', driverProfile.id)

  // Cria registro de request
  await supabase.from('ride_requests').insert({
    ride_id: rideId,
    driver_id: driverProfile.id,
    status: 'accepted',
    responded_at: new Date().toISOString(),
  })

  // Notifica passageiro
  await supabase.from('notifications').insert({
    user_id: ride.passenger_id,
    type: 'ride_accepted',
    title: 'Motorista a caminho!',
    body: 'Um motorista aceitou sua corrida',
    data: { ride_id: rideId },
  })

  revalidatePath('/uppi/driver/rides')
  return { ride: updatedRide }
}

export async function updateRideStatus(rideId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { data: driverProfile } = await supabase
    .from('driver_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!driverProfile) {
    return { error: 'Perfil de motorista nao encontrado' }
  }

  // Verifica se e o motorista da corrida
  const { data: ride } = await supabase
    .from('rides')
    .select('driver_id, passenger_id, status')
    .eq('id', rideId)
    .single()

  if (!ride || ride.driver_id !== driverProfile.id) {
    return { error: 'Sem permissao' }
  }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  // Timestamps baseados no status
  if (status === 'arrived') updates.arrived_at = new Date().toISOString()
  if (status === 'in_progress') updates.started_at = new Date().toISOString()
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('rides')
    .update(updates)
    .eq('id', rideId)

  if (error) {
    console.error('Error updating ride status:', error)
    return { error: 'Erro ao atualizar status' }
  }

  // Libera motorista quando completa
  if (status === 'completed') {
    await supabase
      .from('driver_profiles')
      .update({ is_available: true, total_trips: driverProfile.id })
      .eq('id', driverProfile.id)
  }

  // Notifica passageiro
  const statusMessages: Record<string, string> = {
    arrived: 'Motorista chegou no local',
    in_progress: 'Corrida iniciada',
    completed: 'Corrida finalizada',
  }

  if (statusMessages[status]) {
    await supabase.from('notifications').insert({
      user_id: ride.passenger_id,
      type: `ride_${status}`,
      title: statusMessages[status],
      body: statusMessages[status],
      data: { ride_id: rideId },
    })
  }

  revalidatePath('/uppi/driver/rides')
  return { success: true }
}

export async function getAvailableRides() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: rides } = await supabase
    .from('rides')
    .select(`
      *,
      vehicle_categories(name, display_name, icon),
      passenger:profiles!rides_passenger_id_fkey(full_name, avatar_url, rating)
    `)
    .eq('status', 'pending')
    .is('driver_id', null)
    .order('created_at', { ascending: false })
    .limit(20)

  return rides || []
}

export async function getDriverEarnings(period: 'today' | 'week' | 'month' = 'today') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { total: 0, rides: 0 }
  }

  const { data: driverProfile } = await supabase
    .from('driver_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!driverProfile) {
    return { total: 0, rides: 0 }
  }

  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
  }

  const { data: earnings } = await supabase
    .from('driver_earnings')
    .select('net_amount')
    .eq('driver_id', driverProfile.id)
    .gte('created_at', startDate.toISOString())

  const total = earnings?.reduce((sum, e) => sum + (e.net_amount || 0), 0) || 0
  const rides = earnings?.length || 0

  return { total, rides }
}
