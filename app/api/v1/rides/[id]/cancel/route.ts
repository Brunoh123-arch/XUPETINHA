import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()

    // Buscar a corrida
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', id)
      .single()

    if (rideError || !ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }

    // Verificar se o usuário pode cancelar
    if (ride.passenger_id !== user.id && ride.driver_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verificar se a corrida pode ser cancelada
    if (!['pending', 'negotiating', 'accepted', 'driver_arrived'].includes(ride.status)) {
      return NextResponse.json(
        { error: 'Corrida não pode ser cancelada neste status' },
        { status: 400 }
      )
    }

    // Calcular taxa de cancelamento se aplicável
    let cancellationFee = 0
    if (ride.status === 'accepted' || ride.status === 'driver_arrived') {
      cancellationFee = ride.final_price ? ride.final_price * 0.1 : 0 // 10% do valor
    }

    // Atualizar status via API de status (garante notificações + email)
    const statusRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/rides/${id}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '' },
        body: JSON.stringify({ status: 'cancelled', cancellation_reason: reason || 'Cancelado pelo usuário' }),
      }
    )

    if (!statusRes.ok) {
      // Fallback: atualizar diretamente se a chamada interna falhar
      const { data: updatedRide, error: updateError } = await supabase
        .from('rides')
        .update({
          status: 'cancelled',
          cancelled_by: user.id,
          cancellation_reason: reason || 'Cancelado pelo usuário',
          cancellation_fee: cancellationFee,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      const otherUserId = ride.passenger_id === user.id ? ride.driver_id : ride.passenger_id
      if (otherUserId) {
        await supabase.from('notifications').insert({
          user_id: otherUserId,
          type: 'ride',
          title: 'Corrida cancelada',
          message: `A corrida foi cancelada. Motivo: ${reason || 'Cancelado pelo usuário'}`,
          ride_id: id,
          read: false,
        })
      }

      return NextResponse.json({ ride: updatedRide, cancellationFee })
    }

    const { ride: updatedRide } = await statusRes.json()
    return NextResponse.json({ ride: updatedRide, cancellationFee })
  } catch (error) {
    console.error('[v0] Error cancelling ride:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
