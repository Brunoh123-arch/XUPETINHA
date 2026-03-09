import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: members, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })

    if (error) throw error

    return NextResponse.json({ members: members || [] })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, phone, relationship, can_track_rides, notify_on_start, notify_on_end, is_primary } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Nome e telefone obrigatorios' }, { status: 400 })
    }

    // Limite de 5 membros
    const { count } = await supabase
      .from('family_members')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: 'Limite de 5 contatos atingido' }, { status: 400 })
    }

    // Se is_primary, remover primary dos outros
    if (is_primary) {
      await supabase
        .from('family_members')
        .update({ is_primary: false })
        .eq('user_id', user.id)
    }

    const { data: member, error } = await supabase
      .from('family_members')
      .insert({
        user_id: user.id,
        name,
        phone,
        relationship: relationship || 'other',
        can_track_rides: can_track_rides !== false,
        notify_on_start: notify_on_start !== false,
        notify_on_end: notify_on_end !== false,
        is_primary: is_primary || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, member })
  } catch {
    return NextResponse.json({ error: 'Erro ao adicionar' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

    if (updates.is_primary) {
      await supabase
        .from('family_members')
        .update({ is_primary: false })
        .eq('user_id', user.id)
    }

    const { data, error } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, member: data })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 })
  }
}
