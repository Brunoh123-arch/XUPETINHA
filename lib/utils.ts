import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Obtem a URL do site automaticamente.
 * Prioridade:
 * 1. NEXT_PUBLIC_SITE_URL (configuracao manual para dominio customizado)
 * 2. NEXT_PUBLIC_VERCEL_URL (automatico da Vercel em qualquer deploy)
 * 3. https://uppi.app (fallback fixo — app nativo nao expoe window.location)
 */
export function getSiteUrl(): string {
  // Dominio customizado configurado manualmente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  // URL automatica da Vercel (funciona em qualquer conta/projeto)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  
  // Fallback — app nativo usa sempre o dominio de producao
  return 'https://uppi.app'
}
