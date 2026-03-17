'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserX, ShieldOff, MoreVertical, User } from 'lucide-react'

interface BlockedUser {
  id: string
  blocked_id: string
  reason: string | null
  created_at: string
  blocked_profile: {
    full_name: string
    avatar_url: string | null
    role: string
  }
}

export default function BlockedUsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [blocked, setBlocked] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [unblocking, setUnblocking] = useState<string | null>(null)

  useEffect(() => { loadBlocked() }, [])

  async function loadBlocked() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data } = await supabase
      .from('blocked_users')
      .select(`
        id, blocked_id, reason, created_at,
        blocked_profile:profiles!blocked_id(full_name, avatar_url, role)
      `)
      .eq('blocker_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setBlocked(data as unknown as BlockedUser[])
    setLoading(false)
  }

  async function unblock(id: string) {
    setUnblocking(id)
    await supabase.from('blocked_users').delete().eq('id', id)
    setBlocked(prev => prev.filter(b => b.id !== id))
    setUnblocking(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground">Usuarios Bloqueados</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">
          Usuarios bloqueados nao poderao solicitar corridas com voce nem interagir no feed.
        </p>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-muted animate-pulse rounded-2xl h-20" />
            ))}
          </div>
        ) : blocked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <ShieldOff size={28} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">Nenhum usuario bloqueado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Voce pode bloquear usuarios pelo perfil deles ou apos uma corrida.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {blocked.map(b => (
              <div key={b.id} className="bg-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {b.blocked_profile?.avatar_url ? (
                    <img src={b.blocked_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {b.blocked_profile?.full_name ?? 'Usuario'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {b.blocked_profile?.role === 'driver' ? 'Motorista' : 'Passageiro'}
                  </p>
                  {b.reason && (
                    <p className="text-xs text-muted-foreground truncate">Motivo: {b.reason}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Bloqueado em {new Date(b.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => unblock(b.id)}
                  disabled={unblocking === b.id}
                  className="text-xs text-destructive border border-destructive rounded-lg px-3 py-1.5 font-medium disabled:opacity-50"
                >
                  {unblocking === b.id ? '...' : 'Desbloquear'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
