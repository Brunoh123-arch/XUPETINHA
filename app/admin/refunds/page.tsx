'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  RefreshCw, Search, DollarSign, Clock, CheckCircle2,
  XCircle, AlertCircle, Filter, RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Refund {
  id: string
  payment_id: string
  user_id: string
  amount: number
  reason: string | null
  status: string
  processed_at: string | null
  created_at: string
  user?: { full_name: string; avatar_url: string | null }
  payment?: { ride_id: string | null; amount: number; method: string | null }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  processing: { label: 'Processando', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: RotateCcw },
  refunded: { label: 'Reembolsado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  failed: { label: 'Falhou', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
  cancelled: { label: 'Cancelado', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20', icon: XCircle },
}

export default function AdminRefundsPage() {
  const supabase = createClient()
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [processing, setProcessing] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchRefunds = async () => {
    const { data } = await supabase
      .from('refunds')
      .select(`
        *,
        user:profiles!refunds_user_id_fkey(full_name, avatar_url),
        payment:payments!refunds_payment_id_fkey(ride_id, amount, method)
      `)
      .order('created_at', { ascending: false })
      .limit(200)
    setRefunds((data || []) as Refund[])
    setLoading(false)
  }

  useEffect(() => {
    fetchRefunds()
    channelRef.current = supabase
      .channel('admin-refunds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'refunds' }, fetchRefunds)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const handleProcess = async (id: string) => {
    setProcessing(id)
    await supabase.from('refunds').update({
      status: 'processing',
      processed_at: new Date().toISOString(),
    }).eq('id', id)
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'processing', processed_at: new Date().toISOString() } : r))
    setProcessing(null)
  }

  const handleComplete = async (id: string) => {
    setProcessing(id)
    await supabase.from('refunds').update({
      status: 'refunded',
      processed_at: new Date().toISOString(),
    }).eq('id', id)
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'refunded', processed_at: new Date().toISOString() } : r))
    setProcessing(null)
  }

  const handleFail = async (id: string) => {
    setProcessing(id)
    await supabase.from('refunds').update({ status: 'failed' }).eq('id', id)
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'failed' } : r))
    setProcessing(null)
  }

  const filtered = refunds.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = (r.user?.full_name || '').toLowerCase().includes(q)
      || r.payment_id.toLowerCase().includes(q)
      || (r.reason || '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const pendingCount = refunds.filter(r => r.status === 'pending').length
  const processingCount = refunds.filter(r => r.status === 'processing').length
  const refundedCount = refunds.filter(r => r.status === 'refunded').length
  const totalAmount = refunds.filter(r => r.status === 'refunded').reduce((s, r) => s + Number(r.amount), 0)
  const pendingAmount = refunds.filter(r => ['pending', 'processing'].includes(r.status)).reduce((s, r) => s + Number(r.amount), 0)

  const headerActions = (
    <button type="button" onClick={fetchRefunds} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors">
      <RefreshCw className="w-3 h-3" />
      Atualizar
    </button>
  )

  if (loading) {
    return (
      <>
        <AdminHeader title="Reembolsos" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))]">
          <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Reembolsos"
        subtitle={`${pendingCount} pendentes · ${processingCount} processando · ${refundedCount} concluídos`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))]">
        <div className="p-5 space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pendentes', value: pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Processando', value: processingCount, icon: RotateCcw, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Total Reembolsado', value: `R$ ${totalAmount.toFixed(2)}`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'A Processar', value: `R$ ${pendingAmount.toFixed(2)}`, icon: DollarSign, color: 'text-red-400', bg: 'bg-red-500/10' },
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por usuário, ID ou motivo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-[hsl(var(--admin-green))]"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'processing', 'refunded', 'failed'].map(s => {
                const cfg = STATUS_CONFIG[s]
                return (
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
                    {s === 'all' ? 'Todos' : cfg?.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--admin-border))]">
              <h3 className="text-[13px] font-bold text-slate-200">
                Reembolsos {search && `— ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
              </h3>
              {pendingCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <DollarSign className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-[14px]">Nenhum reembolso {filterStatus !== 'all' ? STATUS_CONFIG[filterStatus]?.label.toLowerCase() : 'encontrado'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[hsl(var(--admin-border))]">
                      {['Usuário', 'Valor', 'Motivo', 'Método', 'Data', 'Status', 'Ações'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => {
                      const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
                      const StatusIcon = cfg.icon
                      const isProcessingThis = processing === r.id
                      return (
                        <tr key={r.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--sidebar-accent))]/50 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[hsl(var(--admin-bg))] overflow-hidden shrink-0 flex items-center justify-center">
                                {r.user?.avatar_url
                                  ? <img src={r.user.avatar_url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                  : <span className="text-[11px] font-bold text-slate-400">{r.user?.full_name?.[0] || '?'}</span>
                                }
                              </div>
                              <p className="text-slate-200 font-medium">{r.user?.full_name || 'Usuário'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-emerald-400 font-bold text-[14px]">R$ {Number(r.amount).toFixed(2)}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-400 max-w-[160px]">
                            <p className="truncate">{r.reason || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {r.payment?.method || '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString('pt-BR')}
                            <br />
                            <span className="text-[11px] text-slate-600">{new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.color)}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                            {r.processed_at && (
                              <p className="text-slate-600 text-[10px] mt-0.5">
                                {new Date(r.processed_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {r.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleProcess(r.id)}
                                  disabled={isProcessingThis}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors text-[11px] font-semibold disabled:opacity-50"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Processar
                                </button>
                              )}
                              {r.status === 'processing' && (
                                <button
                                  type="button"
                                  onClick={() => handleComplete(r.id)}
                                  disabled={isProcessingThis}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-[11px] font-semibold disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Confirmar
                                </button>
                              )}
                              {['pending', 'processing'].includes(r.status) && (
                                <button
                                  type="button"
                                  onClick={() => handleFail(r.id)}
                                  disabled={isProcessingThis}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-[11px] font-semibold disabled:opacity-50"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Falha
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
    </>
  )
}
