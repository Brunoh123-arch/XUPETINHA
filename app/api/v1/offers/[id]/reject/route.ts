import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// POST /api/v1/offers/[id]/reject
// Passageiro ou motorista rejeita uma oferta de preço
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: offerId } = await params
    const supabase = await createClient()

    const { data: offer, error: offerError } = await supabase
      .from('price_offers')
      .select('id, ride_id, passenger_id, driver_id, status, offered_by')
      .eq('id', offerId)
      .single()

    if (offerError || !offer) {
      return errorResponse('Oferta não encontrada', 404)
    }

    if (offer.passenger_id !== user.id && offer.driver_id !== user.id) {
      return errorResponse('Sem permissão para rejeitar esta oferta', 403)
    }

    if (offer.status !== 'pending') {
      return errorResponse(`Não é possível rejeitar uma oferta com status "${offer.status}"`, 400)
    }

    const { error: updateError } = await supabase
      .from('price_offers')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', offerId)

    if (updateError) {
      return errorResponse('Erro ao rejeitar oferta', 500)
    }

    return successResponse({ offer_id: offerId, status: 'rejected' }, 'Oferta rejeitada')
  } catch (error) {
    return handleApiError(error)
  }
}
