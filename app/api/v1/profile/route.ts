import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getDecryptedCpf, updateEncryptedCpf } from '@/lib/encryption'

// GET - Retorna perfil do usuário autenticado
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar perfil na tabela profiles (id = auth.uid())
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    // Buscar perfil de motorista se existir
    const { data: driverProfile } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Buscar saldo da carteira
    const { data: walletBalance } = await supabase
      .rpc('calculate_wallet_balance', { p_user_id: user.id })

    // Buscar CPF descriptografado (se existir)
    const cpf = await getDecryptedCpf(user.id)

    // Não retornar cpf_encrypted na resposta
    const { cpf_encrypted, ...safeProfile } = profile as any

    return NextResponse.json({
      success: true,
      ...safeProfile,
      cpf: cpf || null, // CPF descriptografado
      driver_profile: driverProfile || null,
      wallet_balance: walletBalance ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
  }
}

// PATCH - Atualiza perfil do usuário
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, phone, avatar_url, preferences, cpf, ...rest } = body

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (full_name !== undefined) updateData.full_name = full_name
    if (phone !== undefined)     updateData.phone = phone
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (preferences !== undefined) updateData.preferences = preferences

    // Se CPF foi enviado, criptografar antes de salvar
    if (cpf !== undefined && cpf !== null && cpf !== '') {
      const encrypted = await updateEncryptedCpf(user.id, cpf)
      if (!encrypted) {
        return NextResponse.json({ error: 'Erro ao criptografar CPF' }, { status: 500 })
      }
      // CPF já foi salvo pela função updateEncryptedCpf, não precisa incluir no updateData
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    // Buscar CPF descriptografado para retornar
    const decryptedCpf = await getDecryptedCpf(user.id)
    const { cpf_encrypted, ...safeProfile } = profile as any

    return NextResponse.json({ 
      success: true, 
      profile: { ...safeProfile, cpf: decryptedCpf || null }
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 })
  }
}
