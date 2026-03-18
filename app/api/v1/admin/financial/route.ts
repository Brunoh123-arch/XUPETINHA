import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin ? user : null
}

// GET - Relatorio financeiro completo (admin)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const days = Number(searchParams.get('days') || 30)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startStr = startDate.toISOString()

    const [
      revenueRes,
      withdrawalsRes,
      pendingWithdrawalsRes,
      refundsRes,
      walletCreditsRes,
    ] = await Promise.all([
      supabase.from('rides')
        .select('fare, final_price, platform_fee, driver_earnings, created_at')
        .eq('status', 'completed')
        .gte('created_at', startStr),
      supabase.from('wallet_transactions')
        .select('amount, created_at')
        .eq('type', 'withdrawal')
        .eq('status', 'completed')
        .gte('created_at', startStr),
      supabase.from('wallet_transactions')
        .select('amount, user_id, created_at')
        .eq('type', 'withdrawal')
        .eq('status', 'pending'),
      supabase.from('rides')
        .select('final_price, created_at')
        .eq('status', 'refunded')
        .gte('created_at', startStr),
      supabase.from('wallet_transactions')
        .select('amount')
        .eq('type', 'credit')
        .eq('status', 'completed')
        .gte('created_at', startStr),
    ])

    const totalRevenue = revenueRes.data?.reduce((s, r) => s + (r.final_price || r.fare || 0), 0) || 0
    const platformFees = revenueRes.data?.reduce((s, r) => s + (r.platform_fee || 0), 0) || 0
    const driverEarnings = revenueRes.data?.reduce((s, r) => s + (r.driver_earnings || 0), 0) || 0
    const totalWithdrawals = withdrawalsRes.data?.reduce((s, r) => s + (r.amount || 0), 0) || 0
    const pendingWithdrawals = pendingWithdrawalsRes.data?.reduce((s, r) => s + (r.amount || 0), 0) || 0
    const totalRefunds = refundsRes.data?.reduce((s, r) => s + (r.final_price || 0), 0) || 0
    const totalCredits = walletCreditsRes.data?.reduce((s, r) => s + (r.amount || 0), 0) || 0

    return NextResponse.json({
      period_days: days,
      revenue: {
        total: totalRevenue,
        platform_fees: platformFees,
        driver_earnings: driverEarnings,
        rides_count: revenueRes.data?.length || 0,
      },
      withdrawals: {
        completed: totalWithdrawals,
        pending: pendingWithdrawals,
        pending_count: pendingWithdrawalsRes.data?.length || 0,
      },
      refunds: {
        total: totalRefunds,
        count: refundsRes.data?.length || 0,
      },
      wallet_credits: totalCredits,
      net_revenue: platformFees - totalRefunds,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar relatório financeiro' }, { status: 500 })
  }
}
