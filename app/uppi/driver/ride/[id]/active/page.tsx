'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Ride, Profile, DriverProfile } from '@/lib/types/database'
import { trackingService } from '@/lib/services/tracking-service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { iosToast } from '@/lib/utils/ios-toast'

type RideStatus = Ride['status']

const STATUS_STEPS: RideStatus[] = ['accepted', 'driver_arrived', 'in_progress', 'completed']

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; action: string; nextStatus: RideStatus | null }> = {
  accepted:       { label: 'A caminho do passageiro', color: 'text-blue-400',    bg: 'bg-blue-500',    action: 'Cheguei no local',       nextStatus: 'driver_arrived' },
  driver_arrived: { label: 'Chegou no local',         color: 'text-amber-400',   bg: 'bg-amber-500',   action: 'Iniciar corrida',         nextStatus: 'in_progress' },
  in_progress:    { label: 'Corrida em andamento',    color: 'text-emerald-400', bg: 'bg-emerald-500', action: 'Finalizar corrida',       nextStatus: 'completed' },
  completed:      { label: 'Corrida finalizada',      color: 'text-emerald-400', bg: 'bg-emerald-600', action: '',                        nextStatus: null },
  cancelled:      { label: 'Corrida cancelada',       color: 'text-red-400',     bg: 'bg-red-500',     action: '',                        nextStatus: null },
}

interface RideWithPassenger extends Ride {
  passenger?: Pick<Profile, 'full_name' | 'avatar_url' | 'phone'>
}

export default function DriverActiveRidePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const rideId = params.id as string

  const [ride, setRide] = useState<RideWithPassenger | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadRide()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      trackingService.stopTracking()
    }
  }, [rideId])

  // Timer for in_progress
  useEffect(() => {
    if (ride?.status === 'in_progress' && ride?.started_at) {
      const start = new Date(ride.started_at).getTime()
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [ride?.status, ride?.started_at])

  // GPS location broadcasting delegado ao trackingService (evita watch duplicado)
  useEffect(() => {
    if (!userId || !ride) return
    if (!['accepted', 'driver_arrived', 'in_progress'].includes(ride.status)) return

    // trackingService já gerencia o watchPosition internamente
    trackingService.startDriverTracking(rideId, userId)

    return () => {
      // Só para o tracking quando a corrida terminar, não a cada re-render
    }
  }, [userId, rideId, ride?.status])

  // Realtime subscription
  useEffect(() => {
    if (!rideId) return
    const channel = supabase
      .channel(`driver-active-${rideId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${rideId}`,
      }, (payload) => {
        const updated = payload.new as RideWithPassenger
        setRide(prev => prev ? { ...prev, ...updated } : updated)
        if (updated.status === 'completed') {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimeout(() => router.replace(`/uppi/driver/ride/${rideId}/summary`), 1200)
        }
        if (updated.status === 'cancelled') {
          setTimeout(() => router.replace('/uppi/driver'), 1200)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [rideId])

  const loadRide = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/onboarding/splash'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('rides')
        .select('*, passenger:profiles!passenger_id(full_name, avatar_url, phone)')
        .eq('id', rideId)
        .single()

      if (!data) { router.back(); return }
      if (data.driver_id !== user.id) { router.back(); return }

      setRide(data)

      if (data.status === 'completed') {
        router.replace(`/uppi/driver/ride/${rideId}/summary`)
      } else if (data.status === 'cancelled' || data.status === 'failed') {
        router.replace('/uppi/driver')
      }
    } finally {
      setLoading(false)
    }
  }

  const advanceStatus = async () => {
    if (!ride || updating) return
    const cfg = STATUS_CFG[ride.status]
    if (!cfg?.nextStatus) return

    setUpdating(true)
    try {
      // Usa a API de status para garantir notificações, email de relatório e timestamps corretos
      const res = await fetch(`/api/v1/rides/${rideId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: cfg.nextStatus }),
      })

      if (res.ok) {
        const updates: Partial<Ride> = { status: cfg.nextStatus }
        if (cfg.nextStatus === 'in_progress') updates.started_at = new Date().toISOString()
        if (cfg.nextStatus === 'completed') {
          updates.completed_at = new Date().toISOString()
          trackingService.stopTracking()
          if (timerRef.current) clearInterval(timerRef.current)
          setTimeout(() => router.replace(`/uppi/driver/ride/${rideId}/summary`), 800)
        }
        setRide(prev => prev ? { ...prev, ...updates } : null)
      } else {
        const err = await res.json().catch(() => ({}))
        iosToast.error(err.error || 'Erro ao atualizar status da corrida')
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!ride || cancelling) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/v1/rides/${rideId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancellation_reason: 'Cancelado pelo motorista' }),
      })
      if (!res.ok) {
        // fallback direto
        await supabase.from('rides').update({
          status: 'cancelled',
          cancellation_reason: 'Cancelado pelo motorista',
          cancelled_at: new Date().toISOString(),
        }).eq('id', rideId)
      }
      trackingService.stopTracking()
      router.replace('/uppi/driver')
    } finally {
      setCancelling(false)
      setShowCancel(false)
    }
  }

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const paymentLabel = (method?: string) => {
    const m: Record<string, string> = {
      cash: 'Dinheiro', pix: 'PIX', credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito', wallet: 'Carteira',
    }
    return m[method || ''] || method || '—'
  }

  // Navigation helpers
  const getNavTarget = () => {
    // Se ainda está indo buscar o passageiro, destino é o pickup
    const isGoingToPickup = ride?.status === 'accepted'
    const lat = isGoingToPickup ? ride?.pickup_lat : ride?.dropoff_lat
    const lng = isGoingToPickup ? ride?.pickup_lng : ride?.dropoff_lng
    const address = isGoingToPickup ? ride?.pickup_address : ride?.dropoff_address
    return { lat, lng, address, isGoingToPickup }
  }

  const openGoogleMaps = () => {
    if (!ride) return
    const { lat, lng, address } = getNavTarget()
    const dest = lat && lng ? `${lat},${lng}` : encodeURIComponent(address || '')
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`, '_blank')
  }

  const openWaze = () => {
    if (!ride) return
    const { lat, lng, address } = getNavTarget()
    const url = lat && lng
      ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(address || '')}&navigate=yes`
    window.open(url, '_blank')
  }

  const openAppleMaps = () => {
    if (!ride) return
    const { lat, lng, address } = getNavTarget()
    const dest = lat && lng ? `${lat},${lng}` : encodeURIComponent(address || '')
    window.open(`https://maps.apple.com/?daddr=${dest}&dirflg=d`, '_blank')
  }

  const stepIndex = STATUS_STEPS.indexOf(ride?.status as RideStatus)

  if (loading) {
    return (
      <div className="h-dvh bg-[color:var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-[2.5px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!ride) return null

  // Tela de corrida finalizada — exibida antes do redirect para summary
  if (ride.status === 'completed') {
    const earnings = ride.final_price ? ride.final_price * 0.85 : 0
    return (
      <div className="h-dvh bg-[color:var(--background)] flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-[26px] font-bold text-[color:var(--foreground)]">Corrida finalizada!</h1>
          <p className="text-[15px] text-[color:var(--muted-foreground)]">Voce ganhou</p>
          {earnings > 0 && (
            <p className="text-[36px] font-extrabold text-emerald-500">R$ {earnings.toFixed(2)}</p>
          )}
        </div>
        <div className="w-8 h-8 border-[2.5px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-[color:var(--muted-foreground)]">Redirecionando para o resumo...</p>
      </div>
    )
  }

  const cfg = STATUS_CFG[ride.status] || STATUS_CFG.accepted
  const isActive = ['accepted', 'driver_arrived', 'in_progress'].includes(ride.status)
  const isInProgress = ride.status === 'in_progress'

  return (
    <div className="h-dvh bg-[color:var(--background)] flex flex-col overflow-hidden relative">

      {/* Full-screen status bar at top */}
      <div className={cn('absolute top-0 left-0 right-0 z-30 h-1.5', cfg.bg)} />

      {/* Map placeholder (visual background) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Animated route visualization */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
        </div>
      </div>

      {/* Header floating */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe-offset-4 px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center ios-press"
          aria-label="Voltar"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={cn('px-4 py-2 rounded-full flex items-center gap-2 shadow-lg', cfg.bg)}>
          {isActive && <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" />}
          <span className="text-[13px] font-bold text-white">{cfg.label}</span>
        </div>

        <button
          type="button"
          onClick={() => router.push(`/uppi/ride/${rideId}/chat`)}
          className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center ios-press"
          aria-label="Chat"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Progress Steps */}
      <div className="absolute top-[72px] left-0 right-0 z-20 px-6">
        <div className="flex items-center gap-0">
          {STATUS_STEPS.filter(s => s !== 'completed').map((step, i) => {
            const stepCfg = STATUS_CFG[step]
            const isStepDone = stepIndex > i
            const isStepActive = stepIndex === i
            return (
              <div key={step} className="flex items-center flex-1">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all',
                  isStepDone ? 'bg-emerald-500 border-emerald-500 text-white' :
                  isStepActive ? `${cfg.bg} border-current text-white` :
                  'bg-black/40 border-white/20 text-white/40'
                )}>
                  {isStepDone ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div className={cn('flex-1 h-0.5 mx-1 transition-all', isStepDone ? 'bg-emerald-500' : 'bg-white/20')} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-[color:var(--card)]/[0.97] backdrop-blur-xl rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.2)]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-[5px] bg-[color:var(--muted-foreground)]/30 rounded-full" />
        </div>

        <div className="px-5 pb-safe-offset-6 space-y-4 max-h-[68dvh] overflow-y-auto ios-scroll">

          {/* Timer (during in_progress) */}
          {isInProgress && (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Tempo de viagem</p>
                <p className="text-[28px] font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">{formatElapsed(elapsed)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Passenger Info */}
          <div className="flex items-center gap-4 py-3 border-b border-[color:var(--border)]">
            <Avatar className="w-14 h-14 border-2 border-[color:var(--border)]">
              <AvatarImage src={ride.passenger?.avatar_url || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xl font-bold">
                {ride.passenger?.full_name?.[0] || 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-[color:var(--foreground)] truncate">
                {ride.passenger?.full_name || 'Passageiro'}
              </p>
              <p className="text-[13px] text-[color:var(--muted-foreground)]">Passageiro</p>
            </div>
            <div className="flex gap-2">
              {ride.passenger?.phone && (
                <a
                  href={`tel:${ride.passenger.phone}`}
                  className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center shadow-md ios-press"
                  aria-label="Ligar para passageiro"
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </a>
              )}
              <button
                type="button"
                onClick={() => router.push(`/uppi/ride/${rideId}/chat`)}
                className="w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center shadow-md ios-press"
                aria-label="Chat"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Route */}
          <div className="flex gap-3 py-2 border-b border-[color:var(--border)]">
            <div className="flex flex-col items-center pt-1 gap-1">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" />
              <div className="w-px flex-1 bg-[color:var(--border)] min-h-[20px]" />
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-[color:var(--muted-foreground)] uppercase tracking-wider">Buscar passageiro</p>
                <p className="text-[14px] text-[color:var(--foreground)] font-medium leading-tight">{ride.pickup_address}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[color:var(--muted-foreground)] uppercase tracking-wider">Destino</p>
                <p className="text-[14px] text-[color:var(--foreground)] font-medium leading-tight">{ride.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Navigation SDK */}
          <div className="py-2 border-b border-[color:var(--border)]">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold text-[color:var(--muted-foreground)] uppercase tracking-wider">
                Navegar para {getNavTarget().isGoingToPickup ? 'o passageiro' : 'o destino'}
              </p>
              <span className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                getNavTarget().isGoingToPickup
                  ? 'bg-blue-500/15 text-blue-500'
                  : 'bg-orange-500/15 text-orange-500'
              )}>
                {getNavTarget().isGoingToPickup ? 'Pickup' : 'Destino'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Google Maps */}
              <button
                type="button"
                onClick={openGoogleMaps}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-[color:var(--muted)]/40 border border-[color:var(--border)] ios-press active:scale-95 transition-transform"
                aria-label="Abrir no Google Maps"
              >
                <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4C15.163 4 8 11.163 8 20c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="#EA4335"/>
                  <path d="M24 4C15.163 4 8 11.163 8 20c0 4.285 1.699 8.174 4.458 11.072L28.03 5.09A15.934 15.934 0 0024 4z" fill="#FBBC04"/>
                  <path d="M24 4c3.858 0 7.39 1.365 10.131 3.622L19.97 27.697A11.924 11.924 0 0124 28c2.18 0 4.22-.585 5.972-1.607L12.458 31.072C15.275 33.998 19.42 36 24 36c0 0 16-14 16-26C40 11.163 32.837 4 24 4z" fill="#34A853"/>
                  <path d="M12.458 31.072C9.699 28.174 8 24.285 8 20c0-4.97 2.267-9.408 5.83-12.378L29.972 26.393A11.979 11.979 0 0124 28a11.924 11.924 0 01-4.03-.303l-7.512 3.375z" fill="#4285F4"/>
                  <circle cx="24" cy="20" r="6" fill="white"/>
                </svg>
                <span className="text-[11px] font-semibold text-[color:var(--foreground)]">Google Maps</span>
              </button>

              {/* Waze */}
              <button
                type="button"
                onClick={openWaze}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-[color:var(--muted)]/40 border border-[color:var(--border)] ios-press active:scale-95 transition-transform"
                aria-label="Abrir no Waze"
              >
                <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="22" r="18" fill="#33CCFF"/>
                  <ellipse cx="24" cy="32" rx="10" ry="6" fill="#00B4D8"/>
                  <circle cx="19" cy="20" r="2.5" fill="#1A1A2E"/>
                  <circle cx="29" cy="20" r="2.5" fill="#1A1A2E"/>
                  <path d="M19 26c1.2 2 8.8 2 10 0" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M30 10 Q34 6 38 10" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <path d="M32 8 Q35 4 38 7" stroke="#1A1A2E" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                </svg>
                <span className="text-[11px] font-semibold text-[color:var(--foreground)]">Waze</span>
              </button>

              {/* Apple Maps */}
              <button
                type="button"
                onClick={openAppleMaps}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl bg-[color:var(--muted)]/40 border border-[color:var(--border)] ios-press active:scale-95 transition-transform"
                aria-label="Abrir no Apple Maps"
              >
                <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="10" fill="url(#applemap_grad)"/>
                  <defs>
                    <linearGradient id="applemap_grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3EC6F5"/>
                      <stop offset="1" stopColor="#1A8FE3"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 36l8-12 5 4 7-14 4 22H12z" fill="white" fillOpacity="0.9"/>
                  <path d="M12 36l8-12 5 4 7-14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="34" cy="16" r="3" fill="#FF3B30"/>
                  <circle cx="34" cy="16" r="1.5" fill="white"/>
                </svg>
                <span className="text-[11px] font-semibold text-[color:var(--foreground)]">Apple Maps</span>
              </button>
            </div>
          </div>

          {/* Fare & Payment */}
          <div className="grid grid-cols-3 gap-3 py-2 border-b border-[color:var(--border)]">
            <div className="text-center">
              <p className="text-[10px] text-[color:var(--muted-foreground)] uppercase tracking-wide mb-0.5">Valor</p>
              <p className="text-[16px] font-bold text-[color:var(--foreground)]">
                {ride.final_price
                  ? `R$ ${ride.final_price.toFixed(2)}`
                  : ride.passenger_price_offer
                  ? `R$ ${ride.passenger_price_offer.toFixed(2)}`
                  : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[color:var(--muted-foreground)] uppercase tracking-wide mb-0.5">Seu ganho</p>
              <p className="text-[16px] font-bold text-emerald-500">
                {ride.final_price
                  ? `R$ ${(ride.final_price * 0.85).toFixed(2)}`
                  : ride.passenger_price_offer
                  ? `R$ ${(ride.passenger_price_offer * 0.85).toFixed(2)}`
                  : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[color:var(--muted-foreground)] uppercase tracking-wide mb-0.5">Pagamento</p>
              <p className="text-[13px] font-semibold text-[color:var(--foreground)]">{paymentLabel(ride.payment_method)}</p>
            </div>
          </div>

          {/* Main Action Button */}
          {cfg.nextStatus && (
            <button
              type="button"
              onClick={advanceStatus}
              disabled={updating}
              className={cn(
                'w-full py-4 rounded-2xl text-[17px] font-bold text-white transition-all ios-press shadow-lg disabled:opacity-60',
                cfg.bg
              )}
            >
              {updating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </span>
              ) : cfg.action}
            </button>
          )}

          {/* Secondary Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/uppi/emergency`)}
              className="flex-1 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-[14px] font-semibold text-red-500 flex items-center justify-center gap-2 ios-press"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Emergência
            </button>

            {['accepted', 'driver_arrived'].includes(ride.status) && (
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                className="flex-1 py-3 rounded-2xl bg-[color:var(--muted)]/50 border border-[color:var(--border)] text-[14px] font-semibold text-[color:var(--muted-foreground)] ios-press"
              >
                Cancelar corrida
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancel && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
          <div className="w-full bg-[color:var(--card)] rounded-t-[28px] p-6 pb-safe-offset-6 animate-ios-fade-up">
            <h3 className="text-[20px] font-bold text-[color:var(--foreground)] mb-2">Cancelar corrida?</h3>
            <p className="text-[14px] text-[color:var(--muted-foreground)] mb-6">
              Ao cancelar, o passageiro será notificado e você retornará à fila de disponibilidade.
              Cancelamentos frequentes podem afetar sua avaliação.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                className="flex-1 py-4 rounded-2xl bg-[color:var(--muted)]/50 border border-[color:var(--border)] text-[16px] font-semibold text-[color:var(--foreground)] ios-press"
              >
                Manter corrida
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-[16px] font-bold text-white ios-press disabled:opacity-60"
              >
                {cancelling ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cancelando...
                  </span>
                ) : 'Sim, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
