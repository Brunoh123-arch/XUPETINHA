"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FlaskConical, Plus, ToggleLeft, ToggleRight, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type PricingExp = {
  id: string; name: string; description: string
  variant: string; percentage: number; is_active: boolean; created_at: string
}
type ABTest = {
  id: string; user_id: string; test_name: string
  variant: string; converted: boolean; created_at: string
}
type CampaignAnalytics = {
  id: string; campaign_id: string; sent_count: number; delivered_count: number
  opened_count: number; clicked_count: number; converted_count: number; updated_at: string
}

export default function ExperimentsPage() {
  const supabase = createClient()
  const [experiments, setExperiments] = useState<PricingExp[]>([])
  const [abtests, setABTests] = useState<ABTest[]>([])
  const [analytics, setAnalytics] = useState<CampaignAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", variant: "", percentage: "10" })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [exp, ab, ca] = await Promise.all([
      supabase.from("pricing_experiments").select("*").order("created_at", { ascending: false }),
      supabase.from("ab_test_participants").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("campaign_analytics").select("*").order("updated_at", { ascending: false }).limit(20),
    ])
    setExperiments(exp.data ?? [])
    setABTests(ab.data ?? [])
    setAnalytics(ca.data ?? [])
    setLoading(false)
  }

  async function toggleExp(e: PricingExp) {
    await supabase.from("pricing_experiments").update({ is_active: !e.is_active }).eq("id", e.id)
    fetchAll()
  }

  async function saveExp() {
    await supabase.from("pricing_experiments").insert({
      name: form.name, description: form.description,
      variant: form.variant, percentage: Number(form.percentage), is_active: false,
    })
    setOpen(false)
    fetchAll()
  }

  // Agrupa AB tests por test_name
  const abGrouped = abtests.reduce<Record<string, { variants: Record<string, number>; converted: number; total: number }>>((acc, t) => {
    if (!acc[t.test_name]) acc[t.test_name] = { variants: {}, converted: 0, total: 0 }
    acc[t.test_name].total++
    acc[t.test_name].variants[t.variant] = (acc[t.test_name].variants[t.variant] ?? 0) + 1
    if (t.converted) acc[t.test_name].converted++
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Experimentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Testes A/B, precificacao e analytics de campanhas</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Experimento
        </Button>
      </div>

      <Tabs defaultValue="pricing">
        <TabsList>
          <TabsTrigger value="pricing">Precificacao</TabsTrigger>
          <TabsTrigger value="ab">Testes A/B</TabsTrigger>
          <TabsTrigger value="campaigns">Analytics Campanhas</TabsTrigger>
        </TabsList>

        {/* Experimentos de precificacao */}
        <TabsContent value="pricing" className="space-y-3 mt-4">
          {loading ? <p className="text-muted-foreground py-8 text-center">Carregando...</p> : experiments.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum experimento criado</p>
            </div>
          ) : experiments.map(e => (
            <div key={e.id} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground">{e.name}</span>
                  <Badge variant="outline" className="text-xs">{e.variant}</Badge>
                  <Badge variant="outline" className="text-xs">{e.percentage}% usuarios</Badge>
                  <Badge variant={e.is_active ? "default" : "secondary"} className="text-xs">
                    {e.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{e.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Criado em {format(new Date(e.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => toggleExp(e)}>
                {e.is_active
                  ? <ToggleRight className="w-6 h-6 text-primary" />
                  : <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                }
              </Button>
            </div>
          ))}
        </TabsContent>

        {/* Testes A/B agrupados */}
        <TabsContent value="ab" className="space-y-3 mt-4">
          {Object.keys(abGrouped).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum teste A/B registrado</p>
            </div>
          ) : Object.entries(abGrouped).map(([testName, data]) => (
            <div key={testName} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-foreground">{testName}</span>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{data.total} participantes</span>
                  <span>·</span>
                  <span className="text-green-600 font-medium">
                    {data.total > 0 ? ((data.converted / data.total) * 100).toFixed(1) : 0}% conversao
                  </span>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(data.variants).map(([variant, count]) => (
                  <div key={variant} className="bg-muted rounded-lg px-4 py-2 text-sm">
                    <span className="font-medium text-foreground">{variant}</span>
                    <span className="text-muted-foreground ml-2">{count} usuarios ({data.total > 0 ? ((count / data.total) * 100).toFixed(0) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Campaign analytics */}
        <TabsContent value="campaigns" className="space-y-3 mt-4">
          {analytics.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma metrica de campanha registrada</p>
            </div>
          ) : analytics.map(ca => {
            const openRate = ca.sent_count > 0 ? ((ca.opened_count / ca.sent_count) * 100).toFixed(1) : "0"
            const convRate = ca.sent_count > 0 ? ((ca.converted_count / ca.sent_count) * 100).toFixed(1) : "0"
            return (
              <div key={ca.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground font-mono">{ca.campaign_id.slice(0, 12)}...</span>
                  <span className="text-xs text-muted-foreground">
                    Atualizado {format(new Date(ca.updated_at), "dd/MM HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3 text-center">
                  {[
                    { label: "Enviados", value: ca.sent_count },
                    { label: "Entregues", value: ca.delivered_count },
                    { label: "Abertos", value: `${openRate}%` },
                    { label: "Cliques", value: ca.clicked_count },
                    { label: "Conversoes", value: `${convRate}%` },
                  ].map(m => (
                    <div key={m.label} className="bg-muted rounded-lg p-3">
                      <p className="text-lg font-bold text-foreground">{m.value.toLocaleString("pt-BR")}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Modal novo experimento */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Experimento de Precificacao</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Nome do experimento" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Textarea placeholder="Descricao..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input placeholder="Variante (ex: preco_alto, preco_baixo)" value={form.variant} onChange={e => setForm(f => ({ ...f, variant: e.target.value }))} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">% de usuarios no experimento</label>
              <Input type="number" min="1" max="100" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={saveExp}>Criar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
