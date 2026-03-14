'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCurrentLocation, type Location } from '@/lib/google-maps/utils'

export function useGoogleMaps() {
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionState, setPermissionState] = useState<
    'prompt' | 'granted' | 'denied' | 'loading'
  >('loading')

  const requestLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const location = await getCurrentLocation()
      setUserLocation(location)
      setPermissionState('granted')
      
      import('@/lib/storage').then(({ Storage }) => Storage.setJSON('userLocation', location)).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location')
      setPermissionState('denied')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Verifica cache de localizacao nativo
    import('@/lib/storage').then(({ Storage }) => {
      Storage.getJSON<{ lat: number; lng: number }>('userLocation').then((location) => {
        if (location) {
          setUserLocation(location)
          setLoading(false)
          return
        }
        requestLocation()
      }).catch(() => requestLocation())
    }).catch(() => requestLocation())
    }

    // Verifica permissao de geolocalizacao via Capacitor
    import('@capacitor/geolocation').then(({ Geolocation }) => {
      Geolocation.checkPermissions().then(({ location }) => {
        setPermissionState(
          location === 'granted' ? 'granted'
          : location === 'denied' ? 'denied'
          : 'prompt'
        )
      }).catch(() => setPermissionState('prompt'))
    }

    // Request location on mount
    requestLocation()
  }, [requestLocation])

  return {
    userLocation,
    loading,
    error,
    permissionState,
    requestLocation,
  }
}
