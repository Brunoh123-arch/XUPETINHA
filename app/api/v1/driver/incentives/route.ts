import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Incentivos disponiveis e progresso do motorista
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!driver) return NextResponse.json({ error: 'Perfil de motorista não encontrado' }, { status: 404 })

    const [incentivesRes, progressRes] = await Promise.all([
      supabase.from('driver_incentives')
        .select('*')
        .eq('is_active', true)
        .order('bonus_amount', { ascending: false }),
      supabase.from('driver_incentive_progress')
        .select('*, driver_incentives(name, description, target_rides, bonus_amount, bonus_type)')
        .eq('driver_id', driver.id)
        .order('created_at', { ascending: false }),
    ])

    // Calcular progresso atual da semana
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const { count: weekRides } = await supabase
      .from('rides')
      .select('*', { count: 'exact', head: true })
      .eq('driver_id', driver.id)
      .eq('status', 'completed')
      .gte('created_at', startOfWeek.toISOString())

    return NextResponse.json({
      incentives: incentivesRes.data || [],
      progress: progressRes.data || [],
      week_rides: weekRides || 0,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar incentivos' }, { status: 500 })
  }
}

// POST - Registrar progresso em incentivo
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { incentive_id, rides_completed } = body

    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!driver) return NextResponse.json({ error: 'Perfil de motorista não encontrado' }, { status: 404 })

    const { data: incentive } = await supabase
      .from('driver_incentives')
      .select('*')
      .eq('id', incentive_id)
      .eq('is_active', true)
      .single()

    if (!incentive) return NextResponse.json({ error: 'Incentivo não encontrado' }, { status: 404 })

    const completed = rides_completed >= incentive.target_rides

    const { data: progress, error } = await supabase
      .from('driver_incentive_progress')
      .upsert({
        driver_id: driver.id,
        incentive_id,
        rides_completed,
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
        bonus_paid: false,
      }, { onConflict: 'driver_id,incentive_id' })
      .select()
      .single()

    if (error) throw error

    // Se completou, creditar bonus
    if (completed && !progress.bonus_paid) {
      await supabase.from('driver_incentive_progress').update({ bonus_paid: true }).eq('id', progress.id)

      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: incentive.bonus_amount,
        type: 'credit',
        description: `Bônus incentivo: ${incentive.name}`,
        status: 'completed',
      })

      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'system',
        title: 'Incentivo concluido!',
        message: `Parabens! Voce ganhou R$ ${incentive.bonus_amount.toFixed(2)} pelo incentivo "${incentive.name}".`,
        data: { incentive_id },
        is_read: false,
      })
    }

    return NextResponse.json({ success: true, progress, completed })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar progresso' }, { status: 500 })
  }
}
