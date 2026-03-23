import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// POST /api/v1/rides/[id]/tip
// Passageiro envia gorjeta ao motorista após corrida concluída
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: rideId } = await params
    const body = await request.json()
    const { amount, payment_method = 'wallet' } = body

    if (!amount || Number(amount) <= 0) {
      return errorResponse('Valor da gorjeta inválido', 400)
    }

    const supabase = await createClient()

    // Verificar se a corrida existe e pertence ao passageiro
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('id, status, driver_id, passenger_id')
      .eq('id', rideId)
      .eq('passenger_id', user.id)
      .single()

    if (rideError || !ride) {
      return errorResponse('Corrida não encontrada', 404)
    }

    if (ride.status !== 'completed') {
      return errorResponse('Gorjeta só pode ser enviada em corridas concluídas', 400)
    }

    // Verificar se já enviou gorjeta
    const { data: existingTip } = await supabase
      .from('tip_transactions')
      .select('id')
      .eq('ride_id', rideId)
      .eq('passenger_id', user.id)
      .single()

    if (existingTip) {
      return errorResponse('Gorjeta já enviada para esta corrida', 409)
    }

    // tip_transactions não existe — usa driver_earnings para registrar gorjeta
    const { data: tip, error: tipError } = await supabase
      .from('driver_earnings')
      .insert({
        ride_id: rideId,
        driver_id: ride.driver_id,
        gross_amount: Number(amount),
        net_amount: Number(amount),
        tip_amount: Number(amount),
        commission_amount: 0,
        status: 'paid',
      })
      .select()
      .single()

    if (tipError) throw tipError

    // Creditar wallet do motorista via RPC
    await supabase.rpc('update_wallet_balance', {
      p_user_id: ride.driver_id,
      p_amount: Number(amount),
      p_type: 'credit',
    })

    // Notificar motorista — campo real é "body"
    await supabase.from('notifications').insert({
      user_id: ride.driver_id,
      type: 'tip',
      title: 'Gorjeta recebida!',
      body: `Você recebeu uma gorjeta de R$ ${Number(amount).toFixed(2)}`,
      data: { ride_id: rideId },
      is_read: false,
    })

    return successResponse(tip, 'Gorjeta enviada com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}
