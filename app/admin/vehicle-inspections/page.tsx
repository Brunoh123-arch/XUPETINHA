'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/client'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, CheckCircle, XCircle, Eye, Camera, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface VehicleInspection {
  id: string
  vehicle_id: string
  inspector_id: string | null
  passed: boolean
  checklist: Record<string, boolean>
  notes: string
  photos_urls: string[]
  inspected_at: string
}

const CHECKLIST_LABELS: Record<string, string> = {
  freios: 'Freios', pneus: 'Pneus', luzes: 'Luzes',
  espelhos: 'Espelhos', cinto: 'Cintos', ar_condicionado: 'Ar-cond.',
  limpeza: 'Limpeza', extingidor: 'Extintor', documentacao: 'Docs', higiene: 'Higiene',
}

export default function AdminVehicleInspectionsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [inspections, setInspections] = useState<VehicleInspection[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<VehicleInspection | null>(null)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('vehicle_inspections')
        .select('*')
        .order('inspected_at', { ascending: false })
        .limit(100)
      setInspections(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  async function handleApprove(id: string) {
    await supabase.from('vehicle_inspections').update({ passed: true }).eq('id', id)
    setInspections(prev => prev.map(i => i.id === id ? { ...i, passed: true } : i))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, passed: true } : null)
  }

  async function handleReject(id: string) {
    await supabase.from('vehicle_inspections').update({ passed: false }).eq('id', id)
    setInspections(prev => prev.map(i => i.id === id ? { ...i, passed: false } : i))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, passed: false } : null)
  }

  const filtered = inspections.filter(i => {
    const matchFilter = filter === 'all' || (filter === 'passed' ? i.passed : !i.passed)
    const matchSearch = !search || i.vehicle_id.includes(search) || i.id.includes(search)
    return matchFilter && matchSearch
  })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
  const passedCount = (c: Record<string, boolean>) => Object.values(c ?? {}).filter(Boolean).length
  const totalCount = (c: Record<string, boolean>) => Object.keys(c ?? {}).length

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4 md:px-6">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Inspeções de Veículos</h1>
            <p className="text-xs text-muted-foreground">{inspections.length} inspeções registradas</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: inspections.length, color: 'text-foreground' },
            { label: 'Aprovadas', value: inspections.filter(i => i.passed).length, color: 'text-green-600' },
            { label: 'Reprovadas', value: inspections.filter(i => !i.passed).length, color: 'text-destructive' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID do veículo..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'passed', label: 'Aprovados' },
              { key: 'failed', label: 'Reprovados' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Lista */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))
            ) : filtered.map(insp => (
              <button
                key={insp.id}
                onClick={() => setSelected(insp)}
                className={`w-full bg-card border rounded-xl p-4 flex items-center gap-3 text-left transition-all hover:border-primary/30 ${
                  selected?.id === insp.id ? 'border-primary' : 'border-border'
                }`}
              >
                {insp.passed
                  ? <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                  : <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    Veículo: {insp.vehicle_id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-muted-foreground">{fmtDate(insp.inspected_at)}</p>
                  {totalCount(insp.checklist) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {passedCount(insp.checklist)}/{totalCount(insp.checklist)} itens ok
                    </p>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={insp.passed ? 'bg-green-500/10 text-green-600 text-xs' : 'bg-destructive/10 text-destructive text-xs'}
                >
                  {insp.passed ? 'Aprovado' : 'Reprovado'}
                </Badge>
              </button>
            ))}
          </div>

          {/* Detalhe */}
          {selected && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 self-start sticky top-24">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Detalhes da Inspeção</p>
                <Badge
                  variant="secondary"
                  className={selected.passed ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}
                >
                  {selected.passed ? 'Aprovado' : 'Reprovado'}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Veículo ID</p>
                <p className="text-sm font-mono text-foreground">{selected.vehicle_id}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Data da inspeção</p>
                <p className="text-sm text-foreground">{fmtDate(selected.inspected_at)}</p>
              </div>

              {totalCount(selected.checklist) > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Checklist</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(selected.checklist).map(([key, ok]) => (
                      <div key={key} className="flex items-center gap-1.5">
                        {ok
                          ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                        }
                        <span className="text-xs text-foreground">{CHECKLIST_LABELS[key] ?? key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-sm text-foreground bg-muted rounded-lg p-2">{selected.notes}</p>
                </div>
              )}

              {Array.isArray(selected.photos_urls) && selected.photos_urls.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    <Camera className="w-3 h-3 inline mr-1" />
                    Fotos
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {selected.photos_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover rounded-lg" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => handleReject(selected.id)}
                  disabled={!selected.passed}
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reprovar
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApprove(selected.id)}
                  disabled={selected.passed}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Aprovar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
