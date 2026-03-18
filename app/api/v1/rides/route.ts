import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rideRequestSchema } from '@/lib/validations/schemas'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'
import { sendFcmToTokens } from '@/lib/firebase-admin'

export async function POST(request: Request) {
  // Rate limit: 10 corridas por minuto por IP
  const rlResult = apiLimiter.check(request, 10)
  if (!rlResult.success) return rateLimitResponse(rlResult)

  try {
    const user = await requireAuth()
    const body = await request.json()

    const validation = rideRequestSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse('Dados inválidos: ' + validation.error.errors[0].message)
    }

    const data = validation.data
    const supabase = await createClient()

    const { data: ride, error } = await supabase
      .from('rides')
      .insert({
        passenger_id: user.id,
        pickup_address: data.pickup_address,
        pickup_latitude: data.pickup_lat,
        pickup_longitude: data.pickup_lng,
        dropoff_address: data.dropoff_address,
        dropoff_latitude: data.dropoff_lat,
        dropoff_longitude: data.dropoff_lng,
        status: 'pending',
        payment_method: data.payment_method || 'pix',
        estimated_price: data.passenger_price_offer,
        notes: data.notes || null,
        category_id: data.vehicle_type || null,
      })
      .select(`
        *,
        passenger:profiles!passenger_id(id, full_name, avatar_url, phone)
      `)
      .single()

    if (error) {
      return errorResponse('Erro ao criar corrida: ' + error.message, 500)
    }

    // Notificar motoristas próximos via FCM
    try {
      const supabase2 = await createClient()

      // Buscar motoristas verificados e disponíveis com FCM token
      const { data: nearbyDrivers } = await supabase2
        .from('driver_profiles')
        .select('id')
        .eq('is_verified', true)
        .eq('is_available', true)

      if (nearbyDrivers && nearbyDrivers.length > 0) {
        const driverIds = nearbyDrivers.map((d: { id: string }) => d.id)

        const { data: pushTokens } = await supabase2
          .from('user_push_tokens')
          .select('token')
          .in('user_id', driverIds)
          .eq('is_active', true)

        if (pushTokens && pushTokens.length > 0) {
          await sendFcmToTokens(
            pushTokens.map((t: { token: string }) => t.token),
            'Nova corrida disponivel',
            `De ${data.pickup_address} para ${data.dropoff_address} — R$ ${data.passenger_price_offer?.toFixed(2) ?? '?'}`,
            { ride_id: ride.id, type: 'new_ride', vehicle_type: data.vehicle_type || 'economy' }
          )
        }
      }
    } catch {
      // Falha silenciosa — push nao e critico
    }

    return successResponse(ride, 'Corrida criada com sucesso')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: Request) {
  // Rate limit: 30 buscas por minuto por IP
  const rlGet = apiLimiter.check(request, 30)
  if (!rlGet.success) return rateLimitResponse(rlGet)

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createClient()

    let query = supabase
      .from('rides')
      .select(`
        *,
        passenger:profiles!passenger_id(id, full_name, avatar_url, phone),
        driver:profiles!driver_id(id, full_name, avatar_url, phone),
        driver_profile:driver_profiles!driver_profiles_user_id_fkey(rating, total_trips, is_verified, is_available)
      `)
      .eq('passenger_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: rides, error } = await query

    if (error) {
      return errorResponse('Erro ao buscar corridas: ' + error.message, 500)
    }

    return successResponse(rides)
  } catch (error) {
    return handleApiError(error)
  }
}
