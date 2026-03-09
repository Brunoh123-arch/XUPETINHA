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

    // Usar RPC que faz tudo atomicamente
    const { data, error } = await supabase.rpc('accept_ride', {
      p_ride_id:   rideId,
      p_driver_id: driver.id,
    })

    if (error) return errorResponse('Erro ao aceitar corrida: ' + error.message, 500)
    if (!data?.success) return errorResponse(data?.error || 'Nao foi possivel aceitar a corrida', 409)

    // Buscar dados completos da corrida para retorno
    const { data: ride } = await supabase
      .from('rides')
      .select(`
        *,
        passenger:profiles!passenger_id(id, full_name, avatar_url, phone, rating)
      `)
      .eq('id', rideId)
      .single()

    return NextResponse.json({ success: true, ride, message: 'Corrida aceita com sucesso' })
  } catch (error) {
    return handleApiError(error)
  }
}
