'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'

interface DriverProfile {
  id: string
  full_name: string
  avatar_url: string | null
  rating: number
  total_rides: number
  trust_score: number
  trust_level: string
}

interface DriverStats {
  vehicle_brand: string
  vehicle_model: string
  vehicle_plate: string
  vehicle_color: string
  vehicle_type: string
  is_online: boolean
  is_verified: boolean
  total_earnings: number
  acceptance_rate: number
  cancellation_count: number
  punctuality_rate: number
  current_lat: number | null
  current_lng: number | null
}

interface IncomingRide {
  id: string
  pickup_address: string
  dropoff_address: string
  pickup_lat: number | null
  pickup_lng: number | null
  distance_km: number
  estimated_duration_minutes: number
  passenger_price_offer: number
  vehicle_type: string
  payment_method: string
  notes: string | null
  passenger: {
    id: string
    full_name: string
    avatar_url: string | null
    rating: number
    total_rides: number
  } | null
}

interface ActiveRide {
  id: string
  status: 'accepted' | 'in_progress'
  pickup_address: string
  dropoff_address: string
  final_price: number
  passenger: {
    id: string
    full_name: string
    avatar_url: string | null
    phone: string | null
  } | null
}

interface DayEarnings {
  total: number
  rides: number
  hours: number
}

function formatBRL(v: number) { return `R$ ${v.toFixed(2).replace('.', ',')}` }
function formatKm(v: number) { return `${v.toFixed(1)} km` }

function VehicleIcon({ type, className }: { type: string; className?: string }) {
  if (type === 'moto') return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="5" cy="17" r="3" /><circle cx="19" cy="17" r="3" />
      <path d="M5 14l4-7h6l4 7" /><path d="M9 7l1-3h4l1 3" />
    </svg>
  )
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M8 17a2 2 0 11-4 0 2 2 0 014 0zM16 17a2 2 0 104 0 2 2 0 00-4 0zM4 11l2-5h12l2 5M4 11h16M4 11v6h16v-6" />
    </svg>
  )
}

function PaymentBadge({ method }: { method: string }) {
  const m: Record<string, { label: string; color: string }> = {
    cash: { label: 'Dinheiro', color: 'bg-emerald-500/15 text-emerald-600' },
    pix: { label: 'Pix', color: 'bg-blue-500/15 text-blue-600' },
    credit_card: { label: 'Cartao', color: 'bg-violet-500/15 text-violet-600' },
    wallet: { label: 'Carteira', color: 'bg-amber-500/15 text-amber-600' },
  }
  const info = m[method] || { label: method, color: 'bg-zinc-100 text-zinc-600' }
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
}

export default function DriverHomePage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [stats, setStats] = useState<DriverStats | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [togglingOnline, setTogglingOnline] = useState(false)
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null)
  const [incomingRide, setIncomingRide] = useState<IncomingRide | null>(null)
  const [acceptCountdown, setAcceptCountdown] = useState(30)
  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [completingRide, setCompletingRide] = useState(false)
  const [dayEarnings, setDayEarnings] = useState<DayEarnings>({ total: 0, rides: 0, hours: 0 })
  const [loading, setLoading] = useState(true)

  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const locationRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const startCountdown = useCallback(() => {
    setAcceptCountdown(30)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setAcceptCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          setIncomingRide(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/welcome'); return }

      const [profileRes, statsRes, earningsRes, activeRideRes] = await Promise.all([
        supabase.from('profiles').select('id,full_name,avatar_url,rating,total_rides,trust_score,trust_level').eq('id', user.id).single(),
        supabase.from('driver_profiles').select('*').eq('id', user.id).single(),
        supabase.from('rides')
          .select('id,final_price,passenger_price_offer,created_at,started_at,completed_at')
          .eq('driver_id', user.id)
          .eq('status', 'completed')
          .gte('completed_at', new Date(new Date().setHours(0,0,0,0)).toISOString()),
        supabase.rpc('get_driver_active_ride', { p_driver_id: user.id }),
      ])

      if (profileRes.data)  setProfile(profileRes.data as DriverProfile)
      if (statsRes.data) {
        setStats(statsRes.data as DriverStats)
        setIsOnline(statsRes.data.is_online ?? false)
      }

      // Calcular ganhos do dia
      if (earningsRes.data) {
        const rides = earningsRes.data
        const total = rides.reduce((sum: number, r: { final_price?: number; passenger_price_offer?: number }) =>
          sum + (Number(r.final_price) || Number(r.passenger_price_offer) || 0), 0)
        const hours = rides.reduce((sum: number, r: { started_at?: string; completed_at?: string }) => {
          if (r.started_at && r.completed_at) {
            return sum + (new Date(r.completed_at).getTime() - new Date(r.started_at).getTime()) / 3600000
          }
          return sum
        }, 0)
        setDayEarnings({ total: total * 0.80, rides: rides.length, hours: Math.round(hours * 10) / 10 })
      }

      // Corrida ativa
      if (activeRideRes.data?.has_active_ride) {
        const r = activeRideRes.data
        setActiveRide({
          id: r.ride.id,
          status: r.ride.status,
          pickup_address: r.ride.pickup_address,
          dropoff_address: r.ride.dropoff_address,
          final_price: Number(r.ride.final_price || r.ride.passenger_price_offer || 0),
          passenger: r.passenger,
        })
      }
    } catch (err) {
      console.error('[v0] loadData error:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  const subscribeToRides = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current)
    }

    channelRef.current = supabase
      .channel(`driver-incoming-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'rides',
        filter: `status=eq.searching`,
      }, async (payload) => {
        const ride = payload.new as Record<string, unknown>
        // Verificar se o tipo de veiculo bate
        if (stats && ride.vehicle_type !== stats.vehicle_type && ride.vehicle_type !== 'economy') return
        if (activeRide) return // Ja tem corrida ativa

        // Buscar dados do passageiro
        const { data: passenger } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, rating, total_rides')
          .eq('id', ride.passenger_id as string)
          .single()

        setIncomingRide({
          id: ride.id as string,
          pickup_address: ride.pickup_address as string,
          dropoff_address: ride.dropoff_address as string,
          pickup_lat: ride.pickup_lat as number | null,
          pickup_lng: ride.pickup_lng as number | null,
          distance_km: Number(ride.distance_km) || 0,
          estimated_duration_minutes: Number(ride.estimated_duration_minutes) || 0,
          passenger_price_offer: Number(ride.passenger_price_offer) || 0,
          vehicle_type: ride.vehicle_type as string,
          payment_method: ride.payment_method as string,
          notes: ride.notes as string | null,
          passenger: passenger || null,
        })
        startCountdown()
        try { new Audio('/notification.mp3').play().catch(() => {}) } catch {}
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rides',
        filter: `driver_id=eq.${user.id}`,
      }, (payload) => {
        const r = payload.new as Record<string, unknown>
        if (r.status === 'accepted' || r.status === 'in_progress') {
          loadData()
        }
        if (r.status === 'completed' || r.status === 'cancelled') {
          setActiveRide(null)
          loadData()
        }
      })
      .subscribe()
  }, [supabase, stats, activeRide, startCountdown, loadData])

  // Atualizar localização do motorista periodicamente
  const updateLocation = useCallback(async (userId: string) => {
    const { Geolocation } = await import('@capacitor/geolocation')
    let pos: Awaited<ReturnType<typeof Geolocation.getCurrentPosition>>
    try {
      pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
    } catch { return }
    ;(async () => {
      const { latitude, longitude, heading, speed } = pos.coords
      await supabase.rpc('upsert_driver_location', {
        p_driver_id: userId,
        p_lat: latitude,
        p_lng: longitude,
        p_heading: heading ?? null,
        p_speed: speed ?? null,
        p_accuracy: pos.coords.accuracy,
        p_is_available: isOnline && !activeRide,
      })
      // Atualizar posição no driver_profiles também
      await supabase.from('driver_profiles')
        .update({ current_lat: latitude, current_lng: longitude })
        .eq('id', userId)
    })()
  }, [supabase, isOnline, activeRide])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!isOnline || !profile) return
    subscribeToRides()
    updateLocation(profile.id)
    locationRef.current = setInterval(() => updateLocation(profile.id), 15000)
    return () => {
      if (locationRef.current) clearInterval(locationRef.current)
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [isOnline, profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOnline = async () => {
    if (!profile || togglingOnline) return
    setTogglingOnline(true)
    try {
      const newStatus = !isOnline
      const { error } = await supabase.from('driver_profiles')
        .update({ is_online: newStatus, is_available: newStatus, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
      if (error) throw error
      setIsOnline(newStatus)
      iosToast[newStatus ? 'success' : 'info'](newStatus ? 'Voce esta online!' : 'Voce saiu do ar')
      if (!newStatus && channelRef.current) {
        await supabase.removeChannel(channelRef.current)
        setIncomingRide(null)
      }
    } catch {
      iosToast.error('Erro ao alterar status')
    } finally {
      setTogglingOnline(false)
    }
  }

  const acceptRide = async () => {
    if (!incomingRide || !profile || accepting) return
    setAccepting(true)
    if (countdownRef.current) clearInterval(countdownRef.current)
    try {
      const res = await fetch(`/api/v1/rides/${incomingRide.id}/accept`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        iosToast.error(data.error || 'Corrida nao disponivel mais')
        setIncomingRide(null)
        return
      }
      setIncomingRide(null)
      setActiveRide({
        id: incomingRide.id,
        status: 'accepted',
        pickup_address: incomingRide.pickup_address,
        dropoff_address: incomingRide.dropoff_address,
        final_price: incomingRide.passenger_price_offer,
        passenger: incomingRide.passenger,
      })
      iosToast.success('Corrida aceita! Va buscar o passageiro.')
    } catch {
      iosToast.error('Erro ao aceitar corrida')
    } finally {
      setAccepting(false)
    }
  }

  const rejectRide = async () => {
    if (!incomingRide || !profile || rejecting) return
    setRejecting(true)
    if (countdownRef.current) clearInterval(countdownRef.current)
    try {
      // Registra rejeicao no acceptance_rate
      await supabase.rpc('update_acceptance_rate', { p_driver_id: profile.id, p_accepted: false })
    } catch {}
    setIncomingRide(null)
    setRejecting(false)
  }

  const startRide = async () => {
    if (!activeRide || !profile) return
    try {
      const res = await fetch(`/api/v1/rides/${activeRide.id}/start`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { iosToast.error(data.error || 'Erro ao iniciar corrida'); return }
      setActiveRide(prev => prev ? { ...prev, status: 'in_progress' } : null)
      iosToast.success('Corrida iniciada!')
    } catch {
      iosToast.error('Erro ao iniciar corrida')
    }
  }

  const completeRide = async () => {
    if (!activeRide || !profile || completingRide) return
    setCompletingRide(true)
    try {
      const res = await fetch(`/api/v1/rides/${activeRide.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })
      const data = await res.json()
      if (!res.ok) { iosToast.error(data.error || 'Erro ao finalizar'); return }

      // Liberar motorista
      await supabase.from('driver_profiles')
        .update({ is_available: true })
        .eq('id', profile.id)
      await supabase.from('driver_locations')
        .update({ is_available: true })
        .eq('driver_id', profile.id)

      iosToast.success('Corrida finalizada! Ganho registrado.')
      setActiveRide(null)
      loadData()
      router.push(`/uppi/ride/${activeRide.id}/review`)
    } catch {
      iosToast.error('Erro ao finalizar corrida')
    } finally {
      setCompletingRide(false)
    }
  }

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-zinc-950">
        <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-white overflow-y-auto pb-24">
      {/* Header */}
      <header className="px-5 pt-safe-offset-4 pb-4 flex items-center justify-between sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
            {profile?.avatar_url
              ? <Image src={profile.avatar_url} alt={profile?.full_name || ''} width={40} height={40} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><span className="text-lg font-bold text-zinc-300">{profile?.full_name?.[0] || 'M'}</span></div>
            }
          </div>
          <div>
            <p className="text-[13px] text-zinc-400 leading-none">Ola,</p>
            <p className="text-[17px] font-bold leading-tight">{profile?.full_name?.split(' ')[0] || 'Motorista'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => router.push('/uppi/notifications')} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center active:scale-95 transition-transform">
            <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <button type="button" onClick={() => router.push('/uppi/driver/profile')} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center active:scale-95 transition-transform">
            <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </header>

      <main className="px-4 pt-5 space-y-4">
        {/* Toggle Online / Offline */}
        <div className={`rounded-[24px] p-5 border transition-all duration-500 ${isOnline ? 'bg-emerald-950/40 border-emerald-800/50' : 'bg-zinc-900 border-zinc-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[22px] font-bold tracking-tight">{isOnline ? 'Voce esta online' : 'Voce esta offline'}</h2>
              <p className="text-[13px] text-zinc-400 mt-0.5">{isOnline ? 'Aguardando solicitacoes de corrida' : 'Ligue para comecar a receber corridas'}</p>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${isOnline ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-zinc-800 border-zinc-700'}`}>
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            </div>
          </div>
          <button
            type="button"
            onClick={toggleOnline}
            disabled={togglingOnline}
            className={`w-full h-[52px] rounded-[16px] font-bold text-[17px] transition-all active:scale-[0.97] disabled:opacity-60 ${
              isOnline
                ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                : 'bg-emerald-500 text-white hover:bg-emerald-400'
            }`}
          >
            {togglingOnline ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Aguarde...
              </span>
            ) : isOnline ? 'Ficar offline' : 'Ir online'}
          </button>
        </div>

        {/* Corrida ativa */}
        {activeRide && (
          <div className="rounded-[24px] bg-blue-950/50 border border-blue-800/50 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[13px] font-semibold text-blue-400 uppercase tracking-wide">
                {activeRide.status === 'accepted' ? 'A caminho do passageiro' : 'Corrida em andamento'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Embarque</p>
                  <p className="text-[15px] font-semibold text-white leading-snug">{activeRide.pickup_address}</p>
                </div>
              </div>
              <div className="ml-4 border-l-2 border-dashed border-zinc-700 pl-7 py-1">
                <p className="text-[11px] text-zinc-600">destino</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Destino</p>
                  <p className="text-[15px] font-semibold text-white leading-snug">{activeRide.dropoff_address}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-900/60 rounded-[14px] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                  {activeRide.passenger?.avatar_url
                    ? <Image src={activeRide.passenger.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><span className="font-bold text-zinc-400">{activeRide.passenger?.full_name?.[0] || 'P'}</span></div>
                  }
                </div>
                <div>
                  <p className="text-[15px] font-semibold">{activeRide.passenger?.full_name || 'Passageiro'}</p>
                  {activeRide.passenger?.phone && (
                    <a href={`tel:${activeRide.passenger.phone}`} className="text-[12px] text-blue-400">{activeRide.passenger.phone}</a>
                  )}
                </div>
              </div>
              <p className="text-[20px] font-bold text-emerald-400">{formatBRL(activeRide.final_price)}</p>
            </div>

            <div className="flex gap-2">
              {activeRide.status === 'accepted' && (
                <button
                  type="button"
                  onClick={startRide}
                  className="flex-1 h-[50px] rounded-[14px] bg-blue-500 text-white font-bold text-[15px] active:scale-[0.97] transition-transform"
                >
                  Iniciar corrida
                </button>
              )}
              {activeRide.status === 'in_progress' && (
                <button
                  type="button"
                  onClick={completeRide}
                  disabled={completingRide}
                  className="flex-1 h-[50px] rounded-[14px] bg-emerald-500 text-white font-bold text-[15px] active:scale-[0.97] transition-transform disabled:opacity-60"
                >
                  {completingRide ? 'Finalizando...' : 'Finalizar corrida'}
                </button>
              )}
              <button
                type="button"
                onClick={() => router.push(`/uppi/ride/${activeRide.id}/tracking`)}
                className="w-[50px] h-[50px] rounded-[14px] bg-zinc-800 flex items-center justify-center active:scale-[0.97] transition-transform"
              >
                <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Ganhos do dia */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 rounded-[18px] p-4 border border-zinc-800">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Hoje</p>
            <p className="text-[20px] font-bold text-emerald-400">{formatBRL(dayEarnings.total)}</p>
          </div>
          <div className="bg-zinc-900 rounded-[18px] p-4 border border-zinc-800">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Corridas</p>
            <p className="text-[20px] font-bold">{dayEarnings.rides}</p>
          </div>
          <div className="bg-zinc-900 rounded-[18px] p-4 border border-zinc-800">
            <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Horas</p>
            <p className="text-[20px] font-bold">{dayEarnings.hours}h</p>
          </div>
        </div>

        {/* Stats do motorista */}
        {stats && (
          <div className="bg-zinc-900 rounded-[24px] p-5 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold">Seu desempenho</h3>
              <button type="button" onClick={() => router.push('/uppi/driver/profile')} className="text-[13px] text-blue-400 font-medium">Ver perfil</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/60 rounded-[14px] p-3">
                <p className="text-[11px] text-zinc-500 mb-1">Aceitacao</p>
                <p className="text-[18px] font-bold text-emerald-400">{Number(stats.acceptance_rate || 100).toFixed(0)}%</p>
              </div>
              <div className="bg-zinc-800/60 rounded-[14px] p-3">
                <p className="text-[11px] text-zinc-500 mb-1">Avaliacao</p>
                <p className="text-[18px] font-bold text-amber-400">{Number(profile?.rating || 5).toFixed(1)} ★</p>
              </div>
              <div className="bg-zinc-800/60 rounded-[14px] p-3">
                <p className="text-[11px] text-zinc-500 mb-1">Total corridas</p>
                <p className="text-[18px] font-bold">{profile?.total_rides || 0}</p>
              </div>
              <div className="bg-zinc-800/60 rounded-[14px] p-3">
                <p className="text-[11px] text-zinc-500 mb-1">Ganho total</p>
                <p className="text-[18px] font-bold text-emerald-400">{formatBRL(Number(stats.total_earnings || 0))}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <VehicleIcon type={stats.vehicle_type || 'economy'} className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <p className="text-[15px] font-semibold">{stats.vehicle_brand} {stats.vehicle_model}</p>
                <p className="text-[12px] text-zinc-500">{stats.vehicle_plate} • {stats.vehicle_color}</p>
              </div>
              {stats.is_verified
                ? <div className="ml-auto flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold px-2 py-1 rounded-full"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Verificado</div>
                : <div className="ml-auto text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">Pendente</div>
              }
            </div>
          </div>
        )}

        {/* Atalhos rapidos */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Ganhos', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', href: '/uppi/driver/earnings' },
            { label: 'Agenda', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', href: '/uppi/driver/schedule' },
            { label: 'Zonas Quentes', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', href: '/uppi/driver/hot-zones' },
            { label: 'Historico', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', href: '/uppi/driver/history' },
          ].map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => router.push(item.href)}
              className="bg-zinc-900 border border-zinc-800 rounded-[18px] p-4 flex items-center gap-3 active:scale-[0.97] transition-transform text-left"
            >
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              </div>
              <span className="text-[15px] font-semibold text-white">{item.label}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Modal de corrida recebida */}
      {incomingRide && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-zinc-900 rounded-t-[32px] p-6 shadow-2xl border-t border-zinc-800 animate-in slide-in-from-bottom duration-300">
            {/* Countdown ring */}
            <div className="absolute top-6 right-6">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#27272a" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24"
                  fill="none"
                  stroke={acceptCountdown > 10 ? '#22c55e' : '#ef4444'}
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - acceptCountdown / 30)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[16px] font-bold text-white">{acceptCountdown}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[13px] font-semibold text-emerald-400 uppercase tracking-wide">Nova corrida!</span>
            </div>

            {incomingRide.passenger && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                  {incomingRide.passenger.avatar_url
                    ? <Image src={incomingRide.passenger.avatar_url} alt="" width={48} height={48} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><span className="text-lg font-bold text-zinc-400">{incomingRide.passenger.full_name[0]}</span></div>
                  }
                </div>
                <div>
                  <p className="text-[17px] font-bold">{incomingRide.passenger.full_name}</p>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                    <span className="text-[13px] text-zinc-400">{Number(incomingRide.passenger.rating || 5).toFixed(1)} • {incomingRide.passenger.total_rides} corridas</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 bg-blue-400 rounded-full" /></div>
                <p className="text-[14px] text-zinc-200 leading-snug">{incomingRide.pickup_address}</p>
              </div>
              <div className="ml-2.5 border-l-2 border-dashed border-zinc-700 pl-5 py-0.5"><p className="text-[11px] text-zinc-600">{formatKm(incomingRide.distance_km)} • {incomingRide.estimated_duration_minutes} min</p></div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 bg-emerald-400 rounded-full" /></div>
                <p className="text-[14px] text-zinc-200 leading-snug">{incomingRide.dropoff_address}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <VehicleIcon type={incomingRide.vehicle_type} className="w-5 h-5 text-zinc-400" />
                <span className="text-[13px] text-zinc-400 capitalize">{incomingRide.vehicle_type}</span>
                <PaymentBadge method={incomingRide.payment_method} />
              </div>
              <p className="text-[26px] font-bold text-emerald-400">{formatBRL(incomingRide.passenger_price_offer)}</p>
            </div>

            {incomingRide.notes && (
              <div className="bg-zinc-800/50 rounded-[12px] px-3 py-2 mb-4">
                <p className="text-[12px] text-zinc-400"><span className="font-semibold text-zinc-300">Obs:</span> {incomingRide.notes}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={rejectRide}
                disabled={rejecting || accepting}
                className="flex-1 h-[54px] rounded-[16px] bg-zinc-800 text-zinc-300 font-bold text-[17px] active:scale-[0.97] transition-transform disabled:opacity-60"
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={acceptRide}
                disabled={accepting || rejecting}
                className="flex-[2] h-[54px] rounded-[16px] bg-emerald-500 text-white font-bold text-[17px] active:scale-[0.97] transition-transform disabled:opacity-60"
              >
                {accepting ? (
                  <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Aceitando...</span>
                ) : 'Aceitar corrida'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
