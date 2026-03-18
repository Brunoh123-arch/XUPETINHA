import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

export async function GET(request: Request) {
  try {
    // Rate limit: 20 reads per minute
    const rlResult = apiLimiter.check(request, 20)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'total_rides'
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    // Tenta RPC primeiro; se falhar (função inexistente), usa query direta
    let leaderboard: any[] = []
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_leaderboard_full', {
      limit_count: limit,
      category,
    })

    if (!rpcError && rpcData) {
      leaderboard = rpcData
    } else {
      // Fallback: query direta em user_points + profiles
      const { data: fallback } = await supabase
        .from('user_points')
        .select('user_id, points, lifetime_points, tier, profiles!user_points_user_id_fkey(full_name, avatar_url)')
        .order('points', { ascending: false })
        .limit(limit)

      leaderboard = (fallback || []).map((row: any, idx: number) => ({
        id: row.user_id,
        full_name: row.profiles?.full_name || 'Usuário',
        avatar_url: row.profiles?.avatar_url || null,
        points: row.points || 0,
        lifetime_points: row.lifetime_points || 0,
        tier: row.tier || 'bronze',
        rank: idx + 1,
      }))
    }

    // Get current user's rank
    const userRank = leaderboard?.find((entry: any) => entry.id === user.id)

    return NextResponse.json({
      leaderboard: leaderboard || [],
      userRank: userRank || null,
      category,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
