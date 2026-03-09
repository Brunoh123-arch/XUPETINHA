export interface Coordinates {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  altitudeAccuracy?: number
  heading?: number
  speed?: number
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

class GeolocationService {
  async getCurrentPosition(options?: GeolocationOptions): Promise<Coordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('Geolocation not supported')
        resolve(null)
        return
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 0,
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          })
        },
        (error) => {
          console.error('Geolocation error:', error.message)
          resolve(null)
        },
        defaultOptions
      )
    })
  }

  watchPosition(
    onSuccess: (coords: Coordinates) => void,
    onError?: (error: GeolocationPositionError) => void,
    options?: GeolocationOptions
  ): number | null {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported')
      return null
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 10000,
      maximumAge: options?.maximumAge ?? 1000,
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
        })
      },
      (error) => {
        console.error('Watch position error:', error.message)
        onError?.(error)
      },
      defaultOptions
    )
  }

  clearWatch(watchId: number) {
    if (navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  isAvailable(): boolean {
    return 'geolocation' in navigator
  }

  async requestPermission(): Promise<PermissionState | null> {
    if (!navigator.permissions) return null
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      return result.state
    } catch {
      return null
    }
  }

  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371e3
    const φ1 = (coord1.latitude * Math.PI) / 180
    const φ2 = (coord2.latitude * Math.PI) / 180
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  formatCoordinates(coords: Coordinates, decimals: number = 6): string {
    return `${coords.latitude.toFixed(decimals)}, ${coords.longitude.toFixed(decimals)}`
  }
}

export const geolocationService = new GeolocationService()
