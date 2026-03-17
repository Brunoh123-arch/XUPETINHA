'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, FileText, TrendingUp, Download, Calendar } from 'lucide-react'

interface TaxRecord {
  id: string
  year: number
  month: number
  gross_income: number
  platform_fees: number
  net_income: number
  tax_withheld: number
}

interface Invoice {
  id: string
  amount: number
  tax: number
  total: number
  status: string
  issued_at: string
  pdf_url: string | null
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function DriverTaxPage() {
  const router = useRouter()
  const supabase = createClient()
  const [records, setRecords] = useState<TaxRecord[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [rRes, iRes] = await Promise.all([
        supabase.from('tax_records').select('*').eq('driver_id', user.id).eq('year', selectedYear).order('month'),
        supabase.from('invoices').select('*').eq('user_id', user.id).order('issued_at', { ascending: false }).limit(10),
      ])
      if (rRes.data) setRecords(rRes.data)
      if (iRes.data) setInvoices(iRes.data)
      setLoading(false)
    }
    load()
  }, [selectedYear])

  const totalNet = records.reduce((s, r) => s + Number(r.net_income), 0)
  const totalFees = records.reduce((s, r) => s + Number(r.platform_fees), 0)
  const totalTax = records.reduce((s, r) => s + Number(r.tax_withheld), 0)

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-lg">Relatorio Fiscal</h1>
            <p className="text-xs text-muted-foreground">Rendimentos e imposto de renda</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="p-4 space-y-5">

          {/* Seletor de ano */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Ano:</span>
            {[2024, 2025, 2026].map(y => (
              <button key={y} onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedYear === y ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {y}
              </button>
            ))}
          </div>

          {/* Resumo anual */}
          {records.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                Resumo {selectedYear}
              </h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Rendimento Liquido</p>
                  <p className="text-sm font-bold text-green-600">R$ {totalNet.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Taxa Plataforma</p>
                  <p className="text-sm font-bold text-muted-foreground">R$ {totalFees.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IR Retido</p>
                  <p className="text-sm font-bold text-orange-600">R$ {totalTax.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Detalhamento por mes */}
          {records.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3">Detalhamento Mensal</h2>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {records.map(r => (
                  <div key={r.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{MONTHS[r.month - 1]} {r.year}</p>
                      <p className="text-xs text-muted-foreground">Bruto: R$ {Number(r.gross_income).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">R$ {Number(r.net_income).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">IR: R$ {Number(r.tax_withheld).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Faturas */}
          {invoices.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                Notas Fiscais
              </h2>
              <div className="bg-card rounded-xl border border-border divide-y divide-border">
                {invoices.map(inv => (
                  <div key={inv.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(inv.issued_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {inv.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-foreground">R$ {Number(inv.total).toFixed(2)}</p>
                      {inv.pdf_url && (
                        <a href={inv.pdf_url} target="_blank" rel="noreferrer"
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Download size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {records.length === 0 && (
            <div className="text-center py-12">
              <FileText size={40} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">Nenhum registro para {selectedYear}</p>
              <p className="text-sm text-muted-foreground mt-1">Os dados aparecem apos o fechamento mensal</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
