'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { triggerHaptic } from '@/lib/utils/haptics'
import { PixModal } from '@/components/pix-modal'
import { paymentService } from '@/lib/services/payment-service'
import type { Ride } from '@/lib/types/database'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [ride, setRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [pixModal, setPixModal] = useState<{
    externalId: string
    qrCodeText: string
    qrCodeImage: string | null
    amountLabel: string
  } | null>(null)

  useEffect(() => {
    loadData()

    const channel = supabase
      .channel(`ride-payment-${params.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'rides',
        filter: `id=eq.${params.id}`,
      }, (payload) => {
        const updated = payload.new as Ride
        setRide(updated)
        if (updated.payment_status === 'paid') {
          iosToast.success('Pagamento confirmado!')
          triggerHaptic('heavy')
          setPixModal(null)
          setTimeout(() => router.push(`/uppi/ride/${params.id}/review`), 1500)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/welcome'); return }

      const [{ data: rideData }, walletRes] = await Promise.all([
        supabase.from('rides').select('*').eq('id', params.id as string).single(),
        fetch('/api/v1/wallet'),
      ])

      if (rideData) setRide(rideData)

      if (walletRes.ok) {
        const { balance } = await walletRes.json()
        setWalletBalance(typeof balance === 'number' ? balance : 0)
      }
    } finally {
      setLoading(false)
    }
  }

  /** Valor final da corrida — usa final_price se existir, senão passenger_price_offer */
  const rideAmount = (ride?.final_price ?? ride?.passenger_price_offer) || 0

  const handlePixPayment = async () => {
    if (!ride) return
    setProcessing(true)
    try {
      const result = await paymentService.createPixPayment({
        amount: Math.round(rideAmount * 100),
        description: `Corrida Uppi - ${ride.pickup_address} ate ${ride.dropoff_address}`,
        ride_id: ride.id,
      })
      if (result.success && result.qr_code_text) {
        triggerHaptic('medium')
        setPixModal({
          externalId: result.payment_id!,
          qrCodeText: result.qr_code_text,
          qrCodeImage: result.qr_code || null,
          amountLabel: formatCurrency(rideAmount),
        })
      } else {
        iosToast.error(result.error || 'Erro ao gerar PIX')
      }
    } catch {
      iosToast.error('Erro ao processar pagamento')
    } finally {
      setProcessing(false)
    }
  }

  const handleWalletPayment = async () => {
    if (!ride) return
    if (walletBalance < rideAmount) {
      iosToast.error('Saldo insuficiente na carteira')
      return
    }
    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { iosToast.error('Sessao expirada'); return }
      const success = await paymentService.processWalletPayment(ride.id, user.id, rideAmount)
      if (success) {
        triggerHaptic('success')
        iosToast.success('Pagamento confirmado!')
        setTimeout(() => router.push(`/uppi/ride/${params.id}/review`), 1500)
      } else {
        iosToast.error('Erro ao debitar da carteira')
      }
    } catch {
      iosToast.error('Erro ao processar pagamento')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-neutral-600 dark:text-neutral-400">Corrida não encontrada</p>
      </div>
    )
  }

  return (
    <>
      {/* PIX Modal — renderizado sobre a tela de seleção */}
      {pixModal && (
        <PixModal
          externalId={pixModal.externalId}
          qrCodeText={pixModal.qrCodeText}
          qrCodeImage={pixModal.qrCodeImage}
          amountLabel={pixModal.amountLabel}
          onClose={() => setPixModal(null)}
          onPaid={() => {
            setPixModal(null)
            triggerHaptic('success')
            iosToast.success('Pagamento confirmado!')
            setTimeout(() => router.push(`/uppi/ride/${params.id}/review`), 1500)
          }}
        />
      )}

      <div className="h-dvh bg-[color:var(--background)] overflow-y-auto ios-scroll">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[color:var(--card)]/90 ios-blur border-b border-[color:var(--border)] px-5 pt-safe-offset-4 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[color:var(--secondary)] ios-press"
            >
              <svg className="w-5 h-5 text-[color:var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-[22px] font-bold text-[color:var(--foreground)] tracking-tight">Pagamento</h1>
              <p className="text-[13px] text-[color:var(--muted-foreground)]">Escolha como pagar</p>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 max-w-lg mx-auto space-y-5 pb-safe-offset-8">
          {/* Resumo da corrida */}
          <div className="bg-[color:var(--card)] rounded-[20px] p-5 border border-[color:var(--border)]">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex flex-col items-center gap-0.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="w-px flex-1 min-h-[20px] bg-[color:var(--border)]" />
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[14px] text-[color:var(--foreground)] font-medium leading-snug">{ride?.pickup_address}</p>
                <p className="text-[14px] text-[color:var(--foreground)] font-medium leading-snug">{ride?.dropoff_address}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[color:var(--border)]">
              <span className="text-[15px] font-semibold text-[color:var(--foreground)]">Total</span>
              <span className="text-[26px] font-extrabold text-emerald-600 tracking-tight">
                {formatCurrency(rideAmount)}
              </span>
            </div>
          </div>

          {/* Opções de pagamento */}
          <div className="space-y-3">
            {/* PIX */}
            <button
              type="button"
              disabled={processing}
              onClick={handlePixPayment}
              className="w-full bg-[color:var(--card)] border border-[color:var(--border)] rounded-[18px] p-4 flex items-center gap-4 ios-press hover:border-teal-400 transition-colors disabled:opacity-60"
            >
              <div className="w-12 h-12 bg-teal-50 rounded-[14px] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.5 2a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5h2A1.5 1.5 0 0010 5.5v-2A1.5 1.5 0 008.5 2h-2zm0 8a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5h2a1.5 1.5 0 001.5-1.5v-2A1.5 1.5 0 008.5 10h-2zm7.5-8a1.5 1.5 0 00-1.5 1.5v2A1.5 1.5 0 0014 5.5v-2A1.5 1.5 0 0012.5 2H14v-.001zM14 2h2.5A1.5 1.5 0 0118 3.5v2A1.5 1.5 0 0116.5 7h-2A1.5 1.5 0 0113 5.5v-2A1.5 1.5 0 0114.5 2H14zM14 10a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5h2.5a1.5 1.5 0 001.5-1.5v-2A1.5 1.5 0 0016.5 10H14z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[16px] font-bold text-[color:var(--foreground)]">PIX</p>
                <p className="text-[13px] text-[color:var(--muted-foreground)]">Pagamento instantaneo</p>
              </div>
              {processing ? (
                <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-[color:var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>

            {/* Carteira */}
            <button
              type="button"
              disabled={processing || walletBalance < rideAmount}
              onClick={handleWalletPayment}
              className="w-full bg-[color:var(--card)] border border-[color:var(--border)] rounded-[18px] p-4 flex items-center gap-4 ios-press hover:border-emerald-400 transition-colors disabled:opacity-50"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-[14px] flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[16px] font-bold text-[color:var(--foreground)]">Carteira Uppi</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[13px] text-emerald-600 font-semibold">
                    Saldo: {formatCurrency(walletBalance)}
                  </p>
                  {walletBalance < rideAmount && (
                    <span className="text-[11px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-100">
                      Insuficiente
                    </span>
                  )}
                </div>
              </div>
              <svg className="w-5 h-5 text-[color:var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </main>
      </div>
    </>
  )
}
