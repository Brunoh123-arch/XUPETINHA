import { createClient } from '@/lib/supabase/client'

export interface DriverLocation {
  driver_id: string
  latitude: number
  longitude: number
  heading: number
  speed: number
  accuracy: number
  timestamp: string
}

export interface TrackingUpdate {
  ride_id: string
  status: 'pending' | 'negotiating' | 'accepted' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
  driver_location?: DriverLocation
  eta_minutes?: number
  distance_to_pickup?: number
}

// Configuracoes de tracking otimizadas para bateria (igual Uber)
const TRACKING_CONFIGS = {
  idle: { interval: 60000, distanceFilter: 100 },      // Motorista offline: 1min, 100m
  online: { interval: 10000, distanceFilter: 20 },     // Motorista online: 10s, 20m
  active_ride: { interval: 3000, distanceFilter: 5 },  // Corrida ativa: 3s, 5m
  stopped: { interval: 20000, distanceFilter: 10 },    // Parado: 20s, 10m
}

class TrackingService {
  private supabase = createClient()
  /** ID do watcher de background geolocation (@capacitor-community/background-geolocation) */
  private bgWatcherId: string | null = null
  private updateInterval: NodeJS.Timeout | null = null
  private lastPosition: { lat: number; lng: number } | null = null
  private lastSpeed: number = 0
  private currentMode: 'idle' | 'online' | 'active_ride' = 'online'

  // Calcular distancia em metros (Haversine)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  // Inicia rastreamento GPS do motorista para uma corrida
  startDriverTracking(rideId: string, driverId: string, mode: 'online' | 'active_ride' = 'active_ride') {
    this.currentMode = mode
    const config = TRACKING_CONFIGS[mode]

    // Sempre usa background geolocation nativo — sem fallback web
    this._startBackgroundTracking(rideId, driverId, mode, config)
  }

  /** Tracking nativo com background geolocation */
  private async _startBackgroundTracking(
    rideId: string,
    driverId: string,
    mode: 'online' | 'active_ride',
    config: { interval: number; distanceFilter: number }
  ) {
    try {
      const { BackgroundGeolocation } = await import('@capacitor-community/background-geolocation')

      const watcherId = await BackgroundGeolocation.addWatcher(
        {
          // Notificação persistente Android (obrigatória para background)
          backgroundTitle: 'Uppi — Rastreamento ativo',
          backgroundMessage: 'Sua posição está sendo registrada para a corrida.',
          requestPermissions: true,
          stale: false,
          distanceFilter: config.distanceFilter,
        },
        async (location, error) => {
          if (error || !location) return

          const { latitude: lat, longitude: lng, speed, accuracy, bearing } = location

          if (this.lastPosition) {
            const distance = this.calculateDistance(
              this.lastPosition.lat,
              this.lastPosition.lng,
              lat,
              lng
            )
            const minDist =
              (speed ?? 0) < 0.5
                ? TRACKING_CONFIGS.stopped.distanceFilter
                : config.distanceFilter
            if (distance < minDist) return
          }

          this.lastPosition = { lat, lng }
          this.lastSpeed = speed ?? 0

          await this.updateDriverLocation(rideId, {
            driver_id: driverId,
            latitude: lat,
            longitude: lng,
            heading: bearing ?? 0,
            speed: speed ?? 0,
            accuracy: accuracy ?? 0,
            timestamp: new Date().toISOString(),
          })
        }
      )

      this.bgWatcherId = watcherId
    } catch {
      // Plugin não disponível — tracking silenciosamente desativado
    }
  }

  stopTracking() {
    if (this.bgWatcherId !== null) {
      const watcherId = this.bgWatcherId
      this.bgWatcherId = null
      import('@capacitor-community/background-geolocation').then(({ BackgroundGeolocation }) => {
        BackgroundGeolocation.removeWatcher({ id: watcherId }).catch(() => {})
      }).catch(() => {})
    }
    if (this.updateInterval) {
      clearTimeout(this.updateInterval)
      this.updateInterval = null
    }
    this.lastPosition = null
    this.lastSpeed = 0
    this.currentMode = 'idle'
  }

  // Mudar modo de tracking (ex: de online para active_ride)
  setTrackingMode(mode: 'idle' | 'online' | 'active_ride') {
    this.currentMode = mode
  }

  // Grava localização via API (evita problema de RLS no client-side)
  private async updateDriverLocation(rideId: string, location: DriverLocation) {
    try {
      // 1. Upsert em driver_locations com colunas corretas (latitude, longitude)
      await this.supabase
        .from('driver_locations')
        .upsert(
          {
            driver_id: location.driver_id,
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading,
            speed: location.speed,
            accuracy: location.accuracy,
            last_updated: location.timestamp,
            updated_at: location.timestamp,
            is_available: true,
          },
          { onConflict: 'driver_id' }
        )

      // 2. Inserir ponto no histórico de ride_tracking
      if (rideId) {
        await this.supabase.from('ride_tracking').insert({
          ride_id: rideId,
          driver_id: location.driver_id,
          latitude: location.latitude,
          longitude: location.longitude,
          heading: location.heading,
          speed: location.speed,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
        })
      }
    } catch (_) {}
  }

  // Assina atualizações de corrida para o passageiro
  subscribeToRideUpdates(
    rideId: string,
    onUpdate: (update: TrackingUpdate) => void
  ) {
    // Assina mudanças de status da corrida
    const rideChannel = this.supabase
      .channel(`ride-status:${rideId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rides', filter: `id=eq.${rideId}` },
        (payload) => {
          onUpdate({ ride_id: rideId, status: payload.new.status })
        }
      )
      .subscribe()

    // Assina atualizações de localização do motorista via driver_id
    const locationChannel = this.supabase
      .channel(`driver-loc:${rideId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'driver_locations' },
        (payload) => {
          if (payload.new) {
            onUpdate({
              ride_id: rideId,
              status: 'in_progress',
              driver_location: {
                driver_id: payload.new.driver_id,
                latitude: payload.new.latitude,
                longitude: payload.new.longitude,
                heading: payload.new.heading ?? 0,
                speed: payload.new.speed ?? 0,
                accuracy: payload.new.accuracy ?? 0,
                timestamp: payload.new.last_updated,
              },
            })
          }
        }
      )
      .subscribe()

    return () => {
      this.supabase.removeChannel(rideChannel)
      this.supabase.removeChannel(locationChannel)
    }
  }

  // Assina atualizações de ofertas de preço (para o passageiro ver negociação)
  subscribeToPriceOffers(
    rideId: string,
    onOffer: (offer: any) => void
  ) {
    const channel = this.supabase
      .channel(`price-offers:${rideId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'price_offers', filter: `ride_id=eq.${rideId}` },
        (payload) => onOffer(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'price_offers', filter: `ride_id=eq.${rideId}` },
        (payload) => onOffer(payload.new)
      )
      .subscribe()

    return () => this.supabase.removeChannel(channel)
  }

  // Calcula ETA via Google Maps Directions API
  async calculateETA(
    currentLat: number,
    currentLng: number,
    destLat: number,
    destLng: number
  ): Promise<number> {
    if (typeof window === 'undefined' || !window.google) return 0

    return new Promise((resolve) => {
      const directionsService = new window.google.maps.DirectionsService()
      directionsService.route(
        {
          origin: { lat: currentLat, lng: currentLng },
          destination: { lat: destLat, lng: destLng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response: any, status: any) => {
          if (status === 'OK' && response) {
            resolve(Math.ceil(response.routes[0].legs[0].duration.value / 60))
          } else {
            resolve(0)
          }
        }
      )
    })
  }

  // Atualiza status da corrida via API route
  async updateRideStatus(
    rideId: string,
    status: TrackingUpdate['status'],
    cancellation_reason?: string
  ) {
    try {
      const res = await fetch(`/api/v1/rides/${rideId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancellation_reason }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { success: false, error: err?.error || 'Erro ao atualizar status' }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro de rede' }
    }
  }
}

export const trackingService = new TrackingService()
