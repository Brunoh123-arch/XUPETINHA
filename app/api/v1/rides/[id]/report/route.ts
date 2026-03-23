import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendRideReportEmail } from '@/lib/email'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verificar admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    // Colunas reais: estimated_distance, estimated_duration, driver_profiles!driver_profiles_user_id_fkey
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select(`
        id, pickup_address, dropoff_address, estimated_distance,
        estimated_duration, final_price, payment_method,
        started_at, completed_at, passenger_id, driver_id, status,
        passenger:profiles!passenger_id(full_name, email),
        driver:profiles!driver_id(full_name)
      `)
      .eq('id', params.id)
      .single()

    if (rideError || !ride) {
      return NextResponse.json({ error: 'Corrida nao encontrada' }, { status: 404 })
    }

    const passenger = ride.passenger as any
    const driver = ride.driver as any

    if (!passenger?.email) {
      return NextResponse.json({ error: 'Passageiro sem email cadastrado' }, { status: 400 })
    }

    // Calcular duracao — coluna real: estimated_duration
    let durationMinutes = ride.estimated_duration || 0
    if (ride.started_at && ride.completed_at) {
      durationMinutes = Math.round(
        (new Date(ride.completed_at).getTime() - new Date(ride.started_at).getTime()) / 60000
      )
    }

    const sent = await sendRideReportEmail({
      rideId: ride.id,
      passengerName: passenger.full_name || 'Passageiro',
      passengerEmail: passenger.email,
      driverName: driver?.full_name || 'Motorista',
      vehicleBrand: 'Veiculo',
      vehicleModel: '',
      vehiclePlate: '—',
      vehicleColor: '',
      pickupAddress: ride.pickup_address,
      dropoffAddress: ride.dropoff_address,
      distanceKm: ride.estimated_distance || 0,
      durationMinutes,
      finalPrice: ride.final_price || 0,
      paymentMethod: ride.payment_method || 'pix',
      startedAt: ride.started_at || ride.completed_at || new Date().toISOString(),
      completedAt: ride.completed_at || new Date().toISOString(),
    })

    if (!sent) {
      return NextResponse.json({ error: 'Falha ao enviar email. Verifique a RESEND_API_KEY.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, sentTo: passenger.email })

  } catch (error) {
    console.error('ride report error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
