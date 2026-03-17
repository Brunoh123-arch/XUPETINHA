'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Shield, AlertTriangle, CheckCircle, FileText, Upload } from 'lucide-react'

interface Insurance {
  id: string
  policy_number: string
  coverage_amount: number
  status: string
  starts_at: string
  ends_at: string
}

interface Claim {
  id: string
  amount: number
  description: string
  status: string
  created_at: string
}

export default function RideInsurancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rideId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [insurance, setInsurance] = useState<Insurance | null>(null)
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimDesc, setClaimDesc] = useState('')
  const [claimAmount, setClaimAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [insRes, claimsRes] = await Promise.all([
        supabase.from('trip_insurance').select('*').eq('ride_id', rideId).eq('passenger_id', user.id).single(),
        supabase.from('insurance_claims').select('*').eq('ride_id', rideId).eq('claimant_id', user.id).order('created_at', { ascending: false }),
      ])
      if (insRes.data) setInsurance(insRes.data)
      if (claimsRes.data) setClaims(claimsRes.data)
      setLoading(false)
    }
    load()
  }, [rideId])

  const submitClaim = async () => {
    if (!claimDesc.trim() || !claimAmount) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('insurance_claims').insert({
      ride_id: rideId,
      claimant_id: user.id,
      amount: Number(claimAmount),
      description: claimDesc,
      status: 'pending',
    }).select().single()
    if (data) setClaims(prev => [data, ...prev])
    setClaimDesc('')
    setClaimAmount('')
    setShowClaimForm(false)
    setSubmitting(false)
  }

  const STATUS_MAP: Record<string, { label: string, color: string }> = {
    active: { label: 'Ativo', color: 'bg-green-100 text-green-700' },
    expired: { label: 'Expirado', color: 'bg-muted text-muted-foreground' },
    claimed: { label: 'Acionado', color: 'bg-blue-100 text-blue-700' },
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Negado', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-lg">Seguro da Viagem</h1>
            <p className="text-xs text-muted-foreground">Protecao durante o trajeto</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="p-4 space-y-5">

          {insurance ? (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Seguro Ativo</p>
                  <p className="text-xs text-muted-foreground">Apolice #{insurance.policy_number}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[insurance.status]?.color || 'bg-muted'}`}>
                  {STATUS_MAP[insurance.status]?.label || insurance.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Cobertura</p>
                  <p className="font-bold text-foreground">R$ {Number(insurance.coverage_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Validade</p>
                  <p className="font-medium text-foreground">{new Date(insurance.ends_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Cobertura inclui acidente pessoal, roubo de pertences dentro do veiculo e danos causados durante a viagem.</p>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <Shield size={36} className="text-muted-foreground mx-auto mb-2" />
              <p className="font-medium text-foreground">Sem seguro para esta corrida</p>
              <p className="text-sm text-muted-foreground mt-1">Esta viagem nao possui seguro contratado</p>
            </div>
          )}

          {/* Acionar seguro */}
          {insurance && insurance.status === 'active' && (
            <button
              onClick={() => setShowClaimForm(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-destructive/50 text-destructive rounded-xl text-sm font-medium hover:bg-destructive/5 transition-colors"
            >
              <AlertTriangle size={16} />
              Acionar Seguro
            </button>
          )}

          {showClaimForm && (
            <div className="bg-card rounded-xl border border-destructive/30 p-4 space-y-3">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle size={16} className="text-destructive" />
                Relatar Incidente
              </h2>
              <textarea
                value={claimDesc}
                onChange={e => setClaimDesc(e.target.value)}
                placeholder="Descreva o que aconteceu em detalhes..."
                rows={4}
                className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <input
                    type="number"
                    value={claimAmount}
                    onChange={e => setClaimAmount(e.target.value)}
                    placeholder="Valor do prejuizo"
                    className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground outline-none"
                  />
                </div>
                <button className="px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground flex items-center gap-1">
                  <Upload size={14} />
                  Fotos
                </button>
              </div>
              <button
                onClick={submitClaim}
                disabled={submitting}
                className="w-full bg-destructive text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-60"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitacao'}
              </button>
            </div>
          )}

          {claims.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Solicitacoes Anteriores
              </h2>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {claims.map(c => (
                  <div key={c.id} className="p-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm text-foreground line-clamp-2">{c.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-bold text-foreground">R$ {Number(c.amount).toFixed(2)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MAP[c.status]?.color || 'bg-muted'}`}>
                        {STATUS_MAP[c.status]?.label || c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
