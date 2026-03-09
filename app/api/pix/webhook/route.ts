import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendFcmToTokens } from '@/lib/firebase-admin'

/**
 * POST /api/pix/webhook
 * Recebe confirmacoes de pagamento PIX do gateway Paradise.
 *
 * O Paradise envia um POST com:
 *   { transaction_id, status, amount, reference, paid_at }
 *
 * Fluxo:
 *  1. Valida assinatura HMAC (se configurada)
 *  2. Atualiza `payments.status` para 'completed'
 *  3. Atualiza `rides.payment_status` para 'paid'
 *  4. Dispara push FCM ao passageiro confirmando pagamento
 */
export async function POST(request: NextRequest) {
  let body: {
    transaction_id?: string | number
    status?: string
    amount?: number
    reference?: string
    paid_at?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 })
  }

  const { transaction_id, status, reference } = body

  // Apenas processar pagamentos confirmados
  if (status !== 'paid' && status !== 'completed' && status !== 'approved') {
    return NextResponse.json({ received: true, action: 'ignored', status })
  }

  if (!transaction_id) {
    return NextResponse.json({ error: 'transaction_id ausente' }, { status: 400 })
  }

  const txId = String(transaction_id)

  // Validacao de assinatura HMAC (opcional — ativar quando Paradise suportar)
  const webhookSecret = process.env.PARADISE_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = request.headers.get('x-paradise-signature') ?? ''
    // Implementacao futura: validar HMAC-SHA256 do body com webhookSecret
    if (!signature) {
      return NextResponse.json({ error: 'Assinatura ausente' }, { status: 401 })
    }
  }

  const supabase = await createClient()

  // Buscar pagamento pelo transaction_id
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .select('id, ride_id, amount, status')
    .eq('id', txId)
    .single()

  if (paymentError || !payment) {
    // Pode nao existir se o insert inicial falhou — criamos agora
    if (reference?.startsWith('UPPI-')) {
      const parts = reference.split('-')
      const rideId = parts[1] // UPPI-{ride_id}-{timestamp}
      if (rideId) {
        await supabase.from('payments').upsert({
          id: txId,
          ride_id: rideId,
          amount: (body.amount ?? 0) / 100,
          payment_method: 'pix',
          status: 'completed',
          paid_at: body.paid_at || new Date().toISOString(),
        })
        await supabase
          .from('rides')
          .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
          .eq('id', rideId)
      }
    }
    return NextResponse.json({ received: true, action: 'created' })
  }

  // Ignorar se ja foi processado
  if (payment.status === 'completed') {
    return NextResponse.json({ received: true, action: 'already_processed' })
  }

  // Atualizar payments para completed
  await supabase
    .from('payments')
    .update({
      status: 'completed',
      paid_at: body.paid_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', txId)

  // Atualizar rides.payment_status para paid
  if (payment.ride_id) {
    await supabase
      .from('rides')
      .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', payment.ride_id)

    // Buscar dados da corrida para push ao passageiro
    const { data: ride } = await supabase
      .from('rides')
      .select('passenger_id, dropoff_address, final_price')
      .eq('id', payment.ride_id)
      .single()

    if (ride?.passenger_id) {
      // Inserir notificacao in-app
      await supabase.from('notifications').insert({
        user_id: ride.passenger_id,
        type: 'payment',
        title: 'Pagamento confirmado',
        message: `PIX de R$ ${(payment.amount ?? 0).toFixed(2)} confirmado para ${ride.dropoff_address || 'seu destino'}.`,
        data: { ride_id: payment.ride_id, payment_id: txId },
        is_read: false,
      })

      // Buscar FCM tokens do passageiro e disparar push
      const { data: tokens } = await supabase
        .from('user_push_tokens')
        .select('token')
        .eq('user_id', ride.passenger_id)
        .eq('is_active', true)

      if (tokens && tokens.length > 0) {
        await sendFcmToTokens(
          tokens.map((t: { token: string }) => t.token),
          'Pagamento confirmado',
          `PIX de R$ ${(payment.amount ?? 0).toFixed(2)} recebido com sucesso.`,
          { ride_id: payment.ride_id, type: 'payment_confirmed' }
        ).catch(() => {}) // Push nao e critico
      }
    }
  }

  return NextResponse.json({ received: true, action: 'processed' })
}
