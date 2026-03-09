'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { Input } from '@/components/ui/input'
import {
  Zap, Plus, Trash2, RefreshCw, Check, AlertCircle,
  TrendingUp, MapPin, Clock, ToggleRight, ToggleLeft, Edit2, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SurgeZone {
  id: string
  zone_name: string
  zone_lat: number
  zone_lng: number
  radius_km: number
  multiplier: number
  reason: string | null
  active_from: string | null
  active_until: string | null
  days_of_week: number[]
  is_active: boolean
  demand_level: string
  auto_calculated: boolean
  created_at: string
  updated_at: string
}

const DEMAND_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low:       { bg: 'bg-slate-500/10',   text: 'text-slate-400',   label: 'Baixa' },
  normal:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    label: 'Normal' },
  high:      { bg: 'bg-amber-500/10',   text: 'text-amber-400',   label: 'Alta' },
  very_high: { bg: 'bg-orange-500/10',  text: 'text-orange-400',  label: 'Muito Alta' },
  extreme:   { bg: 'bg-red-500/10',     text: 'text-red-400',     label: 'Extrema' },
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const EMPTY: Partial<SurgeZone> = {
  zone_name: '', zone_lat: -23.5505, zone_lng: -46.6333,
  radius_km: 3, multiplier: 1.5, reason: '',
  active_from: null, active_until: null,
  days_of_week: [0,1,2,3,4,5,6], is_active: true, demand_level: 'high',
}

export default function SurgePricingPage() {
  const supabase = createClient()
  const [zones, setZones] = useState<SurgeZone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<SurgeZone>>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchZones = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('surge_pricing')
      .select('*')
      .order('multiplier', { ascending: false })
    setZones(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchZones()
    channelRef.current = supabase
      .channel('admin-surge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surge_pricing' }, fetchZones)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const handleSave = async () => {
    if (!form.zone_name?.trim()) { setError('Nome da zona é obrigatório'); return }
    if (!form.multiplier || form.multiplier < 1) { setError('Multiplicador mínimo é 1.0'); return }
    setSaving(true)
    setError('')
    const payload = {
      zone_name:    form.zone_name,
      zone_lat:     form.zone_lat || -23.5505,
      zone_lng:     form.zone_lng || -46.6333,
      radius_km:    form.radius_km || 3,
      multiplier:   form.multiplier,
      reason:       form.reason || null,
      active_from:  form.active_from || null,
      active_until: form.active_until || null,
      days_of_week: form.days_of_week || [0,1,2,3,4,5,6],
      is_active:    form.is_active ?? true,
      demand_level: form.demand_level || 'high',
    }
    if (editId) {
      await supabase.from('surge_pricing').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editId)
    } else {
      await supabase.from('surge_pricing').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY)
    fetchZones()
  }

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from('surge_pricing').update({ is_active: !current, updated_at: new Date().toISOString() }).eq('id', id)
    setZones(prev => prev.map(z => z.id === id ? { ...z, is_active: !current } : z))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover zona de surge?')) return
    await supabase.from('surge_pricing').delete().eq('id', id)
    setZones(prev => prev.filter(z => z.id !== id))
  }

  const handleEdit = (z: SurgeZone) => {
    setForm(z)
    setEditId(z.id)
    setShowForm(true)
  }

  const toggleDay = (d: number) => {
    setForm(prev => {
      const days = prev.days_of_week || []
      return {
        ...prev,
        days_of_week: days.includes(d) ? days.filter(x => x !== d) : [...days, d].sort(),
      }
    })
  }

  const activeCount  = zones.filter(z => z.is_active).length
  const avgMultiplier = zones.filter(z => z.is_active).reduce((s, z) => s + z.multiplier, 0) / (activeCount || 1)

  const headerActions = (
    <div className="flex items-center gap-2">
      <button type="button" onClick={fetchZones}
        className="w-8 h-8 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true) }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))] text-[12px] font-bold hover:opacity-90 transition-opacity">
        <Plus className="w-3.5 h-3.5" />
        Nova Zona
      </button>
    </div>
  )

  return (
    <>
      <AdminHeader
        title="Tarifa Dinâmica (Surge)"
        subtitle={`${zones.length} zonas configuradas — ${activeCount} ativas`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))] p-5">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Zonas Ativas',       value: activeCount,              color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Zap },
              { label: 'Zonas Inativas',     value: zones.length - activeCount, color: 'text-slate-400',  bg: 'bg-slate-500/10',  icon: Zap },
              { label: 'Multiplc. Médio',    value: `${avgMultiplier.toFixed(2)}x`, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: TrendingUp },
              { label: 'Total de Zonas',     value: zones.length,             color: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: MapPin },
            ].map(k => (
              <div key={k.label} className="bg-[hsl(var(--admin-surface))] rounded-xl p-4 border border-[hsl(var(--admin-border))] flex flex-col gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-slate-100 tabular-nums leading-none">{k.value}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-green))]/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-slate-200">{editId ? 'Editar Zona de Surge' : 'Nova Zona de Surge'}</h3>
                <button type="button" onClick={() => { setShowForm(false); setError('') }} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px]">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Nome da Zona *</label>
                  <Input value={form.zone_name || ''} onChange={e => setForm(p => ({ ...p, zone_name: e.target.value }))}
                    placeholder="Ex: Aeroporto Guarulhos"
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Latitude</label>
                  <Input type="number" step="0.0001" value={form.zone_lat || ''} onChange={e => setForm(p => ({ ...p, zone_lat: parseFloat(e.target.value) }))}
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Longitude</label>
                  <Input type="number" step="0.0001" value={form.zone_lng || ''} onChange={e => setForm(p => ({ ...p, zone_lng: parseFloat(e.target.value) }))}
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Raio (km)</label>
                  <Input type="number" step="0.5" min="0.5" max="50" value={form.radius_km || 3} onChange={e => setForm(p => ({ ...p, radius_km: parseFloat(e.target.value) }))}
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Multiplicador *</label>
                  <Input type="number" step="0.1" min="1.0" max="5.0" value={form.multiplier || 1.5} onChange={e => setForm(p => ({ ...p, multiplier: parseFloat(e.target.value) }))}
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Nível de Demanda</label>
                  <select value={form.demand_level || 'high'} onChange={e => setForm(p => ({ ...p, demand_level: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]">
                    {Object.entries(DEMAND_COLORS).map(([v, d]) => <option key={v} value={v}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Horário Início</label>
                  <Input type="time" value={form.active_from || ''} onChange={e => setForm(p => ({ ...p, active_from: e.target.value || null }))}
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Horário Fim</label>
                  <Input type="time" value={form.active_until || ''} onChange={e => setForm(p => ({ ...p, active_until: e.target.value || null }))}
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Motivo / Descrição</label>
                  <Input value={form.reason || ''} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    placeholder="Ex: Horário de pico, evento especial..."
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-2">Dias da Semana</label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS.map((day, i) => (
                      <button key={i} type="button" onClick={() => toggleDay(i)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors',
                          form.days_of_week?.includes(i)
                            ? 'bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))]'
                            : 'bg-[hsl(var(--admin-bg))] text-slate-500 border border-[hsl(var(--admin-border))] hover:text-slate-300'
                        )}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--admin-border))]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button type="button" onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}>
                    {form.is_active
                      ? <ToggleRight className="w-5 h-5 text-[hsl(var(--admin-green))]" />
                      : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                  </button>
                  <span className="text-[12px] text-slate-400">Ativar imediatamente</span>
                </label>
                <button type="button" onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))] text-[12px] font-bold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2">
                  {saving ? <div className="w-3.5 h-3.5 border-2 border-[hsl(var(--admin-bg))] border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {editId ? 'Salvar Alterações' : 'Criar Zona'}
                </button>
              </div>
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : zones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <Zap className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-[14px]">Nenhuma zona de surge configurada</p>
              <button type="button" onClick={() => setShowForm(true)} className="mt-3 text-[12px] text-[hsl(var(--admin-green))] hover:underline">Criar primeira zona</button>
            </div>
          ) : (
            <div className="space-y-2">
              {zones.map(z => {
                const demand = DEMAND_COLORS[z.demand_level] || DEMAND_COLORS.normal
                const activeDays = (z.days_of_week || []).map(d => DAYS[d]).join(', ')
                return (
                  <div key={z.id} className={cn(
                    'bg-[hsl(var(--admin-surface))] rounded-xl border p-4 transition-colors',
                    z.is_active ? 'border-[hsl(var(--admin-border))]' : 'border-[hsl(var(--admin-border))]/40 opacity-60'
                  )}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-[14px] font-bold text-slate-100">{z.zone_name}</p>
                          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', demand.bg, demand.text)}>
                            {demand.label}
                          </span>
                          <span className="text-[13px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            {z.multiplier.toFixed(1)}x
                          </span>
                          {z.auto_calculated && (
                            <span className="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Auto</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 flex-wrap">
                          <span><MapPin className="inline w-3 h-3 mr-1" />{z.zone_lat.toFixed(4)}, {z.zone_lng.toFixed(4)} — r: {z.radius_km}km</span>
                          {(z.active_from || z.active_until) && (
                            <span><Clock className="inline w-3 h-3 mr-1" />{z.active_from || '00:00'} – {z.active_until || '23:59'}</span>
                          )}
                          {activeDays && <span>{activeDays}</span>}
                          {z.reason && <span className="text-slate-600 italic">{z.reason}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => handleToggle(z.id, z.is_active)}
                          className={cn('p-1.5 rounded-lg transition-colors', z.is_active
                            ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-500/10')}>
                          {z.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button type="button" onClick={() => handleEdit(z)}
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(z.id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
