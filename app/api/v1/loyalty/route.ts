import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Pontos de fidelidade e recompensas disponíveis
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const [pointsRes, transactionsRes, redemptionsRes, rewardsRes] = await Promise.all([
      supabase.from('user_points').select('*').eq('user_id', user.id).single(),
      supabase.from('point_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('reward_redemptions').select('*').eq('user_id', user.id).order('redeemed_at', { ascending: false }).limit(10),
      // Tabela real é "rewards", não "loyalty_rewards"
      supabase.from('rewards').select('*').eq('is_active', true).order('points_cost', { ascending: true }),
    ])

    return NextResponse.json({
      points: pointsRes.data || { points: 0, lifetime_points: 0, tier: 'bronze' },
      transactions: transactionsRes.data || [],
      redemptions: redemptionsRes.data || [],
      available_rewards: rewardsRes.data || [],
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar pontos' }, { status: 500 })
  }
}

// POST - Resgatar recompensa com pontos
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { reward_id } = body

    if (!reward_id) return NextResponse.json({ error: 'ID da recompensa é obrigatório' }, { status: 400 })

    // Buscar recompensa — tabela real é "rewards"
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('is_active', true)
      .single()

    if (rewardError || !reward) return NextResponse.json({ error: 'Recompensa não encontrada' }, { status: 404 })

    // Verificar saldo de pontos — coluna real é "points"
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', user.id)
      .single()

    const balance = userPoints?.points || 0
    if (balance < reward.points_cost) {
      return NextResponse.json({ error: `Pontos insuficientes. Você tem ${balance} pontos e precisa de ${reward.points_cost}.` }, { status: 400 })
    }

    // Debitar pontos — coluna real é "points"
    await supabase.from('user_points').update({
      points: balance - reward.points_cost,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id)

    // Registrar transação de pontos — coluna real é "points" não "amount"
    await supabase.from('point_transactions').insert({
      user_id: user.id,
      points: -reward.points_cost,
      type: 'debit',
      description: `Resgate: ${reward.name}`,
      reference_type: 'reward_redemption',
      balance_after: balance - reward.points_cost,
    })

    // Registrar resgate — colunas reais: points_spent, redeemed_at, status
    const { data: redemption, error } = await supabase
      .from('reward_redemptions')
      .insert({
        user_id: user.id,
        reward_id,
        points_spent: reward.points_cost,
        status: 'pending',
        redeemed_at: new Date().toISOString(),
        expires_at: reward.valid_until || null,
      })
      .select()
      .single()

    if (error) throw error

    // Notificação — campo real é "body", não "message"
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Recompensa resgatada!',
      body: `Você resgatou: ${reward.name}`,
      data: { redemption_id: redemption.id },
      is_read: false,
    })

    return NextResponse.json({ success: true, redemption }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao resgatar recompensa' }, { status: 500 })
  }
}
