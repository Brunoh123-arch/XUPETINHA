'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AdminHeader } from '@/components/admin/admin-header'
import { cn } from '@/lib/utils'
import { MessageSquare, RefreshCw, Search, Clock, User } from 'lucide-react'

interface Conversation {
  id: string
  ride_id: string
  passenger_id: string
  driver_id: string
  last_message_at: string
  passenger_unread: number
  driver_unread: number
  created_at: string
}

export default function AdminConversationsPage() {
  const supabase = createClient()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchConversations() }, [])

  async function fetchConversations() {
    setLoading(true)
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false })
      .limit(100)
    setConversations(data || [])
    setLoading(false)
  }

  const filtered = conversations.filter(c =>
    c.ride_id?.includes(search) ||
    c.passenger_id?.includes(search) ||
    c.driver_id?.includes(search)
  )

  const totalUnread = conversations.reduce((sum, c) => sum + c.passenger_unread + c.driver_unread, 0)
  const active24h = conversations.filter(c =>
    new Date(c.last_message_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader title="Conversas" subtitle="Threads de mensagem entre passageiros e motoristas" />
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total de Threads', value: conversations.length },
            { label: 'Ativas (24h)', value: active24h },
            { label: 'Mensagens Nao Lidas', value: totalUnread },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ride ID, passageiro ou motorista..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Carregando...
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/20 border-b border-border">
                <tr>
                  {['Corrida', 'Passageiro', 'Motorista', 'Ultima Mensagem', 'Nao Lidas (P)', 'Nao Lidas (M)'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(conv => {
                  const hasUnread = conv.passenger_unread > 0 || conv.driver_unread > 0
                  return (
                    <tr key={conv.id} className={cn('border-b border-border/50 hover:bg-muted/10', hasUnread && 'bg-primary/5')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                            hasUnread ? 'bg-primary/20' : 'bg-muted/20')}>
                            <MessageSquare className={cn('w-3.5 h-3.5', hasUnread ? 'text-primary' : 'text-muted-foreground')} />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">{conv.ride_id?.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-mono text-xs text-muted-foreground">{conv.passenger_id?.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-mono text-xs text-muted-foreground">{conv.driver_id?.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(conv.last_message_at).toLocaleString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {conv.passenger_unread > 0 ? (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full text-xs font-bold">{conv.passenger_unread}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {conv.driver_unread > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-bold">{conv.driver_unread}</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">0</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma conversa encontrada</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
