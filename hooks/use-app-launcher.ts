'use client'

import { useCallback } from 'react'
import { Capacitor } from '@capacitor/core'

/**
 * Hook para abrir aplicativos externos nativamente via @capacitor/app-launcher.
 *
 * Prioridade de abertura de mapas:
 *   1. Waze (se instalado) — preferido por motoristas no Brasil
 *   2. Google Maps (se instalado)
 *   3. Apple Maps no iOS (sempre disponível)
 *   4. Fallback: abre no browser via @capacitor/browser
 *
 * Não usa window.open() — 100% nativo.
 */
export function useAppLauncher() {
  /**
   * Verifica se um app está instalado pelo scheme URI.
   */
  const canOpenApp = useCallback(async (url: string): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false

    try {
      const { AppLauncher } = await import('@capacitor/app-launcher')
      const { value } = await AppLauncher.canOpenUrl({ url })
      return value
    } catch {
      return false
    }
  }, [])

  /**
   * Abre navegação turn-by-turn para um destino.
   * Tenta Waze > Google Maps > Apple Maps > Browser.
   *
   * @param lat        Latitude do destino
   * @param lng        Longitude do destino
   * @param label      Nome do local (exibido no app de mapas)
   */
  const openNavigation = useCallback(async (
    lat: number,
    lng: number,
    label?: string,
  ): Promise<void> => {
    const platform = Capacitor.getPlatform()
    const encodedLabel = encodeURIComponent(label ?? 'Destino')

    if (Capacitor.isNativePlatform()) {
      const { AppLauncher } = await import('@capacitor/app-launcher')

      // 1. Tentar Waze
      const wazeUrl = `waze://?ll=${lat},${lng}&navigate=yes`
      const hasWaze = await canOpenApp(wazeUrl)
      if (hasWaze) {
        await AppLauncher.openUrl({ url: wazeUrl })
        return
      }

      // 2. Tentar Google Maps nativo
      const gmapsScheme = platform === 'ios'
        ? `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`
        : `google.navigation:q=${lat},${lng}`
      const hasGmaps = await canOpenApp(gmapsScheme)
      if (hasGmaps) {
        await AppLauncher.openUrl({ url: gmapsScheme })
        return
      }

      // 3. Apple Maps (iOS — sempre disponível)
      if (platform === 'ios') {
        await AppLauncher.openUrl({
          url: `maps://?daddr=${lat},${lng}&dirflg=d`,
        })
        return
      }
    }

    // 4. Fallback: abre Google Maps no browser nativo
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: fallbackUrl, presentationStyle: 'popover' })
  }, [canOpenApp])

  /**
   * Abre o WhatsApp com uma mensagem pré-preenchida para o número informado.
   * Formato esperado: '5511999990000' (com DDI sem +)
   *
   * @param phone   Número no formato internacional sem '+'
   * @param message Texto pré-preenchido (opcional)
   */
  const openWhatsApp = useCallback(async (
    phone: string,
    message?: string,
  ): Promise<void> => {
    const clean = phone.replace(/\D/g, '')
    const text = message ? encodeURIComponent(message) : ''
    const waUrl = `whatsapp://send?phone=${clean}&text=${text}`

    if (Capacitor.isNativePlatform()) {
      const hasWhatsApp = await canOpenApp(waUrl)
      if (hasWhatsApp) {
        const { AppLauncher } = await import('@capacitor/app-launcher')
        await AppLauncher.openUrl({ url: waUrl })
        return
      }
    }

    // Fallback web
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({
      url: `https://wa.me/${clean}?text=${text}`,
      presentationStyle: 'popover',
    })
  }, [canOpenApp])

  /**
   * Liga para um número de telefone.
   * Usa scheme tel: que o AppLauncher abre no discador nativo.
   */
  const callPhone = useCallback(async (phone: string): Promise<void> => {
    const clean = phone.replace(/\D/g, '')
    const telUrl = `tel:${clean}`

    if (Capacitor.isNativePlatform()) {
      const { AppLauncher } = await import('@capacitor/app-launcher')
      await AppLauncher.openUrl({ url: telUrl })
    } else {
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url: telUrl })
    }
  }, [])

  return {
    openNavigation,
    openWhatsApp,
    callPhone,
    canOpenApp,
  }
}
