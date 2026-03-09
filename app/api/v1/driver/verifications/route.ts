import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: verifications, error } = await supabase
      .from('driver_verifications')
      .select('*')
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calcular status geral de verificação
    const types = ['face', 'cnh', 'vehicle']
    const approved = verifications?.filter(v => v.status === 'approved' && types.includes(v.type)) || []
    const pending = verifications?.filter(v => v.status === 'pending') || []
    const rejected = verifications?.filter(v => v.status === 'rejected') || []

    const verificationStatus = {
      overall: approved.length >= types.length ? 'verified' : rejected.length > 0 ? 'needs_attention' : 'incomplete',
      total_required: types.length,
      total_approved: approved.length,
      total_pending: pending.length,
      total_rejected: rejected.length,
    }

    return NextResponse.json({ verifications: verifications || [], status: verificationStatus })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { type, photo_url } = body

    const validTypes = ['face', 'document', 'selfie', 'cnh', 'vehicle']
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Tipo invalido' }, { status: 400 })
    }

    // Verificar se já existe uma verificação pendente ou aprovada para este tipo
    const { data: existing } = await supabase
      .from('driver_verifications')
      .select('id, status')
      .eq('driver_id', user.id)
      .eq('type', type)
      .in('status', ['pending', 'approved'])
      .single()

    if (existing?.status === 'approved') {
      return NextResponse.json({ error: 'Este tipo ja foi verificado' }, { status: 400 })
    }

    if (existing?.status === 'pending') {
      // Atualizar existente
      const { data, error } = await supabase
        .from('driver_verifications')
        .update({ photo_url, status: 'pending', created_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, verification: data })
    }

    const { data: verification, error } = await supabase
      .from('driver_verifications')
      .insert({
        driver_id: user.id,
        type,
        photo_url,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, verification })
  } catch {
    return NextResponse.json({ error: 'Erro ao enviar verificacao' }, { status: 500 })
  }
}
