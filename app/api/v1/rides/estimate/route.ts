import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse, handleApiError } from '@/lib/api-utils'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

export async function GET(request: Request) {
  const rl = apiLimiter.check(request, 60)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const { searchParams } = new URL(request.url)
    const distanceKm     = parseFloat(searchParams.get('distance_km')    || '0')
    const durationMin    = parseInt(searchParams.get('duration_min')     || '0') || undefined
    const vehicleType    = searchParams.get('vehicle_type')              || 'economy'
    const pickupLat      = parseFloat(searchParams.get('pickup_lat')     || '0') || undefined
    const pickupLng      = parseFloat(searchParams.get('pickup_lng')     || '0') || undefined

    if (!distanceKm || distanceKm <= 0) {
      return errorResponse('distance_km obrigatório e deve ser > 0')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.rpc('estimate_ride_price', {
      p_distance_km:      distanceKm,
      p_duration_minutes: durationMin ?? null,
      p_vehicle_type:     vehicleType,
      p_passenger_id:     user?.id ?? null,
      p_pickup_lat:       pickupLat  ?? null,
      p_pickup_lng:       pickupLng  ?? null,
    })

    if (error) return errorResponse('Erro ao calcular estimativa: ' + error.message, 500)

    return NextResponse.json({ success: true, estimate: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  const rl = apiLimiter.check(request, 30)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const body = await request.json()
    const { distance_km, duration_min, vehicle_type, pickup_lat, pickup_lng } = body

    if (!distance_km || distance_km <= 0) {
      return errorResponse('distance_km obrigatório e deve ser > 0')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Calcular para todos os tipos de veiculo de uma vez
    const vehicleTypes = ['moto', 'economy', 'comfort', 'premium', 'pet', 'accessible']
    const estimates: Record<string, unknown> = {}

    for (const vt of vehicleTypes) {
      const { data } = await supabase.rpc('estimate_ride_price', {
        p_distance_km:      distance_km,
        p_duration_minutes: duration_min ?? null,
        p_vehicle_type:     vt,
        p_passenger_id:     user?.id ?? null,
        p_pickup_lat:       pickup_lat  ?? null,
        p_pickup_lng:       pickup_lng  ?? null,
      })
      if (data) estimates[vt] = data
    }

    // Estimativa para o tipo solicitado ou economy
    const primary = estimates[vehicle_type || 'economy'] || estimates['economy']

    return NextResponse.json({
      success:    true,
      estimate:   primary,
      all_types:  estimates,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
