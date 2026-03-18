'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, TrendingUp, Star, Clock, CheckCircle, AlertCircle, Zap, Award, BarChart3, Shield } from 'lucide-react'

interface Performance {
  acceptance_rate: number
  completion_rate: number
  punctuality_rate: number
  avg_response_time_sec: number
  total_compliments: number
  total_complaints: number
}

interface DriverLevel {
  current_rides: number
  current_rating: number
  tier: {
    name: string
    level: number
    min_rides: number
    commission_discount_percent: number
    perks: Record<string, unknown>
  }
}

interface ShiftLog {
  id: string
  started_at: string
  ended_at: string
  total_trips: number
  total_earnings: number
  online_minutes: number
}

interface Penalty {
  id: string
  type: string
  description: string
  amount: number
  applied_at: string
}

const TIER_COLORS: Record<string, string> = {
  Bronze: 'text-amber-700 bg-amber-100',
  Prata: 'text-slate-600 bg-slate-100',
  Ouro: 'text-yellow-700 bg-yellow-100',
  Diamante: 'text-cyan-700 bg-cyan-100',
}

export default function DriverPerformancePage() {
  const router = useRouter()
  const supabase = createClient()
  const [perf, setPerf] = useState<Performance | null>(null)
  const [level, setLevel] = useState<DriverLevel | null>(null)
  const [shifts, setShifts] = useState<ShiftLog[]>([])
  const [penalties, setPenalties] = useState<Penalty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [perfRes, levelRes, shiftsRes, penRes] = await Promise.all([
        supabase.from('driver_performance').select('*').eq('driver_id', user.id).single(),
        supabase.from('driver_levels').select('*, tier:driver_level_tiers(name,level,min_rides,commission_discount_percent,perks)').eq('driver_id', user.id).single(),
        supabase.from('driver_shift_logs').select('*').eq('driver_id', user.id).order('started_at', { ascending: false }).limit(7),
        supabase.from('driver_penalties').select('*').eq('driver_id', user.id).order('applied_at', { ascending: false }).limit(5),
      ])

      if (perfRes.data) setPerf(perfRes.data)
      if (levelRes.data) setLevel(levelRes.data as DriverLevel)
      if (shiftsRes.data) setShifts(shiftsRes.data)
      if (penRes.data) setPenalties(penRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const formatMinutes = (min: number) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  const MetricCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: string }) => (
    <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-lg">Meu Desempenho</h1>
            <p className="text-xs text-muted-foreground">Metricas e nivel de motorista</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-5">

          {/* Nivel atual */}
          {level?.tier && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award size={20} className="text-primary" />
                  <span className="font-semibold text-foreground">Nivel Atual</span>
                </div>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${TIER_COLORS[level.tier.name] || 'text-primary bg-primary/10'}`}>
                  {level.tier.name}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Corridas realizadas</p>
                  <p className="font-bold text-foreground">{level.current_rides}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Nota media</p>
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {level.current_rating?.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Desconto na taxa</p>
                  <p className="font-bold text-green-600">-{level.tier.commission_discount_percent}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Proxima meta</p>
                  <p className="font-bold text-foreground">{level.tier.min_rides} corridas</p>
                </div>
              </div>
              {/* Barra de progresso */}
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min((level.current_rides / Math.max(level.tier.min_rides, 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {level.current_rides} / {level.tier.min_rides} corridas para o proximo nivel
                </p>
              </div>
            </div>
          )}

          {/* Metricas de performance */}
          {perf && (
            <>
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                Metricas de Desempenho
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard icon={CheckCircle} label="Taxa de Aceitacao" value={`${perf.acceptance_rate?.toFixed(0)}%`} color="bg-green-100 text-green-700" />
                <MetricCard icon={TrendingUp} label="Taxa de Conclusao" value={`${perf.completion_rate?.toFixed(0)}%`} color="bg-blue-100 text-blue-700" />
                <MetricCard icon={Clock} label="Pontualidade" value={`${perf.punctuality_rate?.toFixed(0)}%`} color="bg-purple-100 text-purple-700" />
                <MetricCard icon={Zap} label="Tempo Resposta" value={`${perf.avg_response_time_sec}s`} color="bg-yellow-100 text-yellow-700" />
                <MetricCard icon={Star} label="Elogios" value={String(perf.total_compliments)} color="bg-emerald-100 text-emerald-700" />
                <MetricCard icon={AlertCircle} label="Reclamacoes" value={String(perf.total_complaints)} color="bg-red-100 text-red-700" />
              </div>
            </>
          )}

          {/* Historico de turnos */}
          {shifts.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Clock size={16} className="text-primary" />
                Ultimos 7 Turnos
              </h2>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {shifts.map((s) => (
                  <div key={s.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatDate(s.started_at)}</p>
                      <p className="text-xs text-muted-foreground">{formatMinutes(s.online_minutes)} online · {s.total_trips} corridas</p>
                    </div>
                    <p className="text-sm font-bold text-green-600">R$ {Number(s.total_earnings).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Penalidades */}
          {penalties.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <Shield size={16} className="text-destructive" />
                Penalidades Recentes
              </h2>
              <div className="bg-card rounded-xl border border-destructive/20 divide-y divide-border">
                {penalties.map((p) => (
                  <div key={p.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{p.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.applied_at)}</p>
                    </div>
                    {p.amount > 0 && (
                      <p className="text-sm font-bold text-destructive">-R$ {Number(p.amount).toFixed(2)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!perf && !level && (
            <div className="text-center py-12">
              <BarChart3 size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Dados de desempenho disponiveis apos sua primeira corrida</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
