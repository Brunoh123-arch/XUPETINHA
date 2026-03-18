import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// GET /api/v1/rides/[id]/receipt
// Retorna o comprovante/recibo de uma corrida concluída
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: rideId } = await params
    const supabase = await createClient()

    // Colunas reais: pickup_address/dropoff_address, estimated_price, estimated_distance, estimated_duration
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select(`
        id, status, final_price, estimated_price, driver_commission, platform_fee,
        payment_method, payment_status, pickup_address, dropoff_address,
        estimated_distance, estimated_duration, started_at, completed_at, created_at,
        passenger:profiles!passenger_id(id, full_name, avatar_url),
        driver:profiles!driver_id(id, full_name, avatar_url)
      `)
      .eq('id', rideId)
      .single()

    if (rideError || !ride) {
      return errorResponse('Corrida não encontrada', 404)
    }

    // Verificar se o usuário é passageiro ou motorista da corrida
    const { data: fullRide } = await supabase
      .from('rides')
      .select('passenger_id, driver_id')
      .eq('id', rideId)
      .single()

    if (fullRide?.passenger_id !== user.id && fullRide?.driver_id !== user.id) {
      return errorResponse('Sem permissão para acessar este recibo', 403)
    }

    if (ride.status !== 'completed') {
      return errorResponse('Recibo disponível apenas para corridas concluídas', 400)
    }

    // Buscar recibo salvo na tabela ride_receipts
    const { data: receipt } = await supabase
      .from('ride_receipts')
      .select('*')
      .eq('ride_id', rideId)
      .single()

    // Buscar gorjeta via driver_earnings (tip_transactions não existe)
    const { data: tipData } = await supabase
      .from('driver_earnings')
      .select('tip_amount')
      .eq('ride_id', rideId)
      .not('tip_amount', 'is', null)
      .maybeSingle()

    const tipAmount = tipData?.tip_amount ?? 0

    return successResponse({
      ride_id: rideId,
      receipt,
      summary: {
        fare: ride.final_price ?? ride.estimated_price,
        tip_amount: tipAmount,
        total: (ride.final_price ?? ride.estimated_price ?? 0) + tipAmount,
        payment_method: ride.payment_method,
        payment_status: ride.payment_status,
        distance_km: ride.estimated_distance,
        duration_minutes: ride.estimated_duration,
        origin: ride.pickup_address,
        destination: ride.dropoff_address,
        started_at: ride.started_at,
        completed_at: ride.completed_at,
        passenger: ride.passenger,
        driver: ride.driver,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
