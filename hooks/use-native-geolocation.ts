'use client'

import { useState, useEffect, useCallback } from 'react'
import { Capacitor } from '@capacitor/core'
import { Geolocation, type Position } from '@capacitor/geolocation'

interface LocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number | null
  error: string | null
  loading: boolean
}

interface UseNativeGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watchPosition?: boolean
}

/**
 * Hook que usa Capacitor Geolocation quando disponivel,
 * fallback para Web Geolocation API no browser
 */
export function useNativeGeolocation(options: UseNativeGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watchPosition = false,
  } = options

  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: true,
  })

  const [watchId, setWatchId] = useState<string | null>(null)
  const isNative = Capacitor.isNativePlatform()

  const updatePosition = useCallback((position: Position | GeolocationPosition) => {
    const coords = 'coords' in position ? position.coords : position.coords
    setState({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      heading: coords.heading,
      speed: coords.speed,
      timestamp: position.timestamp,
      error: null,
      loading: false,
    })
  }, [])

  const handleError = useCallback((error: GeolocationPositionError | Error) => {
    setState(prev => ({
      ...prev,
      error: error.message || 'Erro ao obter localizacao',
      loading: false,
    }))
  }, [])

  // Obter posicao atual
  const getCurrentPosition = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      if (isNative) {
        // Capacitor nativo
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy,
          timeout,
          maximumAge,
        })
        updatePosition(position)
      } else {
        // Web fallback
        navigator.geolocation.getCurrentPosition(
          updatePosition,
          handleError,
          { enableHighAccuracy, timeout, maximumAge }
        )
      }
    } catch (err) {
      handleError(err as Error)
    }
  }, [isNative, enableHighAccuracy, timeout, maximumAge, updatePosition, handleError])

  // Iniciar watch
  const startWatching = useCallback(async () => {
    if (watchId) return // Ja esta assistindo

    try {
      if (isNative) {
        const id = await Geolocation.watchPosition(
          { enableHighAccuracy, timeout, maximumAge },
          (position, err) => {
            if (err) {
              handleError(new Error(err.message))
            } else if (position) {
              updatePosition(position)
            }
          }
        )
        setWatchId(id)
      } else {
        const id = navigator.geolocation.watchPosition(
          updatePosition,
          handleError,
          { enableHighAccuracy, timeout, maximumAge }
        )
        setWatchId(String(id))
      }
    } catch (err) {
      handleError(err as Error)
    }
  }, [isNative, watchId, enableHighAccuracy, timeout, maximumAge, updatePosition, handleError])

  // Parar watch
  const stopWatching = useCallback(async () => {
    if (!watchId) return

    try {
      if (isNative) {
        await Geolocation.clearWatch({ id: watchId })
      } else {
        navigator.geolocation.clearWatch(Number(watchId))
      }
      setWatchId(null)
    } catch (err) {
      console.error('[Geolocation] Erro ao parar watch:', err)
    }
  }, [isNative, watchId])

  // Solicitar permissao (Capacitor)
  const requestPermission = useCallback(async () => {
    if (!isNative) return true

    try {
      const status = await Geolocation.requestPermissions()
      return status.location === 'granted'
    } catch {
      return false
    }
  }, [isNative])

  // Auto-start
  useEffect(() => {
    if (watchPosition) {
      startWatching()
    } else {
      getCurrentPosition()
    }

    return () => {
      if (watchId) {
        stopWatching()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchPosition])

  return {
    ...state,
    isNative,
    getCurrentPosition,
    startWatching,
    stopWatching,
    requestPermission,
  }
}
