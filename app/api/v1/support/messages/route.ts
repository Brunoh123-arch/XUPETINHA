import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticket_id')

    if (!ticketId) {
      return NextResponse.json({ error: 'ticket_id obrigatorio' }, { status: 400 })
    }

    // Verificar que o ticket pertence ao user
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('id')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket nao encontrado' }, { status: 404 })
    }

    const { data: messages, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Marcar mensagens de agente como lidas
    await supabase
      .from('support_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('ticket_id', ticketId)
      .in('sender_type', ['agent', 'system'])
      .is('read_at', null)

    return NextResponse.json({ messages: messages || [] })
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
    const { ticket_id, message } = body

    if (!ticket_id || !message) {
      return NextResponse.json({ error: 'ticket_id e message obrigatorios' }, { status: 400 })
    }

    // Verificar que o ticket pertence ao user
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('id, status')
      .eq('id', ticket_id)
      .eq('user_id', user.id)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket nao encontrado' }, { status: 404 })
    }

    if (ticket.status === 'closed') {
      return NextResponse.json({ error: 'Ticket fechado' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data: newMessage, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id,
        sender_id: user.id,
        sender_type: 'user',
        sender_name: profile?.full_name || 'Usuario',
        message,
      })
      .select()
      .single()

    if (error) throw error

    // Atualizar status do ticket para waiting (aguardando resposta)
    if (ticket.status === 'resolved') {
      await supabase
        .from('support_tickets')
        .update({ status: 'open' })
        .eq('id', ticket_id)
    }

    return NextResponse.json({ success: true, message: newMessage })
  } catch {
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 })
  }
}
