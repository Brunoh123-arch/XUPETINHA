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
import { Handshake, Hotel, Clock, Plus, MapPin, Star, Mail, Phone, ToggleLeft, ToggleRight } from "lucide-react"

interface PartnerCompany {
  id: string
  name: string
  cnpj: string
  contact_email: string
  contact_phone: string
  discount_percent: number
  billing_type: string
  is_active: boolean
  created_at: string
}

interface HotelItem {
  id: string
  name: string
  address: string
  city: string
  stars: number
  is_partner: boolean
  created_at: string
}

interface WaitlistItem {
  id: string
  email: string
  phone: string
  city: string
  role: string
  invited: boolean
  invited_at: string | null
  created_at: string
}

export default function AdminPartnersPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<"parceiros" | "hoteis" | "waitlist">("parceiros")
  const [partners, setPartners] = useState<PartnerCompany[]>([])
  const [hotels, setHotels] = useState<HotelItem[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [openInvite, setOpenInvite] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [tab])

  async function fetchData() {
    setLoading(true)
    if (tab === "parceiros") {
      const { data } = await supabase.from("partner_companies").select("*").order("created_at", { ascending: false })
      setPartners(data || [])
    } else if (tab === "hoteis") {
      const { data } = await supabase.from("hotels").select("*").order("city")
      setHotels(data || [])
    } else {
      const { data } = await supabase.from("waitlist").select("*").order("created_at", { ascending: false })
      setWaitlist(data || [])
    }
    setLoading(false)
  }

  async function togglePartner(id: string, current: boolean) {
    await supabase.from("partner_companies").update({ is_active: !current }).eq("id", id)
    fetchData()
  }

  async function toggleHotelPartner(id: string, current: boolean) {
    await supabase.from("hotels").update({ is_partner: !current }).eq("id", id)
    fetchData()
  }

  async function inviteUser(id: string) {
    await supabase.from("waitlist").update({ invited: true, invited_at: new Date().toISOString() }).eq("id", id)
    setOpenInvite(null)
    fetchData()
  }

  const filtered = tab === "parceiros"
    ? partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : tab === "hoteis"
    ? hotels.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.city?.toLowerCase().includes(search.toLowerCase()))
    : waitlist.filter(w => w.email?.includes(search) || w.city?.toLowerCase().includes(search.toLowerCase()))

  const statsWaitlist = { total: waitlist.length, pendentes: waitlist.filter(w => !w.invited).length, convidados: waitlist.filter(w => w.invited).length }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parceiros</h1>
        <p className="text-sm text-muted-foreground mt-1">Empresas parceiras, hoteis integrados e lista de espera</p>
      </div>

      {tab === "waitlist" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Waitlist", value: statsWaitlist.total },
            { label: "Aguardando", value: statsWaitlist.pendentes },
            { label: "Convidados", value: statsWaitlist.convidados },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(["parceiros","hoteis","waitlist"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "parceiros" ? "Parceiros" : t === "hoteis" ? "Hoteis" : "Lista de Espera"}
          </button>
        ))}
      </div>

      <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : tab === "parceiros" ? (
        <div className="space-y-3">
          {(filtered as PartnerCompany[]).map(p => (
            <div key={p.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3" />{p.contact_email}
                    {p.contact_phone && <><Phone className="w-3 h-3 ml-1" />{p.contact_phone}</>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">{p.discount_percent}% desconto</span>
                <Badge variant={p.is_active ? "default" : "secondary"} className="text-xs">{p.is_active ? "Ativo" : "Inativo"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => togglePartner(p.id, p.is_active)}>
                  {p.is_active ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </Button>
              </div>
            </div>
          ))}
          {(filtered as PartnerCompany[]).length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum parceiro encontrado</p>}
        </div>
      ) : tab === "hoteis" ? (
        <div className="space-y-3">
          {(filtered as HotelItem[]).map(h => (
            <div key={h.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Hotel className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{h.city} · {h.address}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(h.stars || 0)].map((_, i) => <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                </div>
                <Badge variant={h.is_partner ? "default" : "secondary"} className="text-xs">{h.is_partner ? "Parceiro" : "Listado"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => toggleHotelPartner(h.id, h.is_partner)}>
                  {h.is_partner ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </Button>
              </div>
            </div>
          ))}
          {(filtered as HotelItem[]).length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum hotel encontrado</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {(filtered as WaitlistItem[]).map(w => (
            <div key={w.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">{w.email || w.phone}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{w.city || "Cidade nao informada"} ·
                  <Badge variant="outline" className="text-xs ml-1 capitalize">{w.role}</Badge>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {w.invited ? (
                  <Badge variant="default" className="text-xs gap-1"><Clock className="w-3 h-3" /> Convidado</Badge>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => inviteUser(w.id)}>
                    <Plus className="w-3 h-3 mr-1" /> Convidar
                  </Button>
                )}
              </div>
            </div>
          ))}
          {(filtered as WaitlistItem[]).length === 0 && <p className="text-center text-muted-foreground py-8">Lista de espera vazia</p>}
        </div>
      )}
    </div>
  )
}
