'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star, Coins, Trophy, TrendingUp, ChevronRight, Lock, CheckCircle, Zap } from 'lucide-react'

interface UserPoints {
  total_points: number
  level: number
}

interface CashbackEarned {
  id: string
  amount: number
  credited_at: string
  rule_id: string
  ride_id: string
}

interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon_url: string
  category: string
  requirement_type: string
  requirement_value: number
  points: number
  is_active: boolean
}

interface UserBadge {
  badge_id: string
  earned_at: string
}

const LEVEL_NAMES: Record<number, { name: string; color: string; min: number; max: number }> = {
  1: { name: 'Bronze', color: '#CD7F32', min: 0, max: 500 },
  2: { name: 'Prata', color: '#9CA3AF', min: 500, max: 1500 },
  3: { name: 'Ouro', color: '#F59E0B', min: 1500, max: 3000 },
  4: { name: 'Platina', color: '#6366F1', min: 3000, max: 6000 },
  5: { name: 'Diamante', color: '#06B6D4', min: 6000, max: 99999 },
}

const CATEGORY_LABELS: Record<string, string> = {
  rides: 'Corridas',
  social: 'Social',
  safety: 'Segurança',
  loyalty: 'Fidelidade',
  special: 'Especial',
}

export default function PointsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userPoints, setUserPoints] = useState<UserPoints | null>(null)
  const [cashbacks, setCashbacks] = useState<CashbackEarned[]>([])
  const [badges, setBadges] = useState<BadgeDefinition[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [totalCashback, setTotalCashback] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pontos' | 'cashback' | 'emblemas'>('pontos')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const [pointsRes, cashbackRes, badgesRes, userBadgesRes] = await Promise.all([
      supabase.from('user_points').select('*').eq('user_id', user.id).single(),
      supabase.from('cashback_earned').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('badge_definitions').select('*').eq('is_active', true).order('requirement_value'),
      supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
    ])

    if (pointsRes.data) setUserPoints(pointsRes.data)
    if (cashbackRes.data) {
      setCashbacks(cashbackRes.data)
      const total = cashbackRes.data.reduce((sum, c) => sum + Number(c.amount), 0)
      setTotalCashback(total)
    }
    if (badgesRes.data) setBadges(badgesRes.data)
    if (userBadgesRes.data) setUserBadges(userBadgesRes.data)
    setLoading(false)
  }

  const currentLevel = LEVEL_NAMES[userPoints?.level ?? 1]
  const nextLevel = LEVEL_NAMES[(userPoints?.level ?? 1) + 1]
  const pts = userPoints?.total_points ?? 0
  const progress = currentLevel && nextLevel
    ? Math.min(100, ((pts - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100)
    : 100

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Pontos & Recompensas</h1>
        </div>

        {/* Nivel atual */}
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: currentLevel?.color + '33', border: `2px solid ${currentLevel?.color}` }}>
                <Star size={18} style={{ color: currentLevel?.color }} />
              </div>
              <div>
                <p className="text-white/70 text-xs">Nível atual</p>
                <p className="font-bold text-lg">{currentLevel?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Seus pontos</p>
              <p className="font-bold text-2xl">{pts.toLocaleString('pt-BR')}</p>
            </div>
          </div>
          {nextLevel && (
            <>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: currentLevel?.color }} />
              </div>
              <p className="text-white/60 text-xs mt-1">{(currentLevel.max - pts).toLocaleString('pt-BR')} pts para {nextLevel.name}</p>
            </>
          )}
        </div>
      </div>

      {/* Cards resumo */}
      <div className="px-4 -mt-4 grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Coins size={16} className="text-amber-500" />
            <p className="text-xs text-muted-foreground">Cashback total</p>
          </div>
          <p className="text-xl font-bold text-foreground">
            {totalCashback.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={16} className="text-primary" />
            <p className="text-xs text-muted-foreground">Emblemas</p>
          </div>
          <p className="text-xl font-bold text-foreground">{earnedBadgeIds.size} / {badges.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-muted rounded-xl p-1 flex gap-1">
          {(['pontos', 'cashback', 'emblemas'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="px-4 space-y-3">

        {/* TAB: Pontos */}
        {activeTab === 'pontos' && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">Como ganhar pontos</h2>
            {[
              { icon: '🚗', title: 'Completar uma corrida', pts: '+50 pts', desc: 'A cada corrida concluída' },
              { icon: '⭐', title: 'Avaliar o motorista', pts: '+10 pts', desc: 'Após finalizar a corrida' },
              { icon: '👥', title: 'Indicar um amigo', pts: '+150 pts', desc: 'Quando o amigo fizer a 1ª corrida' },
              { icon: '🎂', title: 'Aniversário', pts: '+200 pts', desc: 'Presente anual especial' },
              { icon: '🔥', title: 'Sequência de corridas', pts: '+100 pts', desc: '5 corridas em 7 dias' },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-xl">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="text-primary font-bold text-sm">{item.pts}</span>
              </div>
            ))}

            <h2 className="font-semibold text-foreground pt-2">Níveis e benefícios</h2>
            {Object.values(LEVEL_NAMES).map((lv, i) => {
              const isCurrentLevel = (userPoints?.level ?? 1) === i + 1
              return (
                <div key={i} className={`bg-card rounded-2xl p-4 flex items-center gap-3 ${isCurrentLevel ? 'ring-2 ring-primary' : ''}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: lv.color + '22', border: `2px solid ${lv.color}` }}>
                    <Star size={16} style={{ color: lv.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{lv.name}</p>
                      {isCurrentLevel && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Atual</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{lv.min.toLocaleString()} – {lv.max === 99999 ? '∞' : lv.max.toLocaleString()} pts</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              )
            })}
          </div>
        )}

        {/* TAB: Cashback */}
        {activeTab === 'cashback' && (
          <div className="space-y-3">
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 flex items-center gap-3">
              <Coins size={24} className="text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total acumulado</p>
                <p className="font-bold text-xl text-amber-600">
                  {totalCashback.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

            {cashbacks.length === 0 ? (
              <div className="text-center py-12">
                <Zap size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum cashback ainda.</p>
                <p className="text-sm text-muted-foreground mt-1">Faça corridas para acumular!</p>
              </div>
            ) : (
              cashbacks.map(cb => (
                <div key={cb.id} className="bg-card rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/50 rounded-xl flex items-center justify-center">
                    <Coins size={18} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">Cashback de corrida</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cb.credited_at ?? cb.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-green-600 font-bold">
                    +{Number(cb.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: Emblemas */}
        {activeTab === 'emblemas' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{earnedBadgeIds.size} conquistados de {badges.length}</p>

            {Object.keys(CATEGORY_LABELS).map(cat => {
              const catBadges = badges.filter(b => b.category === cat)
              if (catBadges.length === 0) return null
              return (
                <div key={cat}>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">{CATEGORY_LABELS[cat]}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {catBadges.map(badge => {
                      const earned = earnedBadgeIds.has(badge.id)
                      const earnedDate = userBadges.find(ub => ub.badge_id === badge.id)?.earned_at
                      return (
                        <div key={badge.id} className={`bg-card rounded-2xl p-4 text-center ${!earned ? 'opacity-50' : ''}`}>
                          <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center text-2xl relative">
                            <Trophy size={24} className={earned ? 'text-primary' : 'text-muted-foreground'} />
                            {earned && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle size={12} className="text-white" />
                              </div>
                            )}
                            {!earned && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted-foreground/30 rounded-full flex items-center justify-center">
                                <Lock size={10} className="text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <p className="font-semibold text-xs text-foreground leading-tight">{badge.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>
                          {earned && earnedDate && (
                            <p className="text-xs text-primary mt-1">{new Date(earnedDate).toLocaleDateString('pt-BR')}</p>
                          )}
                          {!earned && badge.requirement_value && (
                            <p className="text-xs text-muted-foreground mt-1">{badge.requirement_value} {badge.requirement_type === 'ride_count' ? 'corridas' : 'pts'}</p>
                          )}
                          {badge.points > 0 && (
                            <span className="text-xs text-amber-600 font-medium">+{badge.points} pts</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
