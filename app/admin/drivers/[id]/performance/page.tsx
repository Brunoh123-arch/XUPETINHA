"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Star, Clock, CheckCircle, XCircle, MessageCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Performance = {
  acceptance_rate: number; completion_rate: number; punctuality_rate: number
  avg_response_time_sec: number; total_compliments: number; total_complaints: number
}
type Metric = {
  id: string; period_start: string; period_end: string; rides_completed: number
  rides_cancelled: number; acceptance_rate: number; completion_rate: number
  avg_rating: number; total_online_hours: number; total_earnings: number
  total_distance_km: number; peak_hour_rides: number
}
type DriverInfo = { full_name: string; phone: string }

function ScoreBar({ value, label, color = "bg-primary" }: { value: number; label: string; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{Number(value ?? 0).toFixed(1)}%</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(Number(value ?? 0), 100)}%` }} />
      </div>
    </div>
  )
}

export default function DriverPerformancePage() {
  const supabase = createClient()
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const [perf, setPerf] = useState<Performance | null>(null)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [driver, setDriver] = useState<DriverInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [p, m, d] = await Promise.all([
        supabase.from("driver_performance").select("*").eq("driver_id", id).maybeSingle(),
        supabase.from("driver_performance_metrics").select("*").eq("driver_id", id).order("period_start", { ascending: false }).limit(6),
        supabase.from("profiles").select("full_name, phone").eq("id", id).maybeSingle(),
      ])
      setPerf(p.data)
      setMetrics(m.data ?? [])
      setDriver(d.data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Desempenho do Motorista</h1>
          <p className="text-sm text-muted-foreground">{driver?.full_name ?? id}</p>
        </div>
      </div>

      {/* Score geral */}
      {perf ? (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Metricas Gerais</h2>
          <ScoreBar value={perf.acceptance_rate} label="Taxa de aceitacao" color="bg-green-500" />
          <ScoreBar value={perf.completion_rate} label="Taxa de conclusao" color="bg-blue-500" />
          <ScoreBar value={perf.punctuality_rate} label="Pontualidade" color="bg-yellow-500" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="font-semibold text-foreground">{perf.avg_response_time_sec ?? 0}s</p>
              <p className="text-xs text-muted-foreground">Tempo de resposta</p>
            </div>
            <div className="text-center">
              <MessageCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="font-semibold text-foreground">{perf.total_compliments ?? 0}</p>
              <p className="text-xs text-muted-foreground">Elogios</p>
            </div>
            <div className="text-center">
              <XCircle className="w-5 h-5 mx-auto text-red-500 mb-1" />
              <p className="font-semibold text-foreground">{perf.total_complaints ?? 0}</p>
              <p className="text-xs text-muted-foreground">Reclamacoes</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground">
          Sem dados de performance ainda
        </div>
      )}

      {/* Historico por periodo */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">Historico por Periodo</h2>
        {metrics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Nenhum periodo registrado</div>
        ) : (
          <div className="space-y-3">
            {metrics.map(m => (
              <div key={m.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    {format(new Date(m.period_start), "dd/MM", { locale: ptBR })} — {format(new Date(m.period_end), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    {Number(m.avg_rating ?? 0).toFixed(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { icon: CheckCircle, label: "Corridas", value: m.rides_completed, color: "text-green-500" },
                    { icon: XCircle, label: "Canceladas", value: m.rides_cancelled, color: "text-red-500" },
                    { icon: Clock, label: "Horas online", value: `${Number(m.total_online_hours ?? 0).toFixed(0)}h`, color: "text-blue-500" },
                    { icon: TrendingUp, label: "Ganhos", value: `R$${Number(m.total_earnings ?? 0).toFixed(0)}`, color: "text-primary" },
                  ].map(item => (
                    <div key={item.label}>
                      <item.icon className={`w-4 h-4 mx-auto mb-1 ${item.color}`} />
                      <p className="font-semibold text-foreground text-sm">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
