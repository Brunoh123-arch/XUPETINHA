'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { realtimeService } from '@/lib/services/realtime-service'
import { iosToast } from '@/lib/utils/ios-toast'
import { useHaptic } from '@/hooks/use-haptic'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageCircle } from 'lucide-react'

interface Message {
  id: string
  ride_id: string
  sender_id: string
  content: string
  created_at: string
}

const QUICK_MESSAGES = [
  'Estou a caminho',
  'Cheguei!',
  'Ok, aguardo',
  'Pode confirmar o local?',
]

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const haptic = useHaptic()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')
  const [otherUserName, setOtherUserName] = useState('')
  const [otherUserAvatar, setOtherUserAvatar] = useState('')

  useEffect(() => {
    loadChat()

    const channel = realtimeService.subscribeToMessages(
      params.id as string,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const msg = payload.new as Message
          setMessages(prev => [...prev, msg])
          // Feedback tátil ao receber mensagem de outra pessoa
          if (msg.sender_id !== currentUserId) {
            haptic.selection()
          }
        }
      }
    )

    return () => {
      realtimeService.unsubscribe(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/onboarding/splash')
        return
      }

      setCurrentUserId(user.id)

      // Carrega detalhes da corrida e nomes
      const { data: ride } = await supabase
        .from('rides')
        .select(`
          passenger_id,
          driver_id,
          passenger:profiles!passenger_id(full_name, avatar_url),
          driver:profiles!driver_id(full_name, avatar_url)
        `)
        .eq('id', params.id)
        .single()

      if (ride) {
        const isPassenger = ride.passenger_id === user.id
        const other = isPassenger ? ride.driver : ride.passenger
        setOtherUserName((other as any)?.full_name || 'Usuário')
        setOtherUserAvatar(
          (other as any)?.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${(other as any)?.full_name || 'default'}`
        )
      }

      // Carrega mensagens existentes
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('ride_id', params.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Error loading chat:', err)
      iosToast.error('Erro ao carregar conversa')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? newMessage).trim()
    if (!content || sending) return

    haptic.light()
    setSending(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('messages')
        .insert({
          ride_id: params.id,
          sender_id: user.id,
          content,
        })

      if (error) throw error
      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      haptic.error()
      iosToast.error('Erro ao enviar mensagem')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="h-dvh bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col bg-[#F2F2F7] dark:bg-black overflow-hidden">
      {/* Header iOS */}
      <header className="flex-none bg-white/80 dark:bg-black/80 ios-blur-heavy border-b border-black/[0.08] dark:border-white/[0.08] sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 pt-safe-offset-3 pb-3">
          <button
            type="button"
            onClick={() => {
              haptic.light()
              router.back()
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/60 ios-press"
            aria-label="Voltar"
          >
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <img
            src={otherUserAvatar}
            alt={otherUserName}
            className="w-9 h-9 rounded-full object-cover border border-black/[0.06] dark:border-white/[0.1]"
          />

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-foreground truncate">{otherUserName}</p>
            <p className="text-[12px] text-muted-foreground">Chat da corrida</p>
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <main className="flex-1 overflow-y-auto ios-scroll px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-4 text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-blue-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[17px] font-semibold text-foreground">Nenhuma mensagem</p>
              <p className="text-[14px] text-muted-foreground mt-1">Inicie a conversa com {otherUserName}</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === currentUserId
              const prevMsg = messages[i - 1]
              const showTimestamp =
                !prevMsg ||
                new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000

              return (
                <div key={msg.id}>
                  {showTimestamp && (
                    <div className="text-center my-3">
                      <span className="text-[11px] text-muted-foreground bg-secondary/60 px-3 py-1 rounded-full">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[72%] px-4 py-2.5 rounded-[20px] shadow-sm ${
                        isMe
                          ? 'bg-blue-500 text-white rounded-br-[6px]'
                          : 'bg-white dark:bg-[#1C1C1E] text-foreground rounded-bl-[6px] border border-black/[0.04] dark:border-white/[0.06]'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                    </div>
                  </motion.div>
                </div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Mensagens rápidas */}
      <div className="flex-none px-4 pb-2 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {QUICK_MESSAGES.map((qm) => (
            <button
              key={qm}
              type="button"
              onClick={() => {
                haptic.selection()
                sendMessage(qm)
              }}
              disabled={sending}
              className="flex-none h-9 px-4 bg-white dark:bg-[#1C1C1E] rounded-full text-[13px] font-medium text-blue-500 border border-blue-500/20 ios-press whitespace-nowrap disabled:opacity-50 shadow-sm"
            >
              {qm}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex-none bg-white/80 dark:bg-black/80 ios-blur-heavy border-t border-black/[0.08] dark:border-white/[0.08] px-4 pb-safe-offset-4 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-full px-4 h-11 border border-black/[0.06] dark:border-white/[0.08]">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Mensagem..."
              className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
              disabled={sending}
            />
          </div>

          <motion.button
            type="button"
            onClick={() => sendMessage()}
            disabled={!newMessage.trim() || sending}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${
              newMessage.trim()
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-secondary text-muted-foreground'
            } disabled:opacity-50`}
            aria-label="Enviar mensagem"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" strokeWidth={2.5} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
