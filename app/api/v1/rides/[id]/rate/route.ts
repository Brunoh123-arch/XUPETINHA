import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { authLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

// GET — verifica se o usuário já avaliou esta corrida
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: rideId } = await params

  const { data } = await supabase
    .from('ride_ratings')
    .select('id')
    .eq('ride_id', rideId)
    .eq('rater_id', user.id)
    .single()

  return NextResponse.json({ rated: !!data })
}

// POST — submete avaliação
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlResult = authLimiter.check(request, 10)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: rideId } = await params
    const body = await request.json()
    const { rated_id, stars, comment } = body

    if (!rated_id || !stars || stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'rated_id e stars (1-5) são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('submit_ride_rating', {
      p_ride_id:  rideId,
      p_rater_id: user.id,
      p_rated_id: rated_id,
      p_stars:    Math.round(stars),
      p_comment:  comment || null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[ride rate POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
