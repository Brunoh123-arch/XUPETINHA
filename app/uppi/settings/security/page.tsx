'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Smartphone, Globe, Shield, LogOut, Trash2, MapPin, Lock } from 'lucide-react'
import { iosToast } from '@/lib/utils/ios-toast'

interface UserSession {
  id: string
  ip_address: string | null
  location: string | null
  is_active: boolean
  last_active_at: string
  created_at: string
  device_info: { platform?: string; os?: string; browser?: string } | null
}

interface LoginHistory {
  id: string
  ip_address: string | null
  device_info: { platform?: string } | null
  location: string | null
  login_at: string
  success: boolean
}

interface BlockedUser {
  id: string
  blocked_id: string
  reason: string | null
  created_at: string
  blocked_profile?: { full_name: string; avatar_url: string | null }
}

type Tab = 'sessions' | 'history' | 'blocked'

export default function SecurityPage() {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<Tab>('sessions')
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [history, setHistory] = useState<LoginHistory[]>([])
  const [blocked, setBlocked] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/onboarding/splash'); return }

    const [sessRes, histRes, blockRes] = await Promise.all([
      supabase.from('user_sessions').select('*').eq('user_id', user.id).eq('is_active', true).order('last_active_at', { ascending: false }),
      supabase.from('user_login_history').select('*').eq('user_id', user.id).order('login_at', { ascending: false }).limit(30),
      supabase.from('blocked_users').select('*, blocked_profile:profiles!blocked_users_blocked_id_fkey(full_name, avatar_url)').eq('blocker_id', user.id).order('created_at', { ascending: false }),
    ])

    if (sessRes.data) setSessions(sessRes.data)
    if (histRes.data) setHistory(histRes.data)
    if (blockRes.data) setBlocked(blockRes.data as BlockedUser[])
    setLoading(false)
  }

  const handleRevokeSession = async (sessionId: string) => {
    const { error } = await supabase.from('user_sessions').update({ is_active: false }).eq('id', sessionId)
    if (!error) {
      setSessions(s => s.filter(x => x.id !== sessionId))
      iosToast.success('Sessão encerrada')
    }
  }

  const handleUnblock = async (blockId: string) => {
    const { error } = await supabase.from('blocked_users').delete().eq('id', blockId)
    if (!error) {
      setBlocked(b => b.filter(x => x.id !== blockId))
      iosToast.success('Usuário desbloqueado')
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'sessions', label: 'Sessões' },
    { key: 'history', label: 'Acessos' },
    { key: 'blocked', label: 'Bloqueados' },
  ]

  return (
    <div className="h-dvh overflow-y-auto bg-[#F2F2F7] dark:bg-black pb-10 ios-scroll">
      <header className="bg-white/80 dark:bg-black/80 ios-blur-heavy border-b border-black/[0.08] dark:border-white/[0.08] sticky top-0 z-20">
        <div className="px-5 pt-safe-offset-4 pb-4 flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/60 ios-press">
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">Segurança</h1>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3 flex gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors ios-press ${
                tab === t.key ? 'bg-blue-500 text-white' : 'bg-secondary/60 text-muted-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-5 py-5 max-w-lg mx-auto space-y-3">
        {/* Atalhos rápidos */}
        <div className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[20px] overflow-hidden border border-black/[0.04] dark:border-white/[0.08] shadow-sm">
          <button type="button" onClick={() => router.push('/uppi/settings/2fa')} className="w-full px-5 py-4 flex items-center gap-4 border-b border-border/40 ios-press">
            <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[15px] font-semibold text-foreground">Verificação em 2 Etapas</p>
              <p className="text-[12px] text-muted-foreground">Proteja sua conta com 2FA</p>
            </div>
            <ArrowLeft className="w-4 h-4 text-muted-foreground/40 rotate-180" strokeWidth={2.5} />
          </button>
          <button type="button" onClick={() => router.push('/uppi/settings/password')} className="w-full px-5 py-4 flex items-center gap-4 ios-press">
            <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[15px] font-semibold text-foreground">Alterar Senha</p>
              <p className="text-[12px] text-muted-foreground">Atualize sua senha de acesso</p>
            </div>
            <ArrowLeft className="w-4 h-4 text-muted-foreground/40 rotate-180" strokeWidth={2.5} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-7 h-7 border-[2.5px] border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Sessões ativas */}
            {tab === 'sessions' && (
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground px-1 mb-3">
                  {sessions.length} sessão(ões) ativa(s)
                </p>
                {sessions.length === 0 ? (
                  <div className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[20px] p-8 text-center border border-black/[0.04] dark:border-white/[0.08]">
                    <Smartphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[14px] text-muted-foreground">Nenhuma sessão ativa</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((s, i) => (
                      <div key={s.id} className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[20px] p-4 border border-black/[0.04] dark:border-white/[0.08] shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-[14px] flex items-center justify-center shrink-0">
                            {s.device_info?.platform === 'iOS' || s.device_info?.platform === 'Android'
                              ? <Smartphone className="w-5 h-5 text-blue-500" />
                              : <Globe className="w-5 h-5 text-blue-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[14px] font-semibold text-foreground">
                                {s.device_info?.platform || 'Dispositivo'} {s.device_info?.os ? `· ${s.device_info.os}` : ''}
                              </p>
                              {i === 0 && (
                                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Atual</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {s.location && <><MapPin className="w-3 h-3 text-muted-foreground/60" /><span className="text-[12px] text-muted-foreground">{s.location}</span></>}
                              {s.ip_address && <span className="text-[11px] text-muted-foreground/60 font-mono">· {s.ip_address}</span>}
                            </div>
                            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Último acesso: {formatDate(s.last_active_at)}</p>
                          </div>
                          {i !== 0 && (
                            <button type="button" onClick={() => handleRevokeSession(s.id)} className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center ios-press shrink-0">
                              <LogOut className="w-4 h-4 text-red-500" strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Histórico de acessos */}
            {tab === 'history' && (
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground px-1 mb-3">Últimos 30 acessos</p>
                {history.length === 0 ? (
                  <div className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[20px] p-8 text-center border border-black/[0.04] dark:border-white/[0.08]">
                    <Globe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[14px] text-muted-foreground">Nenhum histórico disponível</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map(h => (
                      <div key={h.id} className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[18px] px-4 py-3 border border-black/[0.04] dark:border-white/[0.08] flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${h.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground">
                            {h.success ? 'Acesso bem-sucedido' : 'Tentativa falhou'}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {h.location || 'Local desconhecido'} {h.ip_address ? `· ${h.ip_address}` : ''}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 shrink-0">{formatDate(h.login_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Usuários bloqueados */}
            {tab === 'blocked' && (
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground px-1 mb-3">
                  {blocked.length} usuário(s) bloqueado(s)
                </p>
                {blocked.length === 0 ? (
                  <div className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[20px] p-8 text-center border border-black/[0.04] dark:border-white/[0.08]">
                    <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[14px] text-muted-foreground">Nenhum usuário bloqueado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {blocked.map(b => (
                      <div key={b.id} className="bg-white/90 dark:bg-[#1C1C1E]/90 rounded-[20px] p-4 border border-black/[0.04] dark:border-white/[0.08] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {b.blocked_profile?.avatar_url
                            ? <img src={b.blocked_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-[16px] font-bold text-foreground">{b.blocked_profile?.full_name?.[0] || '?'}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-foreground">{b.blocked_profile?.full_name || 'Usuário'}</p>
                          {b.reason && <p className="text-[12px] text-muted-foreground truncate">{b.reason}</p>}
                          <p className="text-[11px] text-muted-foreground/60">{formatDate(b.created_at)}</p>
                        </div>
                        <button type="button" onClick={() => handleUnblock(b.id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl text-[12px] font-semibold ios-press">
                          <Trash2 className="w-3.5 h-3.5" />
                          Desbloquear
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
