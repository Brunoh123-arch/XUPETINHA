import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/rides/[id] - Detalhes de uma corrida
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { data: ride, error } = await supabase
      .from('rides')
      .select(`
        *,
        vehicle_categories(id, name, display_name, icon, base_price, price_per_km, price_per_minute),
        passenger:profiles!rides_passenger_id_fkey(id, full_name, avatar_url, phone, rating),
        driver:driver_profiles(
          id,
          rating,
          total_trips,
          is_online,
          user:profiles(full_name, avatar_url, phone)
        ),
        vehicle:vehicles(id, brand, model, color, plate, photo_url)
      `)
      .eq('id', id)
      .single()

    if (error || !ride) {
      return NextResponse.json({ error: 'Corrida nao encontrada' }, { status: 404 })
    }

    // Verifica permissao (passageiro, motorista ou admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isPassenger = ride.passenger_id === user.id
    const isDriver = driverProfile && ride.driver_id === driverProfile.id
    const isAdmin = profile?.is_admin

    if (!isPassenger && !isDriver && !isAdmin) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    return NextResponse.json({ ride })
  } catch (error) {
    console.error('Get ride error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH /api/rides/[id] - Atualiza status da corrida
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { status, cancellation_reason, driver_rating, passenger_rating, driver_comment, passenger_comment } = body

    // Busca a corrida atual
    const { data: currentRide, error: fetchError } = await supabase
      .from('rides')
      .select('*, driver:driver_profiles(user_id)')
      .eq('id', id)
      .single()

    if (fetchError || !currentRide) {
      return NextResponse.json({ error: 'Corrida nao encontrada' }, { status: 404 })
    }

    // Verifica permissao
    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const isPassenger = currentRide.passenger_id === user.id
    const isDriver = driverProfile && currentRide.driver_id === driverProfile.id

    if (!isPassenger && !isDriver) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Prepara updates
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (status) {
      // Valida transicoes de status
      const validTransitions: Record<string, string[]> = {
        pending: ['accepted', 'cancelled'],
        accepted: ['arrived', 'cancelled'],
        arrived: ['in_progress', 'cancelled'],
        in_progress: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
      }

      if (!validTransitions[currentRide.status]?.includes(status)) {
        return NextResponse.json({ 
          error: `Transicao invalida de ${currentRide.status} para ${status}` 
        }, { status: 400 })
      }

      updates.status = status

      // Timestamps baseados no status
      if (status === 'accepted') updates.accepted_at = new Date().toISOString()
      if (status === 'arrived') updates.arrived_at = new Date().toISOString()
      if (status === 'in_progress') updates.started_at = new Date().toISOString()
      if (status === 'completed') updates.completed_at = new Date().toISOString()
      if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString()
        updates.cancelled_by = isDriver ? 'driver' : 'passenger'
        if (cancellation_reason) updates.cancellation_reason = cancellation_reason
      }
    }

    // Ratings
    if (driver_rating !== undefined && isPassenger) {
      updates.driver_rating = driver_rating
      if (driver_comment) updates.driver_comment = driver_comment
    }
    if (passenger_rating !== undefined && isDriver) {
      updates.passenger_rating = passenger_rating
      if (passenger_comment) updates.passenger_comment = passenger_comment
    }

    const { data: ride, error } = await supabase
      .from('rides')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ride:', error)
      return NextResponse.json({ error: 'Erro ao atualizar corrida' }, { status: 500 })
    }

    // Notifica a outra parte
    const notifyUserId = isDriver 
      ? currentRide.passenger_id 
      : (currentRide.driver as any)?.user_id

    if (notifyUserId && status) {
      const statusMessages: Record<string, string> = {
        accepted: 'Motorista aceitou sua corrida',
        arrived: 'Motorista chegou no local',
        in_progress: 'Corrida iniciada',
        completed: 'Corrida finalizada',
        cancelled: 'Corrida cancelada',
      }

      await supabase.from('notifications').insert({
        user_id: notifyUserId,
        type: `ride_${status}`,
        title: statusMessages[status] || 'Atualizacao da corrida',
        body: statusMessages[status],
        data: { ride_id: id },
      })
    }

    return NextResponse.json({ ride })
  } catch (error) {
    console.error('Update ride error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
