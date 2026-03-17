'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { cn } from '@/lib/utils'
import { MapPin, Star, TrendingUp, Plus, Trash2, RefreshCw, Search } from 'lucide-react'

interface PopularDestination {
  id: string
  name: string
  address: string
  category: string
  city: string
  image_url: string
  rides_count: number
  is_featured: boolean
  created_at: string
}

const CATEGORIES = ['airport', 'mall', 'stadium', 'hospital', 'university', 'hotel', 'downtown', 'other']
const CAT_LABEL: Record<string, string> = {
  airport: 'Aeroporto', mall: 'Shopping', stadium: 'Estadio',
  hospital: 'Hospital', university: 'Universidade', hotel: 'Hotel',
  downtown: 'Centro', other: 'Outro',
}
const CAT_COLOR: Record<string, string> = {
  airport: 'bg-blue-500/10 text-blue-400',
  mall: 'bg-violet-500/10 text-violet-400',
  stadium: 'bg-amber-500/10 text-amber-400',
  hospital: 'bg-red-500/10 text-red-400',
  university: 'bg-emerald-500/10 text-emerald-400',
  hotel: 'bg-cyan-500/10 text-cyan-400',
  downtown: 'bg-slate-500/10 text-slate-400',
  other: 'bg-muted/30 text-muted-foreground',
}

export default function AdminDestinationsPage() {
  const supabase = createClient()
  const [destinations, setDestinations] = useState<PopularDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [newDest, setNewDest] = useState({ name: '', address: '', category: 'airport', city: '', is_featured: false })

  useEffect(() => { fetchDestinations() }, [])

  async function fetchDestinations() {
    setLoading(true)
    const { data } = await supabase
      .from('popular_destinations')
      .select('*')
      .order('rides_count', { ascending: false })
    setDestinations(data || [])
    setLoading(false)
  }

  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from('popular_destinations').update({ is_featured: !current }).eq('id', id)
    fetchDestinations()
  }

  async function deleteDestination(id: string) {
    await supabase.from('popular_destinations').delete().eq('id', id)
    fetchDestinations()
  }

  async function createDestination() {
    if (!newDest.name || !newDest.address) return
    await supabase.from('popular_destinations').insert({ ...newDest, rides_count: 0 })
    setNewDest({ name: '', address: '', category: 'airport', city: '', is_featured: false })
    setShowForm(false)
    fetchDestinations()
  }

  const filtered = destinations.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.city.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || d.category === catFilter
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Destinos Populares" subtitle="Locais mais frequentes na plataforma" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Metricas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{destinations.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Destinos</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{destinations.filter(d => d.is_featured).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Em Destaque</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{destinations.reduce((sum, d) => sum + d.rides_count, 0).toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Corridas</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{new Set(destinations.map(d => d.city)).size}</p>
            <p className="text-xs text-muted-foreground mt-1">Cidades</p>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar destino ou cidade..."
              className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
            <option value="all">Todas categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Novo Destino
          </button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Novo Destino Popular</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={newDest.name} onChange={e => setNewDest(p => ({ ...p, name: e.target.value }))}
                placeholder="Nome do local" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
              <input value={newDest.city} onChange={e => setNewDest(p => ({ ...p, city: e.target.value }))}
                placeholder="Cidade" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
              <input value={newDest.address} onChange={e => setNewDest(p => ({ ...p, address: e.target.value }))}
                placeholder="Endereco completo" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground col-span-2" />
              <select value={newDest.category} onChange={e => setNewDest(p => ({ ...p, category: e.target.value }))}
                className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newDest.is_featured} onChange={e => setNewDest(p => ({ ...p, is_featured: e.target.checked }))}
                  className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground">Destaque na home</span>
              </label>
            </div>
            <button onClick={createDestination}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
              Adicionar Destino
            </button>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(dest => (
              <div key={dest.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', CAT_COLOR[dest.category] || 'bg-muted/20')}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{dest.name}</p>
                      {dest.is_featured && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full">
                          <Star className="w-2.5 h-2.5" /> Destaque
                        </span>
                      )}
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', CAT_COLOR[dest.category] || 'bg-muted/30 text-muted-foreground')}>
                        {CAT_LABEL[dest.category] || dest.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{dest.address} · {dest.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {dest.rides_count.toLocaleString('pt-BR')} corridas
                  </div>
                  <button onClick={() => toggleFeatured(dest.id, dest.is_featured)}
                    className={cn('p-1.5 rounded-lg transition-colors',
                      dest.is_featured ? 'text-amber-400 bg-amber-500/10' : 'text-muted-foreground hover:text-amber-400')}>
                    <Star className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteDestination(dest.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">Nenhum destino encontrado</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
