/**
 * lib/native.ts
 *
 * Helpers nativos centrais — substitutos de:
 *   - navigator.share / navigator.clipboard
 *   - window.history.back()
 *   - window.open()
 *   - window.location.href (tel: / mailto:)
 *
 * Todos os imports de plugins Capacitor são dinâmicos para evitar
 * bundle overhead em builds Next.js (SSR).
 */

const APP_URL = 'https://uppi.app'

// ─── Share ────────────────────────────────────────────────────────────────────

interface ShareOptions {
  title?: string
  text?: string
  url?: string
  dialogTitle?: string
}

export async function nativeShare(options: ShareOptions): Promise<void> {
  const { Share } = await import('@capacitor/share')
  await Share.share({
    title: options.title,
    text: options.text,
    url: options.url,
    dialogTitle: options.dialogTitle,
  })
}

// ─── Clipboard ────────────────────────────────────────────────────────────────

export async function nativeCopy(text: string): Promise<void> {
  const { Clipboard } = await import('@capacitor/clipboard')
  await Clipboard.write({ string: text })
}

// ─── Browser (links externos, tel:, mailto:) ──────────────────────────────────

export async function nativeOpenUrl(url: string): Promise<void> {
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url, presentationStyle: 'popover' })
}

export async function nativeCall(phone: string): Promise<void> {
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url: `tel:${phone}` })
}

export async function nativeEmail(email: string): Promise<void> {
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url: `mailto:${email}` })
}

// ─── Navegação / Histórico ────────────────────────────────────────────────────

export async function nativeBack(): Promise<void> {
  if (typeof window === 'undefined') return

  // Se existe histórico de navegação, vai para a tela anterior
  if (window.history && window.history.length > 1) {
    window.history.back()
    return
  }

  // Sem histórico no Android: minimiza o app (comportamento esperado pelo usuário)
  // No iOS o app nunca sai — apenas não faz nada se não houver histórico
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.getPlatform() === 'android') {
      const { App } = await import('@capacitor/app')
      await App.minimizeApp()
    }
  } catch {
    // Fallback seguro
  }
}

export function nativePush(path: string): void {
  // Delega ao event bus que o layout.tsx escuta — aciona router.push() real do Next.js
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('capacitor:navigate', { detail: { path } }))
  }
}

// ─── URL base do app ──────────────────────────────────────────────────────────

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.startsWith('capacitor://')) {
    return window.location.origin
  }
  return APP_URL
}
