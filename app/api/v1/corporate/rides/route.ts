import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Historico de corridas corporativas
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    // Verifica se é admin da conta corporativa
    const { data: account } = await supabase
      .from('corporate_accounts')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    // Verifica se é funcionario
    const { data: employee } = await supabase
      .from('corporate_employees')
      .select('corporate_account_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const corporateAccountId = account?.id || employee?.corporate_account_id
    if (!corporateAccountId) return NextResponse.json({ error: 'Sem conta corporativa vinculada' }, { status: 404 })

    const { data: rides, error } = await supabase
      .from('corporate_rides')
      .select('*, rides(origin_address, destination_address, fare, status, created_at), profiles(full_name)')
      .eq('corporate_account_id', corporateAccountId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Resumo financeiro
    const total = rides?.reduce((sum, r) => sum + (r.rides?.fare || 0), 0) || 0

    return NextResponse.json({ rides: rides || [], total_spent: total })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar corridas corporativas' }, { status: 500 })
  }
}

// POST - Solicitar corrida corporativa
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { ride_id, cost_center, justification } = body

    if (!ride_id) return NextResponse.json({ error: 'ID da corrida é obrigatório' }, { status: 400 })

    const { data: employee } = await supabase
      .from('corporate_employees')
      .select('corporate_account_id, monthly_limit')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!employee) return NextResponse.json({ error: 'Usuário não é funcionário de nenhuma empresa' }, { status: 403 })

    // Verificar limite mensal
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthlyRides } = await supabase
      .from('corporate_rides')
      .select('rides(fare)')
      .eq('corporate_account_id', employee.corporate_account_id)
      .eq('employee_user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    const monthlySpent = monthlyRides?.reduce((sum, r) => sum + (r.rides as { fare?: number })?.fare || 0, 0) || 0

    if (employee.monthly_limit > 0 && monthlySpent >= employee.monthly_limit) {
      return NextResponse.json({ error: 'Limite mensal corporativo atingido' }, { status: 400 })
    }

    const { data: corporateRide, error } = await supabase
      .from('corporate_rides')
      .insert({
        corporate_account_id: employee.corporate_account_id,
        ride_id,
        employee_user_id: user.id,
        cost_center: cost_center || null,
        justification: justification || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, corporate_ride: corporateRide }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao registrar corrida corporativa' }, { status: 500 })
  }
}
