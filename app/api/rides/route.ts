import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/rides - Lista corridas do usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role') || 'passenger'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('rides')
      .select(`
        *,
        vehicle_categories(name, display_name, icon),
        driver:driver_profiles(
          id,
          rating,
          total_trips,
          user:profiles(full_name, avatar_url, phone)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role === 'driver') {
      // Busca driver_profile do usuario
      const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (driverProfile) {
        query = query.eq('driver_id', driverProfile.id)
      } else {
        return NextResponse.json({ rides: [], total: 0 })
      }
    } else {
      query = query.eq('passenger_id', user.id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: rides, error, count } = await query

    if (error) {
      console.error('Error fetching rides:', error)
      return NextResponse.json({ error: 'Erro ao buscar corridas' }, { status: 500 })
    }

    return NextResponse.json({ rides: rides || [], total: count || 0 })
  } catch (error) {
    console.error('Rides API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/rides - Cria nova corrida
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      dropoff_address,
      dropoff_latitude,
      dropoff_longitude,
      category_id,
      estimated_distance,
      estimated_duration,
      estimated_price,
      payment_method,
      notes,
      scheduled_for,
    } = body

    // Validacao basica
    if (!pickup_address || !dropoff_address || !pickup_latitude || !dropoff_latitude) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const { data: ride, error } = await supabase
      .from('rides')
      .insert({
        passenger_id: user.id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        dropoff_address,
        dropoff_latitude,
        dropoff_longitude,
        category_id,
        estimated_distance,
        estimated_duration,
        estimated_price,
        payment_method: payment_method || 'cash',
        notes,
        scheduled_for,
        is_scheduled: !!scheduled_for,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ride:', error)
      return NextResponse.json({ error: 'Erro ao criar corrida' }, { status: 500 })
    }

    // Busca motoristas proximos e notifica
    const { data: nearbyDrivers } = await supabase
      .from('driver_profiles')
      .select('id, user_id')
      .eq('is_online', true)
      .eq('is_available', true)
      .eq('is_verified', true)
      .limit(50)

    if (nearbyDrivers && nearbyDrivers.length > 0) {
      const notifications = nearbyDrivers.map((driver) => ({
        user_id: driver.user_id,
        type: 'new_ride',
        title: 'Nova corrida disponivel',
        body: `De ${pickup_address} para ${dropoff_address}`,
        data: { ride_id: ride.id },
      }))

      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({ ride }, { status: 201 })
  } catch (error) {
    console.error('Create ride error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
