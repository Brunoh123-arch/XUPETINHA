import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { apiLimiter, rateLimitResponse } from '@/lib/utils/rate-limit'

/**
 * POST /api/v1/coupons/apply
 * Valida um cupom e retorna o preco final com desconto aplicado.
 * Nao marca como usado — isso ocorre ao confirmar a corrida.
 *
 * Body: { code: string, original_price: number, ride_id?: string }
 * Response: { discount_amount, final_price, coupon }
 */
export async function POST(request: Request) {
  const rlResult = apiLimiter.check(request, 10)
  if (!rlResult.success) return rateLimitResponse(rlResult)

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, original_price, ride_id } = body

    if (!code || typeof original_price !== 'number' || original_price <= 0) {
      return NextResponse.json(
        { error: 'code e original_price sao obrigatorios' },
        { status: 400 }
      )
    }

    // Buscar cupom ativo e valido
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .gte('valid_until', new Date().toISOString())
      .eq('is_active', true)
      .single()

    if (couponError || !coupon) {
      return NextResponse.json({ error: 'Cupom invalido ou expirado' }, { status: 404 })
    }

    // Verificar limite de usos
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 })
    }

    // Verificar se usuario ja usou este cupom
    const { data: alreadyUsed } = await supabase
      .from('user_coupons')
      .select('id, used_at')
      .eq('user_id', user.id)
      .eq('coupon_id', coupon.id)
      .single()

    if (alreadyUsed?.used_at) {
      return NextResponse.json({ error: 'Voce ja usou este cupom' }, { status: 400 })
    }

    // Calcular desconto
    let discountAmount = 0
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((original_price * (coupon.discount_value / 100)) * 100) / 100
    } else {
      // fixed amount
      discountAmount = Math.min(coupon.discount_value, original_price)
    }

    // Aplicar desconto minimo garantido pelo cupom (se houver)
    if (coupon.min_order_value && original_price < coupon.min_order_value) {
      return NextResponse.json(
        { error: `Pedido minimo de R$ ${coupon.min_order_value.toFixed(2)} para este cupom` },
        { status: 400 }
      )
    }

    // Desconto maximo (cap)
    if (coupon.max_discount_value && discountAmount > coupon.max_discount_value) {
      discountAmount = coupon.max_discount_value
    }

    const finalPrice = Math.max(1, Math.round((original_price - discountAmount) * 100) / 100)

    // Se ride_id fornecido, atualizar passenger_price_offer com desconto
    if (ride_id) {
      await supabase
        .from('rides')
        .update({ passenger_price_offer: finalPrice, applied_coupon_id: coupon.id })
        .eq('id', ride_id)
        .eq('passenger_id', user.id)
        .in('status', ['negotiating', 'pending'])
    }

    return NextResponse.json({
      success: true,
      discount_amount: discountAmount,
      final_price: finalPrice,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    })
  } catch (error) {
    console.error('Coupons apply error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
