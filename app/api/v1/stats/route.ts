import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Corridas como passageiro — schema real: "final_price" (não "price")
    const { data: ridesAsPassenger, error: passengerError } = await supabase
      .from('rides')
      .select('id, status, final_price, created_at')
      .eq('passenger_id', user.id)

    if (passengerError) throw passengerError

    const { data: ridesAsDriver, error: driverError } = await supabase
      .from('rides')
      .select('id, status, final_price, created_at')
      .eq('driver_id', user.id)

    if (driverError) throw driverError

    // Calcular estatísticas
    const totalRides = (ridesAsPassenger?.length || 0) + (ridesAsDriver?.length || 0)
    const completedRides = [
      ...(ridesAsPassenger || []),
      ...(ridesAsDriver || []),
    ].filter(r => r.status === 'completed').length

    const totalSpent = ridesAsPassenger
      ?.filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.final_price || 0), 0) || 0

    const totalEarned = ridesAsDriver
      ?.filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.final_price || 0), 0) || 0

    // Rating — schema real: "rated_id" (não "rated_user_id"), campo "score"
    const { data: ratingsReceived, error: ratingsError } = await supabase
      .from('ratings')
      .select('score')
      .eq('rated_id', user.id)

    if (ratingsError) throw ratingsError

    const averageRating = ratingsReceived && ratingsReceived.length > 0
      ? ratingsReceived.reduce((sum, r) => sum + (r.score || 0), 0) / ratingsReceived.length
      : 0

    // Saldo da carteira via função SQL (profile não tem wallet_balance)
    const { data: walletBalance } = await supabase
      .rpc('calculate_wallet_balance', { p_user_id: user.id })

    return NextResponse.json({
      stats: {
        totalRides,
        completedRides,
        totalSpent,
        totalEarned,
        averageRating: averageRating.toFixed(1),
        walletBalance: walletBalance ?? 0,
        ridesThisMonth: ridesAsPassenger?.filter(r => {
          const rideDate = new Date(r.created_at)
          const now = new Date()
          return rideDate.getMonth() === now.getMonth() && 
                 rideDate.getFullYear() === now.getFullYear()
        }).length || 0,
      }
    })
  } catch (error) {
    console.error('[v0] Stats GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
