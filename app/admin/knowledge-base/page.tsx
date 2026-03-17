"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { BookOpen, Plus, Eye, ThumbsUp, Search, Pencil, Trash2, Globe, EyeOff } from "lucide-react"

type Article = {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  target_audience: string
  is_published: boolean
  views: number
  helpful_count: number
  created_at: string
}

const CATEGORIES = ["Corridas", "Pagamentos", "Conta", "Seguranca", "Motoristas", "Geral"]
const AUDIENCES = ["passageiro", "motorista", "ambos"]

export default function KnowledgeBasePage() {
  const supabase = createClient()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterAudience, setFilterAudience] = useState("todos")
  const [filterCategory, setFilterCategory] = useState("todas")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState({
    title: "", content: "", category: "Geral",
    tags: "", target_audience: "ambos", is_published: true,
  })

  useEffect(() => { fetchArticles() }, [filterAudience, filterCategory])

  async function fetchArticles() {
    setLoading(true)
    let q = supabase.from("knowledge_base_articles").select("*").order("created_at", { ascending: false })
    if (filterAudience !== "todos") q = q.eq("target_audience", filterAudience)
    if (filterCategory !== "todas") q = q.eq("category", filterCategory)
    const { data } = await q
    setArticles(data ?? [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm({ title: "", content: "", category: "Geral", tags: "", target_audience: "ambos", is_published: true })
    setOpen(true)
  }

  function openEdit(a: Article) {
    setEditing(a)
    setForm({ title: a.title, content: a.content, category: a.category, tags: (a.tags ?? []).join(", "), target_audience: a.target_audience, is_published: a.is_published })
    setOpen(true)
  }

  async function save() {
    const payload = {
      title: form.title, content: form.content, category: form.category,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      target_audience: form.target_audience, is_published: form.is_published,
    }
    if (editing) {
      await supabase.from("knowledge_base_articles").update(payload).eq("id", editing.id)
    } else {
      await supabase.from("knowledge_base_articles").insert(payload)
    }
    setOpen(false)
    fetchArticles()
  }

  async function togglePublish(a: Article) {
    await supabase.from("knowledge_base_articles").update({ is_published: !a.is_published }).eq("id", a.id)
    fetchArticles()
  }

  async function remove(id: string) {
    await supabase.from("knowledge_base_articles").delete().eq("id", id)
    fetchArticles()
  }

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Base de Conhecimento</h1>
          <p className="text-sm text-muted-foreground mt-1">{articles.length} artigos cadastrados</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Artigo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar artigos..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterAudience} onValueChange={setFilterAudience}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos publicos</SelectItem>
            <SelectItem value="passageiro">Passageiro</SelectItem>
            <SelectItem value="motorista">Motorista</SelectItem>
            <SelectItem value="ambos">Ambos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorias</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum artigo encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="bg-card border border-border rounded-xl p-5 flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-foreground">{a.title}</span>
                  <Badge variant="outline" className="text-xs">{a.category}</Badge>
                  <Badge variant="outline" className={`text-xs ${a.target_audience === "motorista" ? "border-blue-500 text-blue-500" : a.target_audience === "passageiro" ? "border-green-500 text-green-500" : ""}`}>
                    {a.target_audience}
                  </Badge>
                  {!a.is_published && <Badge variant="secondary" className="text-xs">Rascunho</Badge>}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                {a.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {a.tags.map(t => <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views ?? 0}</span>
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{a.helpful_count ?? 0}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(a)}>
                  {a.is_published ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Artigo" : "Novo Artigo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Titulo do artigo" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <Textarea placeholder="Conteudo do artigo..." rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Publico-alvo</label>
                <Select value={form.target_audience} onValueChange={v => setForm(f => ({ ...f, target_audience: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AUDIENCES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Input placeholder="Tags (separadas por virgula)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} />
              Publicar imediatamente
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
