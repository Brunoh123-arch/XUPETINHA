import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/push/subscribe
 * Registra ou atualiza um token FCM para o usuário autenticado.
 * Body: { token, platform?, device_id?, app_version? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { token, platform = 'android', device_id, app_version } = body

    if (!token) {
      return NextResponse.json(
        { error: 'token FCM é obrigatório' },
        { status: 400 }
      )
    }

    // Upsert pelo token — se o mesmo dispositivo reenviar, apenas atualiza
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert(
        {
          user_id:     user.id,
          token,
          platform,
          device_id:   device_id ?? null,
          app_version: app_version ?? null,
          is_active:   true,
          updated_at:  new Date().toISOString(),
        },
        { onConflict: 'token' }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[push/subscribe] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/push/subscribe
 * Desativa um token FCM quando o usuário revoga notificações.
 * Body: { token }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'token é obrigatório' }, { status: 400 })
    }

    const { error } = await supabase
      .from('fcm_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('token', token)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[push/subscribe] delete error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
