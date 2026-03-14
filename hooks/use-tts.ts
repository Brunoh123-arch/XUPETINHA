'use client'

/**
 * Text-to-Speech para instruções turn-by-turn de navegação.
 *
 * Em plataformas nativas usa @capacitor-community/text-to-speech para
 * acesso ao engine TTS nativo do iOS (AVSpeechSynthesizer) e Android
 * (TextToSpeech). No browser usa Web Speech API como fallback.
 *
 * Língua padrão: pt-BR — mesmo padrão dos apps de corrida brasileiros.
 * A fila automática (queue=true) garante que instruções não se sobreponham.
 */

import { useCallback, useRef } from 'react'
import { Capacitor } from '@capacitor/core'

export interface TTSOptions {
  /** Taxa de fala — 0.5 (lento) a 2.0 (rápido). Padrão: 1.0 */
  rate?: number
  /** Volume — 0 a 1. Padrão: 1.0 */
  volume?: number
  /** Idioma BCP-47. Padrão: 'pt-BR' */
  lang?: string
}

const DEFAULT_OPTS: Required<TTSOptions> = {
  rate: 1.05,
  volume: 1.0,
  lang: 'pt-BR',
}

async function speakNative(text: string, opts: Required<TTSOptions>): Promise<void> {
  const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
  await TextToSpeech.speak({
    text,
    lang: opts.lang,
    rate: opts.rate,
    volume: opts.volume,
    category: 'ambient', // Não interrompe música/áudio externo no iOS
  })
}

export function useTTS(defaultOptions?: TTSOptions) {
  const opts = { ...DEFAULT_OPTS, ...defaultOptions }

  // Evita narrar a mesma instrução duas vezes seguidas
  const lastSpoken = useRef<string>('')

  const speak = useCallback(
    async (text: string, overrideOpts?: TTSOptions) => {
      if (!text || text === lastSpoken.current) return
      if (!Capacitor.isNativePlatform()) return
      lastSpoken.current = text

      try {
        await speakNative(text, { ...opts, ...overrideOpts })
      } catch {
        // TTS nunca deve quebrar o app
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const stop = useCallback(async () => {
    lastSpoken.current = ''
    if (!Capacitor.isNativePlatform()) return
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech')
      await TextToSpeech.stop()
    } catch {
      // Silently fail
    }
  }, [])

  return { speak, stop }
}
