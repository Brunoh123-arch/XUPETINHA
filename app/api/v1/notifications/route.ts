import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

export async function GET(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 30)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('[v0] Notifications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 15)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id, type, title, message, ride_id, data: notifData } = body

    // Schema real: colunas "message", "is_read" (não "body"/"read")
    // Coluna "ride_id" não existe na tabela notifications — vai em data{}
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type,
        title,
        message,
        data: notifData || (ride_id ? { ride_id } : {}),
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('[v0] Notifications POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 30)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notification_id, read } = body

    // Schema real: coluna "is_read" (não "read")
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ is_read: read })
      .eq('id', notification_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('[v0] Notifications PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
