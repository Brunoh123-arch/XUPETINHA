'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, CheckCircle, XCircle, Clock, Camera, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Inspection {
  id: string
  vehicle_id: string
  passed: boolean
  checklist: Record<string, boolean>
  notes: string
  photos_urls: string[]
  inspected_at: string
}

const CHECKLIST_LABELS: Record<string, string> = {
  freios: 'Freios',
  pneus: 'Pneus',
  luzes: 'Luzes e Faróis',
  espelhos: 'Espelhos',
  cinto: 'Cintos de Segurança',
  ar_condicionado: 'Ar-condicionado',
  limpeza: 'Limpeza interna',
  extingidor: 'Extintor de incêndio',
  documentacao: 'Documentação no veículo',
  higiene: 'Higiene geral',
}

export default function VehicleInspectionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('driver_id', user.id)
        .single()

      if (!vehicle) { setLoading(false); return }

      const { data } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('inspected_at', { ascending: false })

      setInspections(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  const passedCount = (checklist: Record<string, boolean>) =>
    Object.values(checklist ?? {}).filter(Boolean).length
  const totalCount = (checklist: Record<string, boolean>) =>
    Object.keys(checklist ?? {}).length

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Inspeções do Veículo</h1>
            <p className="text-xs text-muted-foreground">Histórico de vistorias realizadas</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))
        ) : inspections.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">Nenhuma inspeção registrada</p>
            <p className="text-sm text-muted-foreground mt-1">As vistorias aparecerão aqui após realizadas</p>
          </div>
        ) : (
          inspections.map(insp => {
            const isOpen = expanded === insp.id
            const checklist = insp.checklist ?? {}
            const passed = passedCount(checklist)
            const total = totalCount(checklist)
            const date = new Date(insp.inspected_at).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short', year: 'numeric'
            })

            return (
              <div key={insp.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  className="w-full p-4 flex items-center gap-3 text-left"
                  onClick={() => setExpanded(isOpen ? null : insp.id)}
                >
                  {insp.passed
                    ? <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                    : <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{date}</span>
                      <Badge
                        className={`text-xs ${insp.passed ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}
                        variant="secondary"
                      >
                        {insp.passed ? 'Aprovado' : 'Reprovado'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {total > 0 ? `${passed}/${total} itens aprovados` : 'Sem checklist detalhado'}
                    </p>
                  </div>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  }
                </button>

                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 space-y-3">
                    {/* Checklist */}
                    {total > 0 && (
                      <div className="space-y-2 pt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Checklist</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {Object.entries(checklist).map(([key, ok]) => (
                            <div key={key} className="flex items-center gap-1.5">
                              {ok
                                ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                : <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                              }
                              <span className="text-xs text-foreground">
                                {CHECKLIST_LABELS[key] ?? key}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Observacoes */}
                    {insp.notes && (
                      <div className="pt-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Observações</p>
                        <p className="text-sm text-foreground bg-muted rounded-lg p-2">{insp.notes}</p>
                      </div>
                    )}

                    {/* Fotos */}
                    {Array.isArray(insp.photos_urls) && insp.photos_urls.length > 0 && (
                      <div className="pt-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          <Camera className="w-3 h-3 inline mr-1" />
                          Fotos ({insp.photos_urls.length})
                        </p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {insp.photos_urls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={url}
                                alt={`Foto ${idx + 1}`}
                                className="w-full aspect-square object-cover rounded-lg"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
