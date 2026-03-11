"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UppiLogo } from "@/components/revolut-logo"
import { ArrowLeft, Mail } from "lucide-react"
import { AppBackground } from "@/components/app-background"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const canSubmit = email.includes("@")

  async function handleSendReset() {
    if (!canSubmit) return
    setLoading(true)
    setError("")

    const supabase = createClient()
    // Usar URL de producao para evitar localhost nos emails
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
      : window.location.origin
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?type=recovery`,
    })

    if (resetError) {
      setError("Ocorreu um erro ao enviar o e-mail. Tente novamente.")
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ background: "#000" }}>
        <AppBackground />

        <div className="relative z-10 px-5 pt-12 pb-2">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex items-center justify-center w-9 h-9 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[2rem] font-bold text-white leading-tight text-balance mb-3">
            Verifique seu e-mail
          </h1>
          <p className="text-[15px] text-white/50 leading-relaxed max-w-xs">
            Enviamos um link de redefinição para{" "}
            <span className="text-white/80 font-medium">{email}</span>. Verifique sua caixa de entrada.
          </p>
        </div>

        <div className="relative z-10 px-5 pb-10 pt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 shadow-md"
          >
            Voltar para o login
          </button>
          <button
            type="button"
            onClick={() => { setSent(false); setEmail("") }}
            className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            Tentar outro e-mail
          </button>
        </div>
      </div>
    )
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
          Esqueceu sua senha?
        </h1>
        <p className="mt-2 text-[15px] text-white/50 leading-relaxed">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
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

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40">
            E-mail cadastrado
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            onKeyDown={(e) => e.key === "Enter" && handleSendReset()}
            className="w-full px-4 py-[15px] rounded-2xl bg-white/5 text-white placeholder:text-white/25 text-[15px] outline-none focus:ring-1 focus:ring-white/30 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-5 pb-10 pt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleSendReset}
          disabled={!canSubmit || loading}
          className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-all duration-100 shadow-md disabled:opacity-40"
        >
          {loading ? "Enviando..." : "Enviar link de redefinição"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          Voltar para o login
        </button>
      </div>
    </div>
  )
}
