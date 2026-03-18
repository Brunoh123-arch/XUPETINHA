'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ScheduledPayment {
  id: string
  amount: number
  type: string
  scheduled_at: string
  paid_at: string | null
  status: string
  metadata: Record<string, string> | null
}

const TYPE_LABELS: Record<string, string> = {
  subscription: 'Assinatura',
  cashback: 'Cashback',
  refund: 'Reembolso',
  bonus: 'Bônus',
  split: 'Divisão de corrida',
  insurance: 'Seguro',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Agendado', color: 'bg-yellow-500/10 text-yellow-600' },
  paid: { label: 'Pago', color: 'bg-green-500/10 text-green-600' },
  failed: { label: 'Falhou', color: 'bg-destructive/10 text-destructive' },
  cancelled: { label: 'Cancelado', color: 'bg-muted text-muted-foreground' },
}

export default function ScheduledPaymentsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [payments, setPayments] = useState<ScheduledPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('scheduled_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: false })
      setPayments(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = payments.filter(p => {
    if (filter === 'pending') return p.status === 'pending'
    if (filter === 'paid') return p.status === 'paid'
    return true
  })

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Pagamentos Agendados</h1>
            <p className="text-xs text-muted-foreground">Cobranças e créditos futuros</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Cards resumo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Aguardando</span>
            </div>
            <p className="text-xl font-bold text-foreground">{fmt(totalPending)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {payments.filter(p => p.status === 'pending').length} pagamento(s)
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Processados</span>
            </div>
            <p className="text-xl font-bold text-foreground">{fmt(totalPaid)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {payments.filter(p => p.status === 'paid').length} pagamento(s)
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'pending', label: 'Agendados' },
            { key: 'paid', label: 'Pagos' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">Nenhum pagamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => {
              const status = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending
              const isCredit = p.type === 'cashback' || p.type === 'refund' || p.type === 'bonus'

              return (
                <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    p.status === 'paid' ? 'bg-green-500/10' :
                    p.status === 'failed' ? 'bg-destructive/10' : 'bg-yellow-500/10'
                  }`}>
                    {p.status === 'paid'
                      ? <CheckCircle className="w-5 h-5 text-green-500" />
                      : p.status === 'failed'
                      ? <XCircle className="w-5 h-5 text-destructive" />
                      : <Clock className="w-5 h-5 text-yellow-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {TYPE_LABELS[p.type] ?? p.type}
                      </span>
                      <Badge className={`text-xs ${status.color}`} variant="secondary">
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.status === 'paid' && p.paid_at
                        ? `Pago em ${fmtDate(p.paid_at)}`
                        : `Agendado para ${fmtDate(p.scheduled_at)}`
                      }
                    </p>
                    {p.metadata?.description && (
                      <p className="text-xs text-muted-foreground truncate">{p.metadata.description}</p>
                    )}
                  </div>
                  <span className={`font-bold text-base flex-shrink-0 ${isCredit ? 'text-green-600' : 'text-foreground'}`}>
                    {isCredit ? '+' : '-'}{fmt(Number(p.amount))}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
