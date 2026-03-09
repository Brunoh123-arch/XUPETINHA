import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { ride_id, seats } = body

    if (!ride_id) {
      return NextResponse.json({ error: 'ride_id obrigatorio' }, { status: 400 })
    }

    const numSeats = seats || 1

    // Buscar viagem
    const { data: ride, error: rideError } = await supabase
      .from('intercity_rides')
      .select('*')
      .eq('id', ride_id)
      .single()

    if (rideError || !ride) {
      return NextResponse.json({ error: 'Viagem nao encontrada' }, { status: 404 })
    }

    if (ride.status !== 'open') {
      return NextResponse.json({ error: 'Viagem nao disponivel' }, { status: 400 })
    }

    const seatsAvailable = ride.available_seats - ride.booked_seats
    if (numSeats > seatsAvailable) {
      return NextResponse.json({ error: `Apenas ${seatsAvailable} assento(s) disponivel(is)` }, { status: 400 })
    }

    // Criar reserva
    const totalPrice = numSeats * Number(ride.price_per_seat)

    const { data: booking, error } = await supabase
      .from('intercity_bookings')
      .insert({
        intercity_ride_id: ride_id,
        passenger_id: user.id,
        seats: numSeats,
        total_price: totalPrice,
        status: 'confirmed',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Voce ja reservou esta viagem' }, { status: 400 })
      }
      throw error
    }

    // Atualizar contagem de assentos
    const newBooked = ride.booked_seats + numSeats
    const newStatus = newBooked >= ride.available_seats ? 'full' : 'open'

    await supabase
      .from('intercity_rides')
      .update({ booked_seats: newBooked, status: newStatus })
      .eq('id', ride_id)

    return NextResponse.json({ success: true, booking, total_price: totalPrice })
  } catch {
    return NextResponse.json({ error: 'Erro ao reservar' }, { status: 500 })
  }
}
