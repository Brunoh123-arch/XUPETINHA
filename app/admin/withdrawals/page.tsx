'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { Badge } from '@/components/ui/badge'
import { Banknote, Check, X, Clock, AlertCircle, RefreshCw, Search, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Withdrawal {
  id: string
  driver_id: string
  amount: number
  pix_key: string
  pix_key_type: string
  bank_name: string | null
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  requested_at: string
  processed_at: string | null
  rejection_reason: string | null
  notes: string | null
  driver: {
    full_name: string | null
    avatar_url: string | null
    phone: string | null
  } | null
}

const statusConfig = {
  pending:  { label: 'Pendente',  color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  approved: { label: 'Aprovado', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Rejeitado',color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  paid:     { label: 'Pago',     color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
}

const pixTypeLabels: Record<string, string> = {
  cpf: 'CPF', cnpj: 'CNPJ', email: 'E-mail', phone: 'Telefone', random: 'Chave Aleatória',
}

export default function WithdrawalsPage() {
  const supabase = createClient()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'paid'>('pending')
  const [search, setSearch] = useState('')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [summary, setSummary] = useState({ total_pending: 0, total_amount: 0, count_today: 0 })
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchWithdrawals = useCallback(async () => {
    let q = supabase
      .from('driver_withdrawals')
      .select(`
        *,
        driver:profiles!driver_withdrawals_driver_id_fkey(full_name, avatar_url, phone)
      `)
      .order('requested_at', { ascending: false })
      .limit(100)

    if (filter !== 'all') q = q.eq('status', filter)

    const { data } = await q
    setWithdrawals((data as Withdrawal[]) || [])
    setLoading(false)

    // Summary
    const { data: pendingData } = await supabase
      .from('driver_withdrawals')
      .select('amount')
      .eq('status', 'pending')

    const pendingList = pendingData || []
    setSummary({
      total_pending: pendingList.length,
      total_amount: pendingList.reduce((s, r) => s + (r.amount || 0), 0),
      count_today: pendingList.filter((r: { created_at?: string; requested_at?: string }) => {
        const d = new Date((r as Withdrawal & { requested_at: string }).requested_at)
        return d.toDateString() === new Date().toDateString()
      }).length,
    })
  }, [filter])

  useEffect(() => {
    fetchWithdrawals()
    channelRef.current = supabase
      .channel('admin-withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_withdrawals' }, fetchWithdrawals)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [fetchWithdrawals])

  const handleProcess = async (id: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessing(id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase.rpc('admin_process_withdrawal', {
        p_admin_id: user.id,
        p_withdrawal_id: id,
        p_action: action,
        p_notes: notes || null,
      })
      if (error || !data?.success) {
        alert(data?.error || error?.message || 'Erro ao processar saque')
        return
      }
      setRejectId(null)
      setRejectReason('')
      fetchWithdrawals()
    } finally {
      setProcessing(null)
    }
  }

  const filtered = withdrawals.filter(w => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      w.driver?.full_name?.toLowerCase().includes(q) ||
      w.pix_key?.toLowerCase().includes(q) ||
      w.id?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Saques" subtitle="Gerencie solicitações de saque dos motoristas" />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pendentes', value: summary.total_pending, icon: Clock, color: 'text-amber-400' },
            { label: 'Valor Pendente', value: `R$ ${summary.total_amount.toFixed(2).replace('.', ',')}`, icon: Banknote, color: 'text-emerald-400' },
            { label: 'Solicitados Hoje', value: summary.count_today, icon: TrendingUp, color: 'text-blue-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center', color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-100">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
            {(['all', 'pending', 'approved', 'rejected', 'paid'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setLoading(true) }}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  filter === f
                    ? 'bg-[hsl(var(--admin-green))]/20 text-[hsl(var(--admin-green))]'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {f === 'all' ? 'Todos' : statusConfig[f].label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar motorista ou chave PIX..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-white/20"
            />
          </div>
          <button onClick={fetchWithdrawals} className="p-2 rounded-lg border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
            <AlertCircle className="w-8 h-8 opacity-40" />
            <span className="text-sm">Nenhum saque encontrado</span>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(w => (
              <div key={w.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                {rejectId === w.id ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-300 font-medium">Motivo da rejeição:</p>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Descreva o motivo..."
                      rows={2}
                      className="w-full px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-white/20 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcess(w.id, 'reject', rejectReason)}
                        disabled={processing === w.id}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded-lg border border-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {processing === w.id ? 'Processando...' : 'Confirmar Rejeição'}
                      </button>
                      <button
                        onClick={() => { setRejectId(null); setRejectReason('') }}
                        className="px-3 py-1.5 text-slate-400 text-xs font-medium rounded-lg border border-white/[0.06] hover:text-slate-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shrink-0 text-white text-sm font-bold">
                      {w.driver?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-100">{w.driver?.full_name || 'Motorista'}</span>
                        <Badge className={cn('text-[10px] border', statusConfig[w.status].color)}>
                          {statusConfig[w.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="font-mono">{pixTypeLabels[w.pix_key_type] || 'PIX'}: {w.pix_key}</span>
                        {w.bank_name && <span>{w.bank_name}</span>}
                        <span>{formatDistanceToNow(new Date(w.requested_at), { addSuffix: true, locale: ptBR })}</span>
                      </div>
                      {w.rejection_reason && (
                        <p className="text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                          Motivo: {w.rejection_reason}
                        </p>
                      )}
                    </div>
                    {/* Valor + Ações */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xl font-bold text-emerald-400">
                        R$ {w.amount.toFixed(2).replace('.', ',')}
                      </span>
                      {w.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleProcess(w.id, 'approve')}
                            disabled={processing === w.id}
                            title="Aprovar"
                            className="w-8 h-8 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {processing === w.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setRejectId(w.id)}
                            title="Rejeitar"
                            className="w-8 h-8 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
