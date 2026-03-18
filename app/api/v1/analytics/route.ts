import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin ? user : null
}

// GET - Metricas diarias e eventos de analytics
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const days = Number(searchParams.get('days') || 30)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [dailyRes, eventsRes, revenueRes, driversRes, usersRes] = await Promise.all([
      supabase.from('analytics_daily')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true }),
      supabase.from('analytics_events')
        .select('event_name, count:id', { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .limit(20),
      supabase.from('rides')
        .select('final_price, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString()),
      supabase.from('driver_profiles')
        .select('status', { count: 'exact' })
        .eq('status', 'online'),
      supabase.from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString()),
    ])

    const totalRevenue = revenueRes.data?.reduce((sum, r) => sum + (r.final_price || 0), 0) || 0
    const avgRevenuePerDay = totalRevenue / days

    return NextResponse.json({
      period_days: days,
      daily_metrics: dailyRes.data || [],
      top_events: eventsRes.data || [],
      revenue: {
        total: totalRevenue,
        avg_per_day: avgRevenuePerDay,
        rides_count: revenueRes.data?.length || 0,
      },
      drivers_online: driversRes.count || 0,
      new_users: usersRes.data?.length || 0,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar analytics' }, { status: 500 })
  }
}

// POST - Registrar evento de analytics
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { event_name, properties, session_id } = body

    if (!event_name) return NextResponse.json({ error: 'Nome do evento é obrigatório' }, { status: 400 })

    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_name,
      properties: properties || {},
      session_id: session_id || null,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao registrar evento' }, { status: 500 })
  }
}
