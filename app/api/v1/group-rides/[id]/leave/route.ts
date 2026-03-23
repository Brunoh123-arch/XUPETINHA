import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// DELETE /api/v1/group-rides/[id]/leave
// Passageiro sai de uma corrida em grupo
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: groupRideId } = await params
    const supabase = await createClient()

    // Verificar se a corrida em grupo existe
    const { data: groupRide, error: groupError } = await supabase
      .from('group_rides')
      .select('id, creator_id, status, max_passengers')
      .eq('id', groupRideId)
      .single()

    if (groupError || !groupRide) {
      return errorResponse('Corrida em grupo não encontrada', 404)
    }

    if (groupRide.status === 'completed' || groupRide.status === 'cancelled') {
      return errorResponse('Não é possível sair de uma corrida já finalizada', 400)
    }

    if (groupRide.creator_id === user.id) {
      return errorResponse('O criador não pode sair — cancele a corrida em vez disso', 400)
    }

    // Verificar se o usuário é membro — tabela real: group_ride_participants
    const { data: membership, error: memberError } = await supabase
      .from('group_ride_participants')
      .select('id, status')
      .eq('group_ride_id', groupRideId)
      .eq('user_id', user.id)
      .single()

    if (memberError || !membership) {
      return errorResponse('Você não é membro desta corrida em grupo', 404)
    }

    if (membership.status === 'left') {
      return errorResponse('Você já saiu desta corrida em grupo', 400)
    }

    // Marcar membro como 'left'
    const { error: leaveError } = await supabase
      .from('group_ride_participants')
      .update({ status: 'left' })
      .eq('id', membership.id)

    if (leaveError) {
      return errorResponse('Erro ao sair da corrida em grupo', 500)
    }

    return successResponse({ group_ride_id: groupRideId, status: 'left' }, 'Você saiu da corrida em grupo com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}
