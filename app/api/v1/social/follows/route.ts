import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// GET /api/v1/social/follows
// Lista seguidores ou seguindo do usuário autenticado
export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') ?? 'following' // 'following' | 'followers'
    const userId = searchParams.get('user_id') ?? user.id
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)
    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query
    if (type === 'followers') {
      // Quem segue userId
      query = supabase
        .from('user_follows')
        .select('follower:profiles!follower_id(id, full_name, avatar_url, username)', { count: 'exact' })
        .eq('following_id', userId)
        .range(offset, offset + limit - 1)
    } else {
      // Quem userId está seguindo
      query = supabase
        .from('user_follows')
        .select('following:profiles!following_id(id, full_name, avatar_url, username)', { count: 'exact' })
        .eq('follower_id', userId)
        .range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    if (error) return errorResponse('Erro ao buscar seguidores', 500)

    const users = data?.map((row: Record<string, unknown>) => type === 'followers' ? row.follower : row.following) ?? []

    return successResponse({
      type,
      users,
      pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/v1/social/follows
// Seguir ou deixar de seguir um usuário
export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { target_user_id, action } = body // action: 'follow' | 'unfollow'

    if (!target_user_id || !action) {
      return errorResponse('target_user_id e action são obrigatórios', 400)
    }

    if (!['follow', 'unfollow'].includes(action)) {
      return errorResponse('action deve ser "follow" ou "unfollow"', 400)
    }

    if (target_user_id === user.id) {
      return errorResponse('Você não pode seguir a si mesmo', 400)
    }

    const supabase = await createClient()

    if (action === 'follow') {
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: target_user_id })

      if (error?.code === '23505') {
        return errorResponse('Você já segue este usuário', 409)
      }
      if (error) return errorResponse('Erro ao seguir usuário', 500)

      return successResponse({ following: true }, 'Agora você segue este usuário', 201)
    }

    // unfollow
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', target_user_id)

    if (error) return errorResponse('Erro ao deixar de seguir usuário', 500)

    return successResponse({ following: false }, 'Você deixou de seguir este usuário')
  } catch (error) {
    return handleApiError(error)
  }
}
