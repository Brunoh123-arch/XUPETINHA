import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role') || 'user' // user ou driver

    let query = supabase
      .from('delivery_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (role === 'driver') {
      query = query.eq('driver_id', user.id)
    } else {
      query = query.eq('user_id', user.id)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query.limit(50)
    if (error) throw error

    return NextResponse.json({ orders: orders || [] })
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
      pickup_address, pickup_lat, pickup_lng,
      dropoff_address, dropoff_lat, dropoff_lng,
      recipient_name, recipient_phone,
      package_description, package_size, package_weight_kg,
      is_fragile, requires_signature, notes,
    } = body

    if (!pickup_address || !dropoff_address) {
      return NextResponse.json({ error: 'Enderecos obrigatorios' }, { status: 400 })
    }

    // Calcular preço estimado baseado na distância
    const distKm = pickup_lat && dropoff_lat
      ? Math.sqrt(Math.pow((dropoff_lat - pickup_lat) * 111, 2) + Math.pow((dropoff_lng - pickup_lng) * 111 * Math.cos(pickup_lat * Math.PI / 180), 2))
      : 5

    const sizeMultiplier: Record<string, number> = { small: 1, medium: 1.5, large: 2, extra_large: 3 }
    const basePrice = 8 + distKm * 2.5
    const estimatedPrice = Math.round(basePrice * (sizeMultiplier[package_size || 'small'] || 1) * 100) / 100

    const { data: order, error } = await supabase
      .from('delivery_orders')
      .insert({
        user_id: user.id,
        pickup_address, pickup_lat, pickup_lng,
        dropoff_address, dropoff_lat, dropoff_lng,
        recipient_name, recipient_phone,
        package_description, package_size: package_size || 'small',
        package_weight_kg, is_fragile: is_fragile || false,
        requires_signature: requires_signature || false,
        estimated_price: estimatedPrice,
        notes,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, order })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { order_id, status, photo_on_delivery_url } = body

    if (!order_id) {
      return NextResponse.json({ error: 'order_id obrigatorio' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (status) {
      updateData.status = status
      if (status === 'delivered') updateData.delivered_at = new Date().toISOString()
      if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString()
    }
    if (photo_on_delivery_url) updateData.photo_on_delivery_url = photo_on_delivery_url

    const { data, error } = await supabase
      .from('delivery_orders')
      .update(updateData)
      .eq('id', order_id)
      .or(`user_id.eq.${user.id},driver_id.eq.${user.id}`)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, order: data })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }
}
