import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    // Normaliza para o formato esperado pela club/page.tsx
    const normalized = subscription
      ? { ...subscription, plan: (subscription.plan as any)?.name ?? null }
      : null

    return NextResponse.json({ subscription: normalized })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['basic', 'premium', 'vip'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Busca o plan_id correspondente
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('name', plan)
      .eq('is_active', true)
      .single()

    if (planError || !planData) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Cancela assinatura anterior se existir
    await supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled', cancelled_at: now.toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'active')

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planData.id,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
      })
      .select()
      .single()

    if (error) throw error

    // Notificar usuario
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Assinatura ativada!',
      body: `Seu plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} foi ativado com sucesso.`,
      data: { plan },
      is_read: false,
    })

    return NextResponse.json({ subscription: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled', cancel_at_period_end: true, cancelled_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error cancelling subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

