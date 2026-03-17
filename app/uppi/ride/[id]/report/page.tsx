'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'

const REPORT_TYPES = [
  { key: 'harassment', label: 'Assedio ou ameaca', icon: '⚠️', desc: 'Comportamento intimidador, assedio verbal ou fisico' },
  { key: 'dangerous_driving', label: 'Direcao perigosa', icon: '🚗', desc: 'Alta velocidade, manobras arriscadas, ignorou sinais' },
  { key: 'fraud', label: 'Fraude ou cobranca indevida', icon: '💰', desc: 'Valor cobrado incorretamente ou diferente do acordado' },
  { key: 'inappropriate', label: 'Comportamento inapropriado', icon: '🚫', desc: 'Conteudo inadequado, linguagem ofensiva' },
  { key: 'other', label: 'Outro motivo', icon: '📝', desc: 'Descreva o que aconteceu' },
] as const

type ReportType = typeof REPORT_TYPES[number]['key']

export default function ReportPage() {
  const router = useRouter()
  const params = useParams()
  const rideId = params.id as string
  const supabase = createClient()

  const [step, setStep] = useState<'type' | 'detail' | 'done'>('type')
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!selectedType || !description.trim()) return
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    // Busca o outro usuário da corrida
    const { data: ride } = await supabase
      .from('rides')
      .select('driver_id, passenger_id')
      .eq('id', rideId)
      .single()

    const againstUser = ride
      ? (ride.passenger_id === user.id ? ride.driver_id : ride.passenger_id)
      : null

    await supabase.from('user_reports').insert({
      reporter_id: user.id,
      reported_user_id: againstUser,
      ride_id: rideId,
      type: selectedType,
      description: description.trim(),
    })

    setSubmitting(false)
    setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={36} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Denuncia enviada</h2>
        <p className="text-muted-foreground text-sm mb-8">
          Agradecemos seu relato. Nossa equipe de seguranca analisara a situacao em ate 24 horas.
        </p>
        <button
          onClick={() => router.push('/uppi')}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-semibold"
        >
          Voltar ao inicio
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => step === 'detail' ? setStep('type') : router.back()}
            className="p-2 rounded-full bg-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground">Denunciar</h1>
        </div>
        <div className="ml-11">
          <div className="flex gap-2 mt-2">
            {['type', 'detail'].map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${step === s || (step === 'detail' && i === 0) ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Passo 1: Tipo */}
        {step === 'type' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">O que aconteceu nessa corrida?</p>
            {REPORT_TYPES.map(type => (
              <button
                key={type.key}
                onClick={() => { setSelectedType(type.key); setStep('detail') }}
                className="w-full bg-card rounded-2xl p-4 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Passo 2: Detalhes */}
        {step === 'detail' && selectedType && (
          <div className="space-y-4">
            <div className="bg-muted rounded-2xl p-3 flex items-center gap-3">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-foreground">
                {REPORT_TYPES.find(t => t.key === selectedType)?.label}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Descreva o ocorrido</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Conte com detalhes o que aconteceu. Suas informacoes nos ajudam a manter a plataforma segura..."
                rows={6}
                className="w-full bg-card rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{description.length} / 500 caracteres</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Sua denuncia e anonima para o motorista/passageiro. Apenas nossa equipe de seguranca terá acesso.
              </p>
            </div>

            <button
              onClick={submit}
              disabled={!description.trim() || submitting}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar denuncia'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
