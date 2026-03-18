import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { offerLimiter, apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

export async function POST(request: Request) {
  try {
    const rlResult = offerLimiter.check(request, 5)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ride_id, offered_price, estimated_arrival_minutes, message } = body

    if (!ride_id || !offered_price) {
      return NextResponse.json({ error: 'ride_id e offered_price são obrigatórios' }, { status: 400 })
    }

    // Verificar se o usuário é motorista ativo — FK é user_id, não id
    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('id, is_verified, is_available')
      .eq('user_id', user.id)
      .single()

    if (!driver) {
      return NextResponse.json({ error: 'Motorista não encontrado' }, { status: 403 })
    }

    if (!driver.is_verified) {
      return NextResponse.json({ error: 'Apenas motoristas verificados podem fazer ofertas' }, { status: 403 })
    }

    // Verificar se a corrida está em estado de negociação
    const { data: ride } = await supabase
      .from('rides')
      .select('id, status, passenger_id')
      .eq('id', ride_id)
      .single()

    if (!ride) {
      return NextResponse.json({ error: 'Corrida não encontrada' }, { status: 404 })
    }

    if (!['pending', 'negotiating'].includes(ride.status)) {
      return NextResponse.json({ error: 'Corrida não está disponível para ofertas' }, { status: 409 })
    }

    // Verificar se motorista já fez oferta — tabela real: ride_offers
    const { data: existingOffer } = await supabase
      .from('ride_offers')
      .select('id')
      .eq('ride_id', ride_id)
      .eq('driver_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingOffer) {
      return NextResponse.json({ error: 'Você já fez uma oferta para esta corrida' }, { status: 409 })
    }

    // Criar oferta na tabela real: ride_offers
    const { data: offer, error } = await supabase
      .from('ride_offers')
      .insert({
        ride_id,
        driver_id: user.id,
        offered_price: Number(offered_price),
        eta_minutes: estimated_arrival_minutes || 5,
        notes: message || null,
        status: 'pending',
      })
      .select(`
        *,
        driver:profiles!driver_id(id, full_name, avatar_url, phone),
        driver_profile:driver_profiles!driver_profiles_user_id_fkey(rating, total_trips, is_verified)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Atualizar status da corrida para negociando
    await supabase
      .from('rides')
      .update({ status: 'negotiating' })
      .eq('id', ride_id)
      .eq('status', 'pending')

    // Notificar passageiro — campo real é "body"
    try {
      await supabase.from('notifications').insert({
        user_id: ride.passenger_id,
        type: 'offer',
        title: 'Nova oferta recebida',
        body: `Nova oferta de R$ ${Number(offered_price).toFixed(2)} para sua corrida`,
        data: { ride_id, offer_id: offer.id },
        is_read: false,
      })
    } catch (_) {}

    return NextResponse.json({ success: true, offer })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 30)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ride_id = searchParams.get('ride_id')

    if (!ride_id) {
      return NextResponse.json({ error: 'ride_id é obrigatório' }, { status: 400 })
    }

    // GET — tabela real: ride_offers
    const { data: offers, error } = await supabase
      .from('ride_offers')
      .select(`
        *,
        driver:profiles!driver_id(id, full_name, avatar_url, phone),
        driver_profile:driver_profiles!driver_profiles_user_id_fkey(rating, total_trips, is_verified)
      `)
      .eq('ride_id', ride_id)
      .in('status', ['pending', 'accepted'])
      .order('offered_price', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      offers: offers || [],
      count: offers?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
