'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { cn } from '@/lib/utils'
import { BarChart3, MapPin, Clock, Ban, TrendingUp, RefreshCw, Plus, Trash2, Check, X } from 'lucide-react'

interface GeoZone {
  id: string
  name: string
  type: string
  city: string
  metadata: Record<string, unknown>
  created_at: string
}
interface ZoneStat {
  id: string
  zone_id: string
  date: string
  total_rides: number
  total_revenue: number
  avg_wait_time_sec: number
  avg_fare: number
  active_drivers: number
  demand_score: number
}
interface ZoneRestriction {
  id: string
  zone_id: string
  restriction_type: string
  value: string
  reason: string
  starts_at: string
  ends_at: string
}
interface ZoneAvailability {
  id: string
  zone_id: string
  day_of_week: number
  hour_start: number
  hour_end: number
  is_available: boolean
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const TABS = ['Zonas Geograficas', 'Estatisticas', 'Restricoes', 'Disponibilidade']

export default function AdminGeoZonesPage() {
  const supabase = createClient()
  const [tab, setTab] = useState(0)
  const [zones, setZones] = useState<GeoZone[]>([])
  const [stats, setStats] = useState<ZoneStat[]>([])
  const [restrictions, setRestrictions] = useState<ZoneRestriction[]>([])
  const [availability, setAvailability] = useState<ZoneAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newZone, setNewZone] = useState({ name: '', type: 'general', city: '' })
  const [newRestriction, setNewRestriction] = useState({ zone_id: '', restriction_type: '', value: '', reason: '', starts_at: '', ends_at: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [z, s, r, a] = await Promise.all([
      supabase.from('geographic_zones').select('*').order('city'),
      supabase.from('zone_stats').select('*').order('date', { ascending: false }).limit(100),
      supabase.from('zone_restrictions').select('*').order('starts_at', { ascending: false }),
      supabase.from('zone_availability').select('*').order('day_of_week'),
    ])
    setZones(z.data || [])
    setStats(s.data || [])
    setRestrictions(r.data || [])
    setAvailability(a.data || [])
    setLoading(false)
  }

  async function createZone() {
    if (!newZone.name || !newZone.city) return
    await supabase.from('geographic_zones').insert({ ...newZone, metadata: {} })
    setNewZone({ name: '', type: 'general', city: '' })
    setShowForm(false)
    fetchAll()
  }

  async function deleteZone(id: string) {
    await supabase.from('geographic_zones').delete().eq('id', id)
    fetchAll()
  }

  async function createRestriction() {
    if (!newRestriction.zone_id || !newRestriction.restriction_type) return
    await supabase.from('zone_restrictions').insert(newRestriction)
    setNewRestriction({ zone_id: '', restriction_type: '', value: '', reason: '', starts_at: '', ends_at: '' })
    fetchAll()
  }

  async function deleteRestriction(id: string) {
    await supabase.from('zone_restrictions').delete().eq('id', id)
    fetchAll()
  }

  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    z.city.toLowerCase().includes(search.toLowerCase())
  )

  // Aggregate stats por zone
  const statsMap: Record<string, ZoneStat> = {}
  for (const s of stats) {
    if (!statsMap[s.zone_id]) statsMap[s.zone_id] = s
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Zonas Geograficas" subtitle="Cobertura, restricoes e estatisticas por zona" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg w-fit">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={cn('px-4 py-2 rounded-md text-sm font-medium transition-all',
                tab === i ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
            >{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : (
          <>
            {/* Tab 0 — Zonas */}
            {tab === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nome ou cidade..."
                    className="flex-1 bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" /> Nova Zona
                  </button>
                </div>

                {showForm && (
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">Nova Zona Geografica</p>
                    <div className="grid grid-cols-3 gap-3">
                      <input value={newZone.name} onChange={e => setNewZone(p => ({ ...p, name: e.target.value }))}
                        placeholder="Nome da zona" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground col-span-1" />
                      <input value={newZone.city} onChange={e => setNewZone(p => ({ ...p, city: e.target.value }))}
                        placeholder="Cidade" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground col-span-1" />
                      <select value={newZone.type} onChange={e => setNewZone(p => ({ ...p, type: e.target.value }))}
                        className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground col-span-1">
                        {['general','airport','downtown','suburb','mall','hospital','university','stadium'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={createZone} className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm">
                        <Check className="w-3.5 h-3.5" /> Criar
                      </button>
                      <button onClick={() => setShowForm(false)} className="flex items-center gap-1 bg-muted text-foreground px-3 py-1.5 rounded-lg text-sm">
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredZones.map(zone => {
                    const s = statsMap[zone.id]
                    return (
                      <div key={zone.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{zone.name}</p>
                              <p className="text-xs text-muted-foreground">{zone.city} · {zone.type}</p>
                            </div>
                          </div>
                          <button onClick={() => deleteZone(zone.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {s && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted/20 rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">Corridas</p>
                              <p className="text-sm font-bold text-foreground">{s.total_rides.toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="bg-muted/20 rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">Receita</p>
                              <p className="text-sm font-bold text-foreground">R$ {Number(s.total_revenue).toFixed(0)}</p>
                            </div>
                            <div className="bg-muted/20 rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">Espera</p>
                              <p className="text-sm font-bold text-foreground">{Math.round(s.avg_wait_time_sec / 60)}min</p>
                            </div>
                            <div className="bg-muted/20 rounded-lg p-2 text-center">
                              <p className="text-xs text-muted-foreground">Demanda</p>
                              <p className={cn('text-sm font-bold', Number(s.demand_score) > 7 ? 'text-emerald-400' : 'text-foreground')}>
                                {Number(s.demand_score).toFixed(1)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {filteredZones.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">Nenhuma zona encontrada</div>
                )}
              </div>
            )}

            {/* Tab 1 — Estatisticas */}
            {tab === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Corridas', value: stats.reduce((a, s) => a + s.total_rides, 0).toLocaleString('pt-BR'), icon: TrendingUp },
                    { label: 'Receita Total', value: `R$ ${stats.reduce((a, s) => a + Number(s.total_revenue), 0).toFixed(0)}`, icon: BarChart3 },
                    { label: 'Ticket Medio', value: `R$ ${(stats.reduce((a, s) => a + Number(s.avg_fare), 0) / (stats.length || 1)).toFixed(2)}`, icon: BarChart3 },
                    { label: 'Zonas Ativas', value: zones.length, icon: MapPin },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20 border-b border-border">
                      <tr>
                        {['Zona','Data','Corridas','Receita','Espera (min)','Motoristas','Demanda'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.slice(0, 50).map(s => {
                        const zone = zones.find(z => z.id === s.zone_id)
                        return (
                          <tr key={s.id} className="border-b border-border/50 hover:bg-muted/10">
                            <td className="px-4 py-3 font-medium text-foreground">{zone?.name || s.zone_id.slice(0, 8)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{new Date(s.date).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-3 text-foreground">{s.total_rides.toLocaleString('pt-BR')}</td>
                            <td className="px-4 py-3 text-foreground">R$ {Number(s.total_revenue).toFixed(2)}</td>
                            <td className="px-4 py-3 text-foreground">{Math.round(s.avg_wait_time_sec / 60)}</td>
                            <td className="px-4 py-3 text-foreground">{s.active_drivers}</td>
                            <td className="px-4 py-3">
                              <span className={cn('font-bold', Number(s.demand_score) > 7 ? 'text-emerald-400' : 'text-foreground')}>
                                {Number(s.demand_score).toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {stats.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Sem estatisticas registradas</p>}
                </div>
              </div>
            )}

            {/* Tab 2 — Restricoes */}
            {tab === 2 && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Nova Restricao</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <select value={newRestriction.zone_id} onChange={e => setNewRestriction(p => ({ ...p, zone_id: e.target.value }))}
                      className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                      <option value="">Selecionar zona</option>
                      {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                    <input value={newRestriction.restriction_type} onChange={e => setNewRestriction(p => ({ ...p, restriction_type: e.target.value }))}
                      placeholder="Tipo (no_rides, limited, etc)" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    <input value={newRestriction.reason} onChange={e => setNewRestriction(p => ({ ...p, reason: e.target.value }))}
                      placeholder="Motivo" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    <input type="datetime-local" value={newRestriction.starts_at} onChange={e => setNewRestriction(p => ({ ...p, starts_at: e.target.value }))}
                      className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    <input type="datetime-local" value={newRestriction.ends_at} onChange={e => setNewRestriction(p => ({ ...p, ends_at: e.target.value }))}
                      className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    <button onClick={createRestriction} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary/90">
                      Adicionar Restricao
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {restrictions.map(r => {
                    const zone = zones.find(z => z.id === r.zone_id)
                    const now = new Date()
                    const active = new Date(r.starts_at) <= now && (!r.ends_at || new Date(r.ends_at) >= now)
                    return (
                      <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', active ? 'bg-destructive/10' : 'bg-muted/30')}>
                            <Ban className={cn('w-4 h-4', active ? 'text-destructive' : 'text-muted-foreground')} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{zone?.name || 'Zona desconhecida'} — {r.restriction_type}</p>
                            <p className="text-xs text-muted-foreground">{r.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(r.starts_at).toLocaleString('pt-BR')} → {r.ends_at ? new Date(r.ends_at).toLocaleString('pt-BR') : 'Indefinido'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', active ? 'bg-destructive/10 text-destructive' : 'bg-muted/30 text-muted-foreground')}>
                            {active ? 'Ativa' : 'Inativa'}
                          </span>
                          <button onClick={() => deleteRestriction(r.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {restrictions.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Sem restricoes cadastradas</p>}
                </div>
              </div>
            )}

            {/* Tab 3 — Disponibilidade */}
            {tab === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Horarios de disponibilidade por zona e dia da semana</p>
                {zones.map(zone => {
                  const av = availability.filter(a => a.zone_id === zone.id)
                  return (
                    <div key={zone.id} className="bg-card border border-border rounded-xl p-4">
                      <p className="text-sm font-semibold text-foreground mb-3">{zone.name} — {zone.city}</p>
                      <div className="grid grid-cols-7 gap-1">
                        {DAYS.map((day, di) => {
                          const slots = av.filter(a => a.day_of_week === di)
                          const available = slots.some(a => a.is_available)
                          return (
                            <div key={day} className={cn('rounded-lg p-2 text-center', available ? 'bg-emerald-500/10' : 'bg-muted/20')}>
                              <p className="text-xs font-medium text-muted-foreground">{day}</p>
                              {slots.length > 0 ? (
                                slots.map(s => (
                                  <p key={s.id} className={cn('text-xs mt-1', s.is_available ? 'text-emerald-400' : 'text-muted-foreground')}>
                                    {s.hour_start}h-{s.hour_end}h
                                  </p>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground mt-1">—</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {zones.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma zona cadastrada</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
