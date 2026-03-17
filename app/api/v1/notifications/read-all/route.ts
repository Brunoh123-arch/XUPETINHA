import { createClient } from '@/lib/supabase/server'
import { successResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// PATCH /api/v1/notifications/read-all
// Marca todas as notificações do usuário como lidas
export async function PATCH() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { error, count } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) throw error

    return successResponse(
      { updated: count ?? 0 },
      `${count ?? 0} notificações marcadas como lidas`
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/v1/notifications/read-all
// Remove todas as notificações lidas do usuário
export async function DELETE() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { error, count } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('is_read', true)

    if (error) throw error

    return successResponse(
      { deleted: count ?? 0 },
      `${count ?? 0} notificações removidas`
    )
  } catch (error) {
    return handleApiError(error)
  }
}
