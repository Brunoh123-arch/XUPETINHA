'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { cn } from '@/lib/utils'

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  pix_key: string | null
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
  description: string | null
  driver: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    avatar_url: string | null
  } | null
}

export default function AdminWithdrawalsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'cancelled'>('pending')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/onboarding/splash'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/uppi/home')
        return
      }
      setIsAdmin(true)
    }
    checkAdmin()
  }, [])

  const loadWithdrawals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/admin/withdrawals?status=${statusFilter}`)
      if (!res.ok) throw new Error()
      const { withdrawals: data } = await res.json()
      setWithdrawals(data || [])
    } catch {
      iosToast.error('Erro ao carregar saques')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (isAdmin) loadWithdrawals()
  }, [isAdmin, loadWithdrawals])

  // Realtime
  useEffect(() => {
    if (!isAdmin) return
    const channel = supabase
      .channel('admin-withdrawals')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'wallet_transactions',
        filter: 'type=eq.withdrawal',
      }, () => loadWithdrawals())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isAdmin])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id)
    try {
      const res = await fetch('/api/v1/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: id, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        iosToast.error(data.error || 'Erro ao processar')
        return
      }
      iosToast.success(action === 'approve' ? 'Saque aprovado!' : 'Saque rejeitado e valor estornado')
      setWithdrawals(prev => prev.filter(w => w.id !== id))
    } catch {
      iosToast.error('Erro ao processar saque')
    } finally {
      setProcessing(null)
    }
  }

  if (!isAdmin) return null

  const totalAmount = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0)

  return (
    <div className="h-dvh overflow-y-auto bg-[color:var(--background)] pb-8 ios-scroll">
      <header className="bg-[color:var(--card)]/90 ios-blur border-b border-[color:var(--border)] sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[color:var(--muted)] ios-press"
          >
            <svg className="w-5 h-5 text-[color:var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-[20px] font-bold text-[color:var(--foreground)]">Saques Pendentes</h1>
            <p className="text-[13px] text-[color:var(--muted-foreground)]">Painel Administrativo</p>
          </div>
          {statusFilter === 'pending' && (
            <div className="bg-red-500 text-white text-[12px] font-bold px-3 py-1 rounded-full">
              {withdrawals.length}
            </div>
          )}
        </div>

        <div className="px-5 pb-3 flex gap-2">
          {(['pending', 'completed', 'cancelled'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'flex-1 py-2 rounded-[12px] text-[12px] font-bold ios-press',
                statusFilter === s
                  ? s === 'pending' ? 'bg-amber-500 text-white'
                    : s === 'completed' ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)]'
              )}
            >
              {s === 'pending' ? 'Pendentes' : s === 'completed' ? 'Aprovados' : 'Rejeitados'}
            </button>
          ))}
        </div>
      </header>

      {/* Summary */}
      {statusFilter === 'pending' && withdrawals.length > 0 && (
        <div className="mx-5 mt-5 bg-amber-50 border border-amber-200 rounded-[18px] p-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] text-amber-600 font-semibold">Total pendente</p>
            <p className="text-[22px] font-black text-amber-700">R$ {totalAmount.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-amber-600">{withdrawals.length} solicitações</p>
            <p className="text-[12px] text-amber-500">Aguardando aprovação</p>
          </div>
        </div>
      )}

      <main className="px-5 py-5 max-w-2xl mx-auto space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[color:var(--card)] rounded-[20px] p-5 border border-[color:var(--border)] animate-pulse">
              <div className="h-5 bg-[color:var(--muted)] rounded w-1/2 mb-3" />
              <div className="h-4 bg-[color:var(--muted)] rounded w-3/4" />
            </div>
          ))
        ) : withdrawals.length === 0 ? (
          <div className="bg-[color:var(--card)] rounded-[24px] p-16 text-center border border-[color:var(--border)]">
            <p className="text-[18px] font-bold text-[color:var(--foreground)] mb-1">
              {statusFilter === 'pending' ? 'Nenhum saque pendente' : 'Nenhum registro'}
            </p>
            <p className="text-[14px] text-[color:var(--muted-foreground)]">
              {statusFilter === 'pending' ? 'Todos os saques foram processados' : 'Sem registros neste filtro'}
            </p>
          </div>
        ) : (
          withdrawals.map((w, i) => (
            <div
              key={w.id}
              className="bg-[color:var(--card)] rounded-[20px] p-5 border border-[color:var(--border)] animate-ios-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Driver info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[16px] shrink-0">
                  {w.driver?.full_name?.charAt(0) || 'M'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-[color:var(--foreground)] truncate">
                    {w.driver?.full_name || 'Motorista'}
                  </p>
                  <p className="text-[13px] text-[color:var(--muted-foreground)] truncate">
                    {w.driver?.email || w.driver?.phone || '—'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[22px] font-black text-emerald-600">R$ {Number(w.amount).toFixed(2)}</p>
                  <p className="text-[11px] text-[color:var(--muted-foreground)]">
                    {new Date(w.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* PIX Key */}
              {w.pix_key && (
                <div className="bg-[color:var(--muted)] rounded-[12px] px-3 py-2 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[color:var(--muted-foreground)]">Chave PIX</p>
                    <p className="text-[13px] font-mono font-bold text-[color:var(--foreground)] truncate">{w.pix_key}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => { const { nativeCopy } = await import('@/lib/native'); await nativeCopy(w.pix_key!); iosToast.success('PIX copiado!') }}
                    className="text-[12px] text-blue-500 font-bold ios-press shrink-0"
                  >
                    Copiar
                  </button>
                </div>
              )}

              {/* Actions */}
              {statusFilter === 'pending' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction(w.id, 'reject')}
                    disabled={processing === w.id}
                    className="flex-1 h-[46px] bg-red-50 text-red-600 font-bold text-[14px] rounded-[14px] ios-press disabled:opacity-50 border border-red-200"
                  >
                    {processing === w.id ? '...' : 'Rejeitar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(w.id, 'approve')}
                    disabled={processing === w.id}
                    className="flex-1 h-[46px] bg-emerald-500 text-white font-bold text-[14px] rounded-[14px] ios-press disabled:opacity-50 shadow-md shadow-emerald-500/20"
                  >
                    {processing === w.id
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      : 'Aprovar'}
                  </button>
                </div>
              )}

              {statusFilter !== 'pending' && (
                <div className={cn(
                  'text-center text-[13px] font-bold py-2 rounded-[12px]',
                  statusFilter === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                )}>
                  {statusFilter === 'completed' ? 'Saque aprovado e processado' : 'Saque rejeitado (valor estornado)'}
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  )
}
