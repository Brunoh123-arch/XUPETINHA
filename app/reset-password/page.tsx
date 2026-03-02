"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UppiLogo } from "@/components/revolut-logo"
import { Eye, EyeOff, Check } from "lucide-react"
import { AppBackground } from "@/components/app-background"
import { createClient } from "@/lib/supabase/client"

const requirements = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Um número", test: (p: string) => /[0-9]/.test(p) },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)

  const passwordOk = requirements.every((r) => r.test(password))
  const confirmOk = password === confirm && confirm.length > 0
  const canSubmit = passwordOk && confirmOk

  // Supabase sends the session via hash fragment after the user clicks the email link.
  // We need to wait for it to be processed.
  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true)
      }
    })

    // If already in a session (e.g. PKCE flow), allow immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleReset() {
    if (!canSubmit) return
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError("Não foi possível redefinir a senha. O link pode ter expirado.")
      setLoading(false)
      return
    }

    router.push("/login")
  }

  if (!ready) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: "#000" }}>
        <AppBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin"
          />
          <p className="text-white/50 text-[14px]">Verificando link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: "#000" }}>
      <AppBackground />

      {/* Logo + title */}
      <div className="relative z-10 px-5 pt-14 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center flex-shrink-0">
            <UppiLogo className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-medium text-white/80">Uppi</span>
        </div>
        <h1 className="text-[2rem] font-bold text-white leading-tight text-balance">
          Nova senha
        </h1>
        <p className="mt-2 text-[15px] text-white/50 leading-relaxed">
          Escolha uma senha segura para sua conta.
        </p>
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

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Nova senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
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

        {/* Requirements */}
        <div className="flex flex-col gap-2 pt-1">
          {requirements.map((r) => {
            const ok = r.test(password)
            return (
              <div key={r.label} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{ backgroundColor: ok ? "white" : "rgba(255,255,255,0.1)" }}
                >
                  {ok && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                </div>
                <span
                  className="text-[13px] transition-colors duration-200"
                  style={{ color: ok ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)" }}
                >
                  {r.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Confirmar senha
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-4 py-[15px] pr-12 rounded-2xl bg-white/5 text-white placeholder:text-white/25 text-[15px] outline-none focus:ring-1 focus:ring-white/30 transition-all"
              style={{
                border: confirm.length > 0 && !confirmOk
                  ? "1px solid rgba(239,68,68,0.5)"
                  : "1px solid rgba(255,255,255,0.1)"
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirm.length > 0 && !confirmOk && (
            <p className="text-[12px] text-red-400/80">As senhas não coincidem.</p>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-5 pb-10 pt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={!canSubmit || loading}
          className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-all duration-100 shadow-md disabled:opacity-40"
        >
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
      </div>
    </div>
  )
}
