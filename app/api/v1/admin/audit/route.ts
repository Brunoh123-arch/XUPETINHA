import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin ? user : null
}

// GET - Log de auditoria (admin)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 50)
    const action = searchParams.get('action')
    const entity_type = searchParams.get('entity_type')
    const offset = (page - 1) * limit

    let query = supabase
      .from('admin_audit_logs')
      .select(`
        id, action, entity_type, entity_id, changes, created_at,
        admin:profiles!admin_audit_logs_admin_user_id_fkey(full_name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (action) query = query.eq('action', action)
    if (entity_type) query = query.eq('entity_type', entity_type)

    const { data: logs, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      logs: logs || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar logs de auditoria' }, { status: 500 })
  }
}
