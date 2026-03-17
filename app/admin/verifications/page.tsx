'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  UserCheck, Clock, CheckCircle2, XCircle, Search, RefreshCw,
  Eye, AlertTriangle, FileText, Car, Phone, Camera,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DriverVerification {
  id: string
  driver_id: string
  document_type: string
  document_number: string | null
  document_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
  driver?: {
    full_name: string
    phone: string | null
    avatar_url: string | null
  }
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  approved: { label: 'Aprovado', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejeitado', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
}

const DOC_TYPE_LABEL: Record<string, string> = {
  cnh: 'CNH',
  vehicle_registration: 'CRLV',
  photo: 'Foto do Motorista',
  background_check: 'Antecedentes',
  insurance: 'Seguro',
  vehicle_photo: 'Foto do Veículo',
}

const DOC_TYPE_ICON: Record<string, React.ElementType> = {
  cnh: FileText,
  vehicle_registration: Car,
  photo: Camera,
  background_check: AlertTriangle,
  insurance: FileText,
  vehicle_photo: Camera,
}

export default function AdminVerificationsPage() {
  const supabase = createClient()
  const [verifications, setVerifications] = useState<DriverVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('pending')
  const [rejectionModal, setRejectionModal] = useState<{ id: string; name: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchVerifications = async () => {
    const { data } = await supabase
      .from('driver_verifications')
      .select(`
        *,
        driver:profiles!driver_verifications_driver_id_fkey(full_name, phone, avatar_url)
      `)
      .order('created_at', { ascending: false })
    setVerifications((data || []) as DriverVerification[])
    setLoading(false)
  }

  useEffect(() => {
    fetchVerifications()
    channelRef.current = supabase
      .channel('admin-verifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_verifications' }, fetchVerifications)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const handleApprove = async (id: string) => {
    setProcessing(id)
    await supabase.from('driver_verifications').update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status: 'approved', reviewed_at: new Date().toISOString() } : v))
    setProcessing(null)
  }

  const handleReject = async () => {
    if (!rejectionModal || !rejectionReason.trim()) return
    setProcessing(rejectionModal.id)
    await supabase.from('driver_verifications').update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
    }).eq('id', rejectionModal.id)
    setVerifications(prev => prev.map(v =>
      v.id === rejectionModal.id
        ? { ...v, status: 'rejected', reviewed_at: new Date().toISOString(), rejection_reason: rejectionReason }
        : v
    ))
    setRejectionModal(null)
    setRejectionReason('')
    setProcessing(null)
  }

  const filtered = verifications.filter(v => {
    const q = search.toLowerCase()
    const matchSearch = (v.driver?.full_name || '').toLowerCase().includes(q) ||
      (v.driver?.phone || '').includes(q) ||
      v.document_type.toLowerCase().includes(q)
    const matchStatus = filterStatus === 'all' || v.status === filterStatus
    return matchSearch && matchStatus
  })

  const pendingCount = verifications.filter(v => v.status === 'pending').length
  const approvedCount = verifications.filter(v => v.status === 'approved').length
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length

  const headerActions = (
    <button
      type="button"
      onClick={fetchVerifications}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
    >
      <RefreshCw className="w-3 h-3" />
      Atualizar
    </button>
  )

  if (loading) {
    return (
      <>
        <AdminHeader title="Verificação de Motoristas" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))]">
          <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Verificação de Motoristas"
        subtitle={`${pendingCount} pendentes · ${approvedCount} aprovados · ${rejectedCount} rejeitados`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))]">
        <div className="p-5 space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: verifications.length, icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Pendentes', value: pendingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Aprovados', value: approvedCount, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Rejeitados', value: rejectedCount, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map(k => (
              <div key={k.label} className="bg-[hsl(var(--admin-surface))] rounded-xl p-4 border border-[hsl(var(--admin-border))] flex flex-col gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <div>
                  <p className="text-[22px] font-bold text-slate-100 tracking-tight tabular-nums leading-none">{k.value}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-[hsl(var(--admin-green))]"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map(s => {
                const cfg = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors',
                      filterStatus === s
                        ? 'bg-[hsl(var(--admin-green))] text-[hsl(var(--admin-bg))]'
                        : 'bg-[hsl(var(--admin-surface))] text-slate-400 border border-[hsl(var(--admin-border))] hover:text-slate-200'
                    )}
                  >
                    {s === 'all' ? 'Todos' : cfg?.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--admin-border))]">
              <h3 className="text-[13px] font-bold text-slate-200">
                Verificações {pendingCount > 0 && <span className="ml-1 text-amber-400">({pendingCount} pendentes)</span>}
              </h3>
              {pendingCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                <UserCheck className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-[14px]">Nenhuma verificação {filterStatus !== 'all' ? `${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label.toLowerCase() || ''}` : 'encontrada'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-[hsl(var(--admin-border))]">
                      {['Motorista', 'Documento', 'Data', 'Status', 'Ações'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(v => {
                      const statusCfg = STATUS_CONFIG[v.status]
                      const StatusIcon = statusCfg.icon
                      const DocIcon = DOC_TYPE_ICON[v.document_type] || FileText
                      const isProcessing = processing === v.id
                      return (
                        <tr key={v.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--sidebar-accent))]/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[hsl(var(--admin-bg))] overflow-hidden shrink-0">
                                {v.driver?.avatar_url
                                  ? <img src={v.driver.avatar_url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                  : <div className="w-full h-full flex items-center justify-center text-[13px] font-bold text-slate-400">
                                      {v.driver?.full_name?.[0] || '?'}
                                    </div>
                                }
                              </div>
                              <div>
                                <p className="text-slate-200 font-medium">{v.driver?.full_name || 'Motorista'}</p>
                                {v.driver?.phone && <p className="text-slate-500 text-[11px] flex items-center gap-1"><Phone className="w-3 h-3" />{v.driver.phone}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <DocIcon className="w-4 h-4 text-slate-400 shrink-0" />
                              <div>
                                <p className="text-slate-200 font-medium">{DOC_TYPE_LABEL[v.document_type] || v.document_type}</p>
                                {v.document_number && <p className="text-slate-500 text-[11px] font-mono">{v.document_number}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                            {new Date(v.created_at).toLocaleDateString('pt-BR')}
                            <br />
                            <span className="text-[11px] text-slate-600">{new Date(v.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', statusCfg.color)}>
                                <StatusIcon className="w-3 h-3" />
                                {statusCfg.label}
                              </span>
                              {v.rejection_reason && (
                                <p className="text-[10px] text-red-400 max-w-[150px] truncate" title={v.rejection_reason}>{v.rejection_reason}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {v.document_url && (
                                <a
                                  href={v.document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-slate-400 hover:text-slate-200 transition-colors text-[11px] font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Ver
                                </a>
                              )}
                              {v.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(v.id)}
                                    disabled={!!isProcessing}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors text-[11px] font-semibold disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Aprovar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectionModal({ id: v.id, name: v.driver?.full_name || 'Motorista' })}
                                    disabled={!!isProcessing}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-[11px] font-semibold disabled:opacity-50"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Rejeitar
                                  </button>
                                </>
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
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--admin-surface))] rounded-2xl border border-[hsl(var(--admin-border))] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-200">Rejeitar Verificação</h3>
                <p className="text-[12px] text-slate-500">{rejectionModal.name}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[11px] text-slate-500 font-semibold block mb-1.5">Motivo da rejeição *</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Ex: Documento ilegível, foto não corresponde..."
                className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 outline-none focus:border-red-500/50 resize-none"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setRejectionModal(null); setRejectionReason('') }}
                className="px-4 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectionReason.trim() || !!processing}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-[12px] font-bold disabled:opacity-50 hover:bg-red-600 transition-colors"
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
