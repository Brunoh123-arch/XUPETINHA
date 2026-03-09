import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin ? user : null
}

// GET: Lista saques pendentes com dados do motorista
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    const { data: withdrawals, error } = await supabase
      .from('wallet_transactions')
      .select(`
        *,
        driver:profiles!wallet_transactions_user_id_fkey(
          id, full_name, avatar_url, email, phone
        )
      `)
      .eq('type', 'withdrawal')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ withdrawals: withdrawals || [] })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH: Aprovar ou rejeitar saque
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await requireAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const body = await request.json()
    const { transaction_id, action, notes } = body

    if (!transaction_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Parametros invalidos' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'completed' : 'cancelled'

    // Buscar transação original
    const { data: tx } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('id', transaction_id)
      .single()

    if (!tx) return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    if (tx.status !== 'pending') return NextResponse.json({ error: 'Saque já processado' }, { status: 400 })

    // Atualizar status
    const { error } = await supabase
      .from('wallet_transactions')
      .update({
        status: newStatus,
        metadata: { ...tx.metadata, processed_by: admin.id, notes, processed_at: new Date().toISOString() },
      })
      .eq('id', transaction_id)

    if (error) throw error

    // Se rejeitado: devolver saldo ao motorista
    if (action === 'reject') {
      await supabase
        .from('driver_profiles')
        .update({ total_earnings: supabase.rpc('increment', { x: tx.amount }) })
        .eq('id', tx.user_id)

      // Notificar motorista
      await supabase.from('notifications').insert({
        user_id: tx.user_id,
        type: 'payment_received',
        title: 'Saque rejeitado',
        message: `Seu saque de R$ ${Number(tx.amount).toFixed(2)} foi rejeitado. O valor foi estornado.`,
        data: { transaction_id },
        is_read: false,
      })
    } else {
      // Notificar motorista: aprovado
      await supabase.from('notifications').insert({
        user_id: tx.user_id,
        type: 'payment_received',
        title: 'Saque aprovado!',
        message: `Seu saque de R$ ${Number(tx.amount).toFixed(2)} foi aprovado e será enviado ao seu PIX.`,
        data: { transaction_id },
        is_read: false,
      })
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
