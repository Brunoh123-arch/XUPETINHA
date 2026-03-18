import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin ? user : null
}

// GET - Listar corridas com filtros (admin)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const offset = (page - 1) * limit

    let query = supabase
      .from('rides')
      .select(`
        id, status, origin_address, destination_address, fare, final_price,
        created_at, started_at, completed_at, cancelled_at, cancellation_reason,
        passenger:profiles!rides_passenger_id_fkey(full_name, phone),
        driver:driver_profiles!rides_driver_id_fkey(user_id, profiles(full_name, phone))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data: rides, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      rides: rides || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar corridas' }, { status: 500 })
  }
}

// PATCH - Atualizar corrida (admin pode forcar cancelamento, etc.)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await request.json()
    const { ride_id, status, admin_note } = body

    if (!ride_id || !status) return NextResponse.json({ error: 'ride_id e status são obrigatórios' }, { status: 400 })

    const { data, error } = await supabase
      .from('rides')
      .update({ status, admin_note: admin_note || null, updated_at: new Date().toISOString() })
      .eq('id', ride_id)
      .select()
      .single()

    if (error) throw error

    // Auditoria
    await supabase.from('admin_audit_logs').insert({
      admin_user_id: admin.id,
      action: 'update_ride',
      entity_type: 'ride',
      entity_id: ride_id,
      changes: { status, admin_note },
    })

    return NextResponse.json({ success: true, ride: data })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar corrida' }, { status: 500 })
  }
}
