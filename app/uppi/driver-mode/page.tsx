'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/utils/ios-haptics'
import { ArrowLeft, Car, Package, Clock, DollarSign, TrendingUp } from 'lucide-react'
import { iosToast } from '@/lib/utils/ios-toast'

export default function DriverModePage() {
  const router = useRouter()
  const [switching, setSwitching] = useState<'driver' | 'passenger' | null>(null)

  /**
   * Chama a API para trocar o modo antes de navegar.
   * Se nao tiver driver_profile, redireciona para o cadastro.
   */
  async function switchToDriver() {
    setSwitching('driver')
    haptics.impactMedium()
    try {
      const res = await fetch('/api/v1/driver/mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'driver' }),
      })
      const data = await res.json()

      if (res.status === 403 && data.code === 'NO_DRIVER_PROFILE') {
        iosToast.info('Cadastre-se como motorista primeiro.')
        router.push('/uppi/driver/register')
        return
      }

      if (res.status === 403 && data.code === 'NOT_VERIFIED') {
        iosToast.info('Seu cadastro esta em analise. Aguarde a verificacao.')
        router.push('/uppi/driver/register')
        return
      }

      if (!res.ok) {
        iosToast.error(data.error || 'Erro ao trocar modo')
        return
      }

      haptics.success()
      router.push('/uppi/driver')
    } catch {
      iosToast.error('Erro de conexao. Tente novamente.')
    } finally {
      setSwitching(null)
    }
  }

  async function switchToPassenger() {
    setSwitching('passenger')
    haptics.selection()
    try {
      await fetch('/api/v1/driver/mode', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'passenger' }),
      })
      router.push('/uppi/home')
    } catch {
      router.push('/uppi/home')
    } finally {
      setSwitching(null)
    }
  }

  const isBusy = switching !== null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F2F7] via-[#F9F9FB] to-[#FFFFFF] dark:from-black dark:via-[#0A0A0A] dark:to-[#111111] flex flex-col">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#34C759]/5 dark:bg-[#34C759]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#007AFF]/5 dark:bg-[#007AFF]/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* iOS Status Bar */}
      <div className="h-[env(safe-area-inset-top)]" />

      {/* Navigation Bar */}
      <header className="relative z-10 px-4 py-3 flex items-center backdrop-blur-xl bg-white/50 dark:bg-black/50 border-b border-black/[0.04] dark:border-white/[0.08]">
        <button
          onClick={() => { haptics.selection(); router.back() }}
          className="inline-flex items-center gap-2 text-[#007AFF] text-[17px] font-normal ios-press group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
          Voltar
        </button>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-8 pb-6">
        <div className="max-w-md mx-auto text-center mb-8 animate-ios-fade-up">
          <h1 className="text-[32px] font-bold text-foreground mb-3 tracking-[-0.8px]">
            Ganhe Dinheiro Dirigindo
          </h1>
          <p className="text-[15px] text-[#8E8E93] leading-relaxed">
            Seja seu proprio chefe e defina seus horarios
          </p>
        </div>

        {/* Benefits Card */}
        <div className="bg-gradient-to-br from-[#34C759] to-[#30D158] rounded-[24px] p-6 shadow-lg shadow-[#34C759]/20 mb-6 animate-ios-fade-up [animation-delay:100ms] opacity-0 [animation-fill-mode:forwards]">
          <h2 className="text-white text-[22px] font-bold mb-4">Vantagens</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white text-[15px]">Horario 100% flexivel</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white text-[15px]">Voce define seus precos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white text-[15px]">Taxas competitivas e justas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Options */}
      <div className="relative z-10 flex-1 px-6 space-y-4">
        <div className="max-w-md mx-auto space-y-3">
          {/* Motorista Card */}
          <button
            type="button"
            disabled={isBusy}
            onClick={switchToDriver}
            className="
              w-full group relative overflow-hidden
              bg-white/80 dark:bg-white/[0.03]
              backdrop-blur-xl
              border border-black/[0.08] dark:border-white/[0.08]
              hover:border-[#007AFF]/30
              rounded-[20px] p-5
              transition-all duration-200
              ios-press
              disabled:opacity-60
              animate-ios-fade-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]
            "
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-[16px] bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] flex items-center justify-center shadow-lg">
                {switching === 'driver' ? (
                  <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Car className="w-8 h-8 text-white" strokeWidth={2} />
                )}
              </div>

              <div className="flex-1 text-left">
                <h3 className="text-[17px] font-semibold text-foreground mb-1">Motorista</h3>
                <p className="text-[13px] text-[#8E8E93] leading-tight">
                  Aceite corridas e ganhe dinheiro
                </p>
              </div>

              <svg className="w-5 h-5 text-[#8E8E93] group-hover:text-[#007AFF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Entregador Card */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => { haptics.impactMedium(); router.push('/uppi/driver/register') }}
            className="
              w-full group relative overflow-hidden
              bg-white/80 dark:bg-white/[0.03]
              backdrop-blur-xl
              border border-black/[0.08] dark:border-white/[0.08]
              hover:border-[#FF9500]/30
              rounded-[20px] p-5
              transition-all duration-200
              ios-press
              disabled:opacity-60
              animate-ios-fade-up [animation-delay:300ms] opacity-0 [animation-fill-mode:forwards]
            "
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-[16px] bg-gradient-to-br from-[#FF9500] to-[#FF3B30] flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-white" strokeWidth={2} />
              </div>

              <div className="flex-1 text-left">
                <h3 className="text-[17px] font-semibold text-foreground mb-1">Entregador</h3>
                <p className="text-[13px] text-[#8E8E93] leading-tight">
                  Faca entregas e aumente sua renda
                </p>
              </div>

              <svg className="w-5 h-5 text-[#8E8E93] group-hover:text-[#FF9500] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 px-6 pb-8 space-y-3 animate-ios-fade-up [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
        <div className="max-w-md mx-auto space-y-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={switchToDriver}
            className="
              w-full h-[52px]
              bg-[#007AFF] hover:bg-[#0051D5]
              disabled:opacity-60
              text-white text-[17px] font-semibold
              rounded-[14px]
              transition-all duration-200
              ios-press
              shadow-lg shadow-[#007AFF]/20
              flex items-center justify-center gap-2
            "
          >
            {switching === 'driver' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Entrando no modo motorista...
              </>
            ) : (
              'Comecar Agora'
            )}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={switchToPassenger}
            className="
              w-full h-[52px]
              bg-white/80 dark:bg-white/[0.03]
              backdrop-blur-xl
              border border-black/[0.08] dark:border-white/[0.08]
              disabled:opacity-60
              text-foreground text-[17px] font-medium
              rounded-[14px]
              transition-all duration-200
              ios-press
            "
          >
            {switching === 'passenger' ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Voltar para Modo Passageiro'
            )}
          </button>
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}
