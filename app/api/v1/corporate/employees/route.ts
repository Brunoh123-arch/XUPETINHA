import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Listar funcionarios da conta corporativa
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: account } = await supabase
      .from('corporate_accounts')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!account) return NextResponse.json({ error: 'Conta corporativa não encontrada' }, { status: 404 })

    const { data: employees, error } = await supabase
      .from('corporate_employees')
      .select('*, profiles(full_name, avatar_url, phone)')
      .eq('corporate_account_id', account.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ employees: employees || [] })
  } catch {
    return NextResponse.json({ error: 'Erro ao listar funcionários' }, { status: 500 })
  }
}

// POST - Adicionar funcionario
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { employee_email, monthly_limit, department, role } = body

    if (!employee_email) return NextResponse.json({ error: 'Email do funcionário é obrigatório' }, { status: 400 })

    const { data: account } = await supabase
      .from('corporate_accounts')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!account) return NextResponse.json({ error: 'Conta corporativa não encontrada' }, { status: 404 })

    // Buscar perfil do funcionario pelo email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', employee_email)
      .single()

    const { data: employee, error } = await supabase
      .from('corporate_employees')
      .insert({
        corporate_account_id: account.id,
        user_id: profile?.id || null,
        employee_email,
        monthly_limit: monthly_limit || 0,
        department: department || null,
        role: role || 'employee',
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error

    // Notificar funcionario se perfil encontrado
    if (profile?.id) {
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'system',
        title: 'Você foi adicionado a uma conta corporativa',
        body: 'Você agora pode solicitar corridas corporativas.',
        data: { corporate_account_id: account.id },
        is_read: false,
      })
    }

    return NextResponse.json({ success: true, employee }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao adicionar funcionário' }, { status: 500 })
  }
}

// DELETE - Remover funcionario
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('id')
    if (!employeeId) return NextResponse.json({ error: 'ID do funcionário é obrigatório' }, { status: 400 })

    const { data: account } = await supabase
      .from('corporate_accounts')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!account) return NextResponse.json({ error: 'Conta corporativa não encontrada' }, { status: 404 })

    const { error } = await supabase
      .from('corporate_employees')
      .update({ status: 'inactive' })
      .eq('id', employeeId)
      .eq('corporate_account_id', account.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao remover funcionário' }, { status: 500 })
  }
}
