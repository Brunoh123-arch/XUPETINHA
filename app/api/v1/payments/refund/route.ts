import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// POST /api/v1/payments/refund
// Passageiro solicita reembolso de uma corrida/pagamento
export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { ride_id, reason } = body

    if (!ride_id || !reason) {
      return errorResponse('ride_id e reason são obrigatórios', 400)
    }

    const supabase = await createClient()

    // Verificar se a corrida pertence ao usuário
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('id, passenger_id, status, final_price, passenger_price, payment_status')
      .eq('id', ride_id)
      .single()

    if (rideError || !ride) {
      return errorResponse('Corrida não encontrada', 404)
    }

    if (ride.passenger_id !== user.id) {
      return errorResponse('Sem permissão para solicitar reembolso desta corrida', 403)
    }

    if (ride.payment_status !== 'paid') {
      return errorResponse('Reembolso disponível apenas para pagamentos confirmados', 400)
    }

    // Verificar se já existe reembolso para esta corrida
    const { data: existingRefund } = await supabase
      .from('refunds')
      .select('id, status')
      .eq('ride_id', ride_id)
      .single()

    if (existingRefund) {
      return errorResponse(`Já existe uma solicitação de reembolso com status "${existingRefund.status}"`, 409)
    }

    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        user_id: user.id,
        ride_id,
        amount: ride.passenger_price ?? ride.final_price,
        reason,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (refundError) {
      return errorResponse('Erro ao solicitar reembolso', 500)
    }

    return successResponse(refund, 'Solicitação de reembolso criada com sucesso', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
