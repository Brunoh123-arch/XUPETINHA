'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { cn } from '@/lib/utils'
import { MessageSquare, Plus, Trash2, Eye, EyeOff, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'

interface FeedbackCategory {
  id: string
  name: string
  description: string
  icon: string
  target: string
  is_active: boolean
  created_at: string
}
interface FeedbackForm {
  id: string
  title: string
  description: string
  fields: unknown[]
  target_role: string
  trigger_event: string
  is_active: boolean
  created_at: string
}
interface FeedbackResponse {
  id: string
  form_id: string
  user_id: string
  responses: Record<string, unknown>
  submitted_at: string
}

const TABS = ['Formularios', 'Categorias', 'Respostas']

export default function AdminFeedbackPage() {
  const supabase = createClient()
  const [tab, setTab] = useState(0)
  const [forms, setForms] = useState<FeedbackForm[]>([])
  const [categories, setCategories] = useState<FeedbackCategory[]>([])
  const [responses, setResponses] = useState<FeedbackResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCatForm, setShowCatForm] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', description: '', icon: 'star', target: 'all' })
  const [showFormEditor, setShowFormEditor] = useState(false)
  const [newForm, setNewForm] = useState({ title: '', description: '', target_role: 'passenger', trigger_event: 'after_ride' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [f, c, r] = await Promise.all([
      supabase.from('feedback_forms').select('*').order('created_at', { ascending: false }),
      supabase.from('feedback_categories').select('*').order('name'),
      supabase.from('feedback_responses').select('*').order('submitted_at', { ascending: false }).limit(100),
    ])
    setForms(f.data || [])
    setCategories(c.data || [])
    setResponses(r.data || [])
    setLoading(false)
  }

  async function toggleForm(id: string, current: boolean) {
    await supabase.from('feedback_forms').update({ is_active: !current }).eq('id', id)
    fetchAll()
  }

  async function toggleCategory(id: string, current: boolean) {
    await supabase.from('feedback_categories').update({ is_active: !current }).eq('id', id)
    fetchAll()
  }

  async function deleteForm(id: string) {
    await supabase.from('feedback_forms').delete().eq('id', id)
    fetchAll()
  }

  async function deleteCategory(id: string) {
    await supabase.from('feedback_categories').delete().eq('id', id)
    fetchAll()
  }

  async function createCategory() {
    if (!newCat.name) return
    await supabase.from('feedback_categories').insert({ ...newCat, is_active: true })
    setNewCat({ name: '', description: '', icon: 'star', target: 'all' })
    setShowCatForm(false)
    fetchAll()
  }

  async function createForm() {
    if (!newForm.title) return
    await supabase.from('feedback_forms').insert({ ...newForm, fields: [], is_active: true })
    setNewForm({ title: '', description: '', target_role: 'passenger', trigger_event: 'after_ride' })
    setShowFormEditor(false)
    fetchAll()
  }

  const responsesByForm = responses.reduce<Record<string, number>>((acc, r) => {
    acc[r.form_id] = (acc[r.form_id] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Feedback Avancado" subtitle="Formularios customizaveis, categorias e respostas" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Formularios Ativos', value: forms.filter(f => f.is_active).length },
            { label: 'Categorias Ativas', value: categories.filter(c => c.is_active).length },
            { label: 'Respostas Total', value: responses.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/30 p-1 rounded-lg w-fit">
          {TABS.map((t, i) => (
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
            {/* Tab 0 — Formularios */}
            {tab === 0 && (
              <div className="space-y-4">
                <button onClick={() => setShowFormEditor(!showFormEditor)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
                  <Plus className="w-4 h-4" /> Novo Formulario
                </button>
                {showFormEditor && (
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">Novo Formulario</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="Titulo" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                      <input value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Descricao" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                      <select value={newForm.target_role} onChange={e => setNewForm(p => ({ ...p, target_role: e.target.value }))}
                        className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                        <option value="passenger">Passageiro</option>
                        <option value="driver">Motorista</option>
                        <option value="both">Ambos</option>
                      </select>
                      <select value={newForm.trigger_event} onChange={e => setNewForm(p => ({ ...p, trigger_event: e.target.value }))}
                        className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                        <option value="after_ride">Apos corrida</option>
                        <option value="after_support">Apos suporte</option>
                        <option value="weekly">Semanal</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <button onClick={createForm} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
                      Criar Formulario
                    </button>
                  </div>
                )}
                <div className="space-y-3">
                  {forms.map(form => (
                    <div key={form.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{form.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {form.target_role} · Gatilho: {form.trigger_event} · {responsesByForm[form.id] || 0} respostas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                          form.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted/30 text-muted-foreground')}>
                          {form.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        <button onClick={() => toggleForm(form.id, form.is_active)} className="text-muted-foreground hover:text-foreground transition-colors">
                          {form.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteForm(form.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {forms.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhum formulario criado</p>}
                </div>
              </div>
            )}

            {/* Tab 1 — Categorias */}
            {tab === 1 && (
              <div className="space-y-4">
                <button onClick={() => setShowCatForm(!showCatForm)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
                  <Plus className="w-4 h-4" /> Nova Categoria
                </button>
                {showCatForm && (
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))}
                        placeholder="Nome" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                      <input value={newCat.description} onChange={e => setNewCat(p => ({ ...p, description: e.target.value }))}
                        placeholder="Descricao" className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
                      <select value={newCat.target} onChange={e => setNewCat(p => ({ ...p, target: e.target.value }))}
                        className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                        <option value="all">Todos</option>
                        <option value="passenger">Passageiro</option>
                        <option value="driver">Motorista</option>
                      </select>
                      <button onClick={createCategory} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary/90">
                        Criar Categoria
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.description} · {cat.target}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs',
                          cat.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted/30 text-muted-foreground')}>
                          {cat.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                        <button onClick={() => toggleCategory(cat.id, cat.is_active)} className="text-muted-foreground hover:text-foreground">
                          {cat.is_active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && <p className="col-span-2 text-center py-8 text-muted-foreground text-sm">Nenhuma categoria criada</p>}
                </div>
              </div>
            )}

            {/* Tab 2 — Respostas */}
            {tab === 2 && (
              <div className="space-y-3">
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20 border-b border-border">
                      <tr>
                        {['Formulario', 'Usuario', 'Data', 'Respostas'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map(r => {
                        const form = forms.find(f => f.id === r.form_id)
                        return (
                          <tr key={r.id} className="border-b border-border/50 hover:bg-muted/10">
                            <td className="px-4 py-3 font-medium text-foreground">{form?.title || 'Formulario removido'}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{r.user_id.slice(0, 8)}...</td>
                            <td className="px-4 py-3 text-muted-foreground">{new Date(r.submitted_at).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-3 text-foreground">{Object.keys(r.responses || {}).length} campos</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {responses.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma resposta recebida</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
