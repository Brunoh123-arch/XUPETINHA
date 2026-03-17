'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Bell, Mail, Megaphone, Monitor, Search, ToggleLeft, ToggleRight, Pencil, Trash2 } from 'lucide-react'

type Tab = 'announcements' | 'notifications' | 'emails' | 'banners'

interface Announcement {
  id: string
  title: string
  content: string
  target_role: string
  is_active: boolean
  starts_at: string
  ends_at: string | null
  cta_text: string | null
}

interface NotifTemplate {
  id: string
  name: string
  title: string
  body: string
  type: string
  is_active: boolean
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  is_active: boolean
  updated_at: string
}

interface Banner {
  id: string
  title: string
  subtitle: string | null
  target_role: string
  position: number
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
}

export default function AdminCommunicationsPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('announcements')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [notifTemplates, setNotifTemplates] = useState<NotifTemplate[]>([])
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTarget, setNewTarget] = useState('all')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [aRes, nRes, eRes, bRes] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('notification_templates').select('*').order('created_at', { ascending: false }),
        supabase.from('email_templates').select('id,name,subject,is_active,updated_at').order('updated_at', { ascending: false }),
        supabase.from('in_app_banners').select('*').order('position'),
      ])
      if (aRes.data) setAnnouncements(aRes.data)
      if (nRes.data) setNotifTemplates(nRes.data)
      if (eRes.data) setEmailTemplates(eRes.data)
      if (bRes.data) setBanners(bRes.data)
      setLoading(false)
    }
    load()
  }, [])

  const toggleAnnouncement = async (id: string, current: boolean) => {
    await supabase.from('announcements').update({ is_active: !current }).eq('id', id)
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a))
  }

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const createAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setSaving(true)
    const { data } = await supabase.from('announcements').insert({
      title: newTitle,
      content: newContent,
      target_role: newTarget,
      is_active: true,
      starts_at: new Date().toISOString(),
    }).select().single()
    if (data) setAnnouncements(prev => [data, ...prev])
    setNewTitle(''); setNewContent(''); setShowForm(false); setSaving(false)
  }

  const toggleNotif = async (id: string, current: boolean) => {
    await supabase.from('notification_templates').update({ is_active: !current }).eq('id', id)
    setNotifTemplates(prev => prev.map(n => n.id === id ? { ...n, is_active: !current } : n))
  }

  const TABS = [
    { key: 'announcements' as Tab, label: 'Comunicados', icon: Megaphone },
    { key: 'notifications' as Tab, label: 'Push', icon: Bell },
    { key: 'emails' as Tab, label: 'Emails', icon: Mail },
    { key: 'banners' as Tab, label: 'Banners', icon: Monitor },
  ]

  const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  )

  const RoleBadge = ({ role }: { role: string }) => (
    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium capitalize">
      {role === 'all' ? 'Todos' : role === 'driver' ? 'Motoristas' : 'Passageiros'}
    </span>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunicacoes</h1>
          <p className="text-muted-foreground text-sm mt-1">Anuncios, notificacoes, emails e banners</p>
        </div>
        {tab === 'announcements' && (
          <button onClick={() => setShowForm(v => !v)} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
            <Plus size={16} />
            Novo Comunicado
          </button>
        )}
      </div>

      {showForm && tab === 'announcements' && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-foreground">Novo Comunicado</h2>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titulo" className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none" />
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Conteudo do comunicado..." rows={3} className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none resize-none" />
          <div className="flex items-center gap-3">
            <select value={newTarget} onChange={e => setNewTarget(e.target.value)} className="bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none">
              <option value="all">Todos</option>
              <option value="driver">Motoristas</option>
              <option value="passenger">Passageiros</option>
            </select>
            <button onClick={createAnnouncement} disabled={saving} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              {saving ? 'Criando...' : 'Publicar'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2 bg-muted rounded-xl text-sm text-foreground outline-none" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">

          {tab === 'announcements' && announcements.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).map(a => (
            <div key={a.id} className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm truncate">{a.title}</p>
                  <StatusBadge active={a.is_active} />
                  <RoleBadge role={a.target_role} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(a.starts_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleAnnouncement(a.id, a.is_active)} className="p-1.5 text-muted-foreground hover:text-primary">
                  {a.is_active ? <ToggleRight size={18} className="text-primary" /> : <ToggleLeft size={18} />}
                </button>
                <button onClick={() => deleteAnnouncement(a.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {tab === 'notifications' && notifTemplates.filter(n => n.name.toLowerCase().includes(search.toLowerCase())).map(n => (
            <div key={n.id} className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm">{n.name}</p>
                  <StatusBadge active={n.is_active} />
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{n.type}</span>
                </div>
                <p className="text-xs font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
              <button onClick={() => toggleNotif(n.id, n.is_active)} className="p-1.5 text-muted-foreground hover:text-primary">
                {n.is_active ? <ToggleRight size={18} className="text-primary" /> : <ToggleLeft size={18} />}
              </button>
            </div>
          ))}

          {tab === 'emails' && emailTemplates.filter(e => e.name.toLowerCase().includes(search.toLowerCase())).map(e => (
            <div key={e.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-foreground text-sm">{e.name}</p>
                  <StatusBadge active={e.is_active} />
                </div>
                <p className="text-xs text-muted-foreground">{e.subject}</p>
                <p className="text-xs text-muted-foreground">Atualizado: {new Date(e.updated_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <button className="p-1.5 text-muted-foreground hover:text-primary"><Pencil size={16} /></button>
            </div>
          ))}

          {tab === 'banners' && banners.filter(b => b.title.toLowerCase().includes(search.toLowerCase())).map(b => (
            <div key={b.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-foreground text-sm">{b.title}</p>
                  <StatusBadge active={b.is_active} />
                  <RoleBadge role={b.target_role} />
                </div>
                {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
                <p className="text-xs text-muted-foreground">Posicao #{b.position}</p>
              </div>
              <button className="p-1.5 text-muted-foreground hover:text-primary"><Pencil size={16} /></button>
            </div>
          ))}

          {((tab === 'announcements' && announcements.length === 0) ||
            (tab === 'notifications' && notifTemplates.length === 0) ||
            (tab === 'emails' && emailTemplates.length === 0) ||
            (tab === 'banners' && banners.length === 0)) && (
            <div className="p-8 text-center text-muted-foreground text-sm">Nenhum item encontrado</div>
          )}
        </div>
      )}
    </div>
  )
}
