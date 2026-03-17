import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// GET /api/v1/driver/earnings
// Retorna resumo de ganhos do motorista com filtro por período
export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // day | week | month | all
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Verificar se é motorista
    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!driverProfile) {
      return errorResponse('Perfil de motorista não encontrado', 403)
    }

    // Calcular data de início conforme período
    const now = new Date()
    let startDate: string | null = null
    if (period === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    } else if (period === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      startDate = weekAgo.toISOString()
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    }

    // Buscar registros de ganhos
    let query = supabase
      .from('driver_earnings')
      .select('*', { count: 'exact' })
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (startDate) {
      query = query.gte('period_date', startDate.split('T')[0])
    }

    const { data: earnings, error, count } = await query

    if (error) throw error

    // Calcular totais
    const totals = earnings?.reduce(
      (acc, e) => ({
        gross: acc.gross + (e.gross_amount ?? 0),
        net: acc.net + (e.net_amount ?? 0),
        tips: acc.tips + (e.tip_amount ?? 0),
        bonuses: acc.bonuses + (e.bonus_amount ?? 0),
        platform_fees: acc.platform_fees + (e.platform_fee ?? 0),
        rides: acc.rides + 1,
      }),
      { gross: 0, net: 0, tips: 0, bonuses: 0, platform_fees: 0, rides: 0 }
    ) ?? { gross: 0, net: 0, tips: 0, bonuses: 0, platform_fees: 0, rides: 0 }

    // Buscar wallet do motorista
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance, total_earned')
      .eq('user_id', user.id)
      .single()

    return successResponse({
      period,
      totals,
      wallet: {
        balance: wallet?.balance ?? 0,
        total_earned: wallet?.total_earned ?? 0,
      },
      earnings: earnings ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        pages: Math.ceil((count ?? 0) / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
