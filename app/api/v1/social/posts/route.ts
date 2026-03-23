import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

export async function GET(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 30)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10)
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10)

    const { data, error } = await supabase.rpc('get_social_feed', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset
    })

    if (error) throw error

    return NextResponse.json({ posts: data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 10)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { type, title, description, metadata, visibility } = body

    if (!type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        user_id: user.id,
        type,
        title,
        description,
        metadata: metadata || {},
        visibility: visibility || 'public'
      })
      .select()
      .single()

    if (error) throw error

    // Incrementa posts_count diretamente — RPC genérica "increment" não existe no schema
    await supabase
      .from('user_social_stats')
      .upsert({ user_id: user.id, posts_count: 1 }, { onConflict: 'user_id', ignoreDuplicates: false })
      .select()

    return NextResponse.json({ post: data })
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
