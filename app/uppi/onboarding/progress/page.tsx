'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, CheckCircle2, Circle, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingStep {
  id: string
  step_name: string
  completed: boolean
  skipped: boolean
  completed_at: string | null
}

const STEP_META: Record<string, { label: string; desc: string; route: string; icon: string }> = {
  profile_photo:     { label: 'Foto de perfil',        desc: 'Adicione uma foto para os motoristas te reconhecerem', route: '/uppi/profile', icon: '📸' },
  phone_verified:    { label: 'Verificar telefone',     desc: 'Confirme seu número de celular via SMS', route: '/uppi/settings/phone', icon: '📱' },
  payment_method:    { label: 'Forma de pagamento',     desc: 'Adicione um cartão ou configure o PIX', route: '/uppi/payments', icon: '💳' },
  first_ride:        { label: 'Primeira corrida',       desc: 'Solicite sua primeira corrida com a Uppi', route: '/uppi/home', icon: '🚗' },
  rate_driver:       { label: 'Avaliar motorista',      desc: 'Avalie sua primeira experiência', route: '/uppi/history', icon: '⭐' },
  save_home:         { label: 'Salvar endereço de casa',desc: 'Agilize suas próximas corridas', route: '/uppi/favorites', icon: '🏠' },
  emergency_contact: { label: 'Contato de emergência', desc: 'Adicione alguém para ser notificado em emergências', route: '/uppi/sos', icon: '🆘' },
  notifications:     { label: 'Ativar notificações',   desc: 'Receba alertas de promoções e corridas', route: '/uppi/notifications/settings', icon: '🔔' },
}

export default function OnboardingProgressPage() {
  const router = useRouter()
  const supabase = createClient()
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('onboarding_steps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      setSteps(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  const completed = steps.filter(s => s.completed).length
  const total = steps.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  async function handleSkip(id: string) {
    await supabase.from('onboarding_steps').update({ skipped: true }).eq('id', id)
    setSteps(prev => prev.map(s => s.id === id ? { ...s, skipped: true } : s))
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Configuração da conta</h1>
            <p className="text-xs text-muted-foreground">{completed} de {total} etapas concluídas</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-5">
        {/* Barra de progresso */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-end justify-between mb-3">
            <p className="font-semibold text-foreground">Seu progresso</p>
            <span className="text-3xl font-bold text-primary">{pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <p className="text-sm text-green-600 font-medium mt-3 text-center">
              Conta completamente configurada!
            </p>
          )}
        </div>

        {/* Lista de etapas */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))
        ) : (
          <div className="space-y-3">
            {steps.map(step => {
              const meta = STEP_META[step.step_name]
              if (!meta) return null
              const isDone = step.completed
              const isSkipped = step.skipped && !isDone

              return (
                <div
                  key={step.id}
                  className={`bg-card border rounded-xl p-4 flex items-center gap-3 transition-opacity ${
                    isSkipped ? 'opacity-50 border-border' : isDone ? 'border-primary/30' : 'border-border'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {meta.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{meta.desc}</p>
                    {isDone && step.completed_at && (
                      <p className="text-xs text-primary mt-0.5">
                        Concluído em {new Date(step.completed_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : isSkipped ? (
                      <SkipForward className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-muted-foreground"
                          onClick={() => handleSkip(step.id)}
                        >
                          Pular
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 px-3 text-xs"
                          onClick={() => router.push(meta.route)}
                        >
                          Fazer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Botao continuar */}
        {pct < 100 && !loading && (
          <Button
            className="w-full"
            onClick={() => {
              const next = steps.find(s => !s.completed && !s.skipped)
              if (next) {
                const meta = STEP_META[next.step_name]
                if (meta) router.push(meta.route)
              }
            }}
          >
            Continuar configuração
          </Button>
        )}
      </div>
    </div>
  )
}
