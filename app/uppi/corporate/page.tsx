"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Building2, ChevronRight, CreditCard, Users, ArrowLeft, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type CorporateAccount = {
  id: string
  company_name: string
  cnpj: string
  plan: string
  monthly_limit: number
  used_this_month: number
  status: string
  created_at: string
}

type CorporateInvoice = {
  id: string
  account_id: string
  amount: number
  status: string
  issued_at: string
  due_at: string
  paid_at: string | null
}

export default function CorporatePage() {
  const supabase = createClient()
  const router = useRouter()
  const [account, setAccount] = useState<CorporateAccount | null>(null)
  const [invoices, setInvoices] = useState<CorporateInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: acc } = await supabase
      .from("corporate_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
    setAccount(acc)
    if (acc) {
      const { data: invs } = await supabase
        .from("corporate_invoices")
        .select("*")
        .eq("account_id", acc.id)
        .order("issued_at", { ascending: false })
        .limit(12)
      setInvoices(invs ?? [])
    }
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>

  if (!account) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-12 pb-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Conta Corporativa</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Uppi Corporativo</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs">
            Gerencie as corridas da sua empresa com faturamento mensal, controle de limite por funcionario e relatorios completos.
          </p>
          <div className="space-y-3 w-full max-w-xs">
            {[
              { icon: Users, title: "Ate 500 funcionarios", desc: "Adicione colaboradores com limites individuais" },
              { icon: FileText, title: "Fatura mensal", desc: "Pagamento unico via boleto ou Pix" },
              { icon: CreditCard, title: "Relatorio de gastos", desc: "Visibilidade total das corridas por centro de custo" },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 text-left">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-8 w-full max-w-xs" onClick={() => router.push("/uppi/support")}>
            Solicitar para minha empresa
          </Button>
        </div>
      </div>
    )
  }

  const usedPct = account.monthly_limit > 0 ? Math.min((account.used_this_month / account.monthly_limit) * 100, 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Conta Corporativa</h1>
      </div>

      <div className="px-4 space-y-4 pb-8">
        {/* Card empresa */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">{account.company_name}</p>
              <p className="text-xs text-muted-foreground">CNPJ {account.cnpj}</p>
            </div>
            <Badge variant="outline" className="ml-auto capitalize text-xs">{account.plan}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uso este mes</span>
              <span className="font-medium text-foreground">
                R$ {Number(account.used_this_month).toFixed(2)} / R$ {Number(account.monthly_limit).toFixed(2)}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${usedPct > 90 ? "bg-red-500" : usedPct > 70 ? "bg-yellow-500" : "bg-primary"}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{usedPct.toFixed(0)}% utilizado</p>
          </div>
        </div>

        {/* Acoes rapidas */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "Funcionarios", path: "/uppi/corporate/employees" },
            { icon: FileText, label: "Relatorio", path: "/uppi/corporate/report" },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 text-left hover:bg-muted/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-foreground text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Faturas */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Historico de Faturas</h2>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma fatura ainda</div>
          ) : (
            <div className="space-y-2">
              {invoices.map(inv => (
                <div key={inv.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {format(new Date(inv.issued_at), "MMMM yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Venc. {format(new Date(inv.due_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">R$ {Number(inv.amount).toFixed(2)}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${inv.status === "paid" ? "border-green-500 text-green-600" : inv.status === "overdue" ? "border-red-500 text-red-600" : "border-yellow-500 text-yellow-600"}`}
                      >
                        {inv.status === "paid" ? "Pago" : inv.status === "overdue" ? "Vencido" : "Pendente"}
                      </Badge>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
