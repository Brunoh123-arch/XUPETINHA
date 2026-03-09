import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, authLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

// GET /api/v1/coupons?validate=CODE&amount=X — lista cupons ou valida um
export async function GET(request: Request) {
  try {
    const rlResult = apiLimiter.check(request, 20)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const validateCode = searchParams.get('validate')
    const amount = parseFloat(searchParams.get('amount') || '0')

    // Modo de validação rápida
    if (validateCode) {
      const { data, error } = await supabase.rpc('apply_coupon_to_ride', {
        p_user_id: user.id,
        p_code:    validateCode.toUpperCase().trim(),
        p_amount:  amount,
      })
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      return NextResponse.json(data)
    }

    // Lista cupons ativos que o usuário ainda não usou
    const { data: usedIds } = await supabase
      .from('user_coupons')
      .select('coupon_id')
      .eq('user_id', user.id)
      .not('used_at', 'is', null)

    const usedCouponIds = (usedIds || []).map((r: any) => r.coupon_id)

    let query = supabase
      .from('coupons')
      .select('id, code, discount_type, discount_value, max_discount, description, expires_at, min_ride_value, is_reusable')
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })

    if (usedCouponIds.length > 0) {
      query = query.not('id', 'in', `(${usedCouponIds.join(',')})`)
    }

    const { data: coupons, error } = await query
    if (error) throw error

    return NextResponse.json({ coupons: coupons || [] })
  } catch (error) {
    console.error('[coupons GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/v1/coupons — aplica cupom ao preço da corrida
export async function POST(request: Request) {
  try {
    const rlResult = authLimiter.check(request, 5)
    if (!rlResult.success) return rateLimitResponse(rlResult)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { code, amount } = body

    if (!code || amount == null) {
      return NextResponse.json({ error: 'code e amount são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('apply_coupon_to_ride', {
      p_user_id: user.id,
      p_code:    code.toUpperCase().trim(),
      p_amount:  parseFloat(amount),
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data?.success) return NextResponse.json({ error: data?.error || 'Cupom inválido' }, { status: 400 })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[coupons POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
