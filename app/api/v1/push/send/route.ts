import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendFcmToTokens } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/push/send
 * Body: { user_id, title, body?, data? }
 *
 * Envia FCM HTTP v1 para todos os tokens ativos do usuario e
 * desativa automaticamente tokens expirados/invalidos.
 */
export async function POST(request: NextRequest) {
  try {
    const { user_id, title, body, data } = await request.json()

    if (!user_id || !title) {
      return NextResponse.json(
        { error: 'user_id e title sao obrigatorios' },
        { status: 400 }
      )
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      return NextResponse.json(
        { error: 'FIREBASE_SERVICE_ACCOUNT_JSON nao configurada' },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    // Busca todos os tokens FCM ativos do usuario
    const { data: fcmRows, error: fetchError } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if (fetchError) throw fetchError

    const tokens = (fcmRows ?? []).map((r) => r.token)

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, fcm: { sent: 0, failed: 0, skipped: true } })
    }

    // Converte valores de data para string (requisito FCM)
    const dataStr = Object.fromEntries(
      Object.entries(data ?? {}).map(([k, v]) => [k, String(v)])
    ) as Record<string, string>

    const result = await sendFcmToTokens(tokens, title, body ?? '', dataStr)

    // Desativa tokens expirados/invalidos
    if (result.expiredTokens.length > 0) {
      await supabase
        .from('fcm_tokens')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('token', result.expiredTokens)
    }

    // Registra no log
    await supabase.from('push_log').insert({
      user_id,
      title,
      body: body ?? '',
      channel: 'fcm_v1',
      status: result.sent > 0 ? 'sent' : 'failed',
    })

    return NextResponse.json({
      success: true,
      fcm: {
        sent: result.sent,
        failed: result.failed,
        skipped: false,
        expired_cleaned: result.expiredTokens.length,
      },
    })
  } catch (error) {
    console.error('[push/send] error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
