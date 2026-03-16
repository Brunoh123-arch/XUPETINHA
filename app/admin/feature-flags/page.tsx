'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  Flag, ToggleLeft, ToggleRight, Plus, Trash2, RefreshCw,
  Search, Users, Globe, User, Car, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  is_enabled: boolean
  target: 'all' | 'passengers' | 'drivers' | 'specific'
  rollout_percent: number
  created_at: string
  updated_at: string
}

const TARGET_LABEL: Record<string, string> = {
  all: 'Todos',
  passengers: 'Passageiros',
  drivers: 'Motoristas',
  specific: 'Usuários Específicos',
}

const TARGET_ICON: Record<string, React.ElementType> = {
  all: Globe,
  passengers: User,
  drivers: Car,
  specific: Users,
}

const TARGET_COLOR: Record<string, string> = {
  all: 'text-blue-400 bg-blue-500/10',
  passengers: 'text-violet-400 bg-violet-500/10',
  drivers: 'text-emerald-400 bg-emerald-500/10',
  specific: 'text-amber-400 bg-amber-500/10',
}

const EMPTY_FORM: Partial<FeatureFlag> = {
  key: '',
  name: '',
  description: '',
  is_enabled: false,
  target: 'all',
  rollout_percent: 100,
}

export default function AdminFeatureFlagsPage() {
  const supabase = createClient()
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<FeatureFlag>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchFlags = async () => {
    const { data } = await supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false })
    setFlags(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchFlags()
    channelRef.current = supabase
      .channel('admin-feature-flags')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feature_flags' }, fetchFlags)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from('feature_flags').update({ is_enabled: !current, updated_at: new Date().toISOString() }).eq('id', id)
    setFlags(prev => prev.map(f => f.id === id ? { ...f, is_enabled: !current } : f))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta feature flag?')) return
    await supabase.from('feature_flags').delete().eq('id', id)
    setFlags(prev => prev.filter(f => f.id !== id))
  }

  const handleEdit = (f: FeatureFlag) => {
    setForm(f)
    setEditId(f.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.key?.trim() || !form.name?.trim()) return
    setSaving(true)
    const payload = {
      key: form.key!.toLowerCase().replace(/\s+/g, '_'),
      name: form.name!,
      description: form.description || null,
      is_enabled: form.is_enabled ?? false,
      target: form.target || 'all',
      rollout_percent: form.rollout_percent ?? 100,
      updated_at: new Date().toISOString(),
    }
    if (editId) {
      await supabase.from('feature_flags').update(payload).eq('id', editId)
    } else {
      await supabase.from('feature_flags').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    fetchFlags()
  }

  const filtered = flags.filter(f => {
    const q = search.toLowerCase()
    return f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q)
  })

  const enabledCount = flags.filter(f => f.is_enabled).length
  const disabledCount = flags.length - enabledCount

  const headerActions = (
    <div className="flex items-center gap-2">
      <button type="button" onClick={fetchFlags} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors">
        <RefreshCw className="w-3 h-3" />
        Atualizar
      </button>
      <button type="button" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))] text-[12px] font-bold hover:opacity-90 transition-opacity">
        <Plus className="w-3.5 h-3.5" />
        Nova Flag
      </button>
    </div>
  )

  if (loading) {
    return (
      <>
        <AdminHeader title="Feature Flags" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))]">
          <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Feature Flags"
        subtitle={`${flags.length} flags — ${enabledCount} ativas, ${disabledCount} desativadas`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))]">
        <div className="p-5 space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total de Flags', value: flags.length, icon: Flag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Ativas', value: enabledCount, icon: ToggleRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Desativadas', value: disabledCount, icon: ToggleLeft, color: 'text-red-400', bg: 'bg-red-500/10' },
              { label: 'Para Todos', value: flags.filter(f => f.target === 'all').length, icon: Globe, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map(k => (
              <div key={k.label} className="bg-[hsl(var(--admin-surface))] rounded-xl p-4 border border-[hsl(var(--admin-border))] flex flex-col gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <div>
                  <p className="text-[22px] font-bold text-slate-100 tracking-tight tabular-nums leading-none">{k.value}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou chave..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-[hsl(var(--admin-green))]"
            />
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-slate-200">
                  {editId ? 'Editar Feature Flag' : 'Nova Feature Flag'}
                </h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 text-[12px]">Cancelar</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Nome *</label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Novo fluxo de pagamento"
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Chave (key) *</label>
                  <input
                    type="text"
                    value={form.key || ''}
                    onChange={e => setForm(p => ({ ...p, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    placeholder="Ex: new_payment_flow"
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 font-mono outline-none focus:border-[hsl(var(--admin-green))]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Descrição</label>
                  <textarea
                    value={form.description || ''}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2}
                    placeholder="O que essa feature faz?"
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))] resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Público Alvo</label>
                  <select
                    value={form.target || 'all'}
                    onChange={e => setForm(p => ({ ...p, target: e.target.value as FeatureFlag['target'] }))}
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  >
                    {Object.entries(TARGET_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    Rollout: {form.rollout_percent ?? 100}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.rollout_percent ?? 100}
                    onChange={e => setForm(p => ({ ...p, rollout_percent: Number(e.target.value) }))}
                    className="w-full accent-[hsl(var(--admin-green))]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--admin-border))]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[12px] text-slate-400">Ativar imediatamente</span>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, is_enabled: !p.is_enabled }))}
                    className="text-slate-400"
                  >
                    {form.is_enabled
                      ? <ToggleRight className="w-5 h-5 text-[hsl(var(--admin-green))]" />
                      : <ToggleLeft className="w-5 h-5" />
                    }
                  </button>
                </label>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.key?.trim() || !form.name?.trim()}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))] text-[12px] font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {saving ? 'Salvando...' : editId ? 'Salvar Alterações' : 'Criar Flag'}
                </button>
              </div>
            </div>
          )}

          {/* Flags list */}
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--admin-border))]">
              <h3 className="text-[13px] font-bold text-slate-200">
                Feature Flags {search && `— ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--admin-green))] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--admin-green))]" />
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <Flag className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-[14px]">{search ? 'Nenhuma flag encontrada' : 'Nenhuma feature flag criada'}</p>
                {!search && (
                  <button
                    type="button"
                    onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }}
                    className="mt-3 text-[12px] text-[hsl(var(--admin-green))] hover:underline"
                  >
                    Criar primeira flag
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[hsl(var(--admin-border))]/50">
                {filtered.map(f => {
                  const TargetIcon = TARGET_ICON[f.target] || Globe
                  return (
                    <div key={f.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[hsl(var(--sidebar-accent))]/50 transition-colors group">
                      {/* Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggle(f.id, f.is_enabled)}
                        className="shrink-0"
                        title={f.is_enabled ? 'Desativar' : 'Ativar'}
                      >
                        {f.is_enabled
                          ? <ToggleRight className="w-7 h-7 text-[hsl(var(--admin-green))]" />
                          : <ToggleLeft className="w-7 h-7 text-slate-600" />
                        }
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-semibold text-slate-200">{f.name}</p>
                          <code className="text-[11px] font-mono bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-slate-400 px-1.5 py-0.5 rounded">
                            {f.key}
                          </code>
                        </div>
                        {f.description && (
                          <p className="text-[12px] text-slate-500 mt-0.5 truncate">{f.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={cn('flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full', TARGET_COLOR[f.target])}>
                            <TargetIcon className="w-3 h-3" />
                            {TARGET_LABEL[f.target]}
                          </span>
                          {f.rollout_percent < 100 && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full font-medium">
                              <AlertCircle className="w-3 h-3" />
                              {f.rollout_percent}% rollout
                            </span>
                          )}
                          <span className="text-[11px] text-slate-600">
                            {new Date(f.updated_at || f.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={cn(
                        'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold',
                        f.is_enabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      )}>
                        {f.is_enabled ? 'Ativa' : 'Desativada'}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(f)}
                          className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                          title="Editar"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-amber-400 mb-1">Como usar Feature Flags</p>
                <p className="text-[12px] text-slate-500 leading-relaxed">
                  Use a chave (key) da flag no código do app com{' '}
                  <code className="text-amber-400 bg-amber-500/10 px-1 rounded font-mono">supabase.from('feature_flags').select().eq('key', 'sua_flag')</code>{' '}
                  para ativar/desativar funcionalidades sem fazer deploy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
