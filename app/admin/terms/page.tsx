'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { cn } from '@/lib/utils'
import { FileText, Plus, Check, RefreshCw, Eye, Star, Clock } from 'lucide-react'

interface TermsVersion {
  id: string
  version: string
  title: string
  content: string
  effective_date: string
  is_current: boolean
  created_at: string
}

interface TermsAcceptance {
  id: string
  user_id: string
  terms_id: string
  accepted_at: string
  ip_address: string
}

export default function AdminTermsPage() {
  const supabase = createClient()
  const [versions, setVersions] = useState<TermsVersion[]>([])
  const [acceptances, setAcceptances] = useState<TermsAcceptance[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [selected, setSelected] = useState<TermsVersion | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newTerms, setNewTerms] = useState({ version: '', title: 'Termos de Uso', content: '', effective_date: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [v, a] = await Promise.all([
      supabase.from('terms_versions').select('*').order('created_at', { ascending: false }),
      supabase.from('terms_acceptances').select('*').order('accepted_at', { ascending: false }).limit(100),
    ])
    setVersions(v.data || [])
    setAcceptances(a.data || [])
    if (v.data && v.data.length > 0 && !selected) setSelected(v.data[0])
    setLoading(false)
  }

  async function setCurrent(id: string) {
    await supabase.from('terms_versions').update({ is_current: false }).neq('id', id)
    await supabase.from('terms_versions').update({ is_current: true }).eq('id', id)
    fetchAll()
  }

  async function createVersion() {
    if (!newTerms.version || !newTerms.content) return
    await supabase.from('terms_versions').insert({ ...newTerms, is_current: false })
    setNewTerms({ version: '', title: 'Termos de Uso', content: '', effective_date: '' })
    setShowForm(false)
    fetchAll()
  }

  const acceptancesByTerms = acceptances.reduce<Record<string, number>>((acc, a) => {
    acc[a.terms_id] = (acc[a.terms_id] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Termos e Privacidade" subtitle="Versoes dos termos, aceites e historico" />
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg w-fit">
          {['Versoes', 'Aceites', 'Editor'].map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={cn('px-4 py-2 rounded-md text-sm font-medium transition-all',
                tab === i ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : (
          <>
            {/* Tab 0 — Versoes */}
            {tab === 0 && (
              <div className="space-y-4">
                <button onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
                  <Plus className="w-4 h-4" /> Nova Versao
                </button>

                {showForm && (
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">Nova Versao dos Termos</p>
                    <div className="grid grid-cols-3 gap-3">
                      <input value={newTerms.version} onChange={e => setNewTerms(p => ({ ...p, version: e.target.value }))}
                        placeholder="Versao (ex: 2.1.0)" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                      <input value={newTerms.title} onChange={e => setNewTerms(p => ({ ...p, title: e.target.value }))}
                        placeholder="Titulo" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                      <input type="date" value={newTerms.effective_date} onChange={e => setNewTerms(p => ({ ...p, effective_date: e.target.value }))}
                        className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                    </div>
                    <textarea value={newTerms.content} onChange={e => setNewTerms(p => ({ ...p, content: e.target.value }))}
                      placeholder="Conteudo dos termos (Markdown suportado)..." rows={8}
                      className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono" />
                    <button onClick={createVersion} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
                      Publicar Versao
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {versions.map(v => (
                    <div key={v.id} className={cn('bg-card border rounded-xl p-4 flex items-center justify-between',
                      v.is_current ? 'border-primary/50 bg-primary/5' : 'border-border')}>
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                          v.is_current ? 'bg-primary/20' : 'bg-muted/30')}>
                          <FileText className={cn('w-5 h-5', v.is_current ? 'text-primary' : 'text-muted-foreground')} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{v.title} v{v.version}</p>
                            {v.is_current && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">Atual</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Vigencia: {v.effective_date ? new Date(v.effective_date).toLocaleDateString('pt-BR') : '—'} ·
                            {acceptancesByTerms[v.id] || 0} aceites ·
                            Criado em {new Date(v.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelected(v); setTab(2) }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-muted/20 px-3 py-1.5 rounded-lg">
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </button>
                        {!v.is_current && (
                          <button onClick={() => setCurrent(v.id)}
                            className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20">
                            <Check className="w-3.5 h-3.5" /> Definir como atual
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {versions.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma versao publicada</p>}
                </div>
              </div>
            )}

            {/* Tab 1 — Aceites */}
            {tab === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{acceptances.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total de Aceites</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{new Set(acceptances.map(a => a.user_id)).size}</p>
                    <p className="text-xs text-muted-foreground mt-1">Usuarios Unicos</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{versions.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Versoes Publicadas</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20 border-b border-border">
                      <tr>
                        {['Usuario', 'Versao', 'Data de Aceite', 'IP'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {acceptances.map(a => {
                        const version = versions.find(v => v.id === a.terms_id)
                        return (
                          <tr key={a.id} className="border-b border-border/50 hover:bg-muted/10">
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.user_id.slice(0, 12)}...</td>
                            <td className="px-4 py-3 text-foreground">{version ? `v${version.version}` : '—'}</td>
                            <td className="px-4 py-3 text-muted-foreground">{new Date(a.accepted_at).toLocaleString('pt-BR')}</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{String(a.ip_address) || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {acceptances.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhum aceite registrado</p>}
                </div>
              </div>
            )}

            {/* Tab 2 — Editor / Visualizacao */}
            {tab === 2 && (
              <div className="space-y-4">
                {versions.length > 0 && (
                  <select
                    value={selected?.id || ''}
                    onChange={e => setSelected(versions.find(v => v.id === e.target.value) || null)}
                    className="bg-card border border-border rounded-lg px-4 py-2 text-sm text-foreground"
                  >
                    {versions.map(v => <option key={v.id} value={v.id}>v{v.version} — {v.title}</option>)}
                  </select>
                )}
                {selected && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-foreground">{selected.title} v{selected.version}</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          Vigente desde {selected.effective_date ? new Date(selected.effective_date).toLocaleDateString('pt-BR') : '—'}
                        </p>
                      </div>
                      {selected.is_current && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          <Star className="w-3 h-3" /> Versao atual
                        </span>
                      )}
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">{selected.content}</pre>
                    </div>
                  </div>
                )}
                {!selected && <p className="text-center py-8 text-muted-foreground text-sm">Selecione uma versao para visualizar</p>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
