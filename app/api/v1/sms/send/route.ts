import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

// SMS sender — provider not configured
export async function POST(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 10)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone_number, message, notification_id } = body

    if (!phone_number || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // user_sms_preferences não existe — verifica user_settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('sms_notifications')
      .eq('user_id', user.id)
      .single()

    if (!settings?.sms_notifications) {
      return NextResponse.json({ error: 'SMS not enabled for this user' }, { status: 403 })
    }

    // sms_deliveries tem schema diferente — usa sms_logs em vez disso
    const { data: delivery, error: insertError } = await supabase
      .from('sms_logs')
      .insert({
        phone: phone_number,
        message,
        status: 'pending',
        provider: 'not_configured',
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create SMS log' }, { status: 500 })
    }

    // SMS provider not configured — mark as failed
    await supabase
      .from('sms_logs')
      .update({ status: 'failed' })
      .eq('id', delivery.id)

    return NextResponse.json(
      { error: 'SMS provider not configured' },
      { status: 503 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Process pending SMS (called by cron)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ processed: 0, failed: 0, total: 0, message: 'SMS provider not configured' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
