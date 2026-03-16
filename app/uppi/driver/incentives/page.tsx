'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Target, Gift, CheckCircle2, Clock, Zap } from 'lucide-react'
import { DriverBottomNavigation } from '@/components/driver-bottom-navigation'

interface Incentive {
  id: string
  title: string
  description: string | null
  type: string
  target_rides: number | null
  target_earnings: number | null
  target_period: string | null
  reward_amount: number
  reward_type: string
  status: string
  starts_at: string
  ends_at: string | null
}

interface Bonus {
  id: string
  amount: number
  type: string
  title: string
  description: string | null
  status: string
  paid_at: string | null
  created_at: string
}

export default function DriverIncentivesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [incentives, setIncentives] = useState<Incentive[]>([])
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [ridesThisWeek, setRidesThisWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'history'>('active')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/onboarding/splash'); return }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [incRes, bonusRes, ridesRes] = await Promise.all([
      supabase.from('driver_incentives').select('*').eq('driver_id', user.id).order('created_at', { ascending: false }),
      supabase.from('driver_bonuses').select('*').eq('driver_id', user.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('rides').select('id', { count: 'exact' }).eq('driver_id', user.id).eq('status', 'completed').gte('completed_at', weekAgo),
    ])

    if (incRes.data) setIncentives(incRes.data)
    if (bonusRes.data) setBonuses(bonusRes.data)
    setRidesThisWeek(ridesRes.count || 0)
    setLoading(false)
  }

  const activeIncentives = incentives.filter(i => i.status === 'active')
  const completedIncentives = incentives.filter(i => i.status === 'completed')
  const pendingBonuses = bonuses.filter(b => b.status === 'pending')
  const totalPending = pendingBonuses.reduce((s, b) => s + Number(b.amount), 0)

  const getProgress = (inc: Incentive) => {
    if (inc.target_rides) return Math.min(ridesThisWeek / inc.target_rides * 100, 100)
    return 0
  }

  if (loading) {
    return <div className="h-dvh bg-background flex items-center justify-center"><div className="w-8 h-8 border-[2.5px] border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-28 ios-scroll">
      <header className="bg-card/80 ios-blur border-b border-border/40 sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3 flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary ios-press">
            <ArrowLeft className="w-5 h-5 text-foreground" strokeWidth={2.5} />
          </button>
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">Incentivos</h1>
        </div>
      </header>

      <main className="px-5 py-5 max-w-lg mx-auto space-y-4">
        {/* Bônus pendentes */}
        {totalPending > 0 && (
          <div className="bg-emerald-500 rounded-[20px] p-5 shadow-lg shadow-emerald-500/20 animate-ios-fade-up">
            <div className="flex items-center gap-3 mb-1">
              <Gift className="w-5 h-5 text-white" strokeWidth={2} />
              <p className="text-[13px] font-bold text-white/80">Bônus a receber</p>
            </div>
            <p className="text-[32px] font-black text-white">R$ {totalPending.toFixed(2)}</p>
            <p className="text-[12px] text-white/70">{pendingBonuses.length} bônus pendente(s)</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <button type="button" onClick={() => setTab('active')} className={`flex-1 py-2.5 rounded-[14px] text-[13px] font-semibold ios-press ${tab === 'active' ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}>
            Ativos ({activeIncentives.length})
          </button>
          <button type="button" onClick={() => setTab('history')} className={`flex-1 py-2.5 rounded-[14px] text-[13px] font-semibold ios-press ${tab === 'history' ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'}`}>
            Histórico
          </button>
        </div>

        {tab === 'active' && (
          <div className="space-y-3 animate-ios-fade-up">
            {activeIncentives.length === 0 ? (
              <div className="bg-card rounded-[20px] p-8 text-center border border-border/40">
                <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[16px] font-bold text-foreground mb-1">Nenhum incentivo ativo</p>
                <p className="text-[13px] text-muted-foreground">Fique atento! Novos incentivos aparecem toda semana.</p>
              </div>
            ) : activeIncentives.map(inc => {
              const progress = getProgress(inc)
              return (
                <div key={inc.id} className="bg-card rounded-[20px] p-5 border border-border/40 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-[14px] flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-blue-500" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-foreground">{inc.title}</p>
                        {inc.ends_at && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Até {new Date(inc.ends_at).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="bg-emerald-500/15 rounded-xl px-3 py-1.5 text-right shrink-0">
                      <p className="text-[14px] font-black text-emerald-600 dark:text-emerald-400">R$ {Number(inc.reward_amount).toFixed(0)}</p>
                      <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">bônus</p>
                    </div>
                  </div>

                  {inc.description && <p className="text-[13px] text-muted-foreground mb-3">{inc.description}</p>}

                  {inc.target_rides && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[12px] text-muted-foreground">Progresso: {ridesThisWeek}/{inc.target_rides} corridas</p>
                        <p className="text-[12px] font-bold text-blue-500">{progress.toFixed(0)}%</p>
                      </div>
                      <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-3 animate-ios-fade-up">
            {bonuses.length === 0 ? (
              <div className="bg-card rounded-[20px] p-8 text-center border border-border/40">
                <Gift className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">Nenhum bônus recebido ainda</p>
              </div>
            ) : bonuses.map(b => (
              <div key={b.id} className="bg-card rounded-[18px] px-4 py-3.5 flex items-center gap-3 border border-border/40">
                <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 ${b.status === 'paid' ? 'bg-emerald-500/15' : 'bg-amber-500/15'}`}>
                  {b.status === 'paid' ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> : <Clock className="w-4.5 h-4.5 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground">{b.title}</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(b.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[15px] font-bold ${b.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    +R$ {Number(b.amount).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize">{b.status === 'paid' ? 'Pago' : 'Pendente'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <DriverBottomNavigation />
    </div>
  )
}
