import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()

    // Buscar a corrida com dados de pagamento
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*, passenger:profiles!passenger_id(full_name, email)')
      .eq('id', id)
      .single()

    if (rideError || !ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    }

    // Verificar permissão
    if (ride.passenger_id !== user.id && ride.driver_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Verificar se pode cancelar
    if (!['pending', 'negotiating', 'accepted', 'driver_arrived'].includes(ride.status)) {
      return NextResponse.json(
        { error: 'Corrida não pode ser cancelada neste status' },
        { status: 400 }
      )
    }

    // Taxa de cancelamento para passageiro se motorista já aceitou
    let cancellationFee = 0
    const cancelledByPassenger = ride.passenger_id === user.id
    if (cancelledByPassenger && ['accepted', 'driver_arrived'].includes(ride.status)) {
      cancellationFee = ride.final_price ? Math.round(ride.final_price * 0.1 * 100) / 100 : 5.00
    }

    // ---------------------------------------------------------------
    // Lógica de reembolso PIX
    // ---------------------------------------------------------------
    let refundAmount = 0
    let refundStatus: 'none' | 'refunded' | 'pending_refund' = 'none'

    const { data: payment } = await supabase
      .from('payments')
      .select('id, amount, status, payment_method')
      .eq('ride_id', id)
      .in('payment_method', ['pix'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (payment) {
      if (payment.status === 'pending') {
        // PIX ainda não foi pago — apenas marcar como cancelado
        await supabase
          .from('payments')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('id', payment.id)
        refundStatus = 'none' // Nada a restituir

      } else if (payment.status === 'completed') {
        // PIX já foi pago — reembolsar na carteira do passageiro
        const amountToRefund = Math.max(0, payment.amount - cancellationFee)

        if (amountToRefund > 0 && ride.passenger_id) {
          // Creditar na carteira via API interna (usa mesma lógica de saldo)
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const refundRes = await fetch(`${baseUrl}/api/v1/wallet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              cookie: request.headers.get('cookie') || '',
            },
            body: JSON.stringify({
              amount: amountToRefund,
              type: 'refund',
              description: `Reembolso de corrida cancelada${cancellationFee > 0 ? ` (taxa de R$ ${cancellationFee.toFixed(2)} descontada)` : ''}`,
              reference_id: id,
              reference_type: 'ride_refund',
            }),
          })

          if (refundRes.ok) {
            refundAmount = amountToRefund
            refundStatus = 'refunded'

            // Marcar pagamento como reembolsado
            await supabase
              .from('payments')
              .update({ status: 'refunded', refunded_at: new Date().toISOString() })
              .eq('id', payment.id)
          } else {
            // Falha ao creditar — marcar para reembolso manual
            refundStatus = 'pending_refund'
            await supabase
              .from('payments')
              .update({ status: 'refund_pending', refund_amount: amountToRefund })
              .eq('id', payment.id)
          }
        } else if (cancellationFee >= payment.amount) {
          // Taxa cobre todo o pagamento — sem reembolso
          refundStatus = 'none'
          await supabase
            .from('payments')
            .update({ status: 'refunded', refunded_at: new Date().toISOString() })
            .eq('id', payment.id)
        }
      }
    }
    // ---------------------------------------------------------------

    // Atualizar status da corrida
    const { data: updatedRide, error: updateError } = await supabase
      .from('rides')
      .update({
        status: 'cancelled',
        cancelled_by: user.id,
        cancellation_reason: reason || 'Cancelado pelo usuário',
        cancellation_fee: cancellationFee,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Notificar a outra parte
    const otherUserId = ride.passenger_id === user.id ? ride.driver_id : ride.passenger_id
    if (otherUserId) {
      await supabase.from('notifications').insert({
        user_id: otherUserId,
        type: 'ride',
        title: 'Corrida cancelada',
        body: `A corrida foi cancelada. Motivo: ${reason || 'Cancelado pelo usuário'}`,
        data: { ride_id: id },
        is_read: false,
      })
    }

    // Notificar passageiro sobre reembolso
    if (ride.passenger_id && refundStatus === 'refunded' && refundAmount > 0) {
      await supabase.from('notifications').insert({
        user_id: ride.passenger_id,
        type: 'payment',
        title: 'Reembolso creditado',
        body: `R$ ${refundAmount.toFixed(2)} foram creditados na sua carteira Uppi.${cancellationFee > 0 ? ` Taxa de cancelamento de R$ ${cancellationFee.toFixed(2)} descontada.` : ''}`,
        data: { ride_id: id, refund_amount: refundAmount },
        is_read: false,
      })
    } else if (ride.passenger_id && refundStatus === 'pending_refund') {
      await supabase.from('notifications').insert({
        user_id: ride.passenger_id,
        type: 'payment',
        title: 'Reembolso em processamento',
        body: 'Seu reembolso PIX está sendo processado e será creditado em breve.',
        data: { ride_id: id },
        is_read: false,
      })
    }

    return NextResponse.json({
      ride: updatedRide,
      cancellationFee,
      refund: {
        status: refundStatus,
        amount: refundAmount,
        message:
          refundStatus === 'refunded'
            ? `R$ ${refundAmount.toFixed(2)} reembolsados na sua carteira Uppi`
            : refundStatus === 'pending_refund'
            ? 'Reembolso em processamento'
            : cancellationFee > 0
            ? `Taxa de cancelamento de R$ ${cancellationFee.toFixed(2)} aplicada`
            : 'Sem pagamento a reembolsar',
      },
    })
  } catch (error) {
    console.error('Error cancelling ride:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
