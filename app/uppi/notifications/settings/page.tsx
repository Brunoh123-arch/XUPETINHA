'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'
import { BottomNavigation } from '@/components/bottom-navigation'

interface NotifSettings {
  rides: boolean
  offers: boolean
  payments: boolean
  promotions: boolean
  social: boolean
  system: boolean
  driver_arrived: boolean
  ride_completed: boolean
  chat_messages: boolean
  emergency: boolean
}

const DEFAULT: NotifSettings = {
  rides: true,
  offers: true,
  payments: true,
  promotions: false,
  social: false,
  system: true,
  driver_arrived: true,
  ride_completed: true,
  chat_messages: true,
  emergency: true,
}

const GROUPS = [
  {
    title: 'Corridas',
    items: [
      { key: 'rides', label: 'Atualizacoes de corrida', desc: 'Status, aceitacao e cancelamento' },
      { key: 'driver_arrived', label: 'Motorista chegou', desc: 'Alerta quando o motorista chegar' },
      { key: 'ride_completed', label: 'Corrida concluida', desc: 'Resumo e comprovante da viagem' },
      { key: 'offers', label: 'Novas ofertas de preco', desc: 'Contra-ofertas de motoristas' },
    ],
  },
  {
    title: 'Comunicacao',
    items: [
      { key: 'chat_messages', label: 'Mensagens no chat', desc: 'Mensagens do motorista/passageiro' },
      { key: 'emergency', label: 'Alertas de emergencia', desc: 'SOS e contatos de emergencia' },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { key: 'payments', label: 'Pagamentos', desc: 'Confirmacoes e recibos' },
      { key: 'promotions', label: 'Promocoes e cupons', desc: 'Ofertas e descontos exclusivos' },
    ],
  },
  {
    title: 'Outros',
    items: [
      { key: 'social', label: 'Feed social', desc: 'Curtidas, comentarios e seguidores' },
      { key: 'system', label: 'Atualizacoes do sistema', desc: 'Novidades e manutencoes' },
    ],
  },
]

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single()
      if (data?.notification_settings) {
        setSettings({ ...DEFAULT, ...data.notification_settings })
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggle = async (key: keyof NotifSettings) => {
    const updated = { ...settings, [key]: !settings[key] }
    setSettings(updated)
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('profiles')
        .update({ notification_settings: updated })
        .eq('id', user.id)
    } catch {
      setSettings(settings)
      iosToast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const toggleAll = async (value: boolean) => {
    const updated = Object.fromEntries(Object.keys(DEFAULT).map(k => [k, value])) as NotifSettings
    setSettings(updated)
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').update({ notification_settings: updated }).eq('id', user.id)
      iosToast.success(value ? 'Todas ativadas' : 'Todas desativadas')
    } catch {
      iosToast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const allOn = Object.values(settings).every(Boolean)

  return (
    <div className="h-dvh overflow-y-auto bg-[#F2F2F7] dark:bg-black pb-24 ios-scroll">
      <header className="bg-white/80 dark:bg-black/80 ios-blur-heavy border-b border-black/[0.08] dark:border-white/[0.1] sticky top-0 z-30">
        <div className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full ios-press -ml-1">
              <svg className="w-6 h-6 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-foreground tracking-tight flex-1">Notificacoes</h1>
            {saving && <div className="w-4 h-4 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />}
          </div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-2xl mx-auto space-y-5">
        {/* Master toggle */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
          <div className="px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-[17px] font-semibold text-foreground">Todas as notificacoes</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">Ativar ou desativar tudo de uma vez</p>
            </div>
            <button
              type="button"
              onClick={() => toggleAll(!allOn)}
              className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ios-press ${allOn ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
            >
              <span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md transition-transform duration-200 ${allOn ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-[#1C1C1E] rounded-[20px] h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          GROUPS.map(group => (
            <div key={group.title}>
              <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">{group.title}</p>
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
                {group.items.map((item, idx) => {
                  const key = item.key as keyof NotifSettings
                  const on = settings[key]
                  return (
                    <div
                      key={item.key}
                      className={`px-4 py-3.5 flex items-center gap-4 ${idx < group.items.length - 1 ? 'border-b border-black/[0.06] dark:border-white/[0.06]' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] font-medium text-foreground">{item.label}</p>
                        <p className="text-[13px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className={`relative flex-shrink-0 w-[51px] h-[31px] rounded-full transition-colors duration-200 ios-press ${on ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#3A3A3C]'}`}
                        role="switch"
                        aria-checked={on}
                      >
                        <span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md transition-transform duration-200 ${on ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </main>
      <BottomNavigation />
    </div>
  )
}
