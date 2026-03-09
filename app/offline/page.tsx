'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)
  const [checking, setChecking] = useState(false)

  const tryReconnect = useCallback(async () => {
    setChecking(true)
    try {
      // Pinga o servidor para confirmar conectividade real (nao apenas navigator.onLine)
      const res = await fetch('/api/health', { method: 'HEAD', cache: 'no-store' }).catch(() => null)
      if (res && res.ok) {
        setIsOnline(true)
        router.back()
      }
    } catch {
      // Ainda offline
    } finally {
      setChecking(false)
    }
  }, [router])

  useEffect(() => {
    // Tenta reconectar automaticamente quando o navegador detecta online
    const handleOnline = () => {
      setTimeout(tryReconnect, 500) // Pequeno delay para estabilizar
    }
    window.addEventListener('online', handleOnline)

    // Polling a cada 5 segundos enquanto na pagina
    const interval = setInterval(tryReconnect, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [tryReconnect])

  return (
    <div className="h-dvh bg-[#F2F2F7] dark:bg-black flex flex-col items-center justify-center px-8 text-center">
      {/* Icone animado */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-[28px] bg-white dark:bg-[#1C1C1E] flex items-center justify-center shadow-md shadow-black/10">
          <svg
            className="w-12 h-12 text-[#8E8E93]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
            />
          </svg>
        </div>

        {/* Indicador de status */}
        <div
          className={`
            absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-black
            transition-colors duration-500
            ${isOnline ? 'bg-[#34C759]' : checking ? 'bg-[#FF9500] animate-pulse' : 'bg-[#FF3B30]'}
          `}
        />
      </div>

      <h1 className="text-[28px] font-bold text-foreground text-balance mb-2 tracking-tight">
        Sem conexao
      </h1>
      <p className="text-[15px] text-[#8E8E93] leading-relaxed mb-2 text-pretty max-w-xs">
        Verifique sua conexao Wi-Fi ou dados moveis.
      </p>

      {/* Status de tentativa */}
      <p className="text-[13px] text-[#8E8E93] mb-8">
        {checking
          ? 'Verificando conexao...'
          : isOnline
          ? 'Conexao restaurada! Redirecionando...'
          : 'Tentando reconectar automaticamente'}
      </p>

      {/* Acoes */}
      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          disabled={checking}
          onClick={tryReconnect}
          className="
            w-full h-[52px]
            bg-[#007AFF] hover:bg-[#0051D5]
            disabled:opacity-60
            text-white text-[17px] font-semibold
            rounded-[14px]
            transition-all duration-200
            flex items-center justify-center gap-2
            shadow-lg shadow-[#007AFF]/20
          "
        >
          {checking ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verificando...
            </>
          ) : (
            'Tentar novamente'
          )}
        </button>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="
            w-full h-[52px]
            bg-white dark:bg-[#1C1C1E]
            border border-black/[0.08] dark:border-white/[0.08]
            text-foreground text-[17px] font-medium
            rounded-[14px]
            transition-all duration-200
          "
        >
          Ir para o inicio
        </button>
      </div>

      {/* Dica */}
      <p className="text-[12px] text-[#C7C7CC] mt-8 max-w-xs">
        Suas acoes serao sincronizadas automaticamente quando a conexao for restaurada.
      </p>

      {/* Safe area bottom */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}
