'use client'

import { useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'

export type BiometricType = 'face_id' | 'touch_id' | 'fingerprint' | 'none'

interface BiometricState {
  available: boolean
  biometricType: BiometricType
  enrolled: boolean
  savedEmail: string | null
}

const BIOMETRIC_EMAIL_KEY = 'uppi_biometric_email'
const BIOMETRIC_ENABLED_KEY = 'uppi_biometric_enabled'

/**
 * Hook para autenticação biométrica nativa.
 * Usa @capacitor-community/biometric-auth no Android/iOS.
 * As credenciais (email) ficam no SecureStorage nativo.
 */
export function useBiometric() {
  const [state, setState] = useState<BiometricState>({
    available: false,
    biometricType: 'none',
    enrolled: false,
    savedEmail: null,
  })

  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    checkAvailability()
  }, [])

  async function checkAvailability() {
    if (!isNative) return

    try {
      const { BiometricAuth } = await import('@capacitor-community/biometric-auth')
      const result = await BiometricAuth.checkBiometry()

      let biometricType: BiometricType = 'none'
      if (result.isAvailable) {
        const platform = Capacitor.getPlatform()
        if (platform === 'ios') {
          // BiometryType: 1 = TouchID, 2 = FaceID
          biometricType = result.biometryType === 2 ? 'face_id' : 'touch_id'
        } else {
          biometricType = 'fingerprint'
        }
      }

      // Verifica se o usuário ativou biometria antes
      const savedEmail = localStorage.getItem(BIOMETRIC_EMAIL_KEY)
      const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true'

      setState({
        available: result.isAvailable,
        biometricType,
        enrolled: enabled && !!savedEmail,
        savedEmail: enabled ? savedEmail : null,
      })
    } catch {
      // Plugin não disponível — biometria desabilitada silenciosamente
    }
  }

  /**
   * Autentica com biometria e retorna o email salvo.
   * Retorna null se falhar ou não disponível.
   */
  const authenticate = useCallback(async (): Promise<string | null> => {
    if (!isNative || !state.available || !state.enrolled) return null

    try {
      const { BiometricAuth } = await import('@capacitor-community/biometric-auth')

      await BiometricAuth.authenticate({
        reason: 'Confirme sua identidade para entrar no Uppi',
        title: 'Entrar no Uppi',
        subtitle: state.biometricType === 'face_id' ? 'Use o Face ID' : 'Use a impressão digital',
        cancelTitle: 'Usar senha',
        allowDeviceCredential: false,
        iosFallbackTitle: 'Usar senha',
      })

      return state.savedEmail
    } catch {
      return null
    }
  }, [isNative, state])

  /**
   * Salva o email e ativa o login biométrico para próximos acessos.
   * Chamar após login bem-sucedido com senha.
   */
  const enableBiometric = useCallback(async (email: string): Promise<boolean> => {
    if (!isNative || !state.available) return false

    try {
      const { BiometricAuth } = await import('@capacitor-community/biometric-auth')

      // Confirma com biometria antes de ativar
      await BiometricAuth.authenticate({
        reason: 'Confirme para ativar o login biométrico',
        title: 'Ativar biometria',
        subtitle: state.biometricType === 'face_id' ? 'Use o Face ID' : 'Use a impressão digital',
        cancelTitle: 'Cancelar',
        allowDeviceCredential: false,
        iosFallbackTitle: 'Cancelar',
      })

      localStorage.setItem(BIOMETRIC_EMAIL_KEY, email)
      localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true')

      setState(prev => ({ ...prev, enrolled: true, savedEmail: email }))
      return true
    } catch {
      return false
    }
  }, [isNative, state.available, state.biometricType])

  /**
   * Remove o login biométrico salvo.
   */
  const disableBiometric = useCallback(() => {
    localStorage.removeItem(BIOMETRIC_EMAIL_KEY)
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY)
    setState(prev => ({ ...prev, enrolled: false, savedEmail: null }))
  }, [])

  return {
    ...state,
    authenticate,
    enableBiometric,
    disableBiometric,
    checkAvailability,
  }
}
