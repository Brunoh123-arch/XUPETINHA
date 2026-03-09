import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/v1/driver/mode
 * Retorna o modo atual do usuario (passenger | driver) e se tem driver_profile cadastrado.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('current_mode')
      .eq('id', user.id)
      .single()

    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('id, is_verified, is_available')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      current_mode: profile?.current_mode ?? 'passenger',
      has_driver_profile: !!driverProfile,
      driver_profile: driverProfile ?? null,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}

/**
 * PATCH /api/v1/driver/mode
 * Alterna o modo do usuario entre 'passenger' e 'driver'.
 * Rejeita troca para 'driver' se nao houver driver_profile verificado.
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { mode } = body

    if (!['passenger', 'driver'].includes(mode)) {
      return NextResponse.json({ error: 'Modo invalido. Use "passenger" ou "driver".' }, { status: 400 })
    }

    // Se quer ser motorista, verificar se tem driver_profile cadastrado e verificado
    if (mode === 'driver') {
      const { data: driverProfile } = await supabase
        .from('driver_profiles')
        .select('id, is_verified')
        .eq('id', user.id)
        .single()

      if (!driverProfile) {
        return NextResponse.json(
          { error: 'Cadastro de motorista nao encontrado. Registre-se primeiro.', code: 'NO_DRIVER_PROFILE' },
          { status: 403 }
        )
      }

      if (!driverProfile.is_verified) {
        return NextResponse.json(
          { error: 'Seu cadastro de motorista ainda esta em analise.', code: 'NOT_VERIFIED' },
          { status: 403 }
        )
      }
    }

    // Atualizar modo no perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ current_mode: mode, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Se entrando no modo motorista, marcar como disponivel
    if (mode === 'driver') {
      await supabase
        .from('driver_profiles')
        .update({ is_available: true, updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // Se saindo do modo motorista, marcar como indisponivel
    if (mode === 'passenger') {
      await supabase
        .from('driver_profiles')
        .update({ is_available: false, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .throwOnError()
        .catch(() => {}) // Pode nao ter driver_profile — ok
    }

    return NextResponse.json({ success: true, current_mode: mode })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
