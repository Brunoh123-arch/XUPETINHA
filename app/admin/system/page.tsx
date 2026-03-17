"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings, Smartphone, Wrench, MapPin, Plus, Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AppVersion {
  id: string
  platform: string
  version: string
  build_number: number
  release_notes: string
  force_update: boolean
  min_version: string
  released_at: string
}

interface MaintenanceWindow {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at: string
  affects_roles: string[]
  is_active: boolean
}

interface CityConfig {
  id: string
  city: string
  state: string
  country: string
  is_active: boolean
  base_fare: number
  price_per_km: number
  price_per_minute: number
  min_fare: number
  surge_multiplier_max: number
  timezone: string
}

export default function AdminSystemPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<"versoes" | "manutencao" | "cidades">("versoes")
  const [versions, setVersions] = useState<AppVersion[]>([])
  const [maintenances, setMaintenances] = useState<MaintenanceWindow[]>([])
  const [cities, setCities] = useState<CityConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [openNew, setOpenNew] = useState(false)
  const [newVersion, setNewVersion] = useState({ platform: "ios", version: "", build_number: "", release_notes: "", force_update: false, min_version: "" })
  const [newMaintenance, setNewMaintenance] = useState({ title: "", description: "", starts_at: "", ends_at: "", is_active: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [tab])

  async function fetchData() {
    setLoading(true)
    if (tab === "versoes") {
      const { data } = await supabase.from("app_versions").select("*").order("released_at", { ascending: false })
      setVersions(data || [])
    } else if (tab === "manutencao") {
      const { data } = await supabase.from("maintenance_windows").select("*").order("starts_at", { ascending: false })
      setMaintenances(data || [])
    } else {
      const { data } = await supabase.from("city_configurations").select("*").order("city")
      setCities(data || [])
    }
    setLoading(false)
  }

  async function saveVersion() {
    setSaving(true)
    await supabase.from("app_versions").insert({
      platform: newVersion.platform,
      version: newVersion.version,
      build_number: parseInt(newVersion.build_number),
      release_notes: newVersion.release_notes,
      force_update: newVersion.force_update,
      min_version: newVersion.min_version,
      released_at: new Date().toISOString(),
    })
    setSaving(false)
    setOpenNew(false)
    fetchData()
  }

  async function saveMaintenance() {
    setSaving(true)
    await supabase.from("maintenance_windows").insert({
      title: newMaintenance.title,
      description: newMaintenance.description,
      starts_at: new Date(newMaintenance.starts_at).toISOString(),
      ends_at: new Date(newMaintenance.ends_at).toISOString(),
      affects_roles: ["passenger", "driver"],
      is_active: true,
    })
    setSaving(false)
    setOpenNew(false)
    fetchData()
  }

  async function toggleCity(id: string, current: boolean) {
    await supabase.from("city_configurations").update({ is_active: !current }).eq("id", id)
    fetchData()
  }

  async function toggleMaintenance(id: string, current: boolean) {
    await supabase.from("maintenance_windows").update({ is_active: !current }).eq("id", id)
    fetchData()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sistema</h1>
          <p className="text-sm text-muted-foreground mt-1">Versoes do app, manutencoes e configuracoes por cidade</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {tab === "versoes" ? "Nova Versao" : tab === "manutencao" ? "Agendar Manutencao" : "Nova Cidade"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{tab === "versoes" ? "Nova Versao do App" : "Agendar Manutencao"}</DialogTitle>
            </DialogHeader>
            {tab === "versoes" ? (
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Plataforma</Label>
                    <Select value={newVersion.platform} onValueChange={v => setNewVersion(p => ({ ...p, platform: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ios">iOS</SelectItem>
                        <SelectItem value="android">Android</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label>Versao</Label><Input value={newVersion.version} onChange={e => setNewVersion(p => ({ ...p, version: e.target.value }))} placeholder="1.5.0" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Build Number</Label><Input type="number" value={newVersion.build_number} onChange={e => setNewVersion(p => ({ ...p, build_number: e.target.value }))} placeholder="150" /></div>
                  <div className="space-y-1"><Label>Versao Minima</Label><Input value={newVersion.min_version} onChange={e => setNewVersion(p => ({ ...p, min_version: e.target.value }))} placeholder="1.3.0" /></div>
                </div>
                <div className="space-y-1"><Label>Notas da Versao</Label><Textarea value={newVersion.release_notes} onChange={e => setNewVersion(p => ({ ...p, release_notes: e.target.value }))} placeholder="Novidades desta versao..." rows={3} /></div>
                <div className="flex items-center gap-3">
                  <Switch checked={newVersion.force_update} onCheckedChange={v => setNewVersion(p => ({ ...p, force_update: v }))} />
                  <Label>Atualizacao obrigatoria</Label>
                </div>
                <Button onClick={saveVersion} disabled={saving || !newVersion.version} className="w-full">{saving ? "Salvando..." : "Publicar Versao"}</Button>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                <div className="space-y-1"><Label>Titulo</Label><Input value={newMaintenance.title} onChange={e => setNewMaintenance(p => ({ ...p, title: e.target.value }))} placeholder="Manutencao programada" /></div>
                <div className="space-y-1"><Label>Descricao</Label><Textarea value={newMaintenance.description} onChange={e => setNewMaintenance(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Servico temporariamente indisponivel..." /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Inicio</Label><Input type="datetime-local" value={newMaintenance.starts_at} onChange={e => setNewMaintenance(p => ({ ...p, starts_at: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Fim</Label><Input type="datetime-local" value={newMaintenance.ends_at} onChange={e => setNewMaintenance(p => ({ ...p, ends_at: e.target.value }))} /></div>
                </div>
                <Button onClick={saveMaintenance} disabled={saving || !newMaintenance.title} className="w-full">{saving ? "Salvando..." : "Agendar"}</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(["versoes","manutencao","cidades"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "versoes" ? "Versoes" : t === "manutencao" ? "Manutencao" : "Cidades"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : tab === "versoes" ? (
        <div className="space-y-3">
          {versions.map(v => (
            <div key={v.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{v.version}</p>
                    <Badge variant="outline" className="text-xs capitalize">{v.platform}</Badge>
                    {v.force_update && <Badge variant="destructive" className="text-xs">Obrigatoria</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">Build {v.build_number} · Min: {v.min_version}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{v.released_at ? format(new Date(v.released_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}</p>
            </div>
          ))}
          {versions.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma versao cadastrada</p>}
        </div>
      ) : tab === "manutencao" ? (
        <div className="space-y-3">
          {maintenances.map(m => (
            <div key={m.id} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${m.is_active ? "bg-destructive/10" : "bg-muted"}`}>
                    <Wrench className={`w-5 h-5 ${m.is_active ? "text-destructive" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{m.title}</p>
                      <Badge variant={m.is_active ? "destructive" : "secondary"} className="text-xs">{m.is_active ? "Ativo" : "Inativo"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{m.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{m.starts_at ? format(new Date(m.starts_at), "dd/MM HH:mm") : "—"}</p>
                    <p>ate {m.ends_at ? format(new Date(m.ends_at), "dd/MM HH:mm") : "—"}</p>
                  </div>
                  <Switch checked={m.is_active} onCheckedChange={() => toggleMaintenance(m.id, m.is_active)} />
                </div>
              </div>
            </div>
          ))}
          {maintenances.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma manutencao agendada</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {cities.map(c => (
            <div key={c.id} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{c.city}, {c.state}</p>
                      <Badge variant={c.is_active ? "default" : "secondary"} className="text-xs">{c.is_active ? "Ativa" : "Inativa"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Base R$ {c.base_fare?.toFixed(2)} · R$ {c.price_per_km?.toFixed(2)}/km · Min R$ {c.min_fare?.toFixed(2)}</p>
                  </div>
                </div>
                <Switch checked={c.is_active} onCheckedChange={() => toggleCity(c.id, c.is_active)} />
              </div>
            </div>
          ))}
          {cities.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma cidade configurada</p>}
        </div>
      )}
    </div>
  )
}
