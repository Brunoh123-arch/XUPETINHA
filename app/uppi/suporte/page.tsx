'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { haptics } from '@/lib/utils/ios-haptics'
import { BottomNavigation } from '@/components/bottom-navigation'

interface SupportTicket {
  id: string
  topic: string
  status: string
  priority: string
  created_at: string
}

const TOPIC_MAP: Record<string, { label: string; icon: string }> = {
  ride: { label: 'Problema com corrida', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  payment: { label: 'Pagamento', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  account: { label: 'Minha conta', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  driver: { label: 'Problema com motorista', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  safety: { label: 'Seguranca', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  other: { label: 'Outro assunto', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  open: { text: 'Aberto', color: 'text-blue-600' },
  waiting: { text: 'Aguardando', color: 'text-amber-600' },
  resolved: { text: 'Resolvido', color: 'text-green-600' },
  closed: { text: 'Fechado', color: 'text-neutral-400' },
}

export default function SuportePage() {
  const router = useRouter()
  const supabase = createClient()
  const [message, setMessage] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [openTickets, setOpenTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)

  useEffect(() => {
    const loadTickets = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoadingTickets(false); return }
      const { data } = await supabase
        .from('support_tickets')
        .select('id, topic, status, priority, created_at')
        .eq('user_id', user.id)
        .not('status', 'eq', 'closed')
        .order('created_at', { ascending: false })
        .limit(5)
      setOpenTickets(data || [])
      setLoadingTickets(false)
    }
    loadTickets()
  }, [])

  const handleStartChat = async () => {
    if (!selectedTopic) {
      iosToast.error('Selecione um assunto primeiro')
      return
    }
    setLoading(true)
    haptics.impactMedium()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/uppi/auth/login')
        return
      }
      // Criar ticket de suporte no banco
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          topic: selectedTopic,
          status: 'open',
          priority: selectedTopic === 'safety' ? 'urgent' : selectedTopic === 'ride' ? 'high' : 'medium',
        })
        .select('id')
        .single()

      if (error) throw error

      // Se tiver mensagem inicial, inserir como primeira mensagem
      if (message.trim() && ticket) {
        await supabase.from('support_messages').insert({
          ticket_id: ticket.id,
          sender_id: user.id,
          sender_type: 'user',
          message: message.trim(),
        })
      }

      haptics.notificationSuccess()
      router.push(`/uppi/suporte/chat?ticket=${ticket?.id}&topic=${selectedTopic}`)
    } catch (err: any) {
      iosToast.error('Erro ao iniciar atendimento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const topics = Object.entries(TOPIC_MAP)

  return (
    <div className="h-dvh overflow-y-auto bg-neutral-50 pb-24 ios-scroll">
      {/* Header */}
      <header className="bg-white/95 ios-blur border-b border-neutral-200/60 sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full ios-press">
              <svg className="w-[22px] h-[22px] text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">Suporte</h1>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto space-y-6 animate-ios-fade-up">
        {/* Hero */}
        <div className="ios-card-elevated p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-[22px] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold text-neutral-900 tracking-tight mb-1">Como podemos ajudar?</h2>
          <p className="text-[15px] text-neutral-500">Selecione um assunto para iniciar o atendimento</p>
        </div>

        {/* Tickets abertos */}
        {!loadingTickets && openTickets.length > 0 && (
          <div>
            <p className="ios-section-header">Seus chamados abertos</p>
            <div className="ios-list-group">
              {openTickets.map((ticket, i) => {
                const topicInfo = TOPIC_MAP[ticket.topic] || TOPIC_MAP.other
                const statusInfo = STATUS_LABELS[ticket.status] || STATUS_LABELS.open
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => router.push(`/uppi/suporte/chat?ticket=${ticket.id}&topic=${ticket.topic}`)}
                    className={`w-full ios-list-item ios-press ${i < openTickets.length - 1 ? 'border-b border-neutral-100/80' : ''}`}
                  >
                    <div className="w-11 h-11 bg-blue-50 rounded-[14px] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={topicInfo.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[15px] font-medium text-neutral-900 truncate">{topicInfo.label}</p>
                      <p className={`text-[12px] font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
                    </div>
                    <svg className="w-5 h-5 text-neutral-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Topics */}
        <div>
          <p className="ios-section-header">Novo atendimento — selecione o assunto</p>
          <div className="grid grid-cols-2 gap-3">
            {topics.map(([id, topic]) => (
              <button
                key={id}
                type="button"
                onClick={() => { setSelectedTopic(id === selectedTopic ? null : id); haptics.selectionChanged() }}
                className={`ios-card p-4 flex flex-col items-start gap-3 ios-press ios-smooth ${
                  selectedTopic === id ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ios-smooth ${
                  selectedTopic === id ? 'bg-blue-500 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={topic.icon} />
                  </svg>
                </div>
                <span className="text-[14px] font-semibold text-neutral-900 text-left leading-snug">{topic.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message form */}
        {selectedTopic && (
          <div className="ios-card p-5 animate-ios-fade-up">
            <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight mb-1">Descreva o problema</h3>
            <p className="text-[13px] text-neutral-500 mb-3">Opcional — voce podera detalhar no chat</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conte o que aconteceu..."
              rows={4}
              className="w-full px-4 py-3 bg-neutral-100/80 rounded-[14px] text-[17px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-blue-500/30 resize-none ios-smooth"
            />
            <button
              type="button"
              onClick={handleStartChat}
              disabled={loading}
              className="w-full h-[52px] rounded-[16px] bg-blue-500 text-white font-semibold text-[17px] mt-4 ios-press shadow-[0_4px_16px_rgba(59,130,246,0.3)] disabled:opacity-50"
            >
              {loading ? 'Abrindo chamado...' : 'Iniciar chat ao vivo'}
            </button>
          </div>
        )}

        {/* Contact Channels */}
        <div>
          <p className="ios-section-header">Outros canais</p>
          <div className="ios-list-group">
            {[
              { title: 'E-mail', desc: 'suporte@uppi.com.br', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', action: async () => { const { nativeEmail } = await import('@/lib/native'); await nativeEmail('suporte@uppi.com.br') } },
              { title: 'Telefone', desc: '0800 123 4567', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', action: async () => { const { nativeCall } = await import('@/lib/native'); await nativeCall('08001234567') } },
            ].map((ch, i) => (
              <button
                key={i}
                type="button"
                onClick={ch.action}
                className={`w-full ios-list-item ios-press ${i === 0 ? 'border-b border-neutral-100/80' : ''}`}
              >
                <div className="w-11 h-11 bg-neutral-100 rounded-[14px] flex items-center justify-center flex-shrink-0">
                  <svg className="w-[22px] h-[22px] text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={ch.icon} />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[17px] font-medium text-neutral-900">{ch.title}</p>
                  <p className="text-[13px] text-neutral-500 mt-0.5">{ch.desc}</p>
                </div>
                <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <button
          type="button"
          onClick={() => router.push('/uppi/help')}
          className="w-full ios-card p-5 flex items-center gap-4 ios-press"
        >
          <div className="w-11 h-11 bg-amber-50 rounded-[14px] flex items-center justify-center flex-shrink-0">
            <svg className="w-[22px] h-[22px] text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <p className="text-[17px] font-medium text-neutral-900">Perguntas Frequentes</p>
            <p className="text-[13px] text-neutral-500 mt-0.5">Encontre respostas rapidas</p>
          </div>
          <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </main>

      <BottomNavigation />
    </div>
  )
}
