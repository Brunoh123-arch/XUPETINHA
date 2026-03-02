"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AppBackground } from "@/components/app-background"
import { UppiLogo } from "@/components/revolut-logo"

interface AuthShellProps {
  title: string
  subtitle: string
  onBack?: () => void
  children: React.ReactNode
  steps?: number
  currentStep?: number
}

export function AuthShell({
  title,
  subtitle,
  onBack,
  children,
  steps,
  currentStep,
}: AuthShellProps) {
  const router = useRouter()

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: "#000" }}
    >
      <AppBackground />

      {/* Back button */}
      <div className="relative z-10 px-5 pt-12 pb-2">
        <button
          type="button"
          onClick={onBack ?? (() => router.back())}
          className="flex items-center justify-center w-9 h-9 rounded-full active:scale-95 transition-transform"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Step indicator */}
      {steps && steps > 1 && (
        <div className="relative z-10 px-5 pt-2">
          <div className="flex gap-[5px]">
            {Array.from({ length: steps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className="flex-1 h-[2px] rounded-full overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: currentStep && s <= currentStep ? "100%" : "0%",
                    backgroundColor: "white",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logo + title */}
      <div className="relative z-10 px-5 pt-6 pb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center flex-shrink-0">
            <UppiLogo className="w-4 h-4 text-black" />
          </div>
          <span className="text-sm font-medium text-white/70 font-sans">Uppi</span>
        </div>
        <h1 className="text-[1.85rem] font-bold text-white leading-tight text-balance font-sans">
          {title}
        </h1>
        <p className="mt-2 text-[14px] text-white/45 leading-relaxed font-sans">
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  )
}
