'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { DriverBottomNavigation } from '@/components/driver-bottom-navigation'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

interface SlotRow {
  day: number
  enabled: boolean
  start: string
  end: string
}

const DEFAULT_SLOTS: SlotRow[] = DAYS.map((_, i) => ({
  day: i,
  enabled: i >= 1 && i <= 5, // Seg-Sex ativo por padrao
  start: '07:00',
  end: '22:00',
}))

export default function DriverAvailabilityPage() {
  const router = useRouter()
  const [slots, setSlots] = useState<SlotRow[]>(DEFAULT_SLOTS)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/onboarding/splash'); return }
      setUserId(user.id)

      const { data: avail } = await supabase
        .from('driver_availability')
        .select('*')
        .eq('driver_id', user.id)

      if (avail && avail.length > 0) {
        const merged = DEFAULT_SLOTS.map(def => {
          const found = avail.find(a => a.day_of_week === def.day)
          return found
            ? { day: def.day, enabled: found.is_available, start: found.start_time?.slice(0, 5) || def.start, end: found.end_time?.slice(0, 5) || def.end }
            : def
        })
        setSlots(merged)
      }

      const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('is_online')
        .eq('id', user.id)
        .single()
      setIsOnline(driverProfile?.is_online ?? false)
      setLoading(false)
    }
    load()
  }, [])

  const updateSlot = (day: number, field: keyof SlotRow, value: boolean | string) => {
    setSlots(prev => prev.map(s => s.day === day ? { ...s, [field]: value } : s))
  }

  const save = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const supabase = createClient()
      const upserts = slots.map(s => ({
        driver_id: userId,
        day_of_week: s.day,
        is_available: s.enabled,
        start_time: s.start + ':00',
        end_time: s.end + ':00',
      }))
      const { error } = await supabase
        .from('driver_availability')
        .upsert(upserts, { onConflict: 'driver_id,day_of_week' })
      if (error) throw error
      iosToast.success('Disponibilidade salva')
    } catch {
      iosToast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const toggleOnline = async () => {
    if (!userId) return
    const next = !isOnline
    setIsOnline(next)
    const supabase = createClient()
    await supabase.from('driver_profiles').update({ is_online: next }).eq('id', userId)
    iosToast.success(next ? 'Voce esta online' : 'Voce esta offline')
  }

  const enabledCount = slots.filter(s => s.enabled).length

  return (
    <div className="h-dvh overflow-y-auto bg-[color:var(--background)] pb-24 ios-scroll">
      <header className="bg-[color:var(--card)]/80 ios-blur border-b border-[color:var(--border)] sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full bg-[color:var(--muted)] ios-press">
              <svg className="w-5 h-5 text-[color:var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-[color:var(--foreground)] tracking-tight">Disponibilidade</h1>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-4 h-9 bg-emerald-500 text-white text-[14px] font-bold rounded-[12px] ios-press disabled:opacity-60 flex items-center gap-1.5"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </header>

      <main className="px-5 py-5 max-w-lg mx-auto space-y-5">
        {/* Status online */}
        <div className="bg-[color:var(--card)] rounded-[24px] p-5 border border-[color:var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[17px] font-bold text-[color:var(--foreground)]">Status agora</p>
              <p className="text-[14px] text-[color:var(--muted-foreground)] mt-0.5">
                {isOnline ? 'Voce esta recebendo corridas' : 'Voce esta offline'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleOnline}
              className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ios-press ${isOnline ? 'bg-emerald-500' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
            >
              <span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md transition-transform duration-200 ${isOnline ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} />
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-[20px] p-4 border border-emerald-200 dark:border-emerald-800">
          <p className="text-[14px] font-semibold text-emerald-700 dark:text-emerald-400">
            {enabledCount === 0 ? 'Nenhum dia habilitado' : `${enabledCount} dia${enabledCount > 1 ? 's' : ''} habilitado${enabledCount > 1 ? 's' : ''} por semana`}
          </p>
        </div>

        {/* Horarios por dia */}
        <div>
          <p className="text-[13px] font-semibold text-[color:var(--muted-foreground)] uppercase tracking-wider mb-3 px-1">Horarios por dia</p>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="bg-[color:var(--card)] rounded-[20px] h-16 animate-pulse" />
              ))
            ) : (
              slots.map(slot => (
                <div
                  key={slot.day}
                  className={`bg-[color:var(--card)] rounded-[20px] p-4 border transition-all ${slot.enabled ? 'border-emerald-300 dark:border-emerald-700' : 'border-[color:var(--border)] opacity-70'}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Toggle dia */}
                    <button
                      type="button"
                      onClick={() => updateSlot(slot.day, 'enabled', !slot.enabled)}
                      className={`relative flex-shrink-0 w-[44px] h-[26px] rounded-full transition-colors duration-200 ios-press ${slot.enabled ? 'bg-emerald-500' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
                    >
                      <span className={`absolute top-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-sm transition-transform duration-200 ${slot.enabled ? 'translate-x-[19px]' : 'translate-x-[2px]'}`} />
                    </button>

                    {/* Nome do dia */}
                    <p className="w-8 text-[16px] font-bold text-[color:var(--foreground)]">{DAYS[slot.day]}</p>

                    {/* Horarios */}
                    {slot.enabled ? (
                      <div className="flex-1 flex items-center gap-2">
                        <select
                          value={slot.start}
                          onChange={e => updateSlot(slot.day, 'start', e.target.value)}
                          className="flex-1 h-9 px-2 bg-[color:var(--muted)] rounded-[10px] text-[14px] font-semibold text-[color:var(--foreground)] outline-none"
                        >
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-[14px] text-[color:var(--muted-foreground)] font-semibold">ate</span>
                        <select
                          value={slot.end}
                          onChange={e => updateSlot(slot.day, 'end', e.target.value)}
                          className="flex-1 h-9 px-2 bg-[color:var(--muted)] rounded-[10px] text-[14px] font-semibold text-[color:var(--foreground)] outline-none"
                        >
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    ) : (
                      <p className="flex-1 text-[14px] text-[color:var(--muted-foreground)]">Indisponivel</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <DriverBottomNavigation />
    </div>
  )
}
