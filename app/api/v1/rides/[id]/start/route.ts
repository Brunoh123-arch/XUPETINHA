import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = apiLimiter.check(request, 20)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const { id: rideId } = await params
    const driver = await requireAuth()
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('start_ride', {
      p_ride_id:   rideId,
      p_driver_id: driver.id,
    })

    if (error) return errorResponse('Erro ao iniciar corrida: ' + error.message, 500)
    if (!data?.success) return errorResponse(data?.error || 'Nao foi possivel iniciar a corrida', 409)

    const { data: ride } = await supabase
      .from('rides')
      .select(`*, passenger:profiles!passenger_id(id, full_name, avatar_url, phone)`)
      .eq('id', rideId)
      .single()

    return NextResponse.json({ success: true, ride, message: 'Corrida iniciada' })
  } catch (error) {
    return handleApiError(error)
  }
}
