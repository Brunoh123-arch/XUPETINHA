import { createClient } from '@/lib/supabase/server'
import { successResponse, requireAuth, handleApiError } from '@/lib/api-utils'

// GET /api/v1/coupons/available
// Lista cupons disponíveis para o usuário autenticado
export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const ride_value = parseFloat(searchParams.get('ride_value') || '0')

    const supabase = await createClient()
    const now = new Date().toISOString()

    // Cupons da tabela promo_codes (globais ativos)
    const { data: promoCodes } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .or(`max_uses.is.null,uses_count.lt.max_uses`)

    // Cupons pessoais do usuário (user_coupons)
    const { data: userCoupons } = await supabase
      .from('user_coupons')
      .select(`
        *,
        coupon:coupons(*)
      `)
      .eq('user_id', user.id)
      .eq('used', false)
      .or(`expires_at.is.null,expires_at.gt.${now}`)

    // Filtrar cupons que já foram usados pelo usuário
    const { data: usedCodes } = await supabase
      .from('coupon_uses')
      .select('coupon_id')
      .eq('user_id', user.id)

    const usedIds = new Set(usedCodes?.map((u) => u.coupon_id) ?? [])

    const availablePromoCodes = (promoCodes ?? [])
      .filter((c) => !usedIds.has(c.id))
      .map((c) => ({
        ...c,
        source: 'promo',
        applicable: ride_value === 0 || !c.min_order_value || ride_value >= c.min_order_value,
      }))

    return successResponse({
      promo_codes: availablePromoCodes,
      personal_coupons: userCoupons ?? [],
      total: availablePromoCodes.length + (userCoupons?.length ?? 0),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
