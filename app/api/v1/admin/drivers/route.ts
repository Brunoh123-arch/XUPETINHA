import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin ? user : null
}

// GET - Listar motoristas com filtros (admin)
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
      .from('driver_profiles')
      .select(`
        id, status, rating, total_rides, total_earnings, is_verified, created_at,
        user:profiles!driver_profiles_user_id_fkey(id, full_name, phone, email, avatar_url),
        vehicle:vehicles(make, model, year, plate, category)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data: drivers, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      drivers: drivers || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar motoristas' }, { status: 500 })
  }
}

// PATCH - Atualizar status do motorista (aprovar, suspender, banir)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await request.json()
    const { driver_id, status, is_verified, reason } = body

    if (!driver_id) return NextResponse.json({ error: 'driver_id é obrigatório' }, { status: 400 })

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (typeof is_verified === 'boolean') updates.is_verified = is_verified

    const { data: driver, error } = await supabase
      .from('driver_profiles')
      .update(updates)
      .eq('id', driver_id)
      .select('user_id')
      .single()

    if (error) throw error

    // Notificar motorista
    if (driver?.user_id) {
      const messages: Record<string, string> = {
        active: 'Sua conta de motorista foi aprovada! Você ja pode aceitar corridas.',
        suspended: `Sua conta foi suspensa. Motivo: ${reason || 'Violação dos termos de uso.'}`,
        banned: `Sua conta foi banida permanentemente. Motivo: ${reason || 'Violação grave dos termos.'}`,
      }
      if (status && messages[status]) {
        await supabase.from('notifications').insert({
          user_id: driver.user_id,
          type: status === 'active' ? 'system' : 'alert',
          title: status === 'active' ? 'Conta aprovada' : 'Status da conta alterado',
          message: messages[status],
          data: { status, reason },
          is_read: false,
        })
      }
    }

    // Auditoria
    await supabase.from('admin_audit_logs').insert({
      admin_user_id: admin.id,
      action: `driver_${status || 'updated'}`,
      entity_type: 'driver_profile',
      entity_id: driver_id,
      changes: { status, is_verified, reason },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar motorista' }, { status: 500 })
  }
}
