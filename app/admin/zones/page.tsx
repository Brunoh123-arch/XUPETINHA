'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { Input } from '@/components/ui/input'
import {
  MapPin, Plus, Trash2, RefreshCw, Check, X, Edit2,
  Plane, ShoppingBag, Heart, GraduationCap, Trophy, Building2, Home, Map,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Zone {
  id: string
  name: string
  zone_type: string
  city: string
  description: string | null
  polygon: Record<string, unknown> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const TYPE_META: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  airport:    { icon: Plane,          label: 'Aeroporto',    color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  mall:       { icon: ShoppingBag,    label: 'Shopping',     color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  hospital:   { icon: Heart,          label: 'Hospital',     color: 'text-red-400',     bg: 'bg-red-500/10' },
  university: { icon: GraduationCap,  label: 'Universidade', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  stadium:    { icon: Trophy,         label: 'Estádio',      color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  downtown:   { icon: Building2,      label: 'Centro',       color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
  suburb:     { icon: Home,           label: 'Subúrbio',     color: 'text-slate-400',   bg: 'bg-slate-500/10' },
  standard:   { icon: MapPin,         label: 'Padrão',       color: 'text-slate-400',   bg: 'bg-slate-500/10' },
  general:    { icon: MapPin,         label: 'Geral',        color: 'text-slate-400',   bg: 'bg-slate-500/10' },
}

const EMPTY: Partial<Zone> = {
  name: '', zone_type: 'standard', city: 'São Paulo',
  description: '', is_active: true,
}

export default function AdminZonesPage() {
  const supabase = createClient()
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<Zone>>(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchZones = async () => {
    setLoading(true)
    const { data } = await supabase.from('city_zones').select('*').order('demand_index', { ascending: false })
    setZones(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchZones()
    channelRef.current = supabase
      .channel('admin-zones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'city_zones' }, fetchZones)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const handleSave = async () => {
    if (!form.name?.trim()) return
    setSaving(true)
    const payload = {
      name: form.name,
      zone_type: form.zone_type || 'standard',
      city: form.city || 'São Paulo',
      description: form.description || null,
      is_active: form.is_active ?? true,
    }
    if (editId) {
      await supabase.from('city_zones').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editId)
    } else {
      await supabase.from('city_zones').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY)
    fetchZones()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta zona?')) return
    await supabase.from('city_zones').delete().eq('id', id)
    setZones(prev => prev.filter(z => z.id !== id))
  }

  const handleEdit = (z: Zone) => { setForm(z); setEditId(z.id); setShowForm(true) }

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from('city_zones').update({ is_active: !current }).eq('id', id)
    setZones(prev => prev.map(z => z.id === id ? { ...z, is_active: !current } : z))
  }

  const filtered = filterType === 'all' ? zones : zones.filter(z => z.zone_type === filterType)

  const headerActions = (
    <div className="flex items-center gap-2">
      <button type="button" onClick={fetchZones}
        className="w-8 h-8 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] flex items-center justify-center text-slate-400 hover:text-slate-200">
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true) }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))] text-[12px] font-bold hover:opacity-90">
        <Plus className="w-3.5 h-3.5" /> Nova Zona
      </button>
    </div>
  )

  return (
    <>
      <AdminHeader
        title="Zonas da Cidade"
        subtitle={`${zones.length} zonas — ${zones.filter(z => z.is_active).length} ativas`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))] p-5">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Filtros por tipo */}
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => setFilterType('all')}
              className={cn('px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors',
                filterType === 'all' ? 'bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))]'
                  : 'bg-[hsl(var(--admin-surface))] text-slate-400 border border-[hsl(var(--admin-border))] hover:text-slate-200')}>
              Todos ({zones.length})
            </button>
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const count = zones.filter(z => z.zone_type === type).length
              if (!count) return null
              return (
                <button key={type} type="button" onClick={() => setFilterType(type)}
                  className={cn('px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors',
                    filterType === type ? 'bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))]'
                      : 'bg-[hsl(var(--admin-surface))] text-slate-400 border border-[hsl(var(--admin-border))] hover:text-slate-200')}>
                  {meta.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-green))]/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-slate-200">{editId ? 'Editar Zona' : 'Nova Zona'}</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Nome *</label>
                  <Input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Aeroporto Guarulhos"
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Tipo</label>
                  <select value={form.zone_type || 'standard'} onChange={e => setForm(p => ({ ...p, zone_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]">
                    {Object.entries(TYPE_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Cidade</label>
                  <Input value={form.city || ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Descrição</label>
                  <Input value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Descrição opcional da zona"
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-slate-200 text-[13px]" />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-[hsl(var(--admin-border))]">
                <label className="flex items-center gap-2 cursor-pointer ml-auto">
                  <input type="checkbox" checked={form.is_active ?? true} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                    className="w-4 h-4 accent-[hsl(var(--admin-green))]" />
                  <span className="text-[12px] text-slate-400">Ativa</span>
                </label>
                <button type="button" onClick={handleSave} disabled={saving}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))] text-[12px] font-bold disabled:opacity-50 hover:opacity-90 flex items-center gap-2">
                  {saving ? <div className="w-3.5 h-3.5 border-2 border-[hsl(var(--admin-bg))] border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {editId ? 'Salvar' : 'Criar Zona'}
                </button>
              </div>
            </div>
          )}

          {/* Grid de zonas */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map(z => {
                const meta = TYPE_META[z.zone_type] || TYPE_META.general
                const Icon = meta.icon
                return (
                  <div key={z.id} className={cn(
                    'bg-[hsl(var(--admin-surface))] rounded-xl border p-4',
                    z.is_active ? 'border-[hsl(var(--admin-border))]' : 'border-[hsl(var(--admin-border))]/40 opacity-60'
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', meta.bg)}>
                        <Icon className={cn('w-4.5 h-4.5', meta.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-[13px] font-bold text-slate-100 truncate">{z.name}</p>
                          {!z.is_active && (
                            <span className="text-[10px] bg-slate-500/15 text-slate-400 px-1.5 py-0.5 rounded-full font-semibold">Inativa</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>{meta.label}</span>
                          <span>{z.city}</span>
                          {z.description && <span className="truncate max-w-32">{z.description}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => handleToggleActive(z.id, z.is_active)}
                          title={z.is_active ? 'Desativar' : 'Ativar'}
                          className={cn('p-1.5 rounded-lg transition-colors', z.is_active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-600 hover:bg-slate-500/10')}>
                          <Map className="w-4 h-4" />
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

              {filtered.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 text-slate-600">
                  <MapPin className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-[14px]">Nenhuma zona encontrada</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
