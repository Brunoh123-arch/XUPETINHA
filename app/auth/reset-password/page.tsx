'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { iosToast } from '@/lib/utils/ios-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase injeta a sessão via hash na URL após clicar no link de reset
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      iosToast.error('Senha deve ter pelo menos 8 caracteres')
      return
    }
    if (password !== confirm) {
      iosToast.error('As senhas nao conferem')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        iosToast.error(error.message)
        return
      }
      setDone(true)
      setTimeout(() => router.push('/uppi/home'), 2000)
    } catch {
      iosToast.error('Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3
  const strengthLabel = ['', 'Fraca', 'Media', 'Forte']
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-green-500']

  return (
    <div className="min-h-dvh bg-[#F2F2F7] dark:bg-black flex flex-col">
      <header className="bg-white/80 dark:bg-black/80 ios-blur border-b border-black/[0.08] dark:border-white/[0.1] sticky top-0 z-30">
        <div className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 flex items-center gap-3">
          <h1 className="text-[20px] font-bold text-foreground tracking-tight">Nova senha</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto w-full">
        {done ? (
          <div className="text-center animate-ios-fade-up">
            <div className="w-20 h-20 rounded-[28px] bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[28px] font-bold text-foreground tracking-tight mb-3">Senha redefinida!</h2>
            <p className="text-[16px] text-muted-foreground">Redirecionando para o app...</p>
          </div>
        ) : (
          <div className="w-full animate-ios-fade-up">
            <div className="w-20 h-20 rounded-[28px] bg-[#007AFF] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-[28px] font-bold text-foreground tracking-tight text-center mb-3">Criar nova senha</h2>
            <p className="text-[16px] text-muted-foreground text-center leading-relaxed mb-8">
              Escolha uma senha forte com pelo menos 8 caracteres.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nova senha */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
                <div className="px-4 pt-3 pb-1">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Nova senha</label>
                </div>
                <div className="flex items-center px-4 pb-4 pt-1 gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimo 8 caracteres"
                    autoComplete="new-password"
                    required
                    className="flex-1 bg-transparent text-[17px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground ios-press">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      }
                    </svg>
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-muted'}`} />
                      ))}
                    </div>
                    <p className={`text-[12px] font-semibold ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-green-500'}`}>
                      Senha {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
                <div className="px-4 pt-3 pb-1">
                  <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider">Confirmar senha</label>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 pb-4 pt-1 bg-transparent text-[17px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
                {confirm.length > 0 && (
                  <div className="px-4 pb-3">
                    <p className={`text-[12px] font-semibold ${password === confirm ? 'text-green-500' : 'text-red-500'}`}>
                      {password === confirm ? 'Senhas conferem' : 'Senhas nao conferem'}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 8 || password !== confirm}
                className="w-full h-[54px] rounded-[16px] bg-[#007AFF] text-white font-bold text-[17px] ios-press disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Salvar nova senha'
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
