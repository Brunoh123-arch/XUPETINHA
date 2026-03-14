/**
 * GeolocationService — wrapper sobre @capacitor/geolocation.
 *
 * Substitui a implementacao anterior que usava navigator.geolocation (web-only).
 * Todo acesso a GPS passa pelo plugin Capacitor, que usa CoreLocation no iOS
 * e LocationManager no Android.
 */

import { Geolocation } from '@capacitor/geolocation'

export interface Coordinates {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number | null
  altitudeAccuracy?: number | null
  heading?: number | null
  speed?: number | null
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

class GeolocationService {
  async getCurrentPosition(options?: GeolocationOptions): Promise<Coordinates | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout:            options?.timeout            ?? 10000,
        maximumAge:         options?.maximumAge         ?? 0,
      })
      return {
        latitude:         position.coords.latitude,
        longitude:        position.coords.longitude,
        accuracy:         position.coords.accuracy,
        altitude:         position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading:          position.coords.heading,
        speed:            position.coords.speed,
      }
    } catch (error) {
      console.error('[GeolocationService] getCurrentPosition error:', error)
      return null
    }
  }

  async watchPosition(
    onSuccess: (coords: Coordinates) => void,
    onError?: (error: Error) => void,
    options?: GeolocationOptions
  ): Promise<string | null> {
    try {
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout:            options?.timeout            ?? 10000,
          maximumAge:         options?.maximumAge         ?? 1000,
        },
        (position, err) => {
          if (err) {
            console.error('[GeolocationService] watchPosition error:', err)
            onError?.(new Error(err.message))
            return
          }
          if (!position) return
          onSuccess({
            latitude:         position.coords.latitude,
            longitude:        position.coords.longitude,
            accuracy:         position.coords.accuracy,
            altitude:         position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading:          position.coords.heading,
            speed:            position.coords.speed,
          })
        }
      )
      return watchId
    } catch (error) {
      console.error('[GeolocationService] watchPosition setup error:', error)
      return null
    }
  }

  async clearWatch(watchId: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id: watchId })
    } catch (error) {
      console.error('[GeolocationService] clearWatch error:', error)
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const status = await Geolocation.checkPermissions()
      return status.location !== 'denied'
    } catch {
      return false
    }
  }

  async requestPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      const status = await Geolocation.requestPermissions()
      return status.location as 'granted' | 'denied' | 'prompt'
    } catch {
      return 'denied'
    }
  }

  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371e3
    const φ1 = (coord1.latitude  * Math.PI) / 180
    const φ2 = (coord2.latitude  * Math.PI) / 180
    const Δφ = ((coord2.latitude  - coord1.latitude)  * Math.PI) / 180
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  formatCoordinates(coords: Coordinates, decimals = 6): string {
    return `${coords.latitude.toFixed(decimals)}, ${coords.longitude.toFixed(decimals)}`
  }
}

export const geolocationService = new GeolocationService()
