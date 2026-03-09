import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'passenger'
    const status = searchParams.get('status')

    let query = supabase
      .from('scheduled_rides')
      .select('*')
      .order('scheduled_at', { ascending: true })

    if (role === 'driver') {
      query = query.eq('driver_id', user.id)
    } else {
      query = query.eq('passenger_id', user.id)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    } else {
      query = query.in('status', ['pending', 'confirmed', 'driver_assigned'])
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
      origin_address, origin_lat, origin_lng,
      dest_address, dest_lat, dest_lng,
      scheduled_at, vehicle_type, notes,
    } = body

    if (!origin_address || !dest_address || !scheduled_at) {
      return NextResponse.json({ error: 'Campos obrigatorios faltando' }, { status: 400 })
    }

    const scheduledDate = new Date(scheduled_at)
    if (scheduledDate <= new Date(Date.now() + 30 * 60 * 1000)) {
      return NextResponse.json({ error: 'Agendamento deve ser com no minimo 30 minutos de antecedencia' }, { status: 400 })
    }

    // Calcular preço estimado
    let estimatedPrice = 15
    if (origin_lat && dest_lat) {
      const distKm = Math.sqrt(
        Math.pow((dest_lat - origin_lat) * 111, 2) +
        Math.pow((dest_lng - origin_lng) * 111 * Math.cos(origin_lat * Math.PI / 180), 2)
      )
      const rates: Record<string, number> = { economy: 2.5, comfort: 3.5, premium: 5, suv: 4.5 }
      estimatedPrice = Math.max(8, Math.round((5 + distKm * (rates[vehicle_type || 'economy'] || 2.5)) * 100) / 100)
    }

    const { data: ride, error } = await supabase
      .from('scheduled_rides')
      .insert({
        passenger_id: user.id,
        origin_address, origin_lat, origin_lng,
        dest_address, dest_lat, dest_lng,
        scheduled_at,
        estimated_price: estimatedPrice,
        vehicle_type: vehicle_type || 'economy',
        notes,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, ride })
  } catch {
    return NextResponse.json({ error: 'Erro ao agendar' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const rideId = searchParams.get('id')

    if (!rideId) {
      return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })
    }

    const { error } = await supabase
      .from('scheduled_rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId)
      .eq('passenger_id', user.id)
      .in('status', ['pending', 'confirmed'])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao cancelar' }, { status: 500 })
  }
}
