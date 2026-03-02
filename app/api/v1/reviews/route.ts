import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

// POST - Criar review de corrida
// Schema real: driver_reviews(id, ride_id, driver_id, passenger_id, score, comment, tags, created_at)
export async function POST(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 10)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ride_id, rating, comment, tags } = body

    if (!ride_id || !rating) {
      return NextResponse.json({ error: 'ride_id e rating são obrigatórios' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Avaliação deve ser entre 1 e 5' }, { status: 400 })
    }

    // Buscar a corrida para validar participação
    const { data: ride } = await supabase
      .from('rides')
      .select('id, driver_id, passenger_id, status')
      .eq('id', ride_id)
      .single()

    if (!ride) {
      return NextResponse.json({ error: 'Corrida não encontrada' }, { status: 404 })
    }

    if (ride.status !== 'completed') {
      return NextResponse.json({ error: 'Só é possível avaliar corridas finalizadas' }, { status: 400 })
    }

    const isPassenger = ride.passenger_id === user.id
    const isDriver = ride.driver_id === user.id

    if (!isPassenger && !isDriver) {
      return NextResponse.json({ error: 'Você não participou desta corrida' }, { status: 403 })
    }

    // Verificar se já avaliou — passageiro avalia motorista, motorista avalia passageiro
    const { data: existing } = await supabase
      .from('driver_reviews')
      .select('id')
      .eq('ride_id', ride_id)
      .eq('passenger_id', isPassenger ? user.id : ride.passenger_id)
      .eq('driver_id', ride.driver_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Esta corrida já foi avaliada' }, { status: 409 })
    }

    // Criar review — schema real usa "score" como campo de nota
    const { data: review, error } = await supabase
      .from('driver_reviews')
      .insert({
        ride_id,
        driver_id: ride.driver_id,
        passenger_id: ride.passenger_id,
        score: rating,
        comment: comment || null,
        tags: tags || [],
      })
      .select()
      .single()

    if (error) throw error

    // Atualizar rating médio do motorista
    if (ride.driver_id) {
      const { data: allReviews } = await supabase
        .from('driver_reviews')
        .select('score')
        .eq('driver_id', ride.driver_id)

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum: number, r: any) => sum + r.score, 0) / allReviews.length
        await supabase
          .from('driver_profiles')
          .update({ rating: Number(avg.toFixed(2)) })
          .eq('id', ride.driver_id)
      }
    }

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('[v0] Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

// GET - Buscar reviews de um motorista ou corrida
export async function GET(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 20)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const driver_id = searchParams.get('driver_id')
    const ride_id = searchParams.get('ride_id')

    let query = supabase
      .from('driver_reviews')
      .select(`
        *,
        passenger:profiles!passenger_id(id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (driver_id) query = query.eq('driver_id', driver_id)
    if (ride_id) query = query.eq('ride_id', ride_id)

    const { data: reviews, error } = await query

    if (error) throw error

    const avg = reviews && reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / reviews.length
      : null

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
      average: avg ? Number(avg.toFixed(2)) : null,
      count: reviews?.length || 0,
    })
  } catch (error) {
    console.error('[v0] Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
