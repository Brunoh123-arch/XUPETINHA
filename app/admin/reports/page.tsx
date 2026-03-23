'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { cn } from '@/lib/utils'
import { BarChart3, Download, Plus, RefreshCw, FileText, Calendar } from 'lucide-react'

interface Report {
  id: string
  name: string
  type: string
  period_start: string
  period_end: string
  data: Record<string, unknown>
  generated_by: string
  created_at: string
}

const REPORT_TYPES = [
  { value: 'rides', label: 'Corridas' },
  { value: 'revenue', label: 'Receita' },
  { value: 'drivers', label: 'Motoristas' },
  { value: 'users', label: 'Usuarios' },
  { value: 'support', label: 'Suporte' },
  { value: 'disputes', label: 'Disputas' },
  { value: 'refunds', label: 'Reembolsos' },
]

const TYPE_COLOR: Record<string, string> = {
  rides: 'bg-blue-500/10 text-blue-400',
  revenue: 'bg-emerald-500/10 text-emerald-400',
  drivers: 'bg-amber-500/10 text-amber-400',
  users: 'bg-violet-500/10 text-violet-400',
  support: 'bg-cyan-500/10 text-cyan-400',
  disputes: 'bg-red-500/10 text-red-400',
  refunds: 'bg-orange-500/10 text-orange-400',
}

export default function AdminReportsPage() {
  const supabase = createClient()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState('all')
  const [newReport, setNewReport] = useState({ name: '', type: 'rides', period_start: '', period_end: '' })

  useEffect(() => { fetchReports() }, [])

  async function fetchReports() {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }

  async function generateReport() {
    if (!newReport.name || !newReport.period_start || !newReport.period_end) return
    setGenerating(true)

    // Gera dados reais baseados no tipo
    let data: Record<string, unknown> = {}
    if (newReport.type === 'rides') {
      const { count } = await supabase
        .from('rides')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', newReport.period_start)
        .lte('created_at', newReport.period_end)
      data = { total_trips: count || 0, period: `${newReport.period_start} a ${newReport.period_end}` }
    } else if (newReport.type === 'revenue') {
      const { data: rides } = await supabase
        .from('rides')
        .select('final_price')
        .gte('created_at', newReport.period_start)
        .lte('created_at', newReport.period_end)
        .eq('status', 'completed')
      const total = (rides || []).reduce((sum, r) => sum + (Number(r.final_price) || 0), 0)
      data = { total_revenue: total, rides_completed: (rides || []).length }
    }

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('reports').insert({
      name: newReport.name,
      type: newReport.type,
      period_start: newReport.period_start,
      period_end: newReport.period_end,
      data,
      generated_by: user?.id,
    })
    setNewReport({ name: '', type: 'rides', period_start: '', period_end: '' })
    setGenerating(false)
    fetchReports()
  }

  function downloadReport(report: Report) {
    const content = JSON.stringify(report, null, 2)
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.name.replace(/\s+/g, '_')}_${report.period_start}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = filter === 'all' ? reports : reports.filter(r => r.type === filter)

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Relatorios" subtitle="Gerar e exportar relatorios do sistema" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Resumo */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{reports.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Relatorios Gerados</p>
          </div>
          {['rides','revenue','drivers'].map(type => (
            <div key={type} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{reports.filter(r => r.type === type).length}</p>
              <p className="text-xs text-muted-foreground mt-1">{REPORT_TYPES.find(t => t.value === type)?.label}</p>
            </div>
          ))}
        </div>

        {/* Gerador */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Gerar Novo Relatorio</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input value={newReport.name} onChange={e => setNewReport(p => ({ ...p, name: e.target.value }))}
              placeholder="Nome do relatorio"
              className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground col-span-2 md:col-span-1" />
            <select value={newReport.type} onChange={e => setNewReport(p => ({ ...p, type: e.target.value }))}
              className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input type="date" value={newReport.period_start} onChange={e => setNewReport(p => ({ ...p, period_start: e.target.value }))}
              className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
            <input type="date" value={newReport.period_end} onChange={e => setNewReport(p => ({ ...p, period_end: e.target.value }))}
              className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>
          <button onClick={generateReport} disabled={generating}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            {generating ? 'Gerando...' : 'Gerar Relatorio'}
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:text-foreground')}>
            Todos ({reports.length})
          </button>
          {REPORT_TYPES.map(t => (
            <button key={t.value} onClick={() => setFilter(t.value)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:text-foreground')}>
              {t.label} ({reports.filter(r => r.type === t.value).length})
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(report => (
              <div key={report.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{report.name}</p>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLOR[report.type] || 'bg-muted/30 text-muted-foreground')}>
                        {REPORT_TYPES.find(t => t.value === report.type)?.label || report.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.period_start).toLocaleDateString('pt-BR')} a {new Date(report.period_end).toLocaleDateString('pt-BR')}
                      {' · '}Gerado em {new Date(report.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button onClick={() => downloadReport(report)}
                  className="flex items-center gap-1.5 bg-muted/20 hover:bg-muted/40 text-foreground px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  <Download className="w-3.5 h-3.5" /> Exportar JSON
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">Nenhum relatorio encontrado</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
