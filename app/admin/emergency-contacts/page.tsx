'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { Users, Phone, Search, ShieldAlert, Trash2, UserCheck, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  user_id: string
  name: string
  phone: string
  relationship: string | null
  created_at: string
  user?: { full_name: string; email: string; phone?: string } | null
}

export default function AdminEmergencyContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  const fetchContacts = async () => {
    const supabase = createClient()

    const { data, count } = await supabase
      .from('emergency_contacts')
      .select(`
        *,
        user:profiles!emergency_contacts_user_id_fkey(full_name, email, phone)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(100)

    setContacts((data as any) || [])
    setTotal(count || 0)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('emergency_contacts').delete().eq('id', id)
    setContacts(prev => prev.filter(c => c.id !== id))
    setTotal(prev => prev - 1)
  }

  useEffect(() => {
    fetchContacts()
    const supabase = createClient()
    channelRef.current = supabase
      .channel('admin-emergency-contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_contacts' }, fetchContacts)
      .subscribe()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [])

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.user as any)?.full_name?.toLowerCase().includes(q) ||
      (c.user as any)?.email?.toLowerCase().includes(q)
    )
  })

  const headerActions = (
    <button
      type="button"
      onClick={fetchContacts}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
    >
      <RefreshCw className="w-3 h-3" />
      Atualizar
    </button>
  )

  if (loading) {
    return (
      <>
        <AdminHeader title="Contatos de Emergencia" subtitle="Carregando..." />
        <div className="flex-1 flex items-center justify-center bg-[hsl(var(--admin-bg))]">
          <div className="w-6 h-6 border-2 border-[hsl(var(--admin-green))] border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Contatos de Emergencia"
        subtitle={`${total} contatos cadastrados`}
        actions={headerActions}
      />
      <div className="flex-1 overflow-y-auto bg-[hsl(var(--admin-bg))]">
        <div className="p-5 space-y-5">

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total de Contatos', value: total, icon: Phone, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Usuarios com Contato', value: new Set(contacts.map(c => c.user_id)).size, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Relacoes Cadastradas', value: contacts.filter(c => c.relationship).length, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
            ].map(k => (
              <div key={k.label} className="bg-[hsl(var(--admin-surface))] rounded-xl p-4 border border-[hsl(var(--admin-border))] flex flex-col gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.bg)}>
                  <k.icon className={cn('w-4 h-4', k.color)} />
                </div>
                <div>
                  <p className="text-[22px] font-bold text-slate-100 tracking-tight tabular-nums leading-none">{k.value.toLocaleString('pt-BR')}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por contato, usuario ou telefone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[hsl(var(--admin-surface))] border border-[hsl(var(--admin-border))] text-[13px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-[hsl(var(--admin-green))]"
            />
          </div>

          {/* Table */}
          <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--admin-border))]">
              <h3 className="text-[13px] font-bold text-slate-200">
                Contatos {search && `— ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[hsl(var(--admin-border))]">
                    {['Usuario (Dono)', 'Nome do Contato', 'Telefone', 'Relacao', 'Cadastrado em', 'Acao'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--sidebar-accent))]/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-slate-200 font-medium truncate max-w-[140px]">{(c.user as any)?.full_name || '—'}</p>
                        <p className="text-slate-500 text-[11px] truncate max-w-[140px]">{(c.user as any)?.email || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-medium truncate max-w-[140px]">{c.name}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          {c.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{c.relationship || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 tabular-nums whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-600">
                        <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Nenhum contato encontrado</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
