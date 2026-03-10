'use client'

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Capacitor } from '@capacitor/core'
import { GoogleMap, type GoogleMapHandle } from '@/components/google-map'

export interface NativeMapHandle {
  centerOnUser: () => void
  addMarker: (id: string, lat: number, lng: number, options?: MarkerOptions) => Promise<void>
  removeMarker: (id: string) => Promise<void>
  setRoute: (origin: LatLng, destination: LatLng) => Promise<void>
  clearRoute: () => Promise<void>
  panTo: (lat: number, lng: number) => void
  setZoom: (zoom: number) => void
}

interface LatLng {
  lat: number
  lng: number
}

interface MarkerOptions {
  title?: string
  iconUrl?: string
  draggable?: boolean
  color?: string
}

interface NativeMapProps {
  center?: LatLng
  zoom?: number
  markers?: Array<{ id: string; lat: number; lng: number; title?: string; iconUrl?: string }>
  showUserLocation?: boolean
  showRoute?: boolean
  origin?: LatLng
  destination?: LatLng
  onLocationFound?: (lat: number, lng: number) => void
  onMapReady?: (mapInstance: any) => void
  onMarkerClick?: (markerId: string) => void
  className?: string
}

/**
 * NativeMap — Usa @capacitor/google-maps no Android para performance nativa
 * Faz fallback automatico para GoogleMap web quando nao for plataforma nativa
 */
export const NativeMap = forwardRef<NativeMapHandle, NativeMapProps>(
  function NativeMapInner(props, ref) {
    const {
      center,
      zoom = 15,
      markers = [],
      showUserLocation = true,
      showRoute = false,
      origin,
      destination,
      onLocationFound,
      onMapReady,
      onMarkerClick,
      className,
    } = props

    const isNative = Capacitor.isNativePlatform()
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const nativeMapRef = useRef<any>(null)
    const webMapRef = useRef<GoogleMapHandle>(null)
    const markersMapRef = useRef<Map<string, string>>(new Map())
    const [mapReady, setMapReady] = useState(false)
    const [userLocation, setUserLocation] = useState<LatLng | null>(null)

    // Initialize native map (Android/iOS)
    useEffect(() => {
      if (!isNative || !mapContainerRef.current) return

      let cancelled = false

      async function initNativeMap() {
        try {
          const { GoogleMap: CapacitorGoogleMap } = await import('@capacitor/google-maps')
          
          if (cancelled) return

          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          if (!apiKey) {
            console.error('[NativeMap] GOOGLE_MAPS_API_KEY not set')
            return
          }

          // Create native map
          const map = await CapacitorGoogleMap.create({
            id: 'native-map',
            element: mapContainerRef.current!,
            apiKey,
            config: {
              center: center || { lat: -1.293, lng: -47.926 },
              zoom,
              androidLiteMode: false,
            },
          })

          if (cancelled) {
            await map.destroy()
            return
          }

          nativeMapRef.current = map
          setMapReady(true)
          onMapReady?.(map)

          // Enable my location if requested
          if (showUserLocation) {
            try {
              await map.enableCurrentLocation(true)
            } catch (err) {
              console.warn('[NativeMap] Could not enable current location:', err)
            }
          }

          // Listen for marker clicks
          await map.setOnMarkerClickListener((event) => {
            onMarkerClick?.(event.markerId)
          })

          // Get current location
          if (showUserLocation) {
            try {
              const { Geolocation } = await import('@capacitor/geolocation')
              const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
              const loc = { lat: position.coords.latitude, lng: position.coords.longitude }
              setUserLocation(loc)
              onLocationFound?.(loc.lat, loc.lng)
              
              // Center on user
              await map.setCamera({ coordinate: loc, zoom, animate: true })
            } catch (err) {
              console.warn('[NativeMap] Could not get location:', err)
            }
          }

        } catch (err) {
          console.error('[NativeMap] Init error:', err)
        }
      }

      initNativeMap()

      return () => {
        cancelled = true
        if (nativeMapRef.current) {
          nativeMapRef.current.destroy().catch(() => {})
          nativeMapRef.current = null
        }
      }
    }, [isNative, center, zoom, showUserLocation, onLocationFound, onMapReady, onMarkerClick])

    // Add markers when they change (native)
    useEffect(() => {
      if (!isNative || !nativeMapRef.current || !mapReady) return

      async function syncMarkers() {
        const map = nativeMapRef.current
        if (!map) return

        // Remove old markers that are no longer in the list
        const currentIds = new Set(markers.map(m => m.id))
        for (const [id, markerId] of markersMapRef.current.entries()) {
          if (!currentIds.has(id)) {
            try {
              await map.removeMarker(markerId)
              markersMapRef.current.delete(id)
            } catch {}
          }
        }

        // Add new markers
        for (const marker of markers) {
          if (!markersMapRef.current.has(marker.id)) {
            try {
              const markerId = await map.addMarker({
                coordinate: { lat: marker.lat, lng: marker.lng },
                title: marker.title || '',
                iconUrl: marker.iconUrl,
              })
              markersMapRef.current.set(marker.id, markerId)
            } catch (err) {
              console.warn('[NativeMap] Could not add marker:', err)
            }
          }
        }
      }

      syncMarkers()
    }, [isNative, markers, mapReady])

    // Draw route (native)
    useEffect(() => {
      if (!isNative || !nativeMapRef.current || !mapReady || !showRoute || !origin || !destination) return

      async function drawRoute() {
        const map = nativeMapRef.current
        if (!map) return

        try {
          // Native Capacitor Maps doesnt have built-in routing
          // We need to use Directions API and draw polyline
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}`
          )
          const data = await response.json()

          if (data.routes?.[0]?.overview_polyline?.points) {
            // Decode polyline and draw on map
            const points = decodePolyline(data.routes[0].overview_polyline.points)
            await map.addPolylines([{
              path: points,
              strokeColor: '#2563EB',
              strokeWeight: 4,
              strokeOpacity: 0.8,
            }])
          }
        } catch (err) {
          console.warn('[NativeMap] Could not draw route:', err)
        }
      }

      drawRoute()
    }, [isNative, mapReady, showRoute, origin, destination])

    // Imperative handle
    useImperativeHandle(ref, () => ({
      centerOnUser: async () => {
        if (isNative && nativeMapRef.current && userLocation) {
          await nativeMapRef.current.setCamera({ coordinate: userLocation, zoom, animate: true })
        } else if (webMapRef.current) {
          webMapRef.current.centerOnUser()
        }
      },
      addMarker: async (id, lat, lng, options) => {
        if (isNative && nativeMapRef.current) {
          const markerId = await nativeMapRef.current.addMarker({
            coordinate: { lat, lng },
            title: options?.title || '',
            iconUrl: options?.iconUrl,
            draggable: options?.draggable || false,
          })
          markersMapRef.current.set(id, markerId)
        }
      },
      removeMarker: async (id) => {
        if (isNative && nativeMapRef.current) {
          const markerId = markersMapRef.current.get(id)
          if (markerId) {
            await nativeMapRef.current.removeMarker(markerId)
            markersMapRef.current.delete(id)
          }
        }
      },
      setRoute: async (orig, dest) => {
        if (!isNative && webMapRef.current) {
          await webMapRef.current.drawOptimizedRoute(orig, dest)
        }
        // Native route is handled via useEffect
      },
      clearRoute: async () => {
        // Clear polylines
      },
      panTo: async (lat, lng) => {
        if (isNative && nativeMapRef.current) {
          await nativeMapRef.current.setCamera({ coordinate: { lat, lng }, animate: true })
        }
      },
      setZoom: async (z) => {
        if (isNative && nativeMapRef.current) {
          await nativeMapRef.current.setCamera({ zoom: z, animate: true })
        }
      },
    }), [isNative, userLocation, zoom])

    // Fallback to web GoogleMap when not native
    if (!isNative) {
      return (
        <GoogleMap
          ref={webMapRef}
          onLocationFound={onLocationFound}
          onMapReady={onMapReady}
          className={className}
        />
      )
    }

    // Native map container
    return (
      <div className={`relative w-full h-full ${className || ''}`}>
        <capacitor-google-map
          ref={mapContainerRef}
          id="native-map"
          style={{ display: 'inline-block', width: '100%', height: '100%' }}
        />
        
        {!mapReady && (
          <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-neutral-400">Carregando mapa...</span>
            </div>
          </div>
        )}
      </div>
    )
  }
)

/**
 * Anima marcador suavemente entre duas posicoes (igual Uber)
 * Usa interpolacao linear com requestAnimationFrame
 */
function animateMarkerPosition(
  marker: any,
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  duration: number = 2000,
  onComplete?: () => void
) {
  const startTime = performance.now()
  
  function animate(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Ease-out para movimento mais natural
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    const currentLat = fromLat + (toLat - fromLat) * easeProgress
    const currentLng = fromLng + (toLng - fromLng) * easeProgress
    
    if (marker?.setPosition) {
      marker.setPosition({ lat: currentLat, lng: currentLng })
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      onComplete?.()
    }
  }
  
  requestAnimationFrame(animate)
}

/**
 * Calcula o bearing (direcao) entre dois pontos geograficos
 * Retorna angulo em graus (0-360, onde 0 = norte)
 */
function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
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

/**
 * Cria icone do carro com rotacao
 */
function createCarIcon(heading: number = 0, color: string = '#FF6B00') {
  // SVG do carro apontando para cima (0 graus = norte)
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <g transform="rotate(${heading}, 20, 20)">
        <path d="M20 5 L30 35 L20 28 L10 35 Z" fill="${color}" stroke="#fff" stroke-width="2"/>
      </g>
    </svg>
  `
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

// Decode Google polyline
function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte: number

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const dlat = result & 1 ? ~(result >> 1) : result >> 1
    lat += dlat

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const dlng = result & 1 ? ~(result >> 1) : result >> 1
    lng += dlng

    points.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }

  return points
}

// Declare custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'capacitor-google-map': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { id?: string }, HTMLElement>
    }
  }
}
