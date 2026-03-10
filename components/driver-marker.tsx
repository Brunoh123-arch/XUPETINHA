'use client'

import { useEffect, useRef, useCallback } from 'react'

interface DriverMarkerProps {
  map: any // Google Maps instance
  driverId: string
  lat: number
  lng: number
  heading?: number
  color?: string
  animate?: boolean
  animationDuration?: number
}

/**
 * DriverMarker — Marcador animado do motorista no mapa
 * Implementa:
 * - Animacao suave entre posicoes (interpolacao)
 * - Rotacao do icone na direcao do movimento
 * - Performance otimizada com requestAnimationFrame
 */
export function DriverMarker({
  map,
  driverId,
  lat,
  lng,
  heading = 0,
  color = '#FF6B00',
  animate = true,
  animationDuration = 2000,
}: DriverMarkerProps) {
  const markerRef = useRef<any>(null)
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null)
  const animationRef = useRef<number | null>(null)

  // Criar icone SVG do carro com rotacao
  const createCarIcon = useCallback((rotation: number) => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g transform="rotate(${rotation}, 24, 24)" filter="url(#shadow)">
          <!-- Corpo do carro -->
          <rect x="16" y="8" width="16" height="32" rx="4" fill="${color}"/>
          <!-- Teto -->
          <rect x="18" y="14" width="12" height="12" rx="2" fill="#fff" fill-opacity="0.3"/>
          <!-- Faróis traseiros -->
          <rect x="17" y="36" width="5" height="3" rx="1" fill="#ff4444"/>
          <rect x="26" y="36" width="5" height="3" rx="1" fill="#ff4444"/>
          <!-- Faróis dianteiros -->
          <rect x="17" y="9" width="5" height="3" rx="1" fill="#ffff88"/>
          <rect x="26" y="9" width="5" height="3" rx="1" fill="#ffff88"/>
          <!-- Seta de direcao -->
          <path d="M24 2 L28 8 L20 8 Z" fill="${color}"/>
        </g>
      </svg>
    `
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(48, 48),
      anchor: new window.google.maps.Point(24, 24),
    }
  }, [color])

  // Calcular bearing entre dois pontos
  const calculateBearing = useCallback((
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const toDeg = (rad: number) => (rad * 180) / Math.PI
    
    const dLng = toRad(lng2 - lng1)
    const lat1Rad = toRad(lat1)
    const lat2Rad = toRad(lat2)
    
    const x = Math.sin(dLng) * Math.cos(lat2Rad)
    const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
    
    let bearing = toDeg(Math.atan2(x, y))
    return (bearing + 360) % 360
  }, [])

  // Animar marcador suavemente
  const animateToPosition = useCallback((
    toLat: number,
    toLng: number,
    toHeading: number
  ) => {
    if (!markerRef.current || !lastPositionRef.current) return
    
    const fromLat = lastPositionRef.current.lat
    const fromLng = lastPositionRef.current.lng
    
    // Cancelar animacao anterior
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    const startTime = performance.now()
    
    function step(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      
      // Ease-out cubic para movimento mais natural (como Uber)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      const currentLat = fromLat + (toLat - fromLat) * easeProgress
      const currentLng = fromLng + (toLng - fromLng) * easeProgress
      
      if (markerRef.current) {
        markerRef.current.setPosition({ lat: currentLat, lng: currentLng })
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step)
      } else {
        lastPositionRef.current = { lat: toLat, lng: toLng }
      }
    }
    
    // Atualizar icone com rotacao
    if (markerRef.current) {
      markerRef.current.setIcon(createCarIcon(toHeading))
    }
    
    requestAnimationFrame(step)
  }, [animationDuration, createCarIcon])

  // Criar marcador inicial
  useEffect(() => {
    if (!map || !window.google) return

    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map,
      icon: createCarIcon(heading),
      title: `Motorista ${driverId}`,
      zIndex: 1000, // Acima de outros marcadores
    })

    markerRef.current = marker
    lastPositionRef.current = { lat, lng }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      marker.setMap(null)
    }
  }, [map, driverId]) // Nao incluir lat/lng aqui

  // Atualizar posicao quando mudar
  useEffect(() => {
    if (!markerRef.current || !lastPositionRef.current) return

    const lastPos = lastPositionRef.current
    
    // Calcular bearing automaticamente se nao fornecido
    const calculatedHeading = heading || calculateBearing(
      lastPos.lat, lastPos.lng,
      lat, lng
    )

    if (animate) {
      animateToPosition(lat, lng, calculatedHeading)
    } else {
      markerRef.current.setPosition({ lat, lng })
      markerRef.current.setIcon(createCarIcon(calculatedHeading))
      lastPositionRef.current = { lat, lng }
    }
  }, [lat, lng, heading, animate, animateToPosition, calculateBearing, createCarIcon])

  return null // Marcador e gerenciado via Google Maps API
}

/**
 * Hook para usar com Supabase Realtime
 * Retorna a posicao do motorista com animacao suave
 */
export function useDriverPosition(initialLat: number, initialLng: number) {
  const positionRef = useRef({ lat: initialLat, lng: initialLng, heading: 0 })
  
  const updatePosition = useCallback((newLat: number, newLng: number, newHeading?: number) => {
    const oldPos = positionRef.current
    
    // Calcular heading se nao fornecido
    const heading = newHeading ?? calculateBearingFn(
      oldPos.lat, oldPos.lng,
      newLat, newLng
    )
    
    positionRef.current = { lat: newLat, lng: newLng, heading }
    return positionRef.current
  }, [])
  
  return { position: positionRef.current, updatePosition }
}

function calculateBearingFn(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI
  
  const dLng = toRad(lng2 - lng1)
  const lat1Rad = toRad(lat1)
  const lat2Rad = toRad(lat2)
  
  const x = Math.sin(dLng) * Math.cos(lat2Rad)
  const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
  
  let bearing = toDeg(Math.atan2(x, y))
  return (bearing + 360) % 360
}
