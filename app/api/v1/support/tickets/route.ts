import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('support_tickets')
      .select('*, support_messages(id, message, sender_type, created_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: tickets, error } = await query.limit(50)
    if (error) throw error

    return NextResponse.json({ tickets: tickets || [] })
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
    const { topic, message, ride_id, priority } = body

    if (!message || !topic) {
      return NextResponse.json({ error: 'Topico e mensagem obrigatorios' }, { status: 400 })
    }

    // Criar ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        topic,
        priority: priority || 'medium',
        ride_id: ride_id || null,
      })
      .select()
      .single()

    if (ticketError) throw ticketError

    // Criar primeira mensagem
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { error: msgError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        sender_type: 'user',
        sender_name: profile?.full_name || 'Usuario',
        message,
      })

    if (msgError) throw msgError

    // Resposta automática do sistema
    await supabase.from('support_messages').insert({
      ticket_id: ticket.id,
      sender_id: null,
      sender_type: 'system',
      sender_name: 'Sistema Uppi',
      message: 'Seu ticket foi recebido! Nossa equipe responderá em breve. Tempo estimado: 2-4 horas.',
    })

    return NextResponse.json({ success: true, ticket })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar ticket' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { ticket_id, status } = body

    if (!ticket_id || !status) {
      return NextResponse.json({ error: 'ticket_id e status obrigatorios' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status,
        ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {}),
      })
      .eq('id', ticket_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, ticket: data })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar ticket' }, { status: 500 })
  }
}
