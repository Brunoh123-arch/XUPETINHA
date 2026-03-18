import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// GET /api/v1/wallet/transactions
// Histórico de transações da carteira do usuário com paginação e filtros
export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // credit | debit | all
    const offset = (page - 1) * limit

    const supabase = await createClient()

    // Buscar wallet — tabela real é "wallet" (não "wallets")
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('balance, bonus_balance, lifetime_earnings, lifetime_spent')
      .eq('user_id', user.id)
      .single()

    if (walletError) {
      return errorResponse('Carteira não encontrada', 404)
    }

    // Buscar transações — tabela real é "wallet_transactions" (não "transactions")
    let query = supabase
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('wallet_id', wallet?.id ?? '')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    const { data: transactions, error, count } = await query

    if (error) throw error

    return successResponse({
      wallet,
      transactions: transactions ?? [],
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
