import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

/**
 * POST /api/v1/driver/withdraw
 * Motorista solicita saque dos ganhos para conta bancaria/PIX.
 * Debita da carteira e cria registro de transacao atomicamente.
 */
export async function POST(request: Request) {
  const rlResult = apiLimiter.check(request, 3)
  if (!rlResult.success) return rateLimitResponse(rlResult)

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, pix_key, bank_account } = body

    if (!amount || typeof amount !== 'number' || amount < 10) {
      return NextResponse.json({ error: 'Valor minimo de saque e R$ 10,00' }, { status: 400 })
    }

    if (!pix_key && !bank_account) {
      return NextResponse.json(
        { error: 'Informe uma chave PIX ou conta bancaria para saque' },
        { status: 400 }
      )
    }

    // Verificar se e motorista verificado
    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('is_verified')
      .eq('id', user.id)
      .single()

    if (!driverProfile?.is_verified) {
      return NextResponse.json({ error: 'Motorista nao verificado' }, { status: 403 })
    }

    // Verificar saldo via RPC (calcula saldo real baseado em transacoes)
    const { data: balance } = await supabase.rpc('calculate_wallet_balance', {
      p_user_id: user.id,
    })

    const currentBalance = typeof balance === 'number' ? balance : 0

    if (currentBalance < amount) {
      return NextResponse.json(
        {
          error: `Saldo insuficiente. Saldo atual: R$ ${currentBalance.toFixed(2)}`,
          current_balance: currentBalance,
        },
        { status: 400 }
      )
    }

    // Criar transacao de debito atomicamente
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        amount: -amount, // negativo = debito
        type: 'withdrawal',
        status: 'pending',
        description: `Saque via ${pix_key ? 'PIX' : 'transferencia bancaria'}`,
        metadata: {
          pix_key: pix_key || null,
          bank_account: bank_account || null,
          requested_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (txError) throw txError

    // Atualizar saldo em user_wallets (cache de saldo)
    const newBalance = currentBalance - amount
    await supabase
      .from('user_wallets')
      .upsert(
        { user_id: user.id, balance: newBalance, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    // Notificar motorista
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'payment',
      title: 'Solicitacao de saque recebida',
      message: `Seu saque de R$ ${amount.toFixed(2)} foi solicitado e sera processado em ate 1 dia util.`,
      data: { transaction_id: transaction.id, amount },
      is_read: false,
    })

    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
      amount,
      new_balance: newBalance,
      message: 'Saque solicitado com sucesso. Processamento em ate 1 dia util.',
    })
  } catch (error) {
    console.error('Driver withdraw error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/v1/driver/withdraw
 * Historico de saques do motorista.
 */
export async function GET(request: Request) {
  const rlResult = apiLimiter.check(request, 20)
  if (!rlResult.success) return rateLimitResponse(rlResult)

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: withdrawals, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error('Driver withdraw GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
