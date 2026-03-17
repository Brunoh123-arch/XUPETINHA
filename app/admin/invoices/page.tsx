"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Search, Receipt } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type Invoice = {
  id: string
  user_id: string
  ride_id: string | null
  amount: number
  tax: number
  total: number
  status: string
  issued_at: string
  due_at: string | null
  paid_at: string | null
  pdf_url: string | null
  created_at: string
  profiles?: { full_name: string; phone: string } | null
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pendente",  className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  paid:      { label: "Pago",      className: "bg-green-100 text-green-700 border-green-200" },
  overdue:   { label: "Vencido",   className: "bg-red-100 text-red-700 border-red-200" },
  cancelled: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
}

export default function InvoicesPage() {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")

  useEffect(() => { fetchInvoices() }, [filterStatus])

  async function fetchInvoices() {
    setLoading(true)
    let q = supabase
      .from("invoices")
      .select("*, profiles(full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(100)
    if (filterStatus !== "todos") q = q.eq("status", filterStatus)
    const { data } = await q
    setInvoices(data ?? [])
    setLoading(false)
  }

  async function markPaid(id: string) {
    await supabase.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id)
    fetchInvoices()
  }

  const filtered = invoices.filter(inv => {
    const name = inv.profiles?.full_name?.toLowerCase() ?? ""
    return name.includes(search.toLowerCase()) || inv.id.includes(search)
  })

  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.total, 0)
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0)
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.total, 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Faturas</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestao de faturas de corridas e corporativo</p>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pendentes", value: totalPending, className: "text-yellow-600" },
          { label: "Pagas", value: totalPaid, className: "text-green-600" },
          { label: "Vencidas", value: totalOverdue, className: "text-red-600" },
        ].map(card => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.className}`}>
              R$ {card.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por usuario ou ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma fatura encontrada</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Usuario</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Emissao</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Vencimento</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => {
                const s = STATUS_LABELS[inv.status] ?? { label: inv.status, className: "bg-muted text-muted-foreground" }
                return (
                  <tr key={inv.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{inv.profiles?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{inv.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">R$ {Number(inv.total).toFixed(2)}</p>
                      {inv.tax > 0 && <p className="text-xs text-muted-foreground">Taxa: R$ {Number(inv.tax).toFixed(2)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${s.className}`}>{s.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(inv.issued_at), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {inv.due_at ? format(new Date(inv.due_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        {inv.pdf_url && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={inv.pdf_url} target="_blank" rel="noreferrer"><Download className="w-4 h-4" /></a>
                          </Button>
                        )}
                        {inv.status === "pending" && (
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => markPaid(inv.id)}>
                            Marcar pago
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
