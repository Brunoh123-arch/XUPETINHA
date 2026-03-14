"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UppiLogo } from "@/components/revolut-logo"
import { Eye, EyeOff, ArrowLeft, Phone } from "lucide-react"
import { AppBackground } from "@/components/app-background"
import { createClient } from "@/lib/supabase/client"
import { getSiteUrl } from "@/lib/utils"
import { useBiometric } from "@/hooks/use-biometric"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [biometricLoading, setBiometricLoading] = useState(false)
  const biometric = useBiometric()

  const canSubmit = email.includes("@") && password.length >= 6

  // Preenche o email salvo quando biometria está disponível
  useEffect(() => {
    if (biometric.enrolled && biometric.savedEmail) {
      setEmail(biometric.savedEmail)
    }
  }, [biometric.enrolled, biometric.savedEmail])

  async function handleLogin() {
    if (!canSubmit) return
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Ocorreu um erro. Tente novamente."
      )
      setLoading(false)
      return
    }

    // Verificar tipo de usuário para redirecionar corretamente
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
      .single()

    if (profile?.user_type === 'driver') {
      router.push('/uppi/driver')
    } else {
      router.push('/uppi/home')
    }
    router.refresh()
  }

  async function handleBiometricLogin() {
    setBiometricLoading(true)
    setError("")
    try {
      const savedEmail = await biometric.authenticate()
      if (!savedEmail) {
        setError("Autenticação biométrica cancelada.")
        return
      }
      // Login sem senha — usa o token de sessão já salvo no dispositivo
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single()
        if (profile?.user_type === 'driver') {
          router.push('/uppi/driver')
        } else {
          router.push('/uppi/home')
        }
      } else {
        setError("Sessão expirada. Entre com sua senha.")
      }
    } finally {
      setBiometricLoading(false)
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback`,
      },
    })
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: "#000" }}>
      <AppBackground />

      {/* Back button */}
      <div className="relative z-10 px-5 pt-12 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Logo + title */}
      <div className="relative z-10 px-5 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <UppiLogo size={40} />
          <span className="text-sm font-medium text-white/80">Uppi</span>
        </div>
        <h1 className="text-[2rem] font-bold text-white leading-tight text-balance">
          Bem-vindo de volta
        </h1>
        <p className="mt-2 text-[15px] text-white/50 leading-relaxed">
          Entre na sua conta para continuar.
        </p>
      </div>

      {/* Social login */}
      <div className="relative z-10 px-5 flex flex-col gap-3 mb-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-[15px] rounded-2xl font-semibold text-[15px] text-white active:scale-[0.98] transition-transform duration-100"
          style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>
        <button
          type="button"
          onClick={() => router.push("/phone")}
          className="w-full flex items-center justify-center gap-3 py-[15px] rounded-2xl font-semibold text-[15px] text-white active:scale-[0.98] transition-transform duration-100"
          style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Phone className="w-5 h-5 text-white/80" />
          Continuar com Telefone
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
          <span className="text-[12px] font-medium text-white/35 uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
        </div>
      </div>

      {/* Form */}
      <div className="relative z-10 flex-1 px-5 flex flex-col gap-4">

        {/* Error message */}
        {error && (
          <div
            className="px-4 py-3 rounded-2xl text-[13px] text-red-400"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {error}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            className="w-full px-4 py-[15px] rounded-2xl bg-white/5 text-white placeholder:text-white/25 text-[15px] outline-none focus:ring-1 focus:ring-white/30 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-[15px] pr-12 rounded-2xl bg-white/5 text-white placeholder:text-white/25 text-[15px] outline-none focus:ring-1 focus:ring-white/30 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[13px] text-white/40 hover:text-white/70 transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-5 pb-10 pt-6 flex flex-col gap-3">
        {/* Botao biometrico — exibido apenas se disponivel e ativado */}
        {biometric.available && biometric.enrolled && (
          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={biometricLoading}
            className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-all duration-100 flex items-center justify-center gap-2.5 text-white disabled:opacity-50"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {biometricLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : biometric.biometricType === 'face_id' ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
                <circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/>
                <path d="M9 15c.83 1 2.17 1.5 3 1.5s2.17-.5 3-1.5"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 10a2 2 0 00-2 2c0 1.1.9 2 2 2s2-.9 2-2a2 2 0 00-2-2z"/>
                <path d="M12 4a8 8 0 00-7.4 5M12 4a8 8 0 017.4 5M4.6 15A8 8 0 0012 20a8 8 0 007.4-5"/>
                <path d="M12 7a5 5 0 00-4.6 3M12 7a5 5 0 014.6 3M7.4 17A5 5 0 0012 19a5 5 0 004.6-2"/>
              </svg>
            )}
            {biometricLoading
              ? "Verificando..."
              : biometric.biometricType === 'face_id'
                ? "Entrar com Face ID"
                : "Entrar com Digital"}
          </button>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={!canSubmit || loading}
          className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-all duration-100 shadow-md disabled:opacity-40"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/auth/selection")}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          Criar conta
        </button>
      </div>
    </div>
  )
}
