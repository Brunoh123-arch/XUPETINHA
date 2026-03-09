import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const PARADISE_API_URL = 'https://multi.paradisepags.com/api/v1/transaction.php'

function getParadiseKey() {
  return process.env.PARADISE_API_KEY || ''
}
function getParadiseHash() {
  return process.env.PARADISE_PRODUCT_HASH || ''
}

/**
 * POST /api/v1/payments/pix
 * Proxy server-side para criação de cobranças PIX via Paradise.
 * Mantém as chaves de API fora do cliente.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: {
    amount: number
    description?: string
    payer_name?: string
    payer_cpf?: string
    ride_id?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
  }

  // Buscar nome/CPF do perfil caso não informados
  let payerName = body.payer_name || ''
  let payerCpf = body.payer_cpf || ''

  if (!payerName || !payerCpf) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, cpf')
      .eq('id', user.id)
      .single()
    payerName = payerName || profile?.full_name || 'Passageiro Uppi'
    payerCpf = payerCpf || profile?.cpf || ''
  }

  const reference = `UPPI-${body.ride_id || user.id}-${Date.now()}`

  try {
    const paradiseRes = await fetch(PARADISE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getParadiseKey(),
      },
      body: JSON.stringify({
        amount: body.amount,
        description: body.description || 'Pagamento Uppi',
        reference,
        source: 'api_externa',
        product_hash: getParadiseHash(),
        customer: {
          name: payerName,
          document: payerCpf,
        },
      }),
    })

    const data = await paradiseRes.json()

    if (!paradiseRes.ok || data.status !== 'success') {
      return NextResponse.json(
        { error: data.message || 'Erro ao gerar cobrança PIX' },
        { status: paradiseRes.status || 500 }
      )
    }

    const tx = data.data

    // Persistir pagamento no banco
    await supabase
      .from('payments')
      .insert({
        id: String(tx.transaction_id),
        ride_id: body.ride_id || null,
        amount: body.amount / 100,
        payment_method: 'pix',
        status: 'pending',
        pix_qr_code: tx.qr_code_base64 || null,
        pix_qr_code_text: tx.qr_code || null,
        expires_at: tx.expires_at || null,
      })
      .throwOnError()
      .catch(() => {
        // Não bloqueia o fluxo se inserção falhar (já pode existir)
      })

    return NextResponse.json({
      success: true,
      payment_id: String(tx.transaction_id),
      qr_code: tx.qr_code_base64 || null,
      qr_code_text: tx.qr_code || null,
      expires_at: tx.expires_at || null,
    })
  } catch (err) {
    console.error('[api/v1/payments/pix] Erro ao chamar Paradise:', err)
    return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 })
  }
}
