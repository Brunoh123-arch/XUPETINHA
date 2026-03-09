'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { haptics } from '@/lib/utils/ios-haptics'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'

const POSITIVE_TAGS = ['Pontual', 'Dirigiu bem', 'Ótima conversa', 'Carro limpo', 'Amigável']
const NEGATIVE_TAGS = ['Atrasou', 'Dirigiu mal', 'Carro sujo', 'Rota errada', 'Mal-humorado']

interface RideInfo {
  id: string
  driver_id: string
  driver?: { full_name: string; avatar_url: string | null; rating: number }
  driver_vehicle?: string
  pickup_address: string
  destination_address: string
  completed_at: string
  final_price?: number
  passenger_price_offer?: number
}

export default function RateRidePage() {
  const router = useRouter()
  const params = useParams()
  const rideId = params.id as string
  const supabase = createClient()

  const [ride, setRide] = useState<RideInfo | null>(null)
  const [stars, setStars] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)

  useEffect(() => {
    loadRide()
  }, [rideId])

  const loadRide = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/onboarding/splash'); return }

      // Checar se já avaliou
      const ratedRes = await fetch(`/api/v1/rides/${rideId}/rate`)
      if (ratedRes.ok) {
        const ratedData = await ratedRes.json()
        if (ratedData.rated) { setAlreadyRated(true) }
      }

      const { data: rideData, error } = await supabase
        .from('rides')
        .select(`
          id, driver_id, pickup_address, destination_address, completed_at,
          final_price, passenger_price_offer,
          driver:profiles!rides_driver_id_fkey(full_name, avatar_url, rating),
          dp:driver_profiles!driver_profiles_id_fkey(vehicle_make, vehicle_model)
        `)
        .eq('id', rideId)
        .single()

      if (error || !rideData) {
        iosToast.error('Corrida não encontrada')
        router.back()
        return
      }

      const dp = (rideData as any).dp
      setRide({
        ...rideData,
        driver: Array.isArray((rideData as any).driver) ? (rideData as any).driver[0] : (rideData as any).driver,
        driver_vehicle: dp ? `${(Array.isArray(dp) ? dp[0] : dp)?.vehicle_make || ''} ${(Array.isArray(dp) ? dp[0] : dp)?.vehicle_model || ''}`.trim() : undefined,
      } as RideInfo)
    } catch (err) {
      console.error('[rate] load error', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    haptics.selection()
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (stars === 0) {
      iosToast.error('Selecione uma nota')
      haptics.notification('error')
      return
    }
    if (!ride?.driver_id) return

    setSubmitting(true)
    try {
      const tagComment = selectedTags.length > 0 ? selectedTags.join(', ') : undefined
      const fullComment = [tagComment, comment].filter(Boolean).join(' — ') || undefined

      const res = await fetch(`/api/v1/rides/${rideId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rated_id: ride.driver_id,
          stars,
          comment: fullComment,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        iosToast.error(data.error || 'Erro ao avaliar')
        haptics.notification('error')
        return
      }

      haptics.notification('success')
      iosToast.success('Avaliação enviada!')
      router.replace('/uppi/home')
    } catch (err) {
      console.error('[rate] submit error', err)
      iosToast.error('Erro ao enviar avaliação')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (alreadyRated) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <ThumbsUp className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Você já avaliou esta corrida</h2>
        <p className="text-muted-foreground">Obrigado pelo seu feedback!</p>
        <button
          type="button"
          onClick={() => router.replace('/uppi/home')}
          className="mt-4 px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold ios-press"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  const displayStars = hoveredStar || stars

  return (
    <div className="h-dvh overflow-y-auto bg-background ios-scroll">
      <div className="max-w-md mx-auto px-5 pt-safe-offset-8 pb-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-[28px] font-bold text-foreground tracking-tight">Como foi a corrida?</h1>
          <p className="text-muted-foreground mt-1">Sua avaliação ajuda a melhorar o serviço</p>
        </motion.div>

        {/* Driver card */}
        {ride && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-[24px] p-5 border border-border/50 mb-6 flex items-center gap-4"
          >
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={ride.driver?.avatar_url || undefined} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {ride.driver?.full_name?.[0]?.toUpperCase() || 'M'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[17px] text-foreground">{ride.driver?.full_name || 'Motorista'}</p>
              {ride.driver_vehicle && (
                <p className="text-sm text-muted-foreground">{ride.driver_vehicle}</p>
              )}
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{(ride.driver?.rating || 5).toFixed(1)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-bold text-foreground">
                R$ {(ride.final_price || ride.passenger_price_offer || 0).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">valor total</p>
            </div>
          </motion.div>
        )}

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center gap-3 mb-2"
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => { haptics.impactMedium(); setStars(s) }}
              onMouseEnter={() => setHoveredStar(s)}
              onMouseLeave={() => setHoveredStar(0)}
              className="ios-press"
            >
              <Star
                className={`w-12 h-12 transition-all duration-150 ${
                  s <= displayStars
                    ? 'fill-yellow-400 text-yellow-400 scale-110'
                    : 'text-muted-foreground/30'
                }`}
              />
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {stars > 0 && (
            <motion.p
              key={stars}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-[17px] font-semibold text-foreground mb-6"
            >
              {stars === 5 ? 'Excelente!' : stars === 4 ? 'Muito bom!' : stars === 3 ? 'Ok' : stars === 2 ? 'Ruim' : 'Muito ruim'}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Tags */}
        {stars > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              O que você achou?
            </p>
            <div className="flex flex-wrap gap-2">
              {(stars >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-[14px] font-medium ios-press transition-all ${
                    selectedTags.includes(tag)
                      ? stars >= 4
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comment */}
        {stars > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-muted-foreground/50" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Adicione um comentário (opcional)"
                rows={3}
                maxLength={300}
                className="w-full pl-11 pr-4 py-4 bg-secondary/50 rounded-[16px] text-[15px] text-foreground placeholder:text-muted-foreground/50 resize-none border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="absolute right-3 bottom-3 text-[11px] text-muted-foreground/50">
                {comment.length}/300
              </span>
            </div>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={stars === 0 || submitting}
          whileTap={{ scale: 0.97 }}
          className={`w-full h-[56px] rounded-[18px] font-bold text-[17px] ios-press transition-all ${
            stars === 0
              ? 'bg-secondary text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Enviando...
            </span>
          ) : 'Enviar avaliação'}
        </motion.button>

        <button
          type="button"
          onClick={() => router.replace('/uppi/home')}
          className="w-full mt-3 py-3 text-[15px] text-muted-foreground font-medium ios-press"
        >
          Pular
        </button>
      </div>
    </div>
  )
}
