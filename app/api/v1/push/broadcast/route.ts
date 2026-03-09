import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendFcmToTokens } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

type BroadcastTarget = 'all_passengers' | 'all_drivers' | 'everyone'

/**
 * POST /api/v1/push/broadcast
 * Envia FCM HTTP v1 para um grupo inteiro de usuarios. Apenas admins.
 * Body: { target: 'all_passengers' | 'all_drivers' | 'everyone', title, body, data? }
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return NextResponse.json(
        { error: 'FIREBASE_SERVICE_ACCOUNT_JSON nao configurada' },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    // Verifica autenticacao e perfil admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas admins podem fazer broadcast' },
        { status: 403 }
      )
    }

    const { target, title, body, data } = await request.json() as {
      target: BroadcastTarget
      title: string
      body: string
      data?: Record<string, unknown>
    }

    if (!target || !title || !body) {
      return NextResponse.json(
        { error: 'target, title e body sao obrigatorios' },
        { status: 400 }
      )
    }

    // Busca user_ids do grupo alvo
    let userQuery = supabase.from('profiles').select('id').eq('status', 'active')
    if (target === 'all_passengers') userQuery = userQuery.eq('user_type', 'passenger')
    if (target === 'all_drivers')    userQuery = userQuery.eq('user_type', 'driver')

    const { data: targetUsers } = await userQuery
    if (!targetUsers || targetUsers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, total: 0 })
    }

    const userIds = targetUsers.map((u) => u.id)

    // Busca tokens FCM ativos do grupo (em batches para evitar limite do Supabase)
    const SUPABASE_IN_LIMIT = 1000
    const allTokens: string[] = []

    for (let i = 0; i < userIds.length; i += SUPABASE_IN_LIMIT) {
      const batch = userIds.slice(i, i + SUPABASE_IN_LIMIT)
      const { data: tokenRows } = await supabase
        .from('fcm_tokens')
        .select('token')
        .in('user_id', batch)
        .eq('is_active', true)

      if (tokenRows) {
        allTokens.push(...tokenRows.map((r) => r.token))
      }
    }

    if (allTokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0, total: 0 })
    }

    const dataStr = Object.fromEntries(
      Object.entries(data ?? {}).map(([k, v]) => [k, String(v)])
    ) as Record<string, string>

    // sendFcmToTokens ja processa em chunks de 100 paralelos
    const result = await sendFcmToTokens(allTokens, title, body, dataStr)

    // Desativa tokens expirados/invalidos
    if (result.expiredTokens.length > 0) {
      await supabase
        .from('fcm_tokens')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('token', result.expiredTokens)
    }

    // Registra resumo no log
    await supabase.from('push_log').insert({
      title,
      body,
      channel: 'fcm_v1_broadcast',
      status:  result.sent > 0 ? 'sent' : 'failed',
    })

    return NextResponse.json({
      success: true,
      sent:            result.sent,
      failed:          result.failed,
      total:           allTokens.length,
      expired_cleaned: result.expiredTokens.length,
    })
  } catch (error) {
    console.error('[push/broadcast] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
