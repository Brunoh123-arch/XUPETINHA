"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plane, Plus, MapPin, Search } from "lucide-react"

interface Airport {
  id: string
  name: string
  code: string
  city: string
  state: string | null
  lat: number | null
  lng: number | null
  is_active: boolean | null
  created_at: string
}

interface ServiceArea {
  id: string
  name: string
  city: string
  state: string
  is_active: boolean
  launch_date: string | null
  created_at: string
}

export default function AdminAirportsPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<"aeroportos" | "areas">("aeroportos")
  const [airports, setAirports] = useState<Airport[]>([])
  const [areas, setAreas] = useState<ServiceArea[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [openNew, setOpenNew] = useState(false)
  const [form, setForm] = useState({ name: "", code: "", city: "" })
  const [areaForm, setAreaForm] = useState({ name: "", city: "", state: "", launch_date: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [tab])

  async function fetchData() {
    setLoading(true)
    if (tab === "aeroportos") {
      const { data } = await supabase.from("airports").select("*").order("city")
      setAirports(data || [])
    } else {
      const { data } = await supabase.from("service_areas").select("*").order("city")
      setAreas(data || [])
    }
    setLoading(false)
  }

  async function saveAirport() {
    setSaving(true)
    await supabase.from("airports").insert({ name: form.name, code: form.code.toUpperCase(), city: form.city })
    setSaving(false)
    setOpenNew(false)
    setForm({ name: "", code: "", city: "" })
    fetchData()
  }

  async function saveArea() {
    setSaving(true)
    await supabase.from("service_areas").insert({
      name: areaForm.name,
      city: areaForm.city,
      state: areaForm.state,
      is_active: false,
      launch_date: areaForm.launch_date || null,
    })
    setSaving(false)
    setOpenNew(false)
    setAreaForm({ name: "", city: "", state: "", launch_date: "" })
    fetchData()
  }

  async function toggleArea(id: string, current: boolean) {
    await supabase.from("service_areas").update({ is_active: !current }).eq("id", id)
    fetchData()
  }

  const filteredAirports = airports.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.code?.includes(search.toUpperCase()) || a.city?.toLowerCase().includes(search.toLowerCase()))
  const filteredAreas = areas.filter(a => a.city.toLowerCase().includes(search.toLowerCase()) || a.state?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cobertura</h1>
          <p className="text-sm text-muted-foreground mt-1">Aeroportos com regras especiais e areas de cobertura do servico</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> {tab === "aeroportos" ? "Novo Aeroporto" : "Nova Area"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{tab === "aeroportos" ? "Cadastrar Aeroporto" : "Nova Area de Cobertura"}</DialogTitle></DialogHeader>
            {tab === "aeroportos" ? (
              <div className="space-y-4 mt-2">
                <div className="space-y-1"><Label>Nome do Aeroporto</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Aeroporto Internacional de Guarulhos" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Codigo IATA</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="GRU" maxLength={3} className="uppercase" /></div>
                  <div className="space-y-1"><Label>Cidade</Label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Guarulhos" /></div>
                </div>
                <Button onClick={saveAirport} disabled={saving || !form.name || !form.code} className="w-full">{saving ? "Salvando..." : "Cadastrar"}</Button>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                <div className="space-y-1"><Label>Nome da Area</Label><Input value={areaForm.name} onChange={e => setAreaForm(f => ({ ...f, name: e.target.value }))} placeholder="Grande Sao Paulo" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Cidade Principal</Label><Input value={areaForm.city} onChange={e => setAreaForm(f => ({ ...f, city: e.target.value }))} placeholder="Sao Paulo" /></div>
                  <div className="space-y-1"><Label>Estado</Label><Input value={areaForm.state} onChange={e => setAreaForm(f => ({ ...f, state: e.target.value }))} placeholder="SP" maxLength={2} className="uppercase" /></div>
                </div>
                <div className="space-y-1"><Label>Data de Lancamento</Label><Input type="date" value={areaForm.launch_date} onChange={e => setAreaForm(f => ({ ...f, launch_date: e.target.value }))} /></div>
                <Button onClick={saveArea} disabled={saving || !areaForm.name} className="w-full">{saving ? "Salvando..." : "Cadastrar Area"}</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(["aeroportos","areas"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "aeroportos" ? "Aeroportos" : "Areas de Cobertura"}
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : tab === "aeroportos" ? (
        <div className="grid md:grid-cols-2 gap-3">
          {filteredAirports.map(a => (
            <div key={a.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                <Plane className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-primary leading-none mt-0.5">{a.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{a.city}
                </p>
              </div>
              {a.is_active && (
                <Badge variant="secondary" className="text-xs">Ativo</Badge>
              )}
            </div>
          ))}
          {filteredAirports.length === 0 && <p className="col-span-2 text-center text-muted-foreground py-8">Nenhum aeroporto encontrado</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAreas.map(a => (
            <div key={a.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.is_active ? "bg-primary/10" : "bg-muted"}`}>
                  <MapPin className={`w-5 h-5 ${a.is_active ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.city}, {a.state}{a.launch_date ? ` · Lancamento: ${new Date(a.launch_date).toLocaleDateString("pt-BR")}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={a.is_active ? "default" : "secondary"} className="text-xs">{a.is_active ? "Ativa" : "Em breve"}</Badge>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => toggleArea(a.id, a.is_active)}>
                  {a.is_active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </div>
          ))}
          {filteredAreas.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma area encontrada</p>}
        </div>
      )}
    </div>
  )
}
