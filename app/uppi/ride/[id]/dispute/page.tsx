'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { iosToast } from '@/lib/utils/ios-toast'

const DISPUTE_TYPES = [
  { key: 'overcharge', label: 'Cobrança indevida', desc: 'O valor cobrado foi diferente do estimado' },
  { key: 'route_deviation', label: 'Desvio de rota', desc: 'O motorista tomou um caminho diferente' },
  { key: 'driver_behavior', label: 'Comportamento do motorista', desc: 'Motorista foi rude, abusivo ou inadequado' },
  { key: 'vehicle_issue', label: 'Problema com o veículo', desc: 'Carro sujo, perigoso ou diferente do cadastrado' },
  { key: 'other', label: 'Outro problema', desc: 'Descreva o que aconteceu' },
]

export default function RideDisputePage() {
  const { id: rideId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!type) { iosToast.error('Selecione o tipo de problema'); return }
    if (description.length < 20) { iosToast.error('Descreva o problema com mais detalhes (mín. 20 caracteres)'); return }

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('ride_disputes').insert({
        ride_id: rideId,
        raised_by: user.id,
        type,
        description,
        status: 'open',
      })

      if (error) throw error
      setSubmitted(true)
    } catch {
      iosToast.error('Erro ao enviar disputa. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-dvh overflow-y-auto bg-[#F2F2F7] dark:bg-black pb-10 ios-scroll">
      <header className="bg-white/80 dark:bg-black/80 ios-blur-heavy border-b border-black/[0.08] dark:border-white/[0.08] sticky top-0 z-20">
        <div className="px-5 pt-safe-offset-4 pb-4 flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/60 ios-press">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Reportar Problema</h1>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto">
        {submitted ? (
          <div className="text-center py-10 space-y-4 animate-ios-fade-up">
            <div className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[22px] font-bold text-foreground mb-2">Recebemos sua disputa</p>
              <p className="text-[15px] text-muted-foreground">Nossa equipe irá analisar o caso em até 48 horas e você será notificado por SMS ou email.</p>
            </div>
            <div className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[20px] p-5 border border-black/[0.04] dark:border-white/[0.08] text-left space-y-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-[14px] text-foreground">Analise em até 48h</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-[14px] text-foreground">Notificação por app e email</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-[14px] text-foreground">Reembolso automático se aprovado</p>
              </div>
            </div>
            <button type="button" onClick={() => router.push('/uppi/home')} className="w-full h-[54px] bg-blue-500 text-white font-bold text-[17px] rounded-[18px] ios-press shadow-lg shadow-blue-500/20 mt-4">
              Ir para o início
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Aviso */}
            <div className="flex items-start gap-3 bg-amber-500/10 rounded-[16px] p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-[13px] text-amber-600 dark:text-amber-400">Só abra uma disputa se de fato houve um problema. Disputas falsas podem resultar em suspensão da conta.</p>
            </div>

            {/* Tipo do problema */}
            <div>
              <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Qual foi o problema?</p>
              <div className="space-y-2">
                {DISPUTE_TYPES.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    className={`w-full px-4 py-4 rounded-[18px] border text-left flex items-center gap-3 ios-press transition-colors ${
                      type === t.key
                        ? 'bg-blue-500/10 border-blue-500/40'
                        : 'bg-white/90 dark:bg-[#1C1C1E]/90 border-black/[0.04] dark:border-white/[0.08]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      type === t.key ? 'border-blue-500 bg-blue-500' : 'border-border'
                    }`}>
                      {type === t.key && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground">{t.label}</p>
                      <p className="text-[12px] text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2 px-1">Descreva o que aconteceu *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explique com detalhes o que ocorreu durante a corrida..."
                rows={5}
                className="w-full px-4 py-3.5 rounded-[18px] bg-white/90 dark:bg-[#1C1C1E]/90 border border-black/[0.04] dark:border-white/[0.08] text-foreground text-[14px] placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <p className="text-[11px] text-muted-foreground px-1 mt-1">{description.length}/500 caracteres</p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !type || description.length < 20}
              className="w-full h-[54px] bg-blue-500 text-white font-bold text-[17px] rounded-[18px] ios-press shadow-lg shadow-blue-500/20 disabled:opacity-40"
            >
              {submitting ? 'Enviando...' : 'Enviar Disputa'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
