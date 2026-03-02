"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UppiLogo } from "@/components/revolut-logo"
import { Eye, EyeOff, ArrowLeft, Check, Phone } from "lucide-react"
import { AppBackground } from "@/components/app-background"
import { createClient } from "@/lib/supabase/client"
import { GoogleAuthButton } from "@/components/google-auth-button"

const requirements = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Um número", test: (p: string) => /[0-9]/.test(p) },
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordOk = requirements.every((r) => r.test(password))
  const step1Ok = name.trim().length > 0 && email.includes("@")
  const step2Ok = passwordOk

  const handleSignup = async () => {
    if (!step2Ok) return
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
      // Se sessão foi criada direto (email confirmation desabilitado)
      if (data.session) {
        router.push("/uppi/home")
      } else {
        router.push("/auth/sign-up-success")
      }
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
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="relative z-10 px-5 pt-2">
        <div className="flex gap-[5px]">
          {[1, 2].map((s) => (
            <div
              key={s}
              className="flex-1 h-[2px] rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: s <= step ? "100%" : "0%",
                  backgroundColor: "white",
                }}
              />
            </div>
          ))}
        </div>
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
          {step === 1 ? "Crie sua conta" : "Crie sua senha"}
        </h1>
        <p className="mt-2 text-[15px] text-white/50 leading-relaxed">
          {step === 1
            ? "Passo 1 de 2 — Suas informações básicas."
            : "Passo 2 de 2 — Escolha uma senha segura."}
        </p>
      </div>

      {/* Social signup — só no passo 1 */}
      {step === 1 && (
        <div className="relative z-10 px-5 flex flex-col gap-3 mb-2">
          <GoogleAuthButton label="Cadastrar com Google" />
          <button
            type="button"
            onClick={() => router.push("/phone")}
            className="w-full flex items-center justify-center gap-3 py-[15px] rounded-2xl font-semibold text-[15px] text-white active:scale-[0.98] transition-transform duration-100"
            style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Phone className="w-5 h-5 text-white/80" />
            Cadastrar com Telefone
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
            <span className="text-[12px] font-medium text-white/35 uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
          </div>
        </div>
      )}

      {/* Form */}
      <div className="relative z-10 flex-1 px-5 flex flex-col gap-4">
        {step === 1 ? (
          <>
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
                className="w-full px-4 py-[15px] rounded-2xl bg-white/5 text-white placeholder:text-white/25 text-[15px] outline-none focus:ring-1 focus:ring-white/30 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>

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
          </>
        ) : (
          <>
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

            {/* Password requirements */}
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
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-5 pb-10 pt-6 flex flex-col gap-3">
        {error && (
          <p className="text-[13px] text-red-400/90 text-center">{error}</p>
        )}
        <button
          type="button"
          disabled={step === 1 ? !step1Ok : (!step2Ok || isLoading)}
          onClick={() => {
            if (step === 1 && step1Ok) {
              setStep(2)
            } else if (step === 2 && step2Ok) {
              handleSignup()
            }
          }}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-all duration-100 shadow-md disabled:opacity-30 flex items-center justify-center gap-2"
          style={{ backgroundColor: "white", color: "black" }}
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin text-black/50" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Criando conta...
            </>
          ) : step === 1 ? "Continuar" : "Criar conta"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full py-[17px] rounded-full font-semibold text-[15px] tracking-wide active:scale-[0.98] transition-transform duration-100 text-white"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          Já tenho conta
        </button>

        {/* Links legais */}
        <p className="text-center text-[11px] text-white/30 leading-relaxed pt-1">
          Ao criar uma conta, você concorda com os nossos{" "}
          <Link href="/terms" className="text-white/50 underline underline-offset-2 hover:text-white/70 transition-colors">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="text-white/50 underline underline-offset-2 hover:text-white/70 transition-colors">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
