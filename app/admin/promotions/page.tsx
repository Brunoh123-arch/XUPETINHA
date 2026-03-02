'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { Tag, Users, TrendingUp, Search, Plus, ToggleLeft, ToggleRight, Trash2, RefreshCw, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_amount: number
  max_discount: number
  max_uses: number | null
  uses_count: number
  valid_until: string | null
  is_active: boolean
  created_at: string
}

const emptyForm = {
  code: '',
  discount_type: 'percentage' as const,
  discount_value: 10,
  min_amount: 0,
  max_discount: 0,
  max_uses: '',
  valid_until: '',
}

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const fetchCoupons = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    setCoupons(data || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.code.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_amount: Number(form.min_amount) || 0,
        max_discount: Number(form.max_discount) || 0,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_until: form.valid_until || null,
        is_active: true,
        uses_count: 0,
      })
      .select()
      .single()

    if (!error && data) {
      setCoupons(prev => [data, ...prev])
      setForm(emptyForm)
      setShowForm(false)
    }
    setSaving(false)
  }

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('coupons').update({ is_active: !current }).eq('id', id)
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('coupons').delete().eq('id', id)
    setCoupons(prev => prev.filter(c => c.id !== id))
  }

  useEffect(() => {
    fetchCoupons()
    const supabase = createClient()
    channelRef.current = supabase
      .channel('admin-promotions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, fetchCoupons)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const active = coupons.filter(c => c.is_active)
  const totalUses = coupons.reduce((s, c) => s + c.uses_count, 0)

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={fetchCoupons}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        Atualizar
      </button>
      <button
        type="button"
        onClick={() => setShowForm(v => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-green))]/20 border border-[hsl(var(--admin-green))]/30 text-[12px] font-medium text-[hsl(var(--admin-green))] hover:bg-[hsl(var(--admin-green))]/30 transition-colors"
      >
        <Plus className="w-3 h-3" />
        Novo Cupom
      </button>
    </div>
  )

  if (loading) {
    return (
      <>
        <AdminHeader title="Promocoes e Cupons" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))]">
          <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Promocoes e Cupons"
        subtitle={`${coupons.length} cupons • ${active.length} ativos`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))]">
        <div className="p-5 space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total de Cupons', value: coupons.length, icon: Tag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Cupons Ativos', value: active.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Total de Usos', value: totalUses, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            ].map(k => (
              <div key={k.label} className="bg-[hsl(var(--admin-surface))] rounded-xl p-4 border border-[hsl(var(--admin-border))] flex flex-col gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <div>
                  <p className="text-[22px] font-bold text-slate-100 tabular-nums leading-none">{k.value.toLocaleString('pt-BR')}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
              <h3 className="text-[13px] font-bold text-slate-200 mb-4">Criar Novo Cupom</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Codigo', key: 'code', placeholder: 'UPPI20', type: 'text' },
                  { label: 'Valor do Desconto', key: 'discount_value', placeholder: '10', type: 'number' },
                  { label: 'Valor Minimo', key: 'min_amount', placeholder: '0', type: 'number' },
                  { label: 'Desconto Maximo (R$)', key: 'max_discount', placeholder: '0', type: 'number' },
                  { label: 'Maximo de Usos', key: 'max_uses', placeholder: 'Ilimitado', type: 'number' },
                  { label: 'Valido ate', key: 'valid_until', placeholder: '', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[11px] text-slate-500 font-semibold mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-[hsl(var(--admin-green))]"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] text-slate-500 font-semibold mb-1.5">Tipo de Desconto</label>
                  <select
                    value={form.discount_type}
                    onChange={e => setForm(prev => ({ ...prev, discount_type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-[hsl(var(--admin-green))]"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving || !form.code.trim()}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--admin-green))]/20 border border-[hsl(var(--admin-green))]/30 text-[13px] font-semibold text-[hsl(var(--admin-green))] hover:bg-[hsl(var(--admin-green))]/30 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Criando...' : 'Criar Cupom'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(emptyForm) }}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por codigo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-[hsl(var(--admin-green))]"
            />
          </div>

          {/* Table */}
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
            <div className="px-5 py-3.5 border-b border-[hsl(var(--admin-border))]">
              <h3 className="text-[13px] font-bold text-slate-200">Todos os Cupons</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[hsl(var(--admin-border))]">
                    {['Codigo', 'Desconto', 'Min. Valor', 'Usos', 'Validade', 'Status', 'Acoes'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const expired = c.valid_until ? new Date(c.valid_until) < new Date() : false
                    const exhausted = c.max_uses !== null && c.uses_count >= c.max_uses
                    return (
                      <tr key={c.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--sidebar-accent))]/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-200 text-[13px]">{c.code}</span>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(c.code)}
                              className="text-slate-600 hover:text-slate-400 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-400 tabular-nums">
                          {c.discount_type === 'percentage' ? `${c.discount_value}%` : `R$ ${c.discount_value.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-slate-400 tabular-nums">
                          {c.min_amount > 0 ? `R$ ${c.min_amount.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          <span className="text-slate-300">{c.uses_count}</span>
                          {c.max_uses && <span className="text-slate-600">/{c.max_uses}</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-500 tabular-nums whitespace-nowrap">
                          {c.valid_until ? new Date(c.valid_until).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold',
                            exhausted ? 'bg-slate-500/15 text-slate-400' :
                            expired ? 'bg-red-500/15 text-red-400' :
                            c.is_active ? 'bg-emerald-500/15 text-emerald-400' :
                            'bg-slate-500/15 text-slate-400'
                          )}>
                            {exhausted ? 'Esgotado' : expired ? 'Expirado' : c.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleActive(c.id, c.is_active)}
                              className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors',
                                c.is_active
                                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              )}
                            >
                              {c.is_active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                              {c.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-600">
                        <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Nenhum cupom encontrado</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
