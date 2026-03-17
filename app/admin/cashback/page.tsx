'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  Coins, TrendingUp, Users, RefreshCw, Plus, Trash2,
  ToggleLeft, ToggleRight, Search, DollarSign, Star, Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CashbackRule {
  id: string
  name: string
  description: string | null
  type: 'ride_count' | 'ride_amount' | 'first_ride' | 'subscription'
  cashback_percent: number
  max_cashback_amount: number | null
  min_ride_amount: number | null
  applies_to: 'all' | 'passengers' | 'subscribers'
  is_active: boolean
  created_at: string
}

interface CashbackStats {
  total_earned: number
  total_users: number
  avg_per_user: number
  this_month: number
}

const TYPE_LABEL: Record<string, string> = {
  ride_count: 'Por Qtd. de Corridas',
  ride_amount: 'Por Valor da Corrida',
  first_ride: 'Primeira Corrida',
  subscription: 'Assinantes Club',
}

const TYPE_COLOR: Record<string, string> = {
  ride_count: 'text-blue-400 bg-blue-500/10',
  ride_amount: 'text-emerald-400 bg-emerald-500/10',
  first_ride: 'text-violet-400 bg-violet-500/10',
  subscription: 'text-amber-400 bg-amber-500/10',
}

const APPLIES_LABEL: Record<string, string> = {
  all: 'Todos',
  passengers: 'Passageiros',
  subscribers: 'Assinantes',
}

const EMPTY_FORM: Partial<CashbackRule> = {
  name: '',
  description: '',
  type: 'ride_amount',
  cashback_percent: 3,
  max_cashback_amount: null,
  min_ride_amount: null,
  applies_to: 'all',
  is_active: true,
}

export default function AdminCashbackPage() {
  const supabase = createClient()
  const [rules, setRules] = useState<CashbackRule[]>([])
  const [stats, setStats] = useState<CashbackStats>({ total_earned: 0, total_users: 0, avg_per_user: 0, this_month: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<CashbackRule>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchData = async () => {
    const [rulesRes, earnedRes] = await Promise.all([
      supabase.from('cashback_rules').select('*').order('created_at', { ascending: false }),
      supabase.from('cashback_earned').select('amount, user_id, created_at'),
    ])

    if (rulesRes.data) setRules(rulesRes.data)

    const earned = earnedRes.data || []
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const totalEarned = earned.reduce((s, e) => s + Number(e.amount), 0)
    const uniqueUsers = new Set(earned.map(e => e.user_id)).size
    const thisMonth = earned.filter(e => e.created_at >= startOfMonth).reduce((s, e) => s + Number(e.amount), 0)
    setStats({
      total_earned: totalEarned,
      total_users: uniqueUsers,
      avg_per_user: uniqueUsers > 0 ? totalEarned / uniqueUsers : 0,
      this_month: thisMonth,
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    channelRef.current = supabase
      .channel('admin-cashback-rules')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cashback_rules' }, fetchData)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const handleSave = async () => {
    if (!form.name?.trim()) return
    setSaving(true)
    const payload = {
      name: form.name!,
      description: form.description || null,
      type: form.type || 'ride_amount',
      cashback_percent: form.cashback_percent || 3,
      max_cashback_amount: form.max_cashback_amount || null,
      min_ride_amount: form.min_ride_amount || null,
      applies_to: form.applies_to || 'all',
      is_active: form.is_active ?? true,
    }
    if (editId) {
      await supabase.from('cashback_rules').update(payload).eq('id', editId)
    } else {
      await supabase.from('cashback_rules').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    fetchData()
  }

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from('cashback_rules').update({ is_active: !current }).eq('id', id)
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !current } : r))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta regra de cashback?')) return
    await supabase.from('cashback_rules').delete().eq('id', id)
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const handleEdit = (r: CashbackRule) => {
    setForm(r)
    setEditId(r.id)
    setShowForm(true)
  }

  const filtered = rules.filter(r => {
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)
  })

  const headerActions = (
    <div className="flex items-center gap-2">
      <button type="button" onClick={fetchData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors">
        <RefreshCw className="w-3 h-3" />
        Atualizar
      </button>
      <button type="button" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))] text-[12px] font-bold hover:opacity-90 transition-opacity">
        <Plus className="w-3.5 h-3.5" />
        Nova Regra
      </button>
    </div>
  )

  if (loading) {
    return (
      <>
        <AdminHeader title="Cashback" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))]">
          <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Regras de Cashback"
        subtitle={`${rules.length} regras · ${rules.filter(r => r.is_active).length} ativas`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))]">
        <div className="p-5 space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Distribuído', value: `R$ ${stats.total_earned.toFixed(2)}`, icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Usuários Beneficiados', value: stats.total_users.toLocaleString('pt-BR'), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Média por Usuário', value: `R$ ${stats.avg_per_user.toFixed(2)}`, icon: Star, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              { label: 'Este Mês', value: `R$ ${stats.this_month.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(k => (
              <div key={k.label} className="bg-[hsl(var(--admin-surface))] rounded-xl p-4 border border-[hsl(var(--admin-border))] flex flex-col gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-slate-100 tracking-tight tabular-nums leading-none">{k.value}</p>
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
              placeholder="Buscar regra de cashback..."
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
                  {editId ? 'Editar Regra' : 'Nova Regra de Cashback'}
                </h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-300 text-[12px]">Cancelar</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Nome da Regra *</label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: Cashback Club Premium"
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Descrição</label>
                  <input
                    type="text"
                    value={form.description || ''}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Ex: 3% de volta em créditos Uppi para assinantes"
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Tipo de Regra</label>
                  <select
                    value={form.type || 'ride_amount'}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value as CashbackRule['type'] }))}
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  >
                    {Object.entries(TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Público Alvo</label>
                  <select
                    value={form.applies_to || 'all'}
                    onChange={e => setForm(p => ({ ...p, applies_to: e.target.value as CashbackRule['applies_to'] }))}
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  >
                    {Object.entries(APPLIES_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    % de Cashback: <span className="text-amber-400 font-bold">{form.cashback_percent ?? 3}%</span>
                  </label>
                  <input
                    type="range"
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={form.cashback_percent ?? 3}
                    onChange={e => setForm(p => ({ ...p, cashback_percent: Number(e.target.value) }))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Cashback Máximo (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.max_cashback_amount ?? ''}
                    onChange={e => setForm(p => ({ ...p, max_cashback_amount: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Sem limite"
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">Valor Mínimo da Corrida (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.min_ride_amount ?? ''}
                    onChange={e => setForm(p => ({ ...p, min_ride_amount: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Sem mínimo"
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--admin-border))]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[12px] text-slate-400">Ativar imediatamente</span>
                  <button type="button" onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}>
                    {form.is_active
                      ? <ToggleRight className="w-5 h-5 text-[hsl(var(--admin-green))]" />
                      : <ToggleLeft className="w-5 h-5 text-slate-500" />
                    }
                  </button>
                </label>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.name?.trim()}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))] text-[12px] font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {saving ? 'Salvando...' : editId ? 'Salvar Alterações' : 'Criar Regra'}
                </button>
              </div>
            </div>
          )}

          {/* Rules list */}
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--admin-border))]">
              <h3 className="text-[13px] font-bold text-slate-200">Regras de Cashback</h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <Coins className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-[14px]">{search ? 'Nenhuma regra encontrada' : 'Nenhuma regra de cashback criada'}</p>
                {!search && (
                  <button
                    type="button"
                    onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }}
                    className="mt-3 text-[12px] text-[hsl(var(--admin-green))] hover:underline"
                  >
                    Criar primeira regra
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[hsl(var(--admin-border))]">
                      {['Regra', 'Tipo', 'Público', 'Cashback', 'Limites', 'Status', 'Ações'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--sidebar-accent))]/50 transition-colors group">
                        <td className="px-4 py-3 max-w-[180px]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                              <Coins className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-slate-200 font-medium truncate">{r.name}</p>
                              {r.description && <p className="text-slate-500 text-[11px] truncate">{r.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', TYPE_COLOR[r.type])}>
                            {TYPE_LABEL[r.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{APPLIES_LABEL[r.applies_to]}</td>
                        <td className="px-4 py-3">
                          <span className="text-amber-400 font-bold text-[14px]">{r.cashback_percent}%</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {r.max_cashback_amount ? <p>Máx: R$ {r.max_cashback_amount}</p> : <p>Sem limite</p>}
                          {r.min_ride_amount ? <p>Mín: R$ {r.min_ride_amount}</p> : null}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleToggle(r.id, r.is_active)}
                            className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors',
                              r.is_active ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            )}
                          >
                            {r.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            {r.is_active ? 'Ativa' : 'Inativa'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleEdit(r)}
                              className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                              title="Editar"
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(r.id)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
