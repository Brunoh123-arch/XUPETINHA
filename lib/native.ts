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
  const { App } = await import('@capacitor/app')
  // Tenta pop nativo; se não tiver histórico, minimiza o app (Android)
  try {
    App.exitApp()
  } catch {
    // iOS — não sai do app, apenas não faz nada
  }
}

export function nativePush(path: string): void {
  // Navegação SPA sem reload — usa history API que o Capacitor WebView entende
  if (typeof window !== 'undefined' && window.history) {
    window.history.pushState(null, '', path)
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
  }
}

// ─── URL base do app ──────────────────────────────────────────────────────────

export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.startsWith('capacitor://')) {
    return window.location.origin
  }
  return APP_URL
}
