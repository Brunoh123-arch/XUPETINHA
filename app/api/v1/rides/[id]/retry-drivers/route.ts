import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

/**
 * POST /api/v1/rides/[id]/retry-drivers
 * Re-notifica motoristas próximos quando uma corrida está em negociação
 * sem receber ofertas dentro de 2 minutos.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = apiLimiter.check(request, 5)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const { id: rideId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Buscar a corrida — colunas reais: pickup_latitude/longitude (não pickup_lat/lng)
    const { data: ride } = await supabase
      .from('rides')
      .select('id, passenger_id, status, pickup_latitude, pickup_longitude, category_id, estimated_price, pickup_address, dropoff_address, estimated_distance')
      .eq('id', rideId)
      .single()

    if (!ride) return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    if (ride.passenger_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (!['negotiating', 'pending'].includes(ride.status)) {
      return NextResponse.json({ error: 'Corrida não está em negociação' }, { status: 400 })
    }

    // Buscar motoristas próximos com raio expandido (8km)
    const { data: nearbyDrivers } = await supabase.rpc('find_nearby_drivers', {
      p_lat: ride.pickup_latitude,
      p_lng: ride.pickup_longitude,
      p_radius_km: 8,
      p_vehicle_type: ride.category_id,
    })

    const driverIds: string[] = (nearbyDrivers || [])
      .map((row: any) => row.driver_id || row)
      .filter(Boolean)

    if (driverIds.length === 0) {
      return NextResponse.json({ success: true, notified: 0, message: 'Nenhum motorista disponível na área' })
    }

    // Notificar motoristas que ainda não fizeram oferta — tabela real: ride_offers
    const { data: existingOffers } = await supabase
      .from('ride_offers')
      .select('driver_id')
      .eq('ride_id', rideId)

    const alreadyOffered = new Set((existingOffers || []).map((o: any) => o.driver_id))
    const newDriverIds = driverIds.filter((id: string) => !alreadyOffered.has(id))

    if (newDriverIds.length > 0) {
      const notifications = newDriverIds.map((driverId: string) => ({
        user_id: driverId,
        title: 'Corrida aguardando — sem ofertas',
        body: `Corrida de ${ride.pickup_address?.split(',')[0]} para ${ride.dropoff_address?.split(',')[0]}. Distância: ${Number(ride.estimated_distance || 0).toFixed(1)}km`,
        type: 'new_ride_request',
        data: {
          ride_id: rideId,
          estimated_price: ride.estimated_price,
          distance_km: ride.estimated_distance,
          retry: true,
        },
        is_read: false,
      }))
      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({ success: true, notified: newDriverIds.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
