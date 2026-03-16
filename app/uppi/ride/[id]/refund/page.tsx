'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft, RotateCcw, DollarSign, AlertCircle,
  CheckCircle2, Clock, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const REASONS = [
  { value: 'overcharge', label: 'Cobrança incorreta', desc: 'Valor maior do que o esperado' },
  { value: 'cancelled_ride', label: 'Corrida cancelada', desc: 'Pagamento feito mas corrida não ocorreu' },
  { value: 'driver_no_show', label: 'Motorista não apareceu', desc: 'Fui cobrado mas o motorista não chegou' },
  { value: 'route_deviation', label: 'Rota diferente', desc: 'Motorista tomou rota muito mais longa' },
  { value: 'double_charge', label: 'Cobrança duplicada', desc: 'Fui cobrado duas vezes pela mesma corrida' },
  { value: 'technical_error', label: 'Erro técnico', desc: 'Problema no app durante o pagamento' },
  { value: 'other', label: 'Outro motivo', desc: 'Descreva o que aconteceu' },
]

interface Ride {
  id: string
  status: string
  fare: number
  created_at: string
  origin_address: string
  destination_address: string
  payment?: { id: string; amount: number; method: string | null; status: string } | null
}

export default function RideRefundPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const rideId = params.id as string

  const [ride, setRide] = useState<Ride | null>(null)
  const [loading, setLoading] = useState(true)
  const [existingRefund, setExistingRefund] = useState<{ status: string } | null>(null)
  const [step, setStep] = useState<'reason' | 'details' | 'success'>('reason')
  const [selectedReason, setSelectedReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ data: rideData }, { data: refundData }] = await Promise.all([
        supabase
          .from('rides')
          .select('id, status, fare, created_at, origin_address, destination_address, payment:payments(id, amount, method, status)')
          .eq('id', rideId)
          .single(),
        supabase
          .from('refunds')
          .select('status')
          .eq('ride_id', rideId)
          .maybeSingle(),
      ])

      setRide(rideData as Ride | null)
      setExistingRefund(refundData)
      setLoading(false)
    }
    load()
  }, [rideId])

  const handleSubmit = async () => {
    if (!selectedReason || !ride) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payment = Array.isArray(ride.payment) ? ride.payment[0] : ride.payment
    const amount = payment?.amount ?? ride.fare ?? 0
    const reason = `${REASONS.find(r => r.value === selectedReason)?.label}${details ? ': ' + details : ''}`

    await supabase.from('refunds').insert({
      user_id: user.id,
      ride_id: rideId,
      payment_id: payment?.id ?? null,
      amount,
      reason,
      status: 'pending',
    })

    setStep('success')
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground text-center">Corrida não encontrada.</p>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          Voltar
        </button>
      </div>
    )
  }

  const payment = Array.isArray(ride.payment) ? ride.payment[0] : ride.payment
  const amount = payment?.amount ?? ride.fare ?? 0

  if (existingRefund) {
    const STATUS = {
      pending: { icon: Clock, label: 'Solicitação Recebida', color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Estamos analisando sua solicitação. Em até 5 dias úteis você receberá uma resposta.' },
      processing: { icon: RotateCcw, label: 'Em Processamento', color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Seu reembolso está sendo processado pelo time financeiro.' },
      refunded: { icon: CheckCircle2, label: 'Reembolso Realizado', color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: `R$ ${Number(amount).toFixed(2)} foram devolvidos ao seu método de pagamento.` },
      failed: { icon: AlertCircle, label: 'Solicitação Negada', color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Infelizmente não foi possível aprovar este reembolso. Entre em contato com o suporte.' },
    }
    const cfg = STATUS[existingRefund.status as keyof typeof STATUS] || STATUS.pending
    const Icon = cfg.icon

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-10 bg-background border-b border-border flex items-center px-4 py-3 gap-3">
          <button type="button" onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-base">Status do Reembolso</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className={cn('w-20 h-20 rounded-2xl flex items-center justify-center', cfg.bg)}>
            <Icon className={cn('w-10 h-10', cfg.color)} />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">{cfg.label}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{cfg.desc}</p>
          </div>
          <div className="w-full max-w-xs bg-card rounded-2xl border border-border p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-bold text-emerald-500">R$ {Number(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Corrida</span>
              <span className="font-medium">{new Date(ride.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm w-full max-w-xs">
            Voltar para a corrida
          </button>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Solicitação Enviada</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Recebemos sua solicitação de reembolso de{' '}
            <strong>R$ {Number(amount).toFixed(2)}</strong>.
            Em até 5 dias úteis você receberá uma resposta.
          </p>
        </div>
        <button type="button" onClick={() => router.push('/uppi/history')} className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm w-full max-w-xs">
          Ver minhas corridas
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b border-border flex items-center px-4 py-3 gap-3">
        <button type="button" onClick={() => step === 'details' ? setStep('reason') : router.back()} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-base">Solicitar Reembolso</span>
        <div className="ml-auto flex items-center gap-1">
          {['reason', 'details'].map((s, i) => (
            <div key={s} className={cn('w-2 h-2 rounded-full transition-colors', step === s ? 'bg-primary' : i < ['reason', 'details'].indexOf(step) ? 'bg-primary/40' : 'bg-muted')} />
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 max-w-lg mx-auto w-full">

        {/* Ride info */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{new Date(ride.created_at).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
              <p className="text-muted-foreground text-xs truncate">{ride.origin_address} → {ride.destination_address}</p>
            </div>
            <p className="font-bold text-emerald-500 shrink-0">R$ {Number(amount).toFixed(2)}</p>
          </div>
        </div>

        {step === 'reason' ? (
          <div className="space-y-3">
            <h2 className="font-bold text-base">Qual o motivo do reembolso?</h2>
            <div className="space-y-2">
              {REASONS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setSelectedReason(r.value)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all',
                    selectedReason === r.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30'
                  )}
                >
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors', selectedReason === r.value ? 'border-primary' : 'border-muted-foreground/30')}>
                    {selectedReason === r.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{r.label}</p>
                    <p className="text-muted-foreground text-xs">{r.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-bold text-base">Detalhes adicionais</h2>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Motivo selecionado</p>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <p className="font-semibold text-sm text-primary">{REASONS.find(r => r.value === selectedReason)?.label}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Descreva o que aconteceu <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Quanto mais detalhes você fornecer, mais rápido poderemos resolver..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-border bg-card text-sm resize-none outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Após enviar, nossa equipe analisará a solicitação em até <strong>5 dias úteis</strong>. O reembolso será feito pelo mesmo método de pagamento utilizado.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        {step === 'reason' ? (
          <button
            type="button"
            disabled={!selectedReason}
            onClick={() => setStep('details')}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 transition-opacity"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Enviando...</>
            ) : 'Enviar Solicitação de Reembolso'}
          </button>
        )}
      </div>
    </div>
  )
}
