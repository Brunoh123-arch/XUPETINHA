'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Plus, Check, X, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SpecialRequest {
  id: string
  ride_id: string
  request_type: string
  details: string
  fulfilled: boolean
  created_at: string
}

const REQUEST_TYPES = [
  { key: 'silencio', label: 'Viagem em silêncio', icon: '🔇' },
  { key: 'ac', label: 'Ar-condicionado ligado', icon: '❄️' },
  { key: 'musica', label: 'Música ambiente', icon: '🎵' },
  { key: 'ajuda_bagagem', label: 'Ajuda com bagagem', icon: '🧳' },
  { key: 'pet', label: 'Viagem com pet', icon: '🐾' },
  { key: 'acessibilidade', label: 'Acessibilidade', icon: '♿' },
  { key: 'crianca', label: 'Cadeirinha para criança', icon: '👶' },
  { key: 'outro', label: 'Outro', icon: '💬' },
]

export default function SpecialRequestsPage() {
  const params = useParams()
  const router = useRouter()
  const rideId = params.id as string
  const supabase = createClient()

  const [requests, setRequests] = useState<SpecialRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchRequests() {
      const { data } = await supabase
        .from('ride_special_requests')
        .select('*')
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true })
      setRequests(data ?? [])
      setLoading(false)
    }
    fetchRequests()
  }, [rideId])

  async function handleSubmit() {
    if (!selectedType) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    const { data } = await supabase
      .from('ride_special_requests')
      .insert({
        ride_id: rideId,
        request_type: selectedType,
        details: details.trim() || REQUEST_TYPES.find(r => r.key === selectedType)?.label,
        fulfilled: false,
      })
      .select()
      .single()

    if (data) setRequests(prev => [...prev, data])
    setAdding(false)
    setSelectedType('')
    setDetails('')
    setSubmitting(false)
  }

  async function handleRemove(id: string) {
    await supabase.from('ride_special_requests').delete().eq('id', id)
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const labelFor = (type: string) =>
    REQUEST_TYPES.find(r => r.key === type)?.label ?? type
  const iconFor = (type: string) =>
    REQUEST_TYPES.find(r => r.key === type)?.icon ?? '💬'

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Pedidos Especiais</h1>
            <p className="text-xs text-muted-foreground">Informe suas preferências ao motorista</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Lista de pedidos existentes */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 && !adding ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum pedido ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione preferências para sua viagem</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">{iconFor(req.request_type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{labelFor(req.request_type)}</p>
                  {req.details && req.details !== labelFor(req.request_type) && (
                    <p className="text-xs text-muted-foreground truncate">{req.details}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {req.fulfilled ? (
                    <Badge variant="default" className="bg-primary/10 text-primary text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Atendido
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Pendente</Badge>
                  )}
                  <button
                    onClick={() => handleRemove(req.id)}
                    className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario de adicionar */}
        {adding ? (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <p className="font-medium text-foreground text-sm">Escolha o tipo de pedido</p>
            <div className="grid grid-cols-2 gap-2">
              {REQUEST_TYPES.map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedType(type.key)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedType === type.key
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="text-xs text-left">{type.label}</span>
                </button>
              ))}
            </div>

            {selectedType === 'outro' && (
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Descreva seu pedido..."
                className="w-full border border-border rounded-xl p-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={3}
              />
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setAdding(false); setSelectedType(''); setDetails('') }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!selectedType || submitting}
              >
                {submitting ? 'Salvando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed border-2"
            onClick={() => setAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar pedido especial
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Os pedidos são visíveis ao motorista após aceitar a corrida
        </p>
      </div>
    </div>
  )
}
