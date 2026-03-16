'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, Search,
  RefreshCw, MessageSquare, DollarSign, Car, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RideDispute {
  id: string
  ride_id: string
  user_id: string
  dispute_type: string
  description: string | null
  status: 'open' | 'in_review' | 'resolved' | 'dismissed'
  resolution: string | null
  refund_amount: number | null
  resolved_at: string | null
  created_at: string
  user?: { full_name: string; avatar_url: string | null }
  ride?: { driver_id: string; final_price: number | null; pickup_address: string | null; dropoff_address: string | null }
}

const STATUS_CONFIG = {
  open: { label: 'Aberta', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: AlertTriangle },
  in_review: { label: 'Em Análise', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  resolved: { label: 'Resolvida', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  dismissed: { label: 'Descartada', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: XCircle },
}

const DISPUTE_TYPE_LABEL: Record<string, string> = {
  overcharge: 'Cobrança indevida',
  driver_behavior: 'Comportamento do motorista',
  route: 'Rota incorreta',
  cancellation: 'Cancelamento indevido',
  lost_item: 'Item perdido',
  safety: 'Segurança',
  other: 'Outro',
}

export default function AdminDisputesPage() {
  const supabase = createClient()
  const [disputes, setDisputes] = useState<RideDispute[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('open')
  const [selected, setSelected] = useState<RideDispute | null>(null)
  const [resolution, setResolution] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchDisputes = async () => {
    const { data } = await supabase
      .from('ride_disputes')
      .select(`
        *,
        user:profiles!ride_disputes_user_id_fkey(full_name, avatar_url),
        ride:rides!ride_disputes_ride_id_fkey(driver_id, final_price, pickup_address, dropoff_address)
      `)
      .order('created_at', { ascending: false })
    setDisputes((data || []) as RideDispute[])
    setLoading(false)
  }

  useEffect(() => {
    fetchDisputes()
    channelRef.current = supabase
      .channel('admin-disputes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_disputes' }, fetchDisputes)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const handleUpdateStatus = async (id: string, status: RideDispute['status']) => {
    await supabase.from('ride_disputes').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }

  const handleResolve = async () => {
    if (!selected || !resolution.trim()) return
    setProcessing(true)
    await supabase.from('ride_disputes').update({
      status: 'resolved',
      resolution,
      refund_amount: refundAmount ? Number(refundAmount) : null,
      resolved_at: new Date().toISOString(),
    }).eq('id', selected.id)
    setDisputes(prev => prev.map(d =>
      d.id === selected.id
        ? { ...d, status: 'resolved', resolution, refund_amount: refundAmount ? Number(refundAmount) : null, resolved_at: new Date().toISOString() }
        : d
    ))
    setSelected(null)
    setResolution('')
    setRefundAmount('')
    setProcessing(false)
  }

  const filtered = disputes.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = (d.user?.full_name || '').toLowerCase().includes(q) ||
      d.ride_id.toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return matchSearch && matchStatus
  })

  const openCount = disputes.filter(d => d.status === 'open').length
  const inReviewCount = disputes.filter(d => d.status === 'in_review').length
  const resolvedCount = disputes.filter(d => d.status === 'resolved').length
  const dismissedCount = disputes.filter(d => d.status === 'dismissed').length

  const headerActions = (
    <button type="button" onClick={fetchDisputes} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors">
      <RefreshCw className="w-3 h-3" />
      Atualizar
    </button>
  )

  if (loading) {
    return (
      <>
        <AdminHeader title="Disputas de Corridas" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))]">
          <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Disputas de Corridas"
        subtitle={`${openCount} abertas · ${inReviewCount} em análise · ${resolvedCount} resolvidas`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))]">
        <div className="p-5 space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Abertas', value: openCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
              { label: 'Em Análise', value: inReviewCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Resolvidas', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Descartadas', value: dismissedCount, icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/10' },
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por usuário ou ID da corrida..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-[hsl(var(--admin-green))]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'open', 'in_review', 'resolved', 'dismissed'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors',
                    filterStatus === s
                      ? 'bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))]'
                      : 'bg-[hsl(var(--admin-surface))] text-slate-400 border border-[hsl(var(--admin-border))] hover:text-slate-200'
                  )}
                >
                  {s === 'all' ? 'Todas' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--admin-border))]">
              <h3 className="text-[13px] font-bold text-slate-200">
                Disputas {search && `— ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
              </h3>
              {openCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-[14px]">Nenhuma disputa {filterStatus !== 'all' ? `${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label.toLowerCase() || ''}` : 'encontrada'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[hsl(var(--admin-border))]">
                      {['Passageiro', 'Corrida', 'Tipo', 'Data', 'Status', 'Ações'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(d => {
                      const statusCfg = STATUS_CONFIG[d.status]
                      const StatusIcon = statusCfg.icon
                      return (
                        <tr key={d.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--sidebar-accent))]/50 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[hsl(var(--admin-bg))] overflow-hidden shrink-0 flex items-center justify-center">
                                {d.user?.avatar_url
                                  ? <img src={d.user.avatar_url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                  : <span className="text-[11px] font-bold text-slate-400">{d.user?.full_name?.[0] || '?'}</span>
                                }
                              </div>
                              <p className="text-slate-200 font-medium">{d.user?.full_name || 'Usuário'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-slate-500" />
                              <div>
                                <p className="text-slate-400 font-mono text-[11px]">{d.ride_id.slice(0, 8)}...</p>
                                {d.ride?.final_price && (
                                  <p className="text-slate-500 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    R$ {Number(d.ride.final_price).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400 max-w-[140px]">
                            <p className="truncate">{DISPUTE_TYPE_LABEL[d.dispute_type] || d.dispute_type}</p>
                            {d.description && <p className="text-slate-600 text-[11px] truncate mt-0.5">{d.description}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {new Date(d.created_at).toLocaleDateString('pt-BR')}
                            <br />
                            <span className="text-[11px] text-slate-600">{new Date(d.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', statusCfg.color)}>
                              <StatusIcon className="w-3 h-3" />
                              {statusCfg.label}
                            </span>
                            {d.refund_amount && (
                              <p className="text-emerald-400 text-[11px] font-bold mt-1">Reembolso: R$ {Number(d.refund_amount).toFixed(2)}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {d.status === 'open' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(d.id, 'in_review')}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-[11px] font-semibold"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                  Analisar
                                </button>
                              )}
                              {(d.status === 'open' || d.status === 'in_review') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => { setSelected(d); setResolution(''); setRefundAmount('') }}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-[11px] font-semibold"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Resolver
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(d.id, 'dismissed')}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-slate-400 hover:text-slate-200 transition-colors text-[11px] font-semibold"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Descartar
                                  </button>
                                </>
                              )}
                              {d.resolution && (
                                <button
                                  type="button"
                                  title={d.resolution}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Ver Resolução
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--admin-surface))] rounded-2xl border border-[hsl(var(--admin-border))] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-200">Resolver Disputa</h3>
                <p className="text-[12px] text-slate-500">{selected.user?.full_name} · {DISPUTE_TYPE_LABEL[selected.dispute_type] || selected.dispute_type}</p>
              </div>
            </div>
            {selected.description && (
              <div className="bg-[hsl(var(--admin-bg))] rounded-lg p-3 mb-4">
                <p className="text-[12px] text-slate-400 leading-relaxed">{selected.description}</p>
              </div>
            )}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">Resolução *</label>
                <textarea
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  rows={3}
                  placeholder="Descreva a resolução tomada..."
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-emerald-500/50 resize-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-semibold block mb-1">Valor de Reembolso (R$) — opcional</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={!resolution.trim() || processing}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-[12px] font-bold disabled:opacity-50 hover:bg-emerald-600 transition-colors"
              >
                {processing ? 'Resolvendo...' : 'Confirmar Resolução'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
