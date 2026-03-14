'use client'

import { useCallback } from 'react'
import { Capacitor } from '@capacitor/core'

export interface NativeCameraResult {
  /** Data URL base64 da imagem (ex: "data:image/jpeg;base64,...")  */
  dataUrl: string
  /** Blob pronto para upload */
  blob: Blob
  /** File pronto para storageService.uploadFile() */
  file: File
}

export interface NativeCameraOptions {
  /** Qualidade 0-100, default 90 */
  quality?: number
  /** Permitir galeria além de câmera, default true */
  allowGallery?: boolean
  /** Nome do arquivo gerado, default "avatar.jpg" */
  fileName?: string
}

/**
 * Hook para captura de foto 100% nativa via Capacitor Camera.
 * Em ambiente web (preview no navegador), faz fallback para
 * input[type=file] de forma transparente.
 */
export function useNativeCamera() {
  const isNative = Capacitor.isNativePlatform()

  const takePhoto = useCallback(
    async (opts: NativeCameraOptions = {}): Promise<NativeCameraResult | null> => {
      const quality = opts.quality ?? 90
      const fileName = opts.fileName ?? 'photo.jpg'
      const allowGallery = opts.allowGallery ?? true

      // ── NATIVO (iOS / Android) ─────────────────────────────────────────
      if (isNative) {
        try {
          const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')

          const image = await Camera.getPhoto({
            quality,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: allowGallery ? CameraSource.Prompt : CameraSource.Camera,
            promptLabelHeader: 'Foto de perfil',
            promptLabelCancel: 'Cancelar',
            promptLabelPhoto: 'Escolher da galeria',
            promptLabelPicture: 'Tirar foto',
          })

          if (!image.base64String) return null

          const dataUrl = `data:image/jpeg;base64,${image.base64String}`
          const byteChars = atob(image.base64String)
          const byteNumbers = Array.from(byteChars, c => c.charCodeAt(0))
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: 'image/jpeg' })
          const file = new File([blob], fileName, { type: 'image/jpeg' })

          return { dataUrl, blob, file }
        } catch (err: unknown) {
          // Usuário cancelou — não é erro real
          if (err instanceof Error && err.message.includes('cancelled')) return null
          if (err instanceof Error && err.message.includes('No image picked')) return null
          console.error('[NativeCamera] Erro:', err)
          return null
        }
      }

      // ── WEB FALLBACK (preview / browser) ──────────────────────────────
      return new Promise(resolve => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = () => {
          const file = input.files?.[0]
          if (!file) { resolve(null); return }

          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            const blob = new Blob([file], { type: file.type })
            const namedFile = new File([blob], fileName, { type: file.type })
            resolve({ dataUrl, blob, file: namedFile })
          }
          reader.readAsDataURL(file)
        }
        input.oncancel = () => resolve(null)
        input.click()
      })
    },
    [isNative]
  )

  return { takePhoto, isNative }
}
