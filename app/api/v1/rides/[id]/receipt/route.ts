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

    // Buscar a corrida
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select(`
        id, status, final_price, passenger_price, driver_earnings, platform_fee,
        payment_method, payment_status, origin_address, destination_address,
        distance_km, duration_minutes, started_at, completed_at, created_at,
        passenger:profiles!passenger_id(id, full_name, avatar_url),
        driver:profiles!driver_id(id, full_name, avatar_url),
        driver_profile:driver_profiles!driver_id(vehicle_brand, vehicle_model, vehicle_plate, vehicle_color)
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

    // Buscar gorjeta se houver
    const { data: tip } = await supabase
      .from('tip_transactions')
      .select('amount')
      .eq('ride_id', rideId)
      .single()

    return successResponse({
      ride_id: rideId,
      receipt,
      summary: {
        fare: ride.final_price ?? ride.passenger_price,
        tip_amount: tip?.amount ?? 0,
        total: (ride.passenger_price ?? 0) + (tip?.amount ?? 0),
        payment_method: ride.payment_method,
        payment_status: ride.payment_status,
        distance_km: ride.distance_km,
        duration_minutes: ride.duration_minutes,
        origin: ride.origin_address,
        destination: ride.destination_address,
        started_at: ride.started_at,
        completed_at: ride.completed_at,
        passenger: ride.passenger,
        driver: ride.driver,
        vehicle: ride.driver_profile,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
