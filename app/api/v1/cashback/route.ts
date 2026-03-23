import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Saldo de cashback e historico
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    // Saldo de cashback
    const { data: cashback } = await supabase
      .from('cashback_earned')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Pontos de fidelidade
    const { data: points } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Regras de cashback ativas
    const { data: rules } = await supabase
      .from('cashback_rules')
      .select('*')
      .eq('is_active', true)
      .order('min_ride_value', { ascending: true })

    const totalCashback = cashback
      ?.filter(c => c.status === 'available')
      .reduce((sum, c) => sum + (c.amount || 0), 0) || 0

    return NextResponse.json({
      cashback_balance: totalCashback,
      cashback_history: cashback || [],
      points: points || { balance: 0, lifetime_points: 0 },
      rules: rules || [],
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar cashback' }, { status: 500 })
  }
}

// POST - Resgatar cashback
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { amount } = body

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    // Verificar saldo disponivel
    const { data: available } = await supabase
      .from('cashback_earned')
      .select('id, amount')
      .eq('user_id', user.id)
      .eq('status', 'available')

    const totalAvailable = available?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0

    if (Number(amount) > totalAvailable) {
      return NextResponse.json({ error: 'Saldo de cashback insuficiente' }, { status: 400 })
    }

    // Marcar cashback como resgatado
    let remaining = Number(amount)
    for (const c of available || []) {
      if (remaining <= 0) break
      const toDeduct = Math.min(remaining, c.amount)
      await supabase.from('cashback_earned').update({ status: 'redeemed' }).eq('id', c.id)
      remaining -= toDeduct
    }

    // wallet_transactions precisa do wallet_id — busca primeiro
    const { data: walletData } = await supabase
      .from('wallet')
      .select('id')
      .eq('user_id', user.id)
      .single()

    await supabase.from('wallet_transactions').insert({
      wallet_id: walletData?.id,
      user_id: user.id,
      amount: Number(amount),
      type: 'credit',
      description: 'Resgate de cashback',
      status: 'completed',
    })

    // body (não message) é o campo real em notifications
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Cashback resgatado!',
      body: `R$ ${Number(amount).toFixed(2)} de cashback foi adicionado à sua carteira.`,
      data: { amount },
      is_read: false,
    })

    return NextResponse.json({ success: true, redeemed: Number(amount) })
  } catch {
    return NextResponse.json({ error: 'Erro ao resgatar cashback' }, { status: 500 })
  }
}
