'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { ThemeToggle } from '@/components/theme-toggle'
import { BottomNavigation } from '@/components/bottom-navigation'
import { iosToast } from '@/lib/utils/ios-toast'
import { triggerHaptic } from '@/hooks/use-haptic'
import { createClient } from '@/lib/supabase/client'

interface UserPreferences {
  notifications_push: boolean
  sound_effects: boolean
  location_background: boolean
  save_payment_info: boolean
}

const DEFAULT_PREFS: UserPreferences = {
  notifications_push: true,
  sound_effects: true,
  location_background: false,
  save_payment_info: true,
}

export default function SettingsPage() {
  const router = useRouter()
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS)
  const [userType, setUserType] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, preferences')
        .eq('id', user.id)
        .single()
      if (profile) {
        setUserType(profile.user_type ?? 'passenger')
        if (profile.preferences) {
          setPrefs({ ...DEFAULT_PREFS, ...profile.preferences })
        }
      }
    }
    loadProfile()
  }, [])

  const updatePref = async (key: keyof UserPreferences, value: boolean) => {
    triggerHaptic('selection')
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)

    try {
      await fetch('/api/v1/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updated }),
      })
    } catch {
      // Reverte em caso de erro de rede
      setPrefs(prefs)
      iosToast.error('Erro ao salvar preferencia')
    }
  }

  const settingsSections = [
    {
      title: 'Conta',
      items: [
        { label: 'Editar Perfil', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', path: '/uppi/profile' },
        { label: 'Documentos', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/uppi/driver/documents' },
        { label: 'Formas de Pagamento', iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', path: '/uppi/payments' },
        { label: 'Enderecos Salvos', iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', path: '/uppi/favorites/add' },
      ],
    },
    {
      title: 'Privacidade e Seguranca',
      items: [
        { label: 'Alterar Senha', iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', path: '/uppi/settings/password' },
        { label: 'Verificacao em Duas Etapas', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', path: '/uppi/settings/2fa' },
        { label: 'Sessoes e Dispositivos', iconPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1', path: '/uppi/settings/security' },
        { label: 'Usuarios Bloqueados', iconPath: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', path: '/uppi/settings/blocked' },
        { label: 'Contatos de Emergencia', iconPath: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', path: '/uppi/settings/emergency' },
      ],
    },
    {
      title: 'Recompensas',
      items: [
        { label: 'Pontos e Emblemas', iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', path: '/uppi/points' },
        { label: 'Clube Uppi', iconPath: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', path: '/uppi/club' },
        { label: 'Conquistas', iconPath: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', path: '/uppi/achievements' },
      ],
    },
        { label: 'Idioma', iconPath: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', value: 'Portugues (BR)', path: '/uppi/settings/language' },
        { label: 'Ajuda e Suporte', iconPath: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', path: '/uppi/suporte' },
        { label: 'Termos de Uso', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', path: '/uppi/terms' },
        { label: 'Politica de Privacidade', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', path: '/uppi/privacy' },
      ],
    },
  ]

  return (
    <div className="h-dvh overflow-y-auto bg-[#F2F2F7] dark:bg-black pb-24 ios-scroll">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 ios-blur-heavy border-b border-black/[0.08] dark:border-white/[0.1] sticky top-0 z-30">
        <div className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full ios-press -ml-1">
              <svg className="w-6 h-6 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[34px] font-bold text-foreground tracking-[-0.8px] leading-[1.15]">Configuracoes</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-2xl mx-auto space-y-6">
        {/* Aparencia */}
        <div>
          <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2.5 px-1">Aparencia</p>
          <div className="bg-white/90 dark:bg-[#1C1C1E]/90 ios-blur rounded-[20px] overflow-hidden shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.04),0_2px_12px_rgba(0,0,0,0.3)] border-[0.5px] border-black/[0.06] dark:border-white/[0.08]">
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[17px] font-semibold text-foreground tracking-[-0.4px]">Tema</p>
                <p className="text-[13px] text-[#8E8E93] mt-0.5">Alternar entre claro e escuro</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Notificacoes */}
        <div>
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Notificacoes</p>
          <div className="bg-card rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
              <div>
                <p className="text-[17px] font-medium text-foreground">Notificacoes Push</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Receber alertas sobre corridas</p>
              </div>
              <Switch
                checked={prefs.notifications_push}
                onCheckedChange={(val) => {
                  updatePref('notifications_push', val)
                  iosToast.success(val ? 'Notificacoes ativadas' : 'Notificacoes desativadas')
                }}
              />
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[17px] font-medium text-foreground">Sons e Vibracoes</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Alertas sonoros no app</p>
              </div>
              <Switch
                checked={prefs.sound_effects}
                onCheckedChange={(val) => updatePref('sound_effects', val)}
              />
            </div>
          </div>
        </div>

        {/* Localizacao */}
        <div>
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Localizacao</p>
          <div className="bg-card rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[17px] font-medium text-foreground">Segundo Plano</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Encontrar motoristas mais rapido</p>
              </div>
              <Switch
                checked={prefs.location_background}
                onCheckedChange={(val) => updatePref('location_background', val)}
              />
            </div>
          </div>
        </div>

        {/* Pagamentos */}
        <div>
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Pagamentos</p>
          <div className="bg-card rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[17px] font-medium text-foreground">Salvar Dados de Pagamento</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">Para pagamentos mais rapidos</p>
              </div>
              <Switch
                checked={prefs.save_payment_info}
                onCheckedChange={(val) => updatePref('save_payment_info', val)}
              />
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">{section.title}</p>
            <div className="bg-card rounded-[20px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  type="button"
                  onClick={() => item.path && router.push(item.path)}
                  className={`w-full px-5 py-3.5 flex items-center gap-4 ios-press ${itemIndex < section.items.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <svg className="w-[22px] h-[22px] text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                  </svg>
                  <span className="flex-1 text-left text-[17px] text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-[15px] text-muted-foreground">{item.value}</span>
                    )}
                    <svg className="w-5 h-5 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Tornar-se motorista */}
        {userType !== 'driver' && (
          <div>
            <p className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2.5 px-1">Motorista</p>
            <div className="bg-white/90 dark:bg-[#1C1C1E]/90 ios-blur rounded-[20px] overflow-hidden shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.04),0_2px_12px_rgba(0,0,0,0.3)] border-[0.5px] border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => router.push('/auth/driver/welcome')}
                className="w-full px-4 py-4 flex items-center gap-4 ios-press"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[17px] font-semibold text-foreground tracking-[-0.4px]">Quero ser motorista</p>
                  <p className="text-[13px] text-[#8E8E93] mt-0.5">Cadastre-se e comece a ganhar dinheiro</p>
                </div>
                <svg className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* App Info */}
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-blue-500 rounded-[18px] flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-[17px] font-bold text-foreground tracking-tight">Uppi</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">Versao 1.0.0</p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
