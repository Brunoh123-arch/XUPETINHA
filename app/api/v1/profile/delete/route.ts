import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// DELETE /api/v1/profile/delete
// Solicita exclusão de conta (LGPD/GDPR) — marca como pendente de exclusão
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json().catch(() => ({}))
    const { reason, password_confirmed } = body

    if (!password_confirmed) {
      return errorResponse('Confirmação de senha obrigatória para excluir a conta', 400)
    }

    const supabase = await createClient()

    // Verificar se tem corridas ativas
    const { data: activeRides } = await supabase
      .from('rides')
      .select('id')
      .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
      .in('status', ['searching', 'accepted', 'in_progress'])
      .limit(1)

    if (activeRides && activeRides.length > 0) {
      return errorResponse('Não é possível excluir a conta com corridas em andamento', 400)
    }

    // Marcar conta como pendente de exclusão no perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_reason: reason ?? 'Não informado',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      return errorResponse('Erro ao solicitar exclusão da conta', 500)
    }

    // Registrar no audit_log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'account_deletion_requested',
      details: { reason: reason ?? 'Não informado' },
      created_at: new Date().toISOString(),
    })

    return successResponse(
      { scheduled_deletion: true },
      'Solicitação de exclusão registrada. Sua conta será excluída em até 30 dias conforme a LGPD.'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
