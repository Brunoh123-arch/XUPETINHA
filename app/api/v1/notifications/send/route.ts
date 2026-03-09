import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, title, body: messageBody, message: messageAlt, data } = body

    if (!user_id || !title || (!messageBody && !messageAlt)) {
      return NextResponse.json(
        { error: 'Campos obrigatorios ausentes: user_id, title, body/message' },
        { status: 400 }
      )
    }

    // Salva a notificacao na tabela notifications (Supabase Realtime entrega ao usuario)
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message: messageBody || messageAlt,
        data: data || {},
        is_read: false,
      })

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Notificacao enviada' })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Falha ao enviar notificacao' },
      { status: 500 }
    )
  }
}
