'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { haptics } from '@/lib/utils/ios-haptics'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BottomNavigation } from '@/components/bottom-navigation'
import { Share2, Copy, Users, Gift, CheckCircle2, Clock, ChevronRight } from 'lucide-react'

interface ReferralStats {
  referral_code: string
  total_referrals: number
  completed_referrals: number
  pending_referrals: number
  total_earned: number
  referrals: Array<{
    id: string
    status: 'pending' | 'completed'
    created_at: string
    referred_name: string
    referred_avatar: string | null
  }>
}

export default function ReferralsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [rewardAmount, setRewardAmount] = useState(10)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, configRes] = await Promise.all([
        fetch('/api/v1/referrals'),
        supabase.from('app_config').select('value').eq('key', 'referral_bonus_amount').single(),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      if (!configRes.error && configRes.data) {
        const v = configRes.data.value as any
        if (v?.value) setRewardAmount(Number(v.value))
      }
    } catch (err) {
      console.error('[referrals]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!stats?.referral_code) return
    navigator.clipboard.writeText(stats.referral_code)
    haptics.notification('success')
    iosToast.success('Código copiado!')
  }

  const handleShare = async () => {
    if (!stats?.referral_code) return
    haptics.impactMedium()
    try {
      await navigator.share({
        title: 'Uppi — Compartilhe e ganhe',
        text: `Use meu código ${stats.referral_code} para se cadastrar no Uppi e ganhar desconto na primeira corrida!`,
        url: `https://uppi.app/invite/${stats.referral_code}`,
      })
    } catch {
      handleCopy()
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-y-auto bg-background pb-28 ios-scroll">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 ios-blur border-b border-border/50">
        <div className="flex items-center gap-4 px-5 pt-safe-offset-4 pb-4">
          <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/60 ios-press">
            <svg className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-[22px] font-bold text-foreground">Indique e Ganhe</h1>
            <p className="text-sm text-muted-foreground">Ganhe R$ {rewardAmount} por indicação</p>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-5">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 text-primary-foreground"
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -right-4 top-12 w-24 h-24 bg-white/5 rounded-full" />
          <Gift className="w-10 h-10 mb-3 opacity-90" />
          <h2 className="text-[26px] font-bold leading-tight">
            Indique amigos e ganhe<br />
            <span className="text-[32px]">R$ {rewardAmount},00</span>
          </h2>
          <p className="text-sm opacity-80 mt-2">
            Para cada amigo que completar a primeira corrida, você ganha R$ {rewardAmount} na carteira.
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Indicados', value: stats?.total_referrals ?? 0, icon: Users, color: 'text-blue-500' },
            { label: 'Confirmados', value: stats?.completed_referrals ?? 0, icon: CheckCircle2, color: 'text-green-500' },
            { label: 'Ganhos', value: `R$ ${(stats?.total_earned ?? 0).toFixed(0)}`, icon: Gift, color: 'text-yellow-500' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-card rounded-[20px] p-4 border border-border/50 text-center"
            >
              <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
              <p className="text-[20px] font-bold text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Referral code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-[24px] p-5 border border-border/50"
        >
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Seu código de convite</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-secondary/60 rounded-[14px] px-5 py-4">
              <p className="text-[26px] font-bold tracking-widest text-foreground font-mono">
                {stats?.referral_code || '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="w-14 h-14 bg-secondary/60 rounded-[14px] flex items-center justify-center ios-press"
            >
              <Copy className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="mt-4 w-full h-[52px] bg-primary text-primary-foreground rounded-[16px] flex items-center justify-center gap-2 font-semibold text-[16px] ios-press shadow-md shadow-primary/30"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar convite
          </button>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-[24px] p-5 border border-border/50"
        >
          <p className="text-[15px] font-bold text-foreground mb-4">Como funciona</p>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Compartilhe seu código único' },
              { step: '2', text: 'Amigo se cadastra com seu código' },
              { step: '3', text: 'Amigo completa a primeira corrida' },
              { step: '4', text: `Você recebe R$ ${rewardAmount} na carteira` },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <p className="text-[15px] text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Referrals list */}
        {(stats?.referrals?.length ?? 0) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-[24px] overflow-hidden border border-border/50"
          >
            <div className="px-5 py-4 border-b border-border/50">
              <p className="font-bold text-foreground">Seus indicados</p>
            </div>
            {stats!.referrals.map((ref, i) => (
              <div
                key={ref.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < stats!.referrals.length - 1 ? 'border-b border-border/30' : ''
                }`}
              >
                <Avatar className="w-11 h-11">
                  <AvatarImage src={ref.referred_avatar || undefined} />
                  <AvatarFallback>{ref.referred_name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] text-foreground truncate">{ref.referred_name}</p>
                  <p className="text-[12px] text-muted-foreground">{formatDate(ref.created_at)}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold ${
                  ref.status === 'completed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {ref.status === 'completed'
                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                    : <Clock className="w-3.5 h-3.5" />}
                  {ref.status === 'completed' ? `+R$ ${rewardAmount}` : 'Pendente'}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
