'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  user_type: string
  status: string
  is_banned: boolean
  is_admin: boolean
  total_rides: number
  rating: number
  created_at: string
  avatar_url: string | null
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  passenger: { label: 'Passageiro', color: 'text-blue-600' },
  driver: { label: 'Motorista', color: 'text-emerald-600' },
  both: { label: 'Ambos', color: 'text-purple-600' },
}

export default function AdminUsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const [actionUser, setActionUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/onboarding/splash'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) { router.push('/uppi/home'); return }
      setIsAdmin(true)
    }
    checkAdmin()
  }, [])

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        type: typeFilter,
        page: String(page),
      })
      const res = await fetch(`/api/v1/admin/users?${params}`)
      if (!res.ok) throw new Error()
      const { users: data, totalPages: tp } = await res.json()
      setUsers(data || [])
      setTotalPages(tp || 1)
    } catch {
      iosToast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, search, typeFilter, page])

  useEffect(() => {
    const delay = setTimeout(() => loadUsers(), search ? 500 : 0)
    return () => clearTimeout(delay)
  }, [loadUsers])

  const handleAction = async (userId: string, action: string) => {
    setProcessing(userId)
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        iosToast.error(data.error || 'Erro ao processar')
        return
      }
      iosToast.success('Ação realizada com sucesso')
      setActionUser(null)
      loadUsers()
    } catch {
      iosToast.error('Erro ao processar ação')
    } finally {
      setProcessing(null)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="h-dvh overflow-y-auto bg-[color:var(--background)] pb-8 ios-scroll">
      <header className="bg-[color:var(--card)]/90 ios-blur border-b border-[color:var(--border)] sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[color:var(--muted)] ios-press"
          >
            <svg className="w-5 h-5 text-[color:var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[20px] font-bold text-[color:var(--foreground)]">Usuários</h1>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full h-[42px] pl-10 pr-4 bg-[color:var(--muted)] rounded-[12px] text-[15px] text-[color:var(--foreground)] placeholder:text-[color:var(--muted-foreground)] outline-none"
            />
          </div>
        </div>

        {/* Type filter */}
        <div className="px-5 pb-3 flex gap-2 overflow-x-auto ios-scroll-x">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'passenger', label: 'Passageiros' },
            { key: 'driver', label: 'Motoristas' },
          ].map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => { setTypeFilter(f.key); setPage(1) }}
              className={cn(
                'px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap ios-press',
                typeFilter === f.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[color:var(--card)] rounded-[16px] p-4 border border-[color:var(--border)] animate-pulse flex items-center gap-3">
                <div className="w-12 h-12 bg-[color:var(--muted)] rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[color:var(--muted)] rounded w-1/2" />
                  <div className="h-3 bg-[color:var(--muted)] rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[color:var(--card)] rounded-[24px] p-16 text-center border border-[color:var(--border)]">
            <p className="text-[18px] font-bold text-[color:var(--foreground)]">Nenhum usuário encontrado</p>
            <p className="text-[14px] text-[color:var(--muted-foreground)] mt-1">Tente mudar os filtros</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user, i) => {
              const tc = TYPE_CONFIG[user.user_type] || TYPE_CONFIG.passenger
              return (
                <div
                  key={user.id}
                  className="bg-[color:var(--card)] rounded-[16px] p-4 border border-[color:var(--border)] animate-ios-fade-up"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[16px] shrink-0 overflow-hidden">
                      {user.avatar_url
                        ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        : (user.full_name?.charAt(0) || 'U')
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-[color:var(--foreground)] truncate">
                          {user.full_name || 'Sem nome'}
                        </p>
                        {user.is_admin && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full shrink-0">ADMIN</span>
                        )}
                        {user.is_banned && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full shrink-0">BANIDO</span>
                        )}
                      </div>
                      <p className="text-[12px] text-[color:var(--muted-foreground)] truncate">{user.email || user.phone || '—'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('text-[12px] font-semibold', tc.color)}>{tc.label}</span>
                        <span className="text-[color:var(--muted-foreground)] text-[10px]">•</span>
                        <span className="text-[12px] text-[color:var(--muted-foreground)]">{user.total_rides} corridas</span>
                        <span className="text-[color:var(--muted-foreground)] text-[10px]">•</span>
                        <span className="text-[12px] text-[color:var(--muted-foreground)]">{Number(user.rating).toFixed(1)} ★</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActionUser(user)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[color:var(--muted)] ios-press shrink-0"
                    >
                      <svg className="w-4 h-4 text-[color:var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[color:var(--muted)] text-[color:var(--foreground)] font-semibold rounded-[12px] ios-press disabled:opacity-40 text-[14px]"
                >
                  Anterior
                </button>
                <span className="text-[14px] text-[color:var(--muted-foreground)]">{page} / {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-[color:var(--muted)] text-[color:var(--foreground)] font-semibold rounded-[12px] ios-press disabled:opacity-40 text-[14px]"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Action Sheet */}
      {actionUser && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setActionUser(null)}
        >
          <div
            className="bg-[color:var(--card)] rounded-t-[28px] w-full max-w-lg p-6 pb-safe-offset-6 animate-ios-fade-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[18px]">
                {actionUser.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-[17px] font-bold text-[color:var(--foreground)]">{actionUser.full_name || 'Sem nome'}</p>
                <p className="text-[13px] text-[color:var(--muted-foreground)]">{actionUser.email || actionUser.phone}</p>
              </div>
            </div>

            <div className="space-y-2">
              {!actionUser.is_banned ? (
                <button
                  type="button"
                  onClick={() => handleAction(actionUser.id, 'ban')}
                  disabled={!!processing}
                  className="w-full h-[52px] bg-red-500 text-white font-bold text-[16px] rounded-[16px] ios-press"
                >
                  Banir usuário
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction(actionUser.id, 'unban')}
                  disabled={!!processing}
                  className="w-full h-[52px] bg-emerald-500 text-white font-bold text-[16px] rounded-[16px] ios-press"
                >
                  Desbanir usuário
                </button>
              )}

              {!actionUser.is_admin ? (
                <button
                  type="button"
                  onClick={() => handleAction(actionUser.id, 'make_admin')}
                  disabled={!!processing}
                  className="w-full h-[52px] bg-purple-500 text-white font-bold text-[16px] rounded-[16px] ios-press"
                >
                  Promover a Admin
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction(actionUser.id, 'remove_admin')}
                  disabled={!!processing}
                  className="w-full h-[52px] bg-[color:var(--muted)] text-[color:var(--foreground)] font-bold text-[16px] rounded-[16px] ios-press"
                >
                  Remover Admin
                </button>
              )}

              <button
                type="button"
                onClick={() => setActionUser(null)}
                className="w-full h-[52px] bg-[color:var(--muted)] text-[color:var(--muted-foreground)] font-bold text-[16px] rounded-[16px] ios-press"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
