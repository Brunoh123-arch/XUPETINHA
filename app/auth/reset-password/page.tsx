"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { createClient } from "@/lib/supabase/client"

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

const passwordRules = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Um número", test: (p: string) => /[0-9]/.test(p) },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)

  const passwordOk = passwordRules.every((r) => r.test(password))

  useEffect(() => {
    // Verifica se tem sessão válida vinda do link de reset
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
      } else {
        router.replace("/forgot-password")
      }
    })
  }, [router])

  const handleReset = async () => {
    if (!passwordOk) return
    setIsLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError("Erro ao redefinir senha. Tente novamente.")
        return
      }
      router.push("/login?reset=success")
    } catch {
      setError("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <Spinner />
      </div>
    )
  }

  return (
    <AuthShell
      title="Nova senha"
      subtitle="Escolha uma senha segura para sua conta."
    >
      <div className="relative z-10 flex-1 px-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35 font-sans">
            Nova senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
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

        <div className="flex flex-col gap-2.5 pt-1">
          {passwordRules.map((r) => {
            const ok = r.test(password)
            return (
              <div key={r.label} className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{ backgroundColor: ok ? "white" : "rgba(255,255,255,0.1)" }}
                >
                  {ok && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                </div>
                <span
                  className="text-[13px] transition-colors duration-200 font-sans"
                  style={{ color: ok ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}
                >
                  {r.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative z-10 px-5 pb-10 pt-4 flex flex-col gap-3">
        {error && (
          <p className="text-[13px] text-red-400/90 text-center font-sans">{error}</p>
        )}
        <button
          type="button"
          onClick={handleReset}
          disabled={!passwordOk || isLoading}
          className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 shadow-md disabled:opacity-35 flex items-center justify-center gap-2 font-sans"
        >
          {isLoading ? <><Spinner />Salvando...</> : "Salvar nova senha"}
        </button>
      </div>
    </AuthShell>
  )
}
