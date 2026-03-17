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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Plus, FileText, Users, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react"

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

interface CorporateAccount {
  id: string
  company_id: string
  user_id: string
  employee_id: string
  department: string
  monthly_limit: number
  is_active: boolean
  created_at: string
}

interface CorporateInvoice {
  id: string
  company_id: string
  month: number
  year: number
  total_rides: number
  total_amount: number
  discount: number
  net_amount: number
  status: string
  due_date: string
  paid_at: string | null
}

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

export default function AdminCorporatePage() {
  const supabase = createClient()
  const [tab, setTab] = useState<"empresas" | "funcionarios" | "faturas">("empresas")
  const [companies, setCompanies] = useState<PartnerCompany[]>([])
  const [accounts, setAccounts] = useState<CorporateAccount[]>([])
  const [invoices, setInvoices] = useState<CorporateInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [openNew, setOpenNew] = useState(false)
  const [form, setForm] = useState({ name: "", cnpj: "", contact_email: "", contact_phone: "", discount_percent: "5", billing_type: "monthly" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [tab])

  async function fetchAll() {
    setLoading(true)
    if (tab === "empresas") {
      const { data } = await supabase.from("partner_companies").select("*").order("created_at", { ascending: false })
      setCompanies(data || [])
    } else if (tab === "funcionarios") {
      const { data } = await supabase.from("corporate_accounts").select("*").order("created_at", { ascending: false }).limit(100)
      setAccounts(data || [])
    } else {
      const { data } = await supabase.from("corporate_invoices").select("*").order("year", { ascending: false }).order("month", { ascending: false }).limit(100)
      setInvoices(data || [])
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from("partner_companies").insert({
      name: form.name,
      cnpj: form.cnpj,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      discount_percent: parseFloat(form.discount_percent),
      billing_type: form.billing_type,
      is_active: true,
    })
    setSaving(false)
    setOpenNew(false)
    setForm({ name: "", cnpj: "", contact_email: "", contact_phone: "", discount_percent: "5", billing_type: "monthly" })
    fetchAll()
  }

  async function toggleCompany(id: string, current: boolean) {
    await supabase.from("partner_companies").update({ is_active: !current }).eq("id", id)
    fetchAll()
  }

  async function updateInvoiceStatus(id: string, status: string) {
    await supabase.from("corporate_invoices").update({ status, ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}) }).eq("id", id)
    fetchAll()
  }

  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.cnpj?.includes(search))
  const filteredAccounts = accounts.filter(a => a.employee_id?.toLowerCase().includes(search.toLowerCase()) || a.department?.toLowerCase().includes(search.toLowerCase()))
  const filteredInvoices = invoices.filter(i => companies.find(c => c.id === i.company_id)?.name.toLowerCase().includes(search.toLowerCase()) || true)

  const stats = {
    total: companies.length,
    ativas: companies.filter(c => c.is_active).length,
    funcionarios: accounts.filter(a => a.is_active).length,
    faturasAbertas: invoices.filter(i => i.status === "pending").length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Corporativo</h1>
          <p className="text-sm text-muted-foreground mt-1">Empresas parceiras, funcionarios e faturas mensais</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Cadastrar Empresa</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1"><Label>Nome da Empresa</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Empresa LTDA" /></div>
              <div className="space-y-1"><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" /></div>
              <div className="space-y-1"><Label>E-mail de Contato</Label><Input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} placeholder="financeiro@empresa.com" /></div>
              <div className="space-y-1"><Label>Telefone</Label><Input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="(11) 99999-9999" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Desconto (%)</Label><Input type="number" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} /></div>
                <div className="space-y-1">
                  <Label>Faturamento</Label>
                  <Select value={form.billing_type} onValueChange={v => setForm(f => ({ ...f, billing_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="prepaid">Pre-pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.cnpj} className="w-full">
                {saving ? "Salvando..." : "Cadastrar Empresa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Empresas", value: stats.total, icon: Building2 },
          { label: "Ativas", value: stats.ativas, icon: CheckCircle },
          { label: "Funcionarios", value: stats.funcionarios, icon: Users },
          { label: "Faturas Abertas", value: stats.faturasAbertas, icon: FileText },
        ].map(s => (
          <div key={s.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <s.icon className="w-5 h-5 text-primary" />
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
        {(["empresas","funcionarios","faturas"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_,i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : tab === "empresas" ? (
        <div className="space-y-3">
          {filteredCompanies.map(c => (
            <div key={c.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.cnpj} · {c.contact_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{c.discount_percent}% desc.</span>
                <Badge variant={c.billing_type === "monthly" ? "secondary" : "outline"} className="text-xs capitalize">{c.billing_type}</Badge>
                <Badge variant={c.is_active ? "default" : "secondary"} className="text-xs">{c.is_active ? "Ativa" : "Inativa"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => toggleCompany(c.id, c.is_active)}>
                  {c.is_active ? <XCircle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                </Button>
              </div>
            </div>
          ))}
          {filteredCompanies.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma empresa cadastrada</p>}
        </div>
      ) : tab === "funcionarios" ? (
        <div className="space-y-3">
          {filteredAccounts.map(a => (
            <div key={a.id} className="bg-card border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">ID: {a.employee_id || "—"}</p>
                <p className="text-xs text-muted-foreground">{a.department || "Sem departamento"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Limite: R$ {a.monthly_limit?.toFixed(2) || "0,00"}</span>
                <Badge variant={a.is_active ? "default" : "secondary"} className="text-xs">{a.is_active ? "Ativo" : "Inativo"}</Badge>
              </div>
            </div>
          ))}
          {filteredAccounts.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum funcionario encontrado</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="bg-card border rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">{companies.find(c => c.id === inv.company_id)?.name || "Empresa"}</p>
                <p className="text-xs text-muted-foreground">{MESES[inv.month - 1]}/{inv.year} · {inv.total_rides} corridas</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-foreground">R$ {inv.net_amount?.toFixed(2)}</p>
                  {inv.discount > 0 && <p className="text-xs text-muted-foreground line-through">R$ {inv.total_amount?.toFixed(2)}</p>}
                </div>
                {inv.status === "pending" ? (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => updateInvoiceStatus(inv.id, "paid")}>
                      <CheckCircle className="w-3 h-3" /> Pago
                    </Button>
                  </div>
                ) : (
                  <Badge variant={inv.status === "paid" ? "default" : "secondary"} className="text-xs gap-1">
                    {inv.status === "paid" ? <><CheckCircle className="w-3 h-3" /> Pago</> : <><Clock className="w-3 h-3" /> {inv.status}</>}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {invoices.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma fatura encontrada</p>}
        </div>
      )}
    </div>
  )
}
