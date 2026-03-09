'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { iosToast } from '@/lib/utils/ios-toast'
import { haptics } from '@/lib/utils/ios-haptics'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNavigation } from '@/components/bottom-navigation'
import {
  MessageSquare, ChevronRight, Send, ArrowLeft,
  Clock, CheckCircle2, AlertCircle, XCircle, Plus, Headphones
} from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  category: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  content: string
  is_admin: boolean
  created_at: string
}

const CATEGORIES = [
  { value: 'ride', label: 'Problema com corrida' },
  { value: 'payment', label: 'Pagamento' },
  { value: 'account', label: 'Minha conta' },
  { value: 'driver', label: 'Motorista' },
  { value: 'app', label: 'Problema no app' },
  { value: 'general', label: 'Outro assunto' },
]

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  open:        { label: 'Aberto',       color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',   icon: Clock },
  in_progress: { label: 'Em andamento', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle },
  resolved:    { label: 'Resolvido',    color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  closed:      { label: 'Fechado',      color: 'text-muted-foreground bg-secondary',                                  icon: XCircle },
}

export default function SupportPage() {
  const router = useRouter()
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ subject: '', message: '', category: 'general' })
  const msgEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadTickets() }, [])
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadTickets = async () => {
    try {
      const res = await fetch('/api/v1/support')
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      }
    } catch (err) {
      console.error('[support]', err)
    } finally {
      setLoading(false)
    }
  }

  const openTicket = async (ticket: Ticket) => {
    setActiveTicket(ticket)
    setLoadingMessages(true)
    setView('detail')
    try {
      const res = await fetch(`/api/v1/support?ticket_id=${ticket.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error('[support detail]', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeTicket) return
    setSending(true)
    try {
      const res = await fetch('/api/v1/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: activeTicket.id, message: newMessage }),
      })
      const data = await res.json()
      if (!res.ok) { iosToast.error(data.error || 'Erro ao enviar'); return }
      setMessages(prev => [...prev, data.message])
      setNewMessage('')
      haptics.notification('success')
    } catch { iosToast.error('Erro ao enviar mensagem') } finally { setSending(false) }
  }

  const createTicket = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      iosToast.error('Preencha todos os campos')
      haptics.notification('error')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/v1/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { iosToast.error(data.error || 'Erro ao abrir chamado'); return }
      haptics.notification('success')
      iosToast.success('Chamado aberto com sucesso!')
      setForm({ subject: '', message: '', category: 'general' })
      await loadTickets()
      setView('list')
    } catch { iosToast.error('Erro ao criar chamado') } finally { setCreating(false) }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  // ── Detail view ──
  if (view === 'detail' && activeTicket) {
    const s = STATUS_MAP[activeTicket.status] || STATUS_MAP.open
    return (
      <div className="h-dvh flex flex-col bg-background">
        <header className="bg-background/80 ios-blur border-b border-border/50 sticky top-0 z-10">
          <div className="flex items-center gap-3 px-4 pt-safe-offset-3 pb-3">
            <button type="button" onClick={() => { setView('list'); setActiveTicket(null) }} className="ios-press p-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{activeTicket.subject}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.color}`}>
                <s.icon className="w-3 h-3" /> {s.label}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 ios-scroll">
          {loadingMessages ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-[18px] px-4 py-3 ${
                msg.is_admin
                  ? 'bg-secondary text-foreground rounded-tl-sm'
                  : 'bg-primary text-primary-foreground rounded-tr-sm'
              }`}>
                {msg.is_admin && (
                  <p className="text-[11px] font-semibold opacity-60 mb-1">Suporte Uppi</p>
                )}
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
                <p className="text-[11px] opacity-50 mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={msgEndRef} />
        </div>

        {activeTicket.status !== 'closed' && activeTicket.status !== 'resolved' && (
          <div className="border-t border-border/50 px-4 py-3 bg-background flex items-end gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="flex-1 resize-none bg-secondary/60 rounded-[16px] px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-28"
              style={{ overflowY: 'auto' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
              }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="w-11 h-11 bg-primary rounded-full flex items-center justify-center ios-press disabled:opacity-40"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── New ticket ──
  if (view === 'new') {
    return (
      <div className="h-dvh overflow-y-auto bg-background ios-scroll">
        <header className="sticky top-0 z-10 bg-background/80 ios-blur border-b border-border/50">
          <div className="flex items-center gap-3 px-4 pt-safe-offset-3 pb-3">
            <button type="button" onClick={() => setView('list')} className="ios-press p-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-[18px] font-bold text-foreground">Novo chamado</h1>
          </div>
        </header>

        <main className="px-5 py-6 max-w-lg mx-auto space-y-4">
          <div>
            <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Categoria</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => { haptics.selection(); setForm(f => ({ ...f, category: cat.value })) }}
                  className={`px-4 py-3 rounded-[14px] text-left text-[14px] font-medium ios-press transition-all ${
                    form.category === cat.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Assunto</label>
            <input
              value={form.subject}
              onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Descreva brevemente o problema"
              maxLength={100}
              className="w-full bg-secondary/60 rounded-[16px] px-4 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 border border-border/40"
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Mensagem</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Descreva com detalhes o que aconteceu..."
              rows={5}
              maxLength={1000}
              className="w-full bg-secondary/60 rounded-[16px] px-4 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none border border-border/40"
            />
            <p className="text-right text-[11px] text-muted-foreground mt-1">{form.message.length}/1000</p>
          </div>

          <button
            type="button"
            onClick={createTicket}
            disabled={creating}
            className="w-full h-[56px] bg-primary text-primary-foreground rounded-[18px] font-bold text-[17px] ios-press shadow-lg shadow-primary/30 disabled:opacity-70"
          >
            {creating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Enviando...
              </span>
            ) : 'Abrir chamado'}
          </button>
        </main>
      </div>
    )
  }

  // ── List view ──
  return (
    <div className="h-dvh overflow-y-auto bg-background pb-28 ios-scroll">
      <header className="sticky top-0 z-10 bg-background/80 ios-blur border-b border-border/50">
        <div className="flex items-center justify-between px-5 pt-safe-offset-4 pb-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/60 ios-press">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-[22px] font-bold text-foreground">Suporte</h1>
              <p className="text-sm text-muted-foreground">Seus chamados</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { haptics.impactMedium(); setView('new') }}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-[14px] font-semibold ios-press"
          >
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary/60 mx-auto mb-4 flex items-center justify-center">
              <Headphones className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-[20px] font-bold text-foreground mb-2">Nenhum chamado</h3>
            <p className="text-muted-foreground mb-6">Você não tem nenhum chamado de suporte aberto</p>
            <button
              type="button"
              onClick={() => { haptics.impactMedium(); setView('new') }}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold ios-press"
            >
              Abrir chamado
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket, i) => {
              const s = STATUS_MAP[ticket.status] || STATUS_MAP.open
              return (
                <motion.button
                  key={ticket.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => { haptics.selection(); openTicket(ticket) }}
                  className="w-full bg-card rounded-[20px] p-4 border border-border/50 text-left ios-press flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/60 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-foreground truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.color}`}>
                        <s.icon className="w-3 h-3" /> {s.label}
                      </span>
                      <span className="text-[12px] text-muted-foreground">{formatDate(ticket.updated_at)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                </motion.button>
              )
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
