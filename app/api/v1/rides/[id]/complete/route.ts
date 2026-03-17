import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// POST /api/v1/rides/[id]/complete
// Motorista conclui a corrida explicitamente
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: rideId } = await params
    const supabase = await createClient()

    // Verificar se o motorista é dono da corrida
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('id, driver_id, passenger_id, status, final_price, passenger_price, driver_earnings')
      .eq('id', rideId)
      .single()

    if (rideError || !ride) {
      return errorResponse('Corrida não encontrada', 404)
    }

    if (ride.driver_id !== user.id) {
      return errorResponse('Somente o motorista pode concluir a corrida', 403)
    }

    if (ride.status !== 'in_progress') {
      return errorResponse(`Não é possível concluir uma corrida com status "${ride.status}"`, 400)
    }

    // Atualizar status para completed
    const { error: updateError } = await supabase
      .from('rides')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', rideId)

    if (updateError) {
      return errorResponse('Erro ao concluir a corrida', 500)
    }

    return successResponse({ ride_id: rideId, status: 'completed' }, 'Corrida concluída com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}
