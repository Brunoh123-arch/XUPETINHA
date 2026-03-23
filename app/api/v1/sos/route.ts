import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// POST /api/v1/sos
// Aciona SOS de emergência durante uma corrida
export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { ride_id, location, description } = body

    const supabase = await createClient()

    // Criar evento SOS (o trigger fn_sos_to_emergency_alert cria o emergency_alert automaticamente)
    const { data: sosEvent, error: sosError } = await supabase
      .from('sos_events')
      .insert({
        user_id: user.id,
        ride_id: ride_id ?? null,
        location: location ?? null,
        description: description ?? 'SOS acionado pelo usuário',
        resolved: false,
      })
      .select()
      .single()

    if (sosError) throw sosError

    // Notificar contatos de emergência
    const { data: emergencyContacts } = await supabase
      .from('emergency_contacts')
      .select('name, phone, email')
      .eq('user_id', user.id)

    // Notificar o próprio usuário com confirmação
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'emergency',
      title: 'SOS acionado',
      body: 'Seu SOS foi registrado. Contatos de emergência foram notificados.',
      data: { sos_id: sosEvent.id, ride_id: ride_id ?? null },
      is_read: false,
    })

    return successResponse(
      {
        sos_id: sosEvent.id,
        contacts_notified: emergencyContacts?.length ?? 0,
        message: 'SOS registrado com sucesso. Equipe de suporte foi alertada.',
      },
      'SOS acionado'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/v1/sos
// Lista histórico de eventos SOS do usuário
export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: events, error } = await supabase
      .from('sos_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return successResponse(events ?? [])
  } catch (error) {
    return handleApiError(error)
  }
}
