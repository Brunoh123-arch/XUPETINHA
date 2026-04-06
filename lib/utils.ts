import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Obtem a URL do site automaticamente.
 * Prioridade:
 * 1. NEXT_PUBLIC_SITE_URL (configuracao manual para dominio customizado)
 * 2. window.location.origin (funciona em qualquer ambiente de browser — preview, dev, producao)
 * 3. NEXT_PUBLIC_VERCEL_URL (automatico da Vercel em SSR)
 * 4. https://uppi.app (fallback fixo para app nativo)
 */
export function getSiteUrl(): string {
  // Dominio customizado configurado manualmente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // No browser, usa a origem real da janela — funciona em qualquer ambiente
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // No servidor (SSR), usa a URL da Vercel se disponivel
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  // Fallback para app nativo / producao
  return 'https://uppi.app'
}
