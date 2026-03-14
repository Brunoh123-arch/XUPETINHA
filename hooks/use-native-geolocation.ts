'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  isMoving: boolean
}

type AccuracyMode = 'high' | 'balanced' | 'low'
type TrackingMode = 'idle' | 'online' | 'active_ride'

interface UseNativeGeolocationOptions {
  // Modo de precisao: high (GPS), balanced (GPS+WiFi+Cell), low (WiFi+Cell)
  accuracyMode?: AccuracyMode
  timeout?: number
  maximumAge?: number
  watchPosition?: boolean
  // Distance filter em metros (so atualiza se mover X metros)
  distanceFilter?: number
  // Modo de tracking: idle (desligado), online (motorista disponivel), active_ride (corrida ativa)
  trackingMode?: TrackingMode
  // Callback quando posicao atualiza
  onLocationUpdate?: (lat: number, lng: number, heading: number, speed: number) => void
}

// Configuracoes por modo de tracking (otimizacao de bateria igual Uber)
const TRACKING_CONFIGS: Record<TrackingMode, { interval: number; accuracy: AccuracyMode; distanceFilter: number }> = {
  idle: { interval: 60000, accuracy: 'low', distanceFilter: 100 },        // 1min, baixa precisao, 100m
  online: { interval: 10000, accuracy: 'balanced', distanceFilter: 20 },  // 10s, balanceado, 20m
  active_ride: { interval: 3000, accuracy: 'high', distanceFilter: 5 },   // 3s, GPS preciso, 5m
}

// Configuracoes quando parado (velocidade = 0)
const STOPPED_CONFIG = { interval: 20000, distanceFilter: 10 } // 20s quando parado

/**
 * Hook otimizado para GPS nativo com economia de bateria
 * - Modo balanceado (GPS + WiFi + Cell)
 * - Distance filter (so atualiza se mover X metros)
 * - Frequencia reduzida quando parado
 * - Diferentes modos de tracking (idle, online, active_ride)
 */
export function useNativeGeolocation(options: UseNativeGeolocationOptions = {}) {
  const {
    accuracyMode = 'balanced',
    timeout = 10000,
    maximumAge = 5000,
    watchPosition = false,
    distanceFilter = 10,
    trackingMode = 'online',
    onLocationUpdate,
  } = options

  // Determinar configuracao baseada no modo
  const config = TRACKING_CONFIGS[trackingMode]
  const effectiveAccuracy = accuracyMode === 'high' ? true : accuracyMode === 'balanced' ? true : false
  const effectiveDistanceFilter = distanceFilter || config.distanceFilter

  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: true,
    isMoving: false,
  })

  const [watchId, setWatchId] = useState<string | null>(null)
  const [currentInterval, setCurrentInterval] = useState(config.interval)
  const isNative = Capacitor.isNativePlatform()
  
  // Refs para distance filter e velocidade
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null)
  const lastSpeedRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calcular distancia entre dois pontos (Haversine)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000 // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }, [])

  const updatePosition = useCallback((position: Position | GeolocationPosition) => {
    const coords = 'coords' in position ? position.coords : position.coords
    const newLat = coords.latitude
    const newLng = coords.longitude
    const speed = coords.speed || 0
    const heading = coords.heading || 0

    // DISTANCE FILTER: so atualiza se mover mais que X metros
    if (lastPositionRef.current) {
      const distance = calculateDistance(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        newLat,
        newLng
      )
      if (distance < effectiveDistanceFilter) {
        // Nao moveu o suficiente, ignorar atualizacao
        return
      }
    }

    // Detectar se esta parado ou em movimento
    const isMoving = speed > 0.5 // Mais de 0.5 m/s = em movimento
    lastSpeedRef.current = speed
    lastPositionRef.current = { lat: newLat, lng: newLng }

    // AJUSTE DINAMICO: reduzir frequencia quando parado
    if (!isMoving && currentInterval !== STOPPED_CONFIG.interval && trackingMode === 'active_ride') {
      setCurrentInterval(STOPPED_CONFIG.interval)
    } else if (isMoving && currentInterval !== config.interval) {
      setCurrentInterval(config.interval)
    }

    setState({
      latitude: newLat,
      longitude: newLng,
      accuracy: coords.accuracy,
      heading: heading,
      speed: speed,
      timestamp: position.timestamp,
      error: null,
      loading: false,
      isMoving,
    })

    // Callback para enviar para backend
    onLocationUpdate?.(newLat, newLng, heading, speed)
  }, [calculateDistance, effectiveDistanceFilter, currentInterval, config.interval, trackingMode, onLocationUpdate])

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
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge,
      })
      updatePosition(position)
    } catch (err) {
      handleError(err as Error)
    }
  }, [isNative, enableHighAccuracy, timeout, maximumAge, updatePosition, handleError])

  // Iniciar watch
  const startWatching = useCallback(async () => {
    if (watchId) return // Ja esta assistindo

    try {
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
    } catch (err) {
      handleError(err as Error)
    }
  }, [isNative, watchId, enableHighAccuracy, timeout, maximumAge, updatePosition, handleError])

  // Parar watch
  const stopWatching = useCallback(async () => {
    if (!watchId) return

    try {
      await Geolocation.clearWatch({ id: watchId })
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
