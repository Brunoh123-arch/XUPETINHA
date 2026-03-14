'use client'

/**
 * Hook para controlar a Status Bar nativa via @capacitor/status-bar.
 *
 * Em plataformas nativas (iOS/Android) altera cor de fundo e estilo do texto
 * da status bar em tempo real. No web, é no-op silencioso.
 *
 * Estilos disponíveis:
 *   'dark'  → ícones escuros (barra clara / mapa/tela branca)
 *   'light' → ícones claros (barra escura / tela escura / mapa noturno)
 *
 * Exemplo:
 *   const { setStyle, setColor } = useStatusBar()
 *   // Na tela de mapa (fundo escuro):
 *   useEffect(() => { setStyle('light') }, [])
 *   // Na tela de home (fundo branco):
 *   useEffect(() => { setStyle('dark') }, [])
 */

import { useCallback } from 'react'
import { Capacitor } from '@capacitor/core'

export type StatusBarStyle = 'dark' | 'light'

async function applyStatusBarStyle(style: StatusBarStyle): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({
      style: style === 'dark' ? Style.Dark : Style.Light,
    })
  } catch {
    // Silently fail
  }
}

async function applyStatusBarColor(hexColor: string, darkIcons = true): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    // setBackgroundColor só existe no Android
    await StatusBar.setBackgroundColor({ color: hexColor })
    await StatusBar.setStyle({
      style: darkIcons ? Style.Dark : Style.Light,
    })
  } catch {
    // Silently fail — iOS não suporta setBackgroundColor
  }
}

async function applyStatusBarOverlay(overlay: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar } = await import('@capacitor/status-bar')
    await StatusBar.setOverlaysWebView({ overlay })
  } catch {
    // Silently fail
  }
}

export function useStatusBar() {
  const setStyle = useCallback((style: StatusBarStyle) => {
    applyStatusBarStyle(style)
  }, [])

  const setColor = useCallback((hexColor: string, darkIcons = true) => {
    applyStatusBarColor(hexColor, darkIcons)
  }, [])

  const setOverlay = useCallback((overlay: boolean) => {
    applyStatusBarOverlay(overlay)
  }, [])

  /** Modo mapa — barra transparente, ícones claros (texto branco) */
  const mapMode = useCallback(() => {
    applyStatusBarStyle('light')
    applyStatusBarOverlay(true)
  }, [])

  /** Modo tela normal — barra sólida, ícones escuros */
  const normalMode = useCallback(() => {
    applyStatusBarStyle('dark')
    applyStatusBarOverlay(false)
  }, [])

  return { setStyle, setColor, setOverlay, mapMode, normalMode }
}

// Standalone para uso fora de componentes React (ex: init-app.ts)
export { applyStatusBarStyle, applyStatusBarColor, applyStatusBarOverlay }
