import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/rides/[id]/accept - Motorista aceita corrida
export async function POST(
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

    // Verifica se e motorista verificado
    const { data: driverProfile, error: driverError } = await supabase
      .from('driver_profiles')
      .select('id, is_verified, is_online, is_available')
      .eq('user_id', user.id)
      .single()

    if (driverError || !driverProfile) {
      return NextResponse.json({ error: 'Perfil de motorista nao encontrado' }, { status: 403 })
    }

    if (!driverProfile.is_verified) {
      return NextResponse.json({ error: 'Motorista nao verificado' }, { status: 403 })
    }

    if (!driverProfile.is_online || !driverProfile.is_available) {
      return NextResponse.json({ error: 'Motorista nao esta disponivel' }, { status: 400 })
    }

    // Busca veiculo ativo do motorista
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('driver_id', driverProfile.id)
      .eq('is_active', true)
      .eq('is_primary', true)
      .single()

    // Verifica se corrida esta disponivel
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .is('driver_id', null)
      .single()

    if (rideError || !ride) {
      return NextResponse.json({ error: 'Corrida nao disponivel' }, { status: 400 })
    }

    // Aceita a corrida (transacao atomica)
    const { data: updatedRide, error: updateError } = await supabase
      .from('rides')
      .update({
        driver_id: driverProfile.id,
        vehicle_id: vehicle?.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'pending') // Double check para evitar race condition
      .select()
      .single()

    if (updateError || !updatedRide) {
      return NextResponse.json({ error: 'Corrida ja foi aceita por outro motorista' }, { status: 409 })
    }

    // Marca motorista como nao disponivel
    await supabase
      .from('driver_profiles')
      .update({ is_available: false })
      .eq('id', driverProfile.id)

    // Cria registro de request aceito
    await supabase
      .from('ride_requests')
      .insert({
        ride_id: id,
        driver_id: driverProfile.id,
        status: 'accepted',
        responded_at: new Date().toISOString(),
      })

    // Notifica passageiro
    await supabase.from('notifications').insert({
      user_id: ride.passenger_id,
      type: 'ride_accepted',
      title: 'Motorista a caminho!',
      body: 'Um motorista aceitou sua corrida e esta indo ate voce',
      data: { ride_id: id, driver_id: driverProfile.id },
    })

    return NextResponse.json({ 
      success: true, 
      ride: updatedRide,
      message: 'Corrida aceita com sucesso' 
    })
  } catch (error) {
    console.error('Accept ride error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
