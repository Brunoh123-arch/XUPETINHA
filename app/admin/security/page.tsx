"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { ShieldAlert, Ban, Network, Plus, Clock, Unlock, AlertTriangle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface BanRecord {
  id: string
  user_id: string
  reason: string
  ban_type: string
  starts_at: string
  ends_at: string | null
  unbanned_at: string | null
  created_at: string
}

interface BlockedIP {
  id: string
  ip_address: string
  reason: string
  expires_at: string | null
  is_permanent: boolean
  created_at: string
}

export default function AdminSecurityPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<"banimentos" | "ips">("banimentos")
  const [bans, setBans] = useState<BanRecord[]>([])
  const [ips, setIps] = useState<BlockedIP[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [openBan, setOpenBan] = useState(false)
  const [openIp, setOpenIp] = useState(false)
  const [banForm, setBanForm] = useState({ user_id: "", reason: "", ban_type: "temporary", ends_at: "" })
  const [ipForm, setIpForm] = useState({ ip_address: "", reason: "", is_permanent: false, expires_at: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [tab])

  async function fetchData() {
    setLoading(true)
    if (tab === "banimentos") {
      const { data } = await supabase.from("ban_history").select("*").order("created_at", { ascending: false }).limit(100)
      setBans(data || [])
    } else {
      const { data } = await supabase.from("blocked_ips").select("*").order("created_at", { ascending: false })
      setIps(data || [])
    }
    setLoading(false)
  }

  async function saveBan() {
    setSaving(true)
    await supabase.from("ban_history").insert({
      user_id: banForm.user_id,
      reason: banForm.reason,
      ban_type: banForm.ban_type,
      starts_at: new Date().toISOString(),
      ends_at: banForm.ban_type === "permanent" ? null : banForm.ends_at ? new Date(banForm.ends_at).toISOString() : null,
    })
    setSaving(false)
    setOpenBan(false)
    setBanForm({ user_id: "", reason: "", ban_type: "temporary", ends_at: "" })
    fetchData()
  }

  async function saveBlockedIp() {
    setSaving(true)
    await supabase.from("blocked_ips").insert({
      ip_address: ipForm.ip_address,
      reason: ipForm.reason,
      is_permanent: ipForm.is_permanent,
      expires_at: ipForm.is_permanent ? null : ipForm.expires_at ? new Date(ipForm.expires_at).toISOString() : null,
    })
    setSaving(false)
    setOpenIp(false)
    setIpForm({ ip_address: "", reason: "", is_permanent: false, expires_at: "" })
    fetchData()
  }

  async function unban(id: string) {
    await supabase.from("ban_history").update({ unbanned_at: new Date().toISOString() }).eq("id", id)
    fetchData()
  }

  async function unblockIp(id: string) {
    await supabase.from("blocked_ips").delete().eq("id", id)
    fetchData()
  }

  const filteredBans = bans.filter(b => b.user_id?.includes(search) || b.reason?.toLowerCase().includes(search.toLowerCase()))
  const filteredIps = ips.filter(ip => ip.ip_address?.includes(search) || ip.reason?.toLowerCase().includes(search.toLowerCase()))

  const activeBans = bans.filter(b => !b.unbanned_at)
  const activeIps = ips.filter(ip => ip.is_permanent || !ip.expires_at || new Date(ip.expires_at) > new Date())

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Seguranca</h1>
          <p className="text-sm text-muted-foreground mt-1">Banimentos de usuarios e IPs bloqueados por fraude</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={openBan} onOpenChange={setOpenBan}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Ban className="w-4 h-4" /> Banir Usuario</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Banir Usuario</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1"><Label>ID do Usuario</Label><Input value={banForm.user_id} onChange={e => setBanForm(f => ({ ...f, user_id: e.target.value }))} placeholder="UUID do usuario" /></div>
                <div className="space-y-1"><Label>Motivo</Label><Textarea value={banForm.reason} onChange={e => setBanForm(f => ({ ...f, reason: e.target.value }))} placeholder="Descreva o motivo do banimento..." rows={3} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Tipo</Label>
                    <Select value={banForm.ban_type} onValueChange={v => setBanForm(f => ({ ...f, ban_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temporary">Temporario</SelectItem>
                        <SelectItem value="permanent">Permanente</SelectItem>
                        <SelectItem value="warning">Advertencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {banForm.ban_type === "temporary" && (
                    <div className="space-y-1"><Label>Expira em</Label><Input type="datetime-local" value={banForm.ends_at} onChange={e => setBanForm(f => ({ ...f, ends_at: e.target.value }))} /></div>
                  )}
                </div>
                <Button onClick={saveBan} disabled={saving || !banForm.user_id || !banForm.reason} variant="destructive" className="w-full">{saving ? "Salvando..." : "Aplicar Banimento"}</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={openIp} onOpenChange={setOpenIp}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Network className="w-4 h-4" /> Bloquear IP</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Bloquear IP</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1"><Label>Endereco IP</Label><Input value={ipForm.ip_address} onChange={e => setIpForm(f => ({ ...f, ip_address: e.target.value }))} placeholder="192.168.1.1" /></div>
                <div className="space-y-1"><Label>Motivo</Label><Textarea value={ipForm.reason} onChange={e => setIpForm(f => ({ ...f, reason: e.target.value }))} rows={2} placeholder="Fraude, spam, abuso..." /></div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="permanent" checked={ipForm.is_permanent} onChange={e => setIpForm(f => ({ ...f, is_permanent: e.target.checked }))} className="w-4 h-4" />
                  <Label htmlFor="permanent">Bloqueio permanente</Label>
                </div>
                {!ipForm.is_permanent && (
                  <div className="space-y-1"><Label>Expira em</Label><Input type="datetime-local" value={ipForm.expires_at} onChange={e => setIpForm(f => ({ ...f, expires_at: e.target.value }))} /></div>
                )}
                <Button onClick={saveBlockedIp} disabled={saving || !ipForm.ip_address || !ipForm.reason} className="w-full">{saving ? "Salvando..." : "Bloquear IP"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Banimentos", value: bans.length, color: "text-destructive bg-destructive/10" },
          { label: "Banimentos Ativos", value: activeBans.length, color: "text-destructive bg-destructive/10" },
          { label: "IPs Bloqueados", value: ips.length, color: "text-amber-500 bg-amber-500/10" },
          { label: "IPs Ativos", value: activeIps.length, color: "text-amber-500 bg-amber-500/10" },
        ].map(s => (
          <div key={s.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(["banimentos","ips"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "banimentos" ? "Banimentos" : "IPs Bloqueados"}
          </button>
        ))}
      </div>

      <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : tab === "banimentos" ? (
        <div className="space-y-3">
          {filteredBans.map(b => (
            <div key={b.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${b.unbanned_at ? "bg-muted" : "bg-destructive/10"}`}>
                  <Ban className={`w-5 h-5 ${b.unbanned_at ? "text-muted-foreground" : "text-destructive"}`} />
                </div>
                <div>
                  <p className="font-mono text-xs text-foreground">{b.user_id?.slice(0, 16)}...</p>
                  <p className="text-xs text-muted-foreground">{b.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge variant={b.unbanned_at ? "secondary" : b.ban_type === "permanent" ? "destructive" : "outline"} className="text-xs capitalize">{b.unbanned_at ? "Desbanido" : b.ban_type}</Badge>
                  {b.ends_at && !b.unbanned_at && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(b.ends_at), { locale: ptBR, addSuffix: true })}</p>
                  )}
                </div>
                {!b.unbanned_at && (
                  <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => unban(b.id)}>
                    <Unlock className="w-3 h-3" /> Desbanir
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filteredBans.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum banimento encontrado</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIps.map(ip => (
            <div key={ip.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Network className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-mono text-sm font-medium text-foreground">{ip.ip_address}</p>
                  <p className="text-xs text-muted-foreground">{ip.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {ip.is_permanent ? (
                  <Badge variant="destructive" className="text-xs">Permanente</Badge>
                ) : ip.expires_at ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(ip.expires_at), { locale: ptBR, addSuffix: true })}</p>
                ) : null}
                <Button size="sm" variant="ghost" className="gap-1 text-xs text-destructive" onClick={() => unblockIp(ip.id)}>
                  <Unlock className="w-3 h-3" /> Desbloquear
                </Button>
              </div>
            </div>
          ))}
          {filteredIps.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum IP bloqueado</p>}
        </div>
      )}
    </div>
  )
}
