import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

/**
 * POST /api/v1/driver/withdraw
 * Motorista solicita saque via RPC request_withdrawal_v2 (usa driver_withdrawals + user_wallets atomicamente).
 */
export async function POST(request: Request) {
  const rlResult = apiLimiter.check(request, 3)
  if (!rlResult.success) return rateLimitResponse(rlResult)

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { amount, pix_key, pix_key_type = 'cpf', bank_name } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Informe um valor válido para saque' }, { status: 400 })
    }
    if (!pix_key) {
      return NextResponse.json({ error: 'Informe uma chave PIX' }, { status: 400 })
    }

    // Verificar se é motorista verificado
    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('is_verified, pix_key')
      .eq('id', user.id)
      .single()

    if (!driver?.is_verified) {
      return NextResponse.json({ error: 'Apenas motoristas verificados podem sacar' }, { status: 403 })
    }

    // Usar RPC atômica que valida saldo, debita e cria registro em driver_withdrawals
    const { data, error } = await supabase.rpc('request_withdrawal', {
      p_driver_id:    user.id,
      p_amount:       amount,
      p_pix_key:      pix_key,
      p_pix_key_type: pix_key_type,
      p_bank_name:    bank_name || null,
    })

    if (error) throw error
    if (!data?.success) {
      return NextResponse.json({ error: data?.error || 'Erro ao processar saque' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      withdrawal_id: data.withdrawal_id,
      amount: data.amount,
      status: 'pending',
      message: 'Saque solicitado com sucesso. Processamento em até 1 dia útil.',
    })
  } catch (err) {
    console.error('[driver/withdraw POST]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

/**
 * GET /api/v1/driver/withdraw
 * Histórico de saques do motorista via driver_withdrawals.
 */
export async function GET(request: Request) {
  const rlResult = apiLimiter.check(request, 20)
  if (!rlResult.success) return rateLimitResponse(rlResult)

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '30')

    let query = supabase
      .from('driver_withdrawals')
      .select('*')
      .eq('driver_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)

    const { data: withdrawals, error } = await query
    if (error) throw error

    // Totais
    const pending = withdrawals?.filter(w => w.status === 'pending').reduce((s, w) => s + Number(w.amount), 0) || 0
    const paid    = withdrawals?.filter(w => w.status === 'paid').reduce((s, w) => s + Number(w.amount), 0) || 0

    return NextResponse.json({ withdrawals: withdrawals || [], totals: { pending, paid } })
  } catch (err) {
    console.error('[driver/withdraw GET]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
