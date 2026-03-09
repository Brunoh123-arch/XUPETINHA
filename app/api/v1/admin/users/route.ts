import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  return profile?.is_admin ? user : null
}

// GET: Lista todos os usuários com filtros
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const userType = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, phone, user_type, status, is_banned, is_admin, total_rides, rating, created_at, avatar_url', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (userType !== 'all') {
      query = query.eq('user_type', userType)
    }

    const { data: users, count, error } = await query
    if (error) throw error

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH: Banir/desbanir usuário ou promover a admin
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await request.json()
    const { user_id, action, reason } = body

    if (!user_id || !action) {
      return NextResponse.json({ error: 'user_id e action são obrigatórios' }, { status: 400 })
    }

    if (user_id === admin.id) {
      return NextResponse.json({ error: 'Não é possível modificar a própria conta' }, { status: 400 })
    }

    if (action === 'ban') {
      const { data, error } = await supabase.rpc('admin_ban_user', {
        p_user_id: user_id,
        p_reason: reason || 'Violação dos termos de uso',
      })
      if (error) throw error
      return NextResponse.json({ success: true, result: data })
    }

    if (action === 'unban') {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: false, banned_at: null, ban_reason: null })
        .eq('id', user_id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'make_admin') {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user_id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'remove_admin') {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: false })
        .eq('id', user_id)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
