import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Historico de inspeções do veiculo
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!driver) return NextResponse.json({ error: 'Perfil de motorista não encontrado' }, { status: 404 })

    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id, make, model, year, plate')
      .eq('driver_id', driver.id)
      .eq('is_active', true)
      .single()

    if (!vehicle) return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 })

    const [inspectionsRes, maintenanceRes] = await Promise.all([
      supabase.from('vehicle_inspections')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('inspection_date', { ascending: false }),
      supabase.from('vehicle_maintenance')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('scheduled_date', { ascending: false }),
    ])

    return NextResponse.json({
      vehicle,
      inspections: inspectionsRes.data || [],
      maintenance: maintenanceRes.data || [],
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar inspeções' }, { status: 500 })
  }
}

// POST - Registrar nova inspeção
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { inspection_type, result, notes, next_inspection_date, items_checked } = body

    if (!inspection_type || !result) {
      return NextResponse.json({ error: 'Tipo e resultado da inspeção são obrigatórios' }, { status: 400 })
    }

    const { data: driver } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!driver) return NextResponse.json({ error: 'Perfil de motorista não encontrado' }, { status: 404 })

    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('driver_id', driver.id)
      .eq('is_active', true)
      .single()

    if (!vehicle) return NextResponse.json({ error: 'Veículo não encontrado' }, { status: 404 })

    const { data: inspection, error } = await supabase
      .from('vehicle_inspections')
      .insert({
        vehicle_id: vehicle.id,
        driver_id: driver.id,
        inspection_type,
        result,
        notes: notes || null,
        inspection_date: new Date().toISOString(),
        next_inspection_date: next_inspection_date || null,
        items_checked: items_checked || {},
        inspector_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Se reprovado, notificar motorista
    if (result === 'failed') {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'alert',
        title: 'Inspeção reprovada',
        message: 'Seu veículo foi reprovado na inspeção. Regularize antes de continuar operando.',
        data: { inspection_id: inspection.id },
        is_read: false,
      })

      await supabase.from('driver_profiles').update({ status: 'suspended' }).eq('user_id', driver.id)
    }

    return NextResponse.json({ success: true, inspection }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao registrar inspeção' }, { status: 500 })
  }
}
