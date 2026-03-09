'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell } from 'recharts'
import {
  DollarSign, TrendingUp, CreditCard, Wallet,
  ArrowUpRight, ArrowDownRight, Banknote, RefreshCw, Car,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FinancialSummary {
  total_revenue: number
  today_revenue: number
  platform_fee: number
  driver_earnings: number
  total_rides: number
  today_rides: number
  avg_ticket: number
}

interface DayRevenue {
  day: string
  ride_count: number
  revenue: number
}

interface RecentPayment {
  id: string
  ride_id: string
  amount: number
  platform_fee: number
  driver_earnings: number
  payment_method: string
  status: string
  created_at: string
}

const methodLabels: Record<string, string> = {
  pix: 'PIX', cash: 'Dinheiro', credit_card: 'Credito', debit_card: 'Debito', wallet: 'Carteira', other: 'Outro',
}
const methodColors: Record<string, string> = {
  pix: '#10b981', cash: '#f59e0b', credit_card: '#3b82f6', debit_card: '#8b5cf6', wallet: '#f97316', other: '#6b7280',
}

export default function FinanceiroPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [dailyRevenue, setDailyRevenue] = useState<DayRevenue[]>([])
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [methodBreakdown, setMethodBreakdown] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const [summaryRes, dailyRes, recentRes] = await Promise.all([
      // Sumario financeiro via RPC
      supabase.rpc('get_admin_financial_summary', { p_days: 30 }),
      // Receita por dia via RPC
      supabase.rpc('get_rides_revenue_by_day', { p_days: 14 }),
      // Pagamentos recentes da tabela payments
      supabase
        .from('payments')
        .select('id, ride_id, amount, platform_fee, driver_earnings, payment_method, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    if (summaryRes.data) setSummary(summaryRes.data as FinancialSummary)

    // Preencher dias sem dados com 0
    if (dailyRes.data) {
      const dataMap: Record<string, DayRevenue> = {}
      for (const d of dailyRes.data as DayRevenue[]) dataMap[d.day] = d
      const filled: DayRevenue[] = []
      for (let i = 13; i >= 0; i--) {
        const dt = new Date()
        dt.setDate(dt.getDate() - i)
        const key = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        filled.push(dataMap[key] || { day: key, ride_count: 0, revenue: 0 })
      }
      setDailyRevenue(filled)
    }

    const payments = (recentRes.data || []) as RecentPayment[]
    setRecentPayments(payments)

    // Quebrar por metodo de pagamento
    const methodMap: Record<string, number> = {}
    for (const p of payments) {
      if (p.status === 'completed') {
        const m = p.payment_method || 'other'
        methodMap[m] = (methodMap[m] || 0) + Number(p.amount || 0)
      }
    }

    // Se payments vazios, usar rides completadas agrupadas por payment_method
    if (Object.keys(methodMap).length === 0) {
      const { data: ridePayMethods } = await supabase
        .from('rides')
        .select('payment_method, final_price, passenger_price_offer')
        .eq('status', 'completed')
      for (const r of ridePayMethods || []) {
        const m = r.payment_method || 'cash'
        const amt = Number(r.final_price || r.passenger_price_offer || 0)
        if (amt > 0) methodMap[m] = (methodMap[m] || 0) + amt
      }
    }

    setMethodBreakdown(
      Object.entries(methodMap)
        .map(([key, value]) => ({ name: methodLabels[key] || key, value, color: methodColors[key] || '#6b7280' }))
        .sort((a, b) => b.value - a.value)
    )

    setLastRefresh(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const supabase = createClient()
    channelRef.current = supabase
      .channel('admin-financeiro-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, fetchData)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [fetchData])

  // Calcular variacao diaria
  const today = dailyRevenue[dailyRevenue.length - 1]?.revenue ?? 0
  const yesterday = dailyRevenue[dailyRevenue.length - 2]?.revenue ?? 0
  const revenueChange = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0

  if (loading) {
    return (
      <>
        <AdminHeader title="Financeiro" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))]">
          <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  const s = summary ?? {
    total_revenue: 0, today_revenue: 0, platform_fee: 0,
    driver_earnings: 0, total_rides: 0, today_rides: 0, avg_ticket: 0,
  }

  const headerActions = (
    <button
      type="button"
      onClick={fetchData}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
    >
      <RefreshCw className="w-3 h-3" />
      {lastRefresh && <span className="hidden sm:inline">{lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
    </button>
  )

  return (
    <>
      <AdminHeader title="Financeiro" subtitle="Receitas e pagamentos em tempo real" actions={headerActions} />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))] p-5 space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[22px] font-bold text-slate-100 tabular-nums">R$ {Number(s.total_revenue).toFixed(2)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Receita Total (30d)</p>
          </div>

          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              {revenueChange !== 0 && (
                <div className={cn('flex items-center gap-0.5 text-[11px] font-bold', revenueChange > 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {revenueChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(revenueChange).toFixed(0)}%
                </div>
              )}
            </div>
            <p className="text-[22px] font-bold text-slate-100 tabular-nums">R$ {Number(s.today_revenue).toFixed(2)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Receita Hoje</p>
          </div>

          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3">
              <Wallet className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-[22px] font-bold text-slate-100 tabular-nums">R$ {Number(s.avg_ticket).toFixed(2)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Ticket Medio</p>
          </div>

          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
              <Car className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-[22px] font-bold text-slate-100 tabular-nums">{s.total_rides}</p>
            <p className="text-[11px] text-slate-500 mt-1">Corridas Finalizadas (30d)</p>
          </div>
        </div>

        {/* Taxas e repasses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-100 tabular-nums">R$ {Number(s.platform_fee).toFixed(2)}</p>
              <p className="text-[11px] text-slate-500">Taxa Plataforma (20%)</p>
            </div>
          </div>
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-100 tabular-nums">R$ {Number(s.driver_earnings).toFixed(2)}</p>
              <p className="text-[11px] text-slate-500">Repasse Motoristas (80%)</p>
            </div>
          </div>
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[20px] font-bold text-slate-100 tabular-nums">{s.today_rides}</p>
              <p className="text-[11px] text-slate-500">Corridas Hoje</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4 lg:col-span-2">
            <h3 className="text-[13px] font-bold text-slate-200 mb-4">Receita — Ultimos 14 dias</h3>
            <ChartContainer config={{ revenue: { label: 'Receita (R$)', color: 'hsl(var(--admin-green))' } }} className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyRevenue} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--admin-green))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--admin-green))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--admin-border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--admin-green))" fill="url(#revFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-4">
            <h3 className="text-[13px] font-bold text-slate-200 mb-4">Metodos de Pagamento</h3>
            {methodBreakdown.length > 0 ? (
              <>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={methodBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                        {methodBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {methodBreakdown.map((p) => (
                    <div key={p.name} className="flex items-center gap-2 text-[11px]">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-slate-300 font-medium flex-1">{p.name}</span>
                      <span className="text-slate-500 tabular-nums">R$ {p.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-600 text-[12px]">Sem dados ainda</div>
            )}
          </div>
        </div>

        {/* Tabela de pagamentos */}
        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
          <div className="px-5 py-3.5 border-b border-[hsl(var(--admin-border))]">
            <h3 className="text-[13px] font-bold text-slate-200">Pagamentos Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[hsl(var(--admin-border))]">
                  {['ID Corrida', 'Metodo', 'Taxa (20%)', 'Repasse (80%)', 'Status', 'Valor', 'Data'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPayments.slice(0, 30).map((p) => (
                  <tr key={p.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--sidebar-accent))]/40 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">{p.ride_id?.slice(0, 8) || '---'}…</td>
                    <td className="px-4 py-3 text-slate-300">{methodLabels[p.payment_method] || p.payment_method || '---'}</td>
                    <td className="px-4 py-3 text-amber-400 tabular-nums">R$ {Number(p.platform_fee || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-emerald-400 tabular-nums">R$ {Number(p.driver_earnings || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn('text-[10px] font-bold border-0',
                        p.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                        p.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-red-500/15 text-red-400'
                      )}>
                        {p.status === 'completed' ? 'Pago' : p.status === 'pending' ? 'Pendente' : p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-200 font-semibold tabular-nums">R$ {Number(p.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 tabular-nums whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-600">
                      Nenhum pagamento registrado ainda. Os pagamentos aparecem automaticamente ao finalizar corridas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
