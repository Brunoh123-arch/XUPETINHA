"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Phone } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleAuthButton } from "@/components/google-auth-button"
import { createClient } from "@/lib/supabase/client"

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

const inputCls =
  "w-full px-4 py-[15px] rounded-2xl text-white placeholder:text-white/25 text-[15px] outline-none focus:ring-1 focus:ring-white/25 transition-all font-sans"
const inputStyle = {
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
}

const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-white/35 font-sans"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const canSubmit = email.includes("@") && password.length >= 6

  const handleLogin = async () => {
    if (!canSubmit) return
    setIsLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) {
        setError("E-mail ou senha incorretos.")
        return
      }
      router.push("/uppi/home")
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Variáveis de ambiente")) {
        setError("Configuração do servidor incompleta. Contate o suporte.")
      } else {
        setError("Erro inesperado. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell title="Bem-vindo de volta" subtitle="Entre na sua conta para continuar.">
      {/* Social */}
      <div className="relative z-10 px-5 flex flex-col gap-3 mb-2">
        <GoogleAuthButton label="Continuar com Google" />
        <button
          type="button"
          onClick={() => router.push("/phone")}
          className="w-full flex items-center justify-center gap-3 py-[15px] rounded-2xl font-semibold text-[15px] text-white active:scale-[0.98] transition-transform duration-100 font-sans"
          style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
        >
          <Phone className="w-5 h-5 text-white/60 flex-shrink-0" />
          Continuar com Telefone
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.09)" }} />
          <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest font-sans">ou</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.09)" }} />
        </div>
      </div>

      {/* Form */}
      <div className="relative z-10 flex-1 px-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="seu@email.com"
            autoComplete="email"
            className={inputCls}
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Senha</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`${inputCls} pr-12`}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-[13px] text-white/40 hover:text-white/65 transition-colors font-sans"
          >
            Esqueci minha senha
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-5 pb-10 pt-4 flex flex-col gap-3">
        {error && (
          <p className="text-[13px] text-red-400/90 text-center font-sans">{error}</p>
        )}
        <button
          type="button"
          onClick={handleLogin}
          disabled={!canSubmit || isLoading}
          className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 shadow-md disabled:opacity-35 flex items-center justify-center gap-2 font-sans"
        >
          {isLoading ? <><Spinner />Entrando...</> : "Entrar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white font-sans"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          Criar conta
        </button>
      </div>
    </AuthShell>
  )
}
