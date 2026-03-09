import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { authLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

export async function POST(request: Request) {
  try {
    // Limite restrito: 3 por janela para evitar spam de SOS
    const rlResult = authLimiter.check(request, 3)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { ride_id, location_lat, location_lng, location_address, description } = body

    // Usar RPC que também notifica contatos de emergência cadastrados
    const { data, error } = await supabase.rpc('create_emergency_alert', {
      p_user_id: user.id,
      p_ride_id: ride_id || null,
      p_lat:     location_lat || null,
      p_lng:     location_lng || null,
      p_message: description || 'Emergência! Preciso de ajuda.',
    })

    if (error) {
      console.error('[emergency POST] rpc error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Também notificar admins via tabela
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'SOS Ativado',
      body: `Usuário ${profile?.full_name} ativou alerta de emergência. Localização: ${location_address || 'Desconhecida'}`,
      type: 'admin_alert',
      data: { alert_id: data?.alert_id, user_id: user.id, ride_id },
    })

    return NextResponse.json({ success: true, alert_id: data?.alert_id }, { status: 201 })
  } catch (err) {
    console.error('[emergency POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's emergency alerts
    const { data: alerts, error } = await supabase
      .from('emergency_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error) {
    console.error('[API] Error fetching alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { alert_id, status } = body

    if (!alert_id || !status) {
      return NextResponse.json({ error: 'Alert ID and status required' }, { status: 400 })
    }

    // Update alert status
    const { data, error } = await supabase
      .from('emergency_alerts')
      .update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', alert_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, alert: data })
  } catch (error) {
    console.error('[API] Error updating alert:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
