import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin ? user : null
}

// GET /api/v1/admin/withdrawals?status=pending
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 50
    const offset = (page - 1) * limit

    const query = supabase
      .from('driver_withdrawals')
      .select(`
        *,
        driver:profiles!driver_withdrawals_driver_id_fkey(
          id, full_name, avatar_url, email, phone
        )
      `, { count: 'exact' })
      .order('requested_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status !== 'all') query.eq('status', status)

    const { data: withdrawals, error, count } = await query
    if (error) throw error

    // Totais por status
    const { data: summary } = await supabase
      .from('driver_withdrawals')
      .select('status, amount')

    const totals = (summary || []).reduce((acc: Record<string, { count: number; amount: number }>, row) => {
      const s = row.status as string
      if (!acc[s]) acc[s] = { count: 0, amount: 0 }
      acc[s].count++
      acc[s].amount += Number(row.amount)
      return acc
    }, {})

    return NextResponse.json({
      withdrawals: withdrawals || [],
      total: count || 0,
      totals,
      page,
      limit,
    })
  } catch (err) {
    console.error('[admin/withdrawals GET]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH /api/v1/admin/withdrawals — aprova ou rejeita um saque
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await request.json()
    const { withdrawal_id, action, notes } = body

    if (!withdrawal_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Parâmetros inválidos. Use withdrawal_id e action (approve|reject)' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('admin_process_withdrawal', {
      p_admin_id:      admin.id,
      p_withdrawal_id: withdrawal_id,
      p_action:        action,
      p_notes:         notes || null,
    })

    if (error) throw error
    if (!data?.success) {
      return NextResponse.json({ error: data?.error || 'Erro ao processar saque' }, { status: 400 })
    }

    return NextResponse.json({ success: true, withdrawal_id, action })
  } catch (err) {
    console.error('[admin/withdrawals PATCH]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
