import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// POST /api/v1/driver/shift
// Inicia ou encerra o turno do motorista
export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { action, location } = body // action: 'start' | 'end'

    if (!action || !['start', 'end'].includes(action)) {
      return errorResponse('action deve ser "start" ou "end"', 400)
    }

    const supabase = await createClient()

    // Verificar se o usuário é motorista
    const { data: driver, error: driverError } = await supabase
      .from('driver_profiles')
      .select('id, is_active, is_online')
      .eq('id', user.id)
      .single()

    if (driverError || !driver) {
      return errorResponse('Perfil de motorista não encontrado', 404)
    }

    if (action === 'start') {
      // Verificar se já tem turno aberto
      const { data: openShift } = await supabase
        .from('driver_shift_logs')
        .select('id')
        .eq('driver_id', user.id)
        .is('ended_at', null)
        .single()

      if (openShift) {
        return errorResponse('Já existe um turno em andamento', 409)
      }

      const { data: shift, error: shiftError } = await supabase
        .from('driver_shift_logs')
        .insert({
          driver_id: user.id,
          started_at: new Date().toISOString(),
          start_location: location ?? null,
        })
        .select()
        .single()

      if (shiftError) return errorResponse('Erro ao iniciar turno', 500)

      // Marcar motorista como online
      await supabase
        .from('driver_profiles')
        .update({ is_online: true, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      return successResponse(shift, 'Turno iniciado com sucesso', 201)
    }

    // action === 'end'
    const { data: openShift, error: findError } = await supabase
      .from('driver_shift_logs')
      .select('id, started_at')
      .eq('driver_id', user.id)
      .is('ended_at', null)
      .single()

    if (findError || !openShift) {
      return errorResponse('Nenhum turno em andamento encontrado', 404)
    }

    const startedAt = new Date(openShift.started_at)
    const endedAt = new Date()
    const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)

    const { data: shift, error: endError } = await supabase
      .from('driver_shift_logs')
      .update({
        ended_at: endedAt.toISOString(),
        duration_minutes: durationMinutes,
        end_location: location ?? null,
      })
      .eq('id', openShift.id)
      .select()
      .single()

    if (endError) return errorResponse('Erro ao encerrar turno', 500)

    // Marcar motorista como offline
    await supabase
      .from('driver_profiles')
      .update({ is_online: false, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    return successResponse(shift, 'Turno encerrado com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/v1/driver/shift
// Retorna o turno atual do motorista ou histórico
export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const history = searchParams.get('history') === 'true'

    const supabase = await createClient()

    if (!history) {
      // Turno atual aberto
      const { data: shift } = await supabase
        .from('driver_shift_logs')
        .select('*')
        .eq('driver_id', user.id)
        .is('ended_at', null)
        .single()

      return successResponse({ active_shift: shift ?? null })
    }

    // Histórico de turnos
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
    const offset = (page - 1) * limit

    const { data: shifts, count, error } = await supabase
      .from('driver_shift_logs')
      .select('*', { count: 'exact' })
      .eq('driver_id', user.id)
      .not('ended_at', 'is', null)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return errorResponse('Erro ao buscar histórico de turnos', 500)

    return successResponse({
      shifts,
      pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
