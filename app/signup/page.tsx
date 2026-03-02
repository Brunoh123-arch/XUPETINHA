"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Phone, Check } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleAuthButton } from "@/components/google-auth-button"
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
const labelCls = "text-[11px] font-semibold uppercase tracking-widest text-white/35 font-sans"

const passwordRules = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Um número", test: (p: string) => /[0-9]/.test(p) },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordOk = passwordRules.every((r) => r.test(password))
  const step1Ok = name.trim().length > 1 && email.includes("@")

  const handleSignup = async () => {
    if (!passwordOk) return
    setIsLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : "/auth/callback",
        },
      })
      if (authError) {
        setError(authError.message)
        return
      }
      if (data.session) {
        router.push("/uppi/home")
      } else {
        router.push("/auth/sign-up-success")
      }
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
    <AuthShell
      title={step === 1 ? "Crie sua conta" : "Escolha uma senha"}
      subtitle={
        step === 1
          ? "Passo 1 de 2 — Suas informações básicas."
          : "Passo 2 de 2 — Crie uma senha segura."
      }
      steps={2}
      currentStep={step}
      onBack={step > 1 ? () => setStep(1) : undefined}
    >
      {/* Social — só passo 1 */}
      {step === 1 && (
        <div className="relative z-10 px-5 flex flex-col gap-3 mb-2">
          <GoogleAuthButton label="Cadastrar com Google" />
          <button
            type="button"
            onClick={() => router.push("/phone")}
            className="w-full flex items-center justify-center gap-3 py-[15px] rounded-2xl font-semibold text-[15px] text-white active:scale-[0.98] transition-transform duration-100 font-sans"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <Phone className="w-5 h-5 text-white/60 flex-shrink-0" />
            Cadastrar com Telefone
          </button>
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.09)" }} />
            <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest font-sans">ou</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.09)" }} />
          </div>
        </div>
      )}

      {/* Form */}
      <div className="relative z-10 flex-1 px-5 flex flex-col gap-4">
        {step === 1 ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Senha</label>
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

            {/* Regras */}
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
          </>
        )}
      </div>

      {/* CTA */}
      <div className="relative z-10 px-5 pb-10 pt-4 flex flex-col gap-3">
        {error && (
          <p className="text-[13px] text-red-400/90 text-center font-sans">{error}</p>
        )}
        <button
          type="button"
          disabled={step === 1 ? !step1Ok : (!passwordOk || isLoading)}
          onClick={() => {
            if (step === 1 && step1Ok) setStep(2)
            else if (step === 2 && passwordOk) handleSignup()
          }}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 shadow-md disabled:opacity-35 flex items-center justify-center gap-2 font-sans"
          style={{ backgroundColor: "white", color: "black" }}
        >
          {isLoading
            ? <><Spinner />Criando conta...</>
            : step === 1 ? "Continuar" : "Criar conta"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white font-sans"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          Ja tenho conta
        </button>
        {step === 1 && (
          <p className="text-center text-[11px] text-white/25 leading-relaxed pt-1 font-sans">
            Ao criar uma conta, você concorda com os nossos{" "}
            <Link href="/terms" className="text-white/45 underline underline-offset-2">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacy" className="text-white/45 underline underline-offset-2">
              Privacidade
            </Link>.
          </p>
        )}
      </div>
    </AuthShell>
  )
}
