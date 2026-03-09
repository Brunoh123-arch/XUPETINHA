'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { BottomNavigation } from '@/components/bottom-navigation'
import { cn } from '@/lib/utils'

interface ScheduledRide {
  id: string
  passenger_id: string
  driver_id: string | null
  origin_address: string
  dest_address: string
  scheduled_at: string
  estimated_price: number | null
  vehicle_type: string
  status: string
  notes: string | null
  created_at: string
  driver?: { full_name: string; avatar_url: string | null; rating: number } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Aguardando motorista', color: 'text-amber-600', bg: 'bg-amber-50' },
  confirmed: { label: 'Motorista confirmado', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  driver_assigned: { label: 'Motorista designado', color: 'text-blue-600', bg: 'bg-blue-50' },
  cancelled: { label: 'Cancelado', color: 'text-red-600', bg: 'bg-red-50' },
  completed: { label: 'Concluído', color: 'text-neutral-600', bg: 'bg-neutral-100' },
}

const VEHICLE_LABELS: Record<string, string> = {
  economy: 'Econômico',
  comfort: 'Conforto',
  premium: 'Premium',
  suv: 'SUV',
  moto: 'Moto',
}

export default function SchedulePage() {
  const router = useRouter()
  const supabase = createClient()
  const [rides, setRides] = useState<ScheduledRide[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')

  const loadRides = useCallback(async () => {
    setLoading(true)
    try {
      const statusFilter = tab === 'upcoming' ? 'pending,confirmed,driver_assigned' : 'completed,cancelled'
      const res = await fetch(`/api/v1/scheduled-rides?role=passenger&status=${statusFilter}`)
      if (!res.ok) throw new Error()
      const { rides: data } = await res.json()

      // Buscar info do motorista se confirmado
      const ridesWithDrivers = await Promise.all(
        (data as ScheduledRide[]).map(async (ride) => {
          if (ride.driver_id) {
            const { data: driver } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, rating')
              .eq('id', ride.driver_id)
              .single()
            return { ...ride, driver }
          }
          return ride
        })
      )
      setRides(ridesWithDrivers)
    } catch {
      iosToast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => {
    loadRides()
  }, [loadRides])

  // Realtime: atualiza quando status muda
  useEffect(() => {
    let userId = ''
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      userId = user.id
      const channel = supabase
        .channel('passenger-scheduled-rides')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'scheduled_rides',
          filter: `passenger_id=eq.${userId}`,
        }, () => loadRides())
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    })
  }, [])

  const handleCancel = async (rideId: string) => {
    setCancelling(rideId)
    try {
      const res = await fetch(`/api/v1/scheduled-rides?id=${rideId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        iosToast.error(err.error || 'Erro ao cancelar')
        return
      }
      setRides(prev => prev.filter(r => r.id !== rideId))
      iosToast.success('Agendamento cancelado')
    } catch {
      iosToast.error('Erro ao cancelar agendamento')
    } finally {
      setCancelling(null)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    if (d.toDateString() === today.toDateString()) return 'Hoje'
    if (d.toDateString() === tomorrow.toDateString()) return 'Amanhã'
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-dvh overflow-y-auto bg-[color:var(--background)] pb-24 ios-scroll">
      <header className="bg-[color:var(--card)]/80 ios-blur border-b border-[color:var(--border)] sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[color:var(--muted)] ios-press"
            aria-label="Voltar"
          >
            <svg className="w-5 h-5 text-[color:var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-[20px] font-bold text-[color:var(--foreground)] tracking-tight">Meus Agendamentos</h1>
            <p className="text-[13px] text-[color:var(--muted-foreground)]">Corridas programadas</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/uppi/ride/schedule')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 ios-press"
            aria-label="Novo agendamento"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-3 flex gap-2">
          {(['upcoming', 'past'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setLoading(true) }}
              className={cn(
                'flex-1 py-2 rounded-[12px] text-[13px] font-bold transition-colors ios-press',
                tab === t
                  ? 'bg-blue-500 text-white'
                  : 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)]'
              )}
            >
              {t === 'upcoming' ? 'Próximos' : 'Histórico'}
            </button>
          ))}
        </div>
      </header>

      <main className="px-5 py-5 max-w-lg mx-auto space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[color:var(--card)] rounded-[24px] p-5 border border-[color:var(--border)] animate-pulse">
              <div className="h-4 bg-[color:var(--muted)] rounded w-1/2 mb-3" />
              <div className="h-3 bg-[color:var(--muted)] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[color:var(--muted)] rounded w-2/3" />
            </div>
          ))
        ) : rides.length === 0 ? (
          <div className="bg-[color:var(--card)] rounded-[24px] p-16 text-center border border-[color:var(--border)]">
            <div className="w-20 h-20 bg-[color:var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[color:var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-[18px] font-bold text-[color:var(--foreground)] mb-1.5">
              {tab === 'upcoming' ? 'Nenhum agendamento' : 'Sem histórico'}
            </p>
            <p className="text-[14px] text-[color:var(--muted-foreground)] mb-6">
              {tab === 'upcoming' ? 'Agende sua próxima corrida com antecedência' : 'Seus agendamentos passados aparecerão aqui'}
            </p>
            {tab === 'upcoming' && (
              <button
                type="button"
                onClick={() => router.push('/uppi/ride/route-input')}
                className="h-[46px] px-6 bg-blue-500 text-white font-bold text-[15px] rounded-[16px] ios-press"
              >
                Agendar corrida
              </button>
            )}
          </div>
        ) : (
          rides.map((ride, i) => {
            const sc = STATUS_CONFIG[ride.status] || STATUS_CONFIG.pending
            const timeUntil = new Date(ride.scheduled_at).getTime() - Date.now()
            const isUrgent = tab === 'upcoming' && timeUntil > 0 && timeUntil < 3600000
            const canCancel = ['pending', 'confirmed'].includes(ride.status)

            return (
              <div
                key={ride.id}
                className={cn(
                  'bg-[color:var(--card)] rounded-[24px] p-5 border animate-ios-fade-up relative overflow-hidden',
                  isUrgent ? 'border-amber-300' : 'border-[color:var(--border)]'
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {isUrgent && <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 rounded-t-[24px]" />}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[17px] font-bold text-[color:var(--foreground)]">
                      {formatDate(ride.scheduled_at)} às {formatTime(ride.scheduled_at)}
                    </p>
                    <span className={cn('text-[12px] font-bold px-2.5 py-1 rounded-full inline-block mt-1', sc.bg, sc.color)}>
                      {sc.label}
                    </span>
                  </div>
                  {ride.estimated_price && (
                    <span className="text-[20px] font-black text-blue-600">
                      R$ {ride.estimated_price.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    <div className="w-px flex-1 bg-[color:var(--border)] min-h-[20px]" />
                    <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <p className="text-[13px] font-medium text-[color:var(--foreground)] truncate">{ride.origin_address}</p>
                    <p className="text-[13px] font-medium text-[color:var(--foreground)] truncate">{ride.dest_address}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] text-[color:var(--muted-foreground)] bg-[color:var(--muted)] px-2.5 py-1 rounded-full">
                    {VEHICLE_LABELS[ride.vehicle_type] || ride.vehicle_type}
                  </span>
                  {isUrgent && (
                    <span className="text-[12px] font-bold text-amber-600 animate-pulse">
                      Em menos de 1 hora
                    </span>
                  )}
                </div>

                {ride.driver && (
                  <div className="flex items-center gap-2.5 mb-3 bg-[color:var(--muted)] rounded-[14px] p-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[14px] shrink-0">
                      {ride.driver.full_name?.charAt(0) || 'M'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[color:var(--foreground)] truncate">{ride.driver.full_name}</p>
                      <p className="text-[12px] text-[color:var(--muted-foreground)]">{ride.driver.rating?.toFixed(1)} estrelas</p>
                    </div>
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => handleCancel(ride.id)}
                    disabled={cancelling === ride.id}
                    className="w-full h-[44px] bg-[color:var(--muted)] text-red-500 font-bold text-[14px] rounded-[14px] ios-press flex items-center justify-center"
                  >
                    {cancelling === ride.id
                      ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      : 'Cancelar agendamento'
                    }
                  </button>
                )}
              </div>
            )
          })
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
