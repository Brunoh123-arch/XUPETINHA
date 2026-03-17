'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) {
        iosToast.error(error.message)
        return
      }
      setSent(true)
    } catch {
      iosToast.error('Erro ao enviar email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#F2F2F7] dark:bg-black flex flex-col">
      <header className="bg-white/80 dark:bg-black/80 ios-blur border-b border-black/[0.08] dark:border-white/[0.1] sticky top-0 z-30">
        <div className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full ios-press -ml-1">
            <svg className="w-6 h-6 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">Esqueci minha senha</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto w-full">
        {sent ? (
          <div className="text-center animate-ios-fade-up">
            <div className="w-20 h-20 rounded-[28px] bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <h2 className="text-[28px] font-bold text-foreground tracking-tight mb-3">Email enviado!</h2>
            <p className="text-[16px] text-muted-foreground leading-relaxed mb-2">
              Enviamos um link de redefinicao para
            </p>
            <p className="text-[16px] font-semibold text-foreground mb-8">{email}</p>
            <p className="text-[14px] text-muted-foreground mb-8">
              Verifique sua caixa de entrada e spam. O link expira em 1 hora.
            </p>
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="w-full h-[54px] rounded-[16px] bg-[#007AFF] text-white font-bold text-[17px] ios-press"
            >
              Voltar ao login
            </button>
          </div>
        ) : (
          <div className="w-full animate-ios-fade-up">
            <div className="w-20 h-20 rounded-[28px] bg-[#007AFF] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-[28px] font-bold text-foreground tracking-tight text-center mb-3">Redefinir senha</h2>
            <p className="text-[16px] text-muted-foreground text-center leading-relaxed mb-8">
              Informe seu email cadastrado e enviaremos um link para criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
                <div className="px-4 pt-3 pb-1">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  autoFocus
                  required
                  className="w-full px-4 pb-4 pt-1 bg-transparent text-[17px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full h-[54px] rounded-[16px] bg-[#007AFF] text-white font-bold text-[17px] ios-press disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Enviar link de redefinicao'
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full h-[48px] rounded-[16px] bg-transparent text-[#007AFF] font-semibold text-[17px] ios-press"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
