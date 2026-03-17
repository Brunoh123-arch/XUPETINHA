'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Shield, Activity, Search, ChevronRight, Clock } from 'lucide-react'

type Tab = 'users' | 'roles' | 'actions'

interface AdminUser {
  id: string
  department: string | null
  permissions: Record<string, boolean> | null
  created_at: string
  profile?: { full_name: string; avatar_url: string | null; email?: string }
}

interface AdminRole {
  id: string
  admin_id: string
  role: string
  permissions: Record<string, boolean>
  created_at: string
}

interface AdminAction {
  id: string
  admin_id: string
  action: string
  target_table: string
  details: Record<string, unknown>
  ip_address: string
  created_at: string
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  finance: 'Financeiro',
  support: 'Suporte',
  operations: 'Operacoes',
  marketing: 'Marketing',
  viewer: 'Visualizador',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  finance: 'bg-green-100 text-green-700',
  support: 'bg-blue-100 text-blue-700',
  operations: 'bg-orange-100 text-orange-700',
  marketing: 'bg-purple-100 text-purple-700',
  viewer: 'bg-muted text-muted-foreground',
}

export default function AdminTeamPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [actions, setActions] = useState<AdminAction[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [uRes, rRes, aRes] = await Promise.all([
        supabase.from('admin_users').select('*, profile:profiles(full_name,avatar_url)').order('created_at', { ascending: false }),
        supabase.from('admin_roles').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_actions').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      if (uRes.data) setUsers(uRes.data as AdminUser[])
      if (rRes.data) setRoles(rRes.data)
      if (aRes.data) setActions(aRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const TABS = [
    { key: 'users' as Tab, label: 'Equipe', icon: Users, count: users.length },
    { key: 'roles' as Tab, label: 'Permissoes', icon: Shield, count: roles.length },
    { key: 'actions' as Tab, label: 'Auditoria', icon: Activity, count: actions.length },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipe Admin</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestao de usuarios, permissoes e auditoria</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {TABS.map(t => (
          <div key={t.key} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <t.icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{t.count}</p>
              <p className="text-xs text-muted-foreground">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 bg-muted rounded-xl text-sm text-foreground outline-none" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">

          {tab === 'users' && users.filter(u => (u.profile?.full_name || '').toLowerCase().includes(search.toLowerCase())).map(u => (
            <div key={u.id} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {u.profile?.full_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{u.profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{u.department || 'Sem departamento'}</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          ))}

          {tab === 'roles' && roles.filter(r => r.role.toLowerCase().includes(search.toLowerCase())).map(r => (
            <div key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[r.role] || 'bg-muted text-muted-foreground'}`}>
                  {ROLE_LABELS[r.role] || r.role}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.values(r.permissions || {}).filter(Boolean).length} permissoes ativas
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}

          {tab === 'actions' && actions.filter(a => a.action.toLowerCase().includes(search.toLowerCase()) || a.target_table.toLowerCase().includes(search.toLowerCase())).map(a => (
            <div key={a.id} className="p-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity size={13} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{a.action}</p>
                <p className="text-xs text-muted-foreground">Tabela: {a.target_table}</p>
                {a.ip_address && <p className="text-xs text-muted-foreground">IP: {a.ip_address}</p>}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Clock size={11} />
                {new Date(a.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {((tab === 'users' && users.length === 0) ||
            (tab === 'roles' && roles.length === 0) ||
            (tab === 'actions' && actions.length === 0)) && (
            <div className="p-8 text-center text-muted-foreground text-sm">Nenhum registro encontrado</div>
          )}
        </div>
      )}
    </div>
  )
}
