import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/wallet - Retorna carteira do usuario
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { data: wallet, error } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // Cria carteira se nao existir
      if (error.code === 'PGRST116') {
        const { data: newWallet, error: createError } = await supabase
          .from('wallet')
          .insert({
            user_id: user.id,
            balance: 0,
            bonus_balance: 0,
            lifetime_earnings: 0,
            lifetime_spent: 0,
            pending_withdrawals: 0,
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating wallet:', createError)
          return NextResponse.json({ error: 'Erro ao criar carteira' }, { status: 500 })
        }

        return NextResponse.json({ wallet: newWallet })
      }

      console.error('Error fetching wallet:', error)
      return NextResponse.json({ error: 'Erro ao buscar carteira' }, { status: 500 })
    }

    // Busca transacoes recentes
    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ wallet, transactions: transactions || [] })
  } catch (error) {
    console.error('Wallet API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/wallet - Adiciona credito a carteira
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, type = 'deposit', description } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor invalido' }, { status: 400 })
    }

    // Busca carteira
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Carteira nao encontrada' }, { status: 404 })
    }

    const newBalance = wallet.balance + amount

    // Atualiza saldo
    const { error: updateError } = await supabase
      .from('wallet')
      .update({
        balance: newBalance,
        lifetime_earnings: wallet.lifetime_earnings + (type === 'earning' ? amount : 0),
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)

    if (updateError) {
      console.error('Error updating wallet:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar saldo' }, { status: 500 })
    }

    // Registra transacao
    await supabase.from('wallet_transactions').insert({
      wallet_id: wallet.id,
      type,
      amount,
      balance_after: newBalance,
      description: description || `Credito de R$ ${amount.toFixed(2)}`,
    })

    return NextResponse.json({ 
      success: true, 
      balance: newBalance,
      message: 'Credito adicionado com sucesso'
    })
  } catch (error) {
    console.error('Add credit error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
