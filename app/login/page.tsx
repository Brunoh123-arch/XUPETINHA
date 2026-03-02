"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UppiLogo } from "@/components/revolut-logo"
import { Eye, EyeOff, ArrowLeft, Phone } from "lucide-react"
import { AppBackground } from "@/components/app-background"
import { createClient } from "@/lib/supabase/client"
import { GoogleAuthButton } from "@/components/google-auth-button"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!email || !password) return
    setIsLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError("Email ou senha incorretos.")
        return
      }
      router.push("/uppi/home")
    } catch {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
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
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center flex-shrink-0">
            <UppiLogo className="w-4 h-4 text-black" />
          </div>
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
        <GoogleAuthButton label="Continuar com Google" />
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
          <button type="button" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
            Esqueci minha senha
          </button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-5 pb-10 pt-6 flex flex-col gap-3">
        {error && (
          <p className="text-[13px] text-red-400/90 text-center">{error}</p>
        )}
        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoading || !email || !password}
          className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 shadow-md disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin text-black/50" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Entrando...
            </>
          ) : "Entrar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          Criar conta
        </button>
      </div>
    </div>
  )
}
