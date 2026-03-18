import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

/**
 * POST /api/v1/offers/[id]/counter
 * Motorista faz uma contra-oferta em cima de uma oferta existente.
 * Atualiza offered_price na oferta e sincroniza final_price na corrida via Realtime.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rlResult = apiLimiter.check(request, 5)
  if (!rlResult.success) return rateLimitResponse(rlResult)

  try {
    const { id: offerId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { counter_price, message } = body

    if (!counter_price || typeof counter_price !== 'number' || counter_price <= 0) {
      return NextResponse.json({ error: 'counter_price invalido' }, { status: 400 })
    }

    // Buscar oferta — tabela real: ride_offers
    const { data: offer, error: offerError } = await supabase
      .from('ride_offers')
      .select('*, rides(id, passenger_id, status, estimated_price)')
      .eq('id', offerId)
      .single()

    if (offerError || !offer) {
      return NextResponse.json({ error: 'Oferta nao encontrada' }, { status: 404 })
    }

    if (offer.driver_id !== user.id) {
      return NextResponse.json({ error: 'Sem permissao para contra-ofertar' }, { status: 403 })
    }

    const ride = offer.rides as any
    if (!ride || !['negotiating', 'pending'].includes(ride.status)) {
      return NextResponse.json(
        { error: 'Corrida nao esta mais em negociacao' },
        { status: 400 }
      )
    }

    // Atualizar oferta com novo preco
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 3) // 3 min para passageiro responder

    const { data: updatedOffer, error: updateError } = await supabase
      .from('ride_offers')
      .update({
        offered_price: counter_price,
        notes: message || offer.notes,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        counter_count: (offer.counter_count || 0) + 1,
      })
      .eq('id', offerId)
      .select()
      .single()

    if (updateError) throw updateError

    // Atualizar final_price na corrida para refletir a contra-oferta mais recente
    await supabase
      .from('rides')
      .update({ final_price: counter_price })
      .eq('id', ride.id)
      .in('status', ['negotiating', 'pending'])

    // Notificar passageiro da contra-oferta
    if (ride.passenger_id) {
      await supabase.from('notifications').insert({
        user_id: ride.passenger_id,
        type: 'ride',
        title: 'Nova contra-oferta!',
        body: `O motorista ofereceu R$ ${counter_price.toFixed(2)} para sua corrida.`,
        data: {
          ride_id: ride.id,
          offer_id: offerId,
          counter_price,
          type: 'counter_offer',
        },
        is_read: false,
      })
    }

    return NextResponse.json({
      success: true,
      offer: updatedOffer,
      ride_final_price: counter_price,
    })
  } catch (error) {
    console.error('Counter-offer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
