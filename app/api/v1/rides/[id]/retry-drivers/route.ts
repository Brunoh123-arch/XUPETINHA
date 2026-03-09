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

    // Buscar a corrida — apenas o passageiro dono pode retentar
    const { data: ride } = await supabase
      .from('rides')
      .select('id, passenger_id, status, pickup_lat, pickup_lng, vehicle_type, passenger_price_offer, pickup_address, dropoff_address, distance_km, estimated_duration_minutes')
      .eq('id', rideId)
      .single()

    if (!ride) return NextResponse.json({ error: 'Ride not found' }, { status: 404 })
    if (ride.passenger_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (!['negotiating', 'pending'].includes(ride.status)) {
      return NextResponse.json({ error: 'Corrida não está em negociação' }, { status: 400 })
    }

    // Buscar motoristas próximos com raio expandido (8km)
    const { data: nearbyDrivers } = await supabase.rpc('find_nearby_drivers', {
      p_lat: ride.pickup_lat,
      p_lng: ride.pickup_lng,
      p_radius_km: 8,
      p_vehicle_type: ride.vehicle_type,
    })

    const driverIds: string[] = (nearbyDrivers || [])
      .map((row: any) => row.driver_id || row)
      .filter(Boolean)

    if (driverIds.length === 0) {
      return NextResponse.json({ success: true, notified: 0, message: 'Nenhum motorista disponível na área' })
    }

    // Notificar motoristas que ainda não fizeram oferta
    const { data: existingOffers } = await supabase
      .from('price_offers')
      .select('driver_id')
      .eq('ride_id', rideId)

    const alreadyOffered = new Set((existingOffers || []).map((o: any) => o.driver_id))
    const newDriverIds = driverIds.filter((id: string) => !alreadyOffered.has(id))

    if (newDriverIds.length > 0) {
      const notifications = newDriverIds.map((driverId: string) => ({
        user_id: driverId,
        title: 'Corrida aguardando — sem ofertas',
        message: `Corrida de ${ride.pickup_address?.split(',')[0]} para ${ride.dropoff_address?.split(',')[0]}. Oferta: R$ ${Number(ride.passenger_price_offer || 0).toFixed(2)}`,
        type: 'new_ride_request',
        data: {
          ride_id: rideId,
          passenger_offer: ride.passenger_price_offer,
          distance_km: ride.distance_km,
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
