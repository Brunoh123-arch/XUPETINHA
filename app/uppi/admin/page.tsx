'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AdminStats {
  summary: {
    total_revenue?: number
    platform_fee?: number
    total_rides_today?: number
    pending_drivers?: number
  }
  pending_withdrawals_count: number
  pending_withdrawals_amount: number
  total_users: number
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/onboarding/splash'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) { router.push('/uppi/home'); return }
      setIsAdmin(true)

      try {
        const res = await fetch('/api/v1/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  if (!isAdmin) return null

  const menuItems = [
    {
      title: 'Saques Pendentes',
      description: stats ? `${stats.pending_withdrawals_count} solicitações` : 'Gerenciar saques',
      badge: stats?.pending_withdrawals_count || 0,
      badgeColor: 'bg-red-500',
      icon: (
        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/uppi/admin/withdrawals',
      color: 'bg-emerald-50',
    },
    {
      title: 'Usuários',
      description: stats ? `${stats.total_users.toLocaleString('pt-BR')} ativos` : 'Gerenciar usuários',
      badge: 0,
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      href: '/uppi/admin/users',
      color: 'bg-blue-50',
    },
    {
      title: 'Motoristas',
      description: 'Verificar documentos e perfis',
      badge: stats?.summary?.pending_drivers || 0,
      badgeColor: 'bg-amber-500',
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/uppi/admin/drivers',
      color: 'bg-amber-50',
    },
    {
      title: 'Corridas',
      description: 'Monitorar corridas em tempo real',
      badge: 0,
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      href: '/uppi/admin/rides',
      color: 'bg-purple-50',
    },
    {
      title: 'Analytics',
      description: 'Relatórios e estatísticas',
      badge: 0,
      icon: (
        <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      href: '/uppi/analytics',
      color: 'bg-rose-50',
    },
  ]

  return (
    <div className="h-dvh overflow-y-auto bg-[color:var(--background)] ios-scroll">
      <header className="bg-[color:var(--card)]/90 ios-blur border-b border-[color:var(--border)] sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[color:var(--muted)] ios-press"
          >
            <svg className="w-5 h-5 text-[color:var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-[22px] font-bold text-[color:var(--foreground)]">Painel Admin</h1>
            <p className="text-[13px] text-[color:var(--muted-foreground)]">Uppi Administrator</p>
          </div>
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto space-y-5">
        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[color:var(--card)] rounded-[18px] p-4 border border-[color:var(--border)] animate-pulse h-20" />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[color:var(--card)] rounded-[18px] p-4 border border-[color:var(--border)]">
              <p className="text-[12px] text-[color:var(--muted-foreground)] font-semibold">Faturamento</p>
              <p className="text-[22px] font-black text-[color:var(--foreground)] mt-1">
                R$ {Number(stats.summary?.total_revenue || 0).toFixed(0)}
              </p>
              <p className="text-[11px] text-emerald-500 font-medium">+hoje</p>
            </div>
            <div className="bg-[color:var(--card)] rounded-[18px] p-4 border border-[color:var(--border)]">
              <p className="text-[12px] text-[color:var(--muted-foreground)] font-semibold">Saques Pendentes</p>
              <p className="text-[22px] font-black text-amber-500 mt-1">
                {stats.pending_withdrawals_count}
              </p>
              <p className="text-[11px] text-[color:var(--muted-foreground)] font-medium">
                R$ {stats.pending_withdrawals_amount.toFixed(2)}
              </p>
            </div>
            <div className="bg-[color:var(--card)] rounded-[18px] p-4 border border-[color:var(--border)]">
              <p className="text-[12px] text-[color:var(--muted-foreground)] font-semibold">Usuários Ativos</p>
              <p className="text-[22px] font-black text-[color:var(--foreground)] mt-1">
                {stats.total_users.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-[color:var(--card)] rounded-[18px] p-4 border border-[color:var(--border)]">
              <p className="text-[12px] text-[color:var(--muted-foreground)] font-semibold">Taxa Plataforma</p>
              <p className="text-[22px] font-black text-blue-500 mt-1">
                R$ {Number(stats.summary?.platform_fee || 0).toFixed(0)}
              </p>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          <p className="text-[13px] font-bold text-[color:var(--muted-foreground)] uppercase tracking-wide">Gerenciamento</p>
          {menuItems.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => router.push(item.href)}
              className="w-full bg-[color:var(--card)] rounded-[18px] p-4 border border-[color:var(--border)] ios-press flex items-center gap-4 text-left animate-ios-fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`w-12 h-12 ${item.color} rounded-[14px] flex items-center justify-center shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-bold text-[color:var(--foreground)]">{item.title}</p>
                <p className="text-[13px] text-[color:var(--muted-foreground)] truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.badge > 0 && (
                  <span className={`${item.badgeColor || 'bg-blue-500'} text-white text-[12px] font-bold w-6 h-6 rounded-full flex items-center justify-center`}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
                <svg className="w-4 h-4 text-[color:var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
