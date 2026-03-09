'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface VoiceAssistantOptions {
  onResult?: (transcript: string) => void
  onCommand?: (command: VoiceCommand) => void
  onError?: (error: string) => void
  continuous?: boolean
  interimResults?: boolean
}

export interface VoiceCommand {
  type: 'ride_request' | 'navigate' | 'settings' | 'unknown'
  destination?: string
  origin?: string
  raw: string
}

export function useVoiceAssistant(options: VoiceAssistantOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (!SpeechRecognition) {
      options.onError?.('Speech Recognition não é suportado neste navegador')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = options.continuous ?? false
    recognition.interimResults = options.interimResults ?? true
    recognition.maxAlternatives = 1

    recognition.onstart = () => { setIsListening(true) }

    recognition.onresult = (event: any) => {
      const current = event.resultIndex
      const transcriptText = event.results[current][0].transcript
      setTranscript(transcriptText)
      options.onResult?.(transcriptText)

      if (event.results[current].isFinal) {
        const command = parseVoiceCommand(transcriptText)
        options.onCommand?.(command)
      }
    }

    recognition.onerror = (event: any) => {
      setIsListening(false)
      let errorMessage = 'Erro no reconhecimento de voz'
      if (event.error === 'no-speech') errorMessage = 'Nenhuma fala detectada'
      else if (event.error === 'audio-capture') errorMessage = 'Microfone não encontrado'
      else if (event.error === 'not-allowed') errorMessage = 'Permissão de microfone negada'
      options.onError?.(errorMessage)
    }

    recognition.onend = () => { setIsListening(false) }

    recognitionRef.current = recognition

    return () => { recognitionRef.current?.stop() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      options.onError?.('Speech Recognition não disponível')
      return
    }
    try {
      setTranscript('')
      recognitionRef.current.start()
    } catch {
      options.onError?.('Erro ao iniciar reconhecimento de voz')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  return { isListening, isSupported, transcript, startListening, stopListening }
}

function parseVoiceCommand(text: string): VoiceCommand {
  const lowerText = text.toLowerCase().trim()

  const ridePatterns = [
    /(?:ir|vou|quero ir|me leva|leva|chamar corrida|pedir corrida|solicitar corrida|corrida).*(?:para|pro|pra|até|em)\s+(.+)/i,
    /corrida.*(?:para|pro|pra|até|em)\s+(.+)/i,
    /(?:para|pro|pra)\s+(.+)/i,
  ]

  for (const pattern of ridePatterns) {
    const match = text.match(pattern)
    if (match) return { type: 'ride_request', destination: match[1]?.trim(), raw: text }
  }

  if (lowerText.includes('voltar') || lowerText.includes('retornar')) {
    return { type: 'navigate', raw: text }
  }

  if (lowerText.includes('configurações') || lowerText.includes('configuracao') || lowerText.includes('ajustes')) {
    return { type: 'settings', raw: text }
  }

  return { type: 'unknown', raw: text }
}
