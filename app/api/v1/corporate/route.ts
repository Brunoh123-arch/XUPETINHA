import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Buscar conta corporativa do usuario
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: account, error } = await supabase
      .from('corporate_accounts')
      .select('*, corporate_employees(*), corporate_ride_policies(*)')
      .eq('owner_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // Verifica se é funcionário de alguma empresa
    const { data: employee } = await supabase
      .from('corporate_employees')
      .select('*, corporate_accounts(*)')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ account: account || null, employee: employee || null })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar conta corporativa' }, { status: 500 })
  }
}

// POST - Criar conta corporativa
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { company_name, cnpj, billing_email, monthly_limit, cost_center } = body

    if (!company_name || !cnpj) {
      return NextResponse.json({ error: 'Nome e CNPJ são obrigatórios' }, { status: 400 })
    }

    const { data: account, error } = await supabase
      .from('corporate_accounts')
      .insert({
        owner_id: user.id,
        company_name,
        cnpj,
        billing_email: billing_email || user.email,
        monthly_limit: monthly_limit || 0,
        cost_center: cost_center || null,
        status: 'active',
        balance: 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, account }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar conta corporativa' }, { status: 500 })
  }
}

// PATCH - Atualizar conta corporativa
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { company_name, billing_email, monthly_limit, cost_center, status } = body

    const { data, error } = await supabase
      .from('corporate_accounts')
      .update({ company_name, billing_email, monthly_limit, cost_center, status, updated_at: new Date().toISOString() })
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, account: data })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar conta corporativa' }, { status: 500 })
  }
}
