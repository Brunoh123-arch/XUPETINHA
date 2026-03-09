import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, authLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

// GET /api/v1/support — lista tickets do usuário
export async function GET(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 20)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const ticket_id = searchParams.get('ticket_id')

    if (ticket_id) {
      // Detalhes de um ticket com mensagens
      const [ticketRes, messagesRes] = await Promise.all([
        supabase.from('support_tickets').select('*').eq('id', ticket_id).eq('user_id', user.id).single(),
        supabase.from('support_messages').select('*').eq('ticket_id', ticket_id).order('created_at', { ascending: true }),
      ])
      if (ticketRes.error) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
      return NextResponse.json({ ticket: ticketRes.data, messages: messagesRes.data || [] })
    }

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('id, subject, category, status, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ tickets: tickets || [] })
  } catch (err) {
    console.error('[support GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/support — abre ticket ou responde existente
export async function POST(request: Request) {
  try {
    const rlResult = authLimiter.check(request, 5)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { subject, message, category, ride_id, ticket_id } = body

    // Reply to existing ticket
    if (ticket_id) {
      if (!message) return NextResponse.json({ error: 'message é obrigatório' }, { status: 400 })
      const { data, error } = await supabase.rpc('reply_support_ticket', {
        p_user_id:   user.id,
        p_ticket_id: ticket_id,
        p_message:   message,
        p_is_admin:  false,
        p_close:     false,
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json(data)
    }

    // Create new ticket
    if (!subject || !message) {
      return NextResponse.json({ error: 'subject e message são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('create_support_ticket', {
      p_user_id:  user.id,
      p_subject:  subject,
      p_message:  message,
      p_category: category || 'general',
      p_ride_id:  ride_id || null,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[support POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
