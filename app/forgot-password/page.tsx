"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, CheckCircle2 } from "lucide-react"
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

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const canSubmit = email.includes("@") && email.includes(".")

  const handleReset = async () => {
    if (!canSubmit) return
    setIsLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/reset-password`
          : "/auth/reset-password"
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (authError) {
        setError("Erro ao enviar e-mail. Verifique o endereço e tente novamente.")
        return
      }
      setSent(true)
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

  if (sent) {
    return (
      <AuthShell
        title="E-mail enviado"
        subtitle="Verifique sua caixa de entrada."
      >
        <div className="relative z-10 flex-1 px-5 flex flex-col items-center justify-center gap-5 pb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div className="text-center flex flex-col gap-2">
            <p className="text-[15px] text-white/80 font-sans leading-relaxed">
              Enviamos um link de redefinição para
            </p>
            <p className="text-[15px] text-white font-semibold font-sans">{email}</p>
            <p className="text-[13px] text-white/40 font-sans leading-relaxed mt-1">
              Clique no link no e-mail para criar uma nova senha. O link expira em 1 hora.
            </p>
          </div>
        </div>

        <div className="relative z-10 px-5 pb-10 pt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 shadow-md font-sans"
          >
            Voltar ao login
          </button>
          <button
            type="button"
            onClick={() => { setSent(false); setEmail("") }}
            className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white font-sans"
            style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          >
            Tentar outro e-mail
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Esqueci minha senha"
      subtitle="Informe seu e-mail e enviaremos um link para redefinir sua senha."
    >
      <div className="relative z-10 flex-1 px-5 flex flex-col gap-5">
        {/* Ícone decorativo */}
        <div
          className="self-start w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
        >
          <Mail className="w-6 h-6 text-white/70" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-white/35 font-sans">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReset()}
            placeholder="seu@email.com"
            autoComplete="email"
            className={inputCls}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="relative z-10 px-5 pb-10 pt-4 flex flex-col gap-3">
        {error && (
          <p className="text-[13px] text-red-400/90 text-center font-sans">{error}</p>
        )}
        <button
          type="button"
          onClick={handleReset}
          disabled={!canSubmit || isLoading}
          className="w-full py-[17px] rounded-full bg-white text-black font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 shadow-md disabled:opacity-35 flex items-center justify-center gap-2 font-sans"
        >
          {isLoading ? <><Spinner />Enviando...</> : "Enviar link"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white font-sans"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          Voltar ao login
        </button>
      </div>
    </AuthShell>
  )
}
