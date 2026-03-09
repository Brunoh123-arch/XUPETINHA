import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const dest = searchParams.get('dest')
    const myRides = searchParams.get('my_rides') === 'true'

    let query = supabase
      .from('intercity_rides')
      .select(`
        *,
        driver:profiles!intercity_rides_driver_id_fkey(id, full_name, avatar_url, rating),
        bookings:intercity_bookings(id, passenger_id, seats, status)
      `)
      .order('departure_time', { ascending: true })

    if (myRides) {
      query = query.or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
    } else {
      query = query.in('status', ['open'])
      query = query.gte('departure_time', new Date().toISOString())
      if (origin) query = query.ilike('origin_city', `%${origin}%`)
      if (dest) query = query.ilike('dest_city', `%${dest}%`)
    }

    const { data: rides, error } = await query.limit(50)
    if (error) throw error

    return NextResponse.json({ rides: rides || [] })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      origin_city, origin_state, origin_address,
      dest_city, dest_state, dest_address,
      departure_time, available_seats, price_per_seat,
      vehicle_type, allow_pets, allow_luggage, notes,
    } = body

    if (!origin_city || !dest_city || !departure_time || !price_per_seat) {
      return NextResponse.json({ error: 'Campos obrigatorios faltando' }, { status: 400 })
    }

    if (new Date(departure_time) <= new Date()) {
      return NextResponse.json({ error: 'Data deve ser futura' }, { status: 400 })
    }

    const { data: ride, error } = await supabase
      .from('intercity_rides')
      .insert({
        driver_id: user.id,
        passenger_id: user.id,
        origin_city, origin_state, origin_address,
        dest_city, dest_state, dest_address,
        departure_time,
        available_seats: available_seats || 3,
        price_per_seat: Number(price_per_seat),
        vehicle_type: vehicle_type || 'economy',
        allow_pets: allow_pets || false,
        allow_luggage: allow_luggage !== false,
        notes,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, ride })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar viagem' }, { status: 500 })
  }
}
