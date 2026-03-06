import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/admin/check
// Verifica se o usuário autenticado via cookie de sessão é admin
// NÃO aceita user_id no body — usa a sessão do servidor
export async function POST(req: NextRequest) {
  try {
    // Ler sessão do cookie — nunca confiar em dados do body
    const supabase = await createClient()
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ is_admin: false }, { status: 401 })
    }

    // Usar service role para ignorar RLS e verificar flag is_admin
    const adminClient = createAdminClient()
    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('is_admin, full_name')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json({ is_admin: false }, { status: 403 })
    }

    return NextResponse.json({
      is_admin: profile.is_admin ?? false,
      full_name: profile.full_name,
    })
  } catch {
    return NextResponse.json({ is_admin: false }, { status: 500 })
  }
}
