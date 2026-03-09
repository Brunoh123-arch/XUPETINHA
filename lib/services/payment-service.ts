'use client'

import { createClient } from '@/lib/supabase/client'

export interface PixPaymentRequest {
  amount: number // em centavos (ex: 2500 = R$ 25,00)
  description: string
  payer_name?: string
  payer_cpf?: string
  ride_id: string
}

export interface PixPaymentResponse {
  success: boolean
  payment_id?: string
  qr_code?: string // QR Code em base64
  qr_code_text?: string // Código PIX copia e cola
  expires_at?: string
  error?: string
}

export interface PaymentStatus {
  payment_id: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  paid_at?: string
  amount: number
}

class PaymentService {
  /**
   * Cria um pagamento PIX via proxy server-side (/api/v1/payments/pix).
   * As chaves Paradise ficam apenas no servidor — nunca no bundle do cliente.
   */
  async createPixPayment(request: PixPaymentRequest): Promise<PixPaymentResponse> {
    try {
      const res = await fetch('/api/v1/payments/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: request.amount,
          description: request.description || 'Pagamento Uppi',
          payer_name: request.payer_name || '',
          payer_cpf: request.payer_cpf || '',
          ride_id: request.ride_id,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Erro ao gerar PIX. Tente novamente.' }
      }

      return {
        success: true,
        payment_id: data.payment_id,
        qr_code: data.qr_code || undefined,
        qr_code_text: data.qr_code_text || undefined,
        expires_at: data.expires_at || undefined,
      }
    } catch {
      return { success: false, error: 'Erro ao processar pagamento' }
    }
  }

  /**
   * Verifica o status de um pagamento PIX via /api/pix/status (proxy server-side)
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    try {
      const res = await fetch(`/api/pix/status?hash=${encodeURIComponent(paymentId)}`, { cache: 'no-store' })
      const data = await res.json()

      if (data.status === 'paid') {
        const supabase = createClient()
        await supabase.from('payments').update({ status: 'completed', paid_at: new Date().toISOString() }).eq('id', paymentId)
      }

      return { payment_id: paymentId, status: data.status, amount: 0 }
    } catch {
      return null
    }
  }

  /**
   * Cancela um pagamento PIX
   */
  async cancelPayment(paymentId: string): Promise<boolean> {
    try {
      const supabase = createClient()
      await supabase.from('payments').update({ status: 'cancelled' }).eq('id', paymentId)
      return true
    } catch {
      return false
    }
  }

  /**
   * Processa pagamento em carteira digital
   */
  async processWalletPayment(rideId: string, userId: string, amount: number): Promise<boolean> {
    const supabase = createClient()

    try {
      // Verificar saldo via RPC (fonte principal) ou cálculo via transações (fallback)
      let balance = 0
      const { data: rpcBalance } = await supabase.rpc('calculate_wallet_balance', { p_user_id: userId })
      if (typeof rpcBalance === 'number') {
        balance = rpcBalance
      } else {
        const { data: wallet } = await supabase.from('user_wallets').select('balance').eq('user_id', userId).single()
        balance = wallet?.balance ?? 0
      }

      if (balance < amount) return false

      // Debitar via wallet API para garantir consistência do saldo em user_wallets
      const res = await fetch('/api/v1/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          type: 'debit',
          description: 'Pagamento de corrida',
          reference_id: rideId,
          reference_type: 'ride',
        }),
      })

      if (!res.ok) return false

      // Atualizar corrida como paga
      await supabase
        .from('rides')
        .update({ payment_status: 'paid', payment_method: 'wallet' })
        .eq('id', rideId)

      // Registrar pagamento
      await supabase.from('payments').insert({
        ride_id: rideId,
        amount,
        payment_method: 'wallet',
        status: 'completed',
        paid_at: new Date().toISOString(),
      }).throwOnError().catch(() => {})

      return true
    } catch {
      return false
    }
  }
}

export const paymentService = new PaymentService()
