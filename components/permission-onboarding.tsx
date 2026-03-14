'use client'

import { useState, useEffect } from 'react'
import { MapPin, Bell, Camera, Check } from 'lucide-react'
import { iosToast } from '@/lib/utils/ios-toast'
import { triggerHaptic } from '@/hooks/use-haptic'
import { Capacitor } from '@capacitor/core'
import { motion, AnimatePresence } from 'framer-motion'

type PermissionStep = 'location' | 'notification' | 'camera' | 'complete'

interface PermissionStep_Config {
  id: PermissionStep
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  buttonColor: string
  buttonShadow: string
  title: string
  description: string
  benefit1: string
  benefit2: string
  cta: string
}

const STEPS: PermissionStep_Config[] = [
  {
    id: 'location',
    icon: <MapPin className="w-9 h-9" strokeWidth={1.8} />,
    iconBg: 'bg-[#007AFF]/10',
    iconColor: 'text-[#007AFF]',
    buttonColor: 'bg-[#007AFF]',
    buttonShadow: 'shadow-[0_4px_16px_rgba(0,122,255,0.35)]',
    title: 'Ative sua localização',
    description: 'Para encontrar motoristas próximos e calcular rotas em tempo real.',
    benefit1: 'Corridas mais rápidas e precisas',
    benefit2: 'Rastreamento ao vivo da sua corrida',
    cta: 'Permitir Localização',
  },
  {
    id: 'notification',
    icon: <Bell className="w-9 h-9" strokeWidth={1.8} />,
    iconBg: 'bg-[#FF9500]/10',
    iconColor: 'text-[#FF9500]',
    buttonColor: 'bg-[#FF9500]',
    buttonShadow: 'shadow-[0_4px_16px_rgba(255,149,0,0.35)]',
    title: 'Ative as notificações',
    description: 'Receba alertas de novas corridas, chegada do motorista e promoções.',
    benefit1: 'Nunca perca uma corrida nova',
    benefit2: 'Atualizações em tempo real',
    cta: 'Permitir Notificações',
  },
  {
    id: 'camera',
    icon: <Camera className="w-9 h-9" strokeWidth={1.8} />,
    iconBg: 'bg-[#34C759]/10',
    iconColor: 'text-[#34C759]',
    buttonColor: 'bg-[#34C759]',
    buttonShadow: 'shadow-[0_4px_16px_rgba(52,199,89,0.35)]',
    title: 'Acesso à câmera',
    description: 'Para enviar sua foto de perfil e documentos durante o cadastro.',
    benefit1: 'Perfil verificado e confiável',
    benefit2: 'Envio rápido de documentos',
    cta: 'Permitir Câmera',
  },
]

export function PermissionOnboarding() {
  const [show, setShow] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [granted, setGranted] = useState<Record<PermissionStep, boolean>>({
    location: false,
    notification: false,
    camera: false,
    complete: true,
  })
  const [requesting, setRequesting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    checkAndShow()
  }, [])

  async function checkAndShow() {
    // Evita re-exibir se já foi feito onboarding
    try {
      const flag = localStorage.getItem('permissions_onboarded_v2')
      if (flag === 'true') return
    } catch {}

    // Espera 1.5s para não aparecer imediatamente ao abrir o app
    await new Promise(r => setTimeout(r, 1500))

    const results = await checkCurrentPermissions()

    // Determina o primeiro passo ainda não concedido
    const firstPending = STEPS.findIndex(s => !results[s.id])
    if (firstPending === -1) {
      // Tudo concedido — não exibe
      try { localStorage.setItem('permissions_onboarded_v2', 'true') } catch {}
      return
    }

    setGranted(results)
    setStepIndex(firstPending)
    setShow(true)
  }

  async function checkCurrentPermissions(): Promise<Record<PermissionStep, boolean>> {
    const result: Record<PermissionStep, boolean> = {
      location: false,
      notification: false,
      camera: false,
      complete: true,
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation')
        const locStatus = await Geolocation.checkPermissions()
        result.location = locStatus.location === 'granted' || locStatus.coarseLocation === 'granted'
      } catch { result.location = false }

      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')
        const pushStatus = await PushNotifications.checkPermissions()
        result.notification = pushStatus.receive === 'granted'
      } catch { result.notification = false }

      try {
        const { Camera } = await import('@capacitor/camera')
        const camStatus = await Camera.checkPermissions()
        result.camera = camStatus.camera === 'granted'
      } catch { result.camera = false }
    } else {
      // Web fallback
      try {
        const geo = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        result.location = geo.state === 'granted'
      } catch {}
      try {
        result.notification = 'Notification' in window && Notification.permission === 'granted'
      } catch {}
      result.camera = false // câmera no web só pede quando usa
    }

    return result
  }

  async function requestCurrent() {
    setRequesting(true)
    const step = STEPS[stepIndex]
    triggerHaptic('medium')

    try {
      if (Capacitor.isNativePlatform()) {
        await requestNative(step.id)
      } else {
        await requestWeb(step.id)
      }
    } finally {
      setRequesting(false)
    }
  }

  async function requestNative(id: PermissionStep) {
    if (id === 'location') {
      try {
        const { Geolocation } = await import('@capacitor/geolocation')
        const status = await Geolocation.requestPermissions({ permissions: ['location'] })
        if (status.location === 'granted' || status.coarseLocation === 'granted') {
          triggerHaptic('success')
          iosToast.success('Localização permitida')
          markGranted(id)
        } else {
          iosToast.error('Localização negada — você pode ativar em Ajustes')
          advanceStep()
        }
      } catch { advanceStep() }
    }

    if (id === 'notification') {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')
        const status = await PushNotifications.requestPermissions()
        if (status.receive === 'granted') {
          await PushNotifications.register()
          triggerHaptic('success')
          iosToast.success('Notificações permitidas')
          markGranted(id)
        } else {
          iosToast.error('Notificações negadas — você pode ativar em Ajustes')
          advanceStep()
        }
      } catch { advanceStep() }
    }

    if (id === 'camera') {
      try {
        const { Camera } = await import('@capacitor/camera')
        const status = await Camera.requestPermissions({ permissions: ['camera'] })
        if (status.camera === 'granted') {
          triggerHaptic('success')
          iosToast.success('Câmera permitida')
          markGranted(id)
        } else {
          iosToast.error('Câmera negada — você pode ativar em Ajustes')
          advanceStep()
        }
      } catch { advanceStep() }
    }
  }

  async function requestWeb(id: PermissionStep) {
    if (id === 'location') {
      try {
        await new Promise<void>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(() => resolve(), reject, { enableHighAccuracy: true })
        )
        triggerHaptic('success')
        iosToast.success('Localização permitida')
        markGranted(id)
      } catch {
        iosToast.error('Localização negada')
        advanceStep()
      }
    }

    if (id === 'notification') {
      try {
        const perm = await Notification.requestPermission()
        if (perm === 'granted') {
          triggerHaptic('success')
          iosToast.success('Notificações permitidas')
          markGranted(id)
        } else {
          advanceStep()
        }
      } catch { advanceStep() }
    }

    if (id === 'camera') {
      // Web: câmera só pede quando usa, avança direto
      advanceStep()
    }
  }

  function markGranted(id: PermissionStep) {
    setGranted(prev => ({ ...prev, [id]: true }))
    setTimeout(() => advanceStep(), 600)
  }

  function advanceStep() {
    const next = STEPS.findIndex((s, i) => i > stepIndex && !granted[s.id])
    if (next === -1) {
      finishOnboarding()
    } else {
      setStepIndex(next)
    }
  }

  function finishOnboarding() {
    setDone(true)
    try { localStorage.setItem('permissions_onboarded_v2', 'true') } catch {}
    setTimeout(() => setShow(false), 1800)
  }

  function skip() {
    triggerHaptic('light')
    try { localStorage.setItem('permissions_onboarded_v2', 'true') } catch {}
    setShow(false)
  }

  if (!show) return null

  const cfg = STEPS[stepIndex]

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className="w-full max-w-md mx-4 mb-8"
      >
        <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-[0_-4px_40px_rgba(0,0,0,0.3)] border border-black/[0.05] dark:border-white/[0.08] overflow-hidden">
          {/* Step indicators */}
          <div className="flex justify-center gap-1.5 pt-5 pb-0">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === stepIndex ? 'w-6 bg-[#007AFF]' : granted[s.id] ? 'w-3 bg-[#34C759]' : 'w-3 bg-neutral-200 dark:bg-neutral-700'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#34C759]/10 flex items-center justify-center mb-5">
                  <Check className="w-10 h-10 text-[#34C759]" strokeWidth={2.5} />
                </div>
                <h2 className="text-[26px] font-bold tracking-tight mb-2">Tudo pronto!</h2>
                <p className="text-[15px] text-neutral-500 dark:text-neutral-400">
                  Você está pronto para usar o Uppi.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={cfg.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ type: 'spring', stiffness: 400, damping: 38 }}
                className="p-8"
              >
                {/* Icon */}
                <div className={`w-[72px] h-[72px] rounded-[22px] ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center mb-5`}>
                  {cfg.icon}
                </div>

                {/* Title + description */}
                <h2 className="text-[26px] font-bold tracking-tight leading-tight mb-2 text-balance">
                  {cfg.title}
                </h2>
                <p className="text-[15px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                  {cfg.description}
                </p>

                {/* Benefits */}
                <div className="flex flex-col gap-2.5 mb-7">
                  {[cfg.benefit1, cfg.benefit2].map(b => (
                    <div key={b} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shrink-0`}>
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className="text-[14px] font-medium text-foreground">{b}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={requestCurrent}
                  disabled={requesting}
                  className={`w-full h-[54px] ${cfg.buttonColor} ${cfg.buttonShadow} text-white rounded-[16px] font-semibold text-[17px] tracking-tight active:scale-[0.98] transition-transform duration-100 disabled:opacity-60 mb-3`}
                >
                  {requesting ? 'Aguarde...' : cfg.cta}
                </button>
                <button
                  type="button"
                  onClick={skip}
                  className="w-full h-[46px] text-neutral-500 dark:text-neutral-400 font-medium text-[15px] active:opacity-60 transition-opacity"
                >
                  Agora não
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
