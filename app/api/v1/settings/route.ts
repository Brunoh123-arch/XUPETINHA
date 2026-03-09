import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Tentar buscar settings, criar se nao existir
    let { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // Nao existe, criar
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert({ user_id: user.id })
        .select()
        .single()

      if (insertError) throw insertError
      settings = newSettings
    } else if (error) {
      throw error
    }

    return NextResponse.json({ settings })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    // Filtrar apenas campos permitidos
    const allowedFields = [
      'notifications_rides', 'notifications_promotions', 'notifications_chat',
      'notifications_system', 'recording_enabled', 'recording_auto',
      'two_factor_enabled', 'biometric_enabled', 'share_location_family',
      'dark_mode', 'language', 'haptic_enabled', 'map_provider',
    ]

    const updates: Record<string, unknown> = {}
    for (const key of allowedFields) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo valido para atualizar' }, { status: 400 })
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, ...updates })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, settings })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}
