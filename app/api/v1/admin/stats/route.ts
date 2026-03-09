import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return profile?.is_admin ? user : null
}

export async function GET() {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    // Buscar todas as estatísticas em paralelo
    const [
      summaryResult,
      pendingWithdrawalsResult,
      recentRidesResult,
      usersResult,
    ] = await Promise.all([
      supabase.rpc('get_admin_financial_summary', { p_days: 30 }),
      supabase
        .from('wallet_transactions')
        .select('amount', { count: 'exact' })
        .eq('type', 'withdrawal')
        .eq('status', 'pending'),
      supabase
        .from('rides')
        .select('id, status, final_price, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('profiles')
        .select('id, user_type', { count: 'exact' })
        .eq('status', 'active'),
    ])

    const summary = summaryResult.data || {}
    const pendingWithdrawalsAmount = pendingWithdrawalsResult.data?.reduce(
      (sum, tx) => sum + Number(tx.amount), 0
    ) ?? 0

    return NextResponse.json({
      summary,
      pending_withdrawals_count: pendingWithdrawalsResult.count || 0,
      pending_withdrawals_amount: pendingWithdrawalsAmount,
      recent_rides: recentRidesResult.data || [],
      total_users: usersResult.count || 0,
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
