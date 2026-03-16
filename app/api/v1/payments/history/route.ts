import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// GET /api/v1/payments/history
// Histórico de pagamentos do usuário com paginação
export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
    const status = searchParams.get('status') // paid, pending, failed, refunded
    const from = searchParams.get('from') // ISO date
    const to = searchParams.get('to')   // ISO date
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase
      .from('payments')
      .select('*', { count: 'exact' })
      .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)
    if (from)   query = query.gte('created_at', from)
    if (to)     query = query.lte('created_at', to)

    const { data, error, count } = await query

    if (error) return errorResponse('Erro ao buscar histórico de pagamentos', 500)

    return successResponse({
      payments: data,
      pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
