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
      supabase.from('reward_redemptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('loyalty_rewards').select('*').eq('is_active', true).order('points_required', { ascending: true }),
    ])

    return NextResponse.json({
      points: pointsRes.data || { balance: 0, lifetime_points: 0, level: 'bronze' },
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

    // Buscar recompensa
    const { data: reward, error: rewardError } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('is_active', true)
      .single()

    if (rewardError || !reward) return NextResponse.json({ error: 'Recompensa não encontrada' }, { status: 404 })

    // Verificar saldo de pontos
    const { data: points } = await supabase
      .from('user_points')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    const balance = points?.balance || 0
    if (balance < reward.points_required) {
      return NextResponse.json({ error: `Pontos insuficientes. Você tem ${balance} pontos e precisa de ${reward.points_required}.` }, { status: 400 })
    }

    // Debitar pontos
    await supabase.from('user_points').update({
      balance: balance - reward.points_required,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id)

    // Registrar transação de pontos
    await supabase.from('point_transactions').insert({
      user_id: user.id,
      amount: -reward.points_required,
      type: 'debit',
      description: `Resgate: ${reward.name}`,
      reference_type: 'reward_redemption',
    })

    // Registrar resgate
    const { data: redemption, error } = await supabase
      .from('reward_redemptions')
      .insert({
        user_id: user.id,
        reward_id,
        points_used: reward.points_required,
        status: 'pending',
        reward_value: reward.value || null,
        reward_type: reward.type,
      })
      .select()
      .single()

    if (error) throw error

    // Se for cashback, creditar automaticamente
    if (reward.type === 'cashback' && reward.value) {
      await supabase.from('cashback_earned').insert({
        user_id: user.id,
        amount: reward.value,
        source: 'loyalty_redemption',
        reference_id: redemption.id,
        status: 'available',
      })
      await supabase.from('reward_redemptions').update({ status: 'completed' }).eq('id', redemption.id)
    }

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Recompensa resgatada!',
      message: `Você resgatou: ${reward.name}`,
      data: { redemption_id: redemption.id },
      is_read: false,
    })

    return NextResponse.json({ success: true, redemption }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao resgatar recompensa' }, { status: 500 })
  }
}
