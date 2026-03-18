import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/driver - Retorna perfil de motorista
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const { data: driverProfile, error } = await supabase
      .from('driver_profiles')
      .select(`
        *,
        user:profiles(full_name, email, phone, avatar_url),
        vehicles:vehicles(
          id, brand, model, year, color, plate, photo_url, 
          is_active, is_primary, is_verified, verification_status,
          category:vehicle_categories(name, display_name)
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (error) {
      // Motorista nao registrado ainda
      if (error.code === 'PGRST116') {
        return NextResponse.json({ driver: null, registered: false })
      }
      console.error('Error fetching driver profile:', error)
      return NextResponse.json({ error: 'Erro ao buscar perfil' }, { status: 500 })
    }

    // Busca estatisticas
    const { data: stats } = await supabase
      .from('rides')
      .select('id, status, final_price, driver_rating')
      .eq('driver_id', driverProfile.id)

    const completedRides = stats?.filter(r => r.status === 'completed') || []
    const totalEarnings = completedRides.reduce((sum, r) => sum + (r.final_price || 0), 0)
    const avgRating = completedRides.length > 0
      ? completedRides.reduce((sum, r) => sum + (r.driver_rating || 5), 0) / completedRides.length
      : 5

    return NextResponse.json({ 
      driver: driverProfile, 
      registered: true,
      stats: {
        total_trips: completedRides.length,
        total_earnings: totalEarnings,
        average_rating: Math.round(avgRating * 10) / 10,
      }
    })
  } catch (error) {
    console.error('Driver API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/driver - Registra como motorista
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Verifica se ja e motorista
    const { data: existing } = await supabase
      .from('driver_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Ja registrado como motorista' }, { status: 400 })
    }

    const body = await request.json()
    const {
      license_number,
      license_category,
      license_expiry,
      bank_name,
      bank_agency,
      bank_account,
      bank_account_type,
      pix_key,
      pix_key_type,
    } = body

    // Validacao basica
    if (!license_number || !license_expiry) {
      return NextResponse.json({ error: 'Dados da CNH obrigatorios' }, { status: 400 })
    }

    const { data: driverProfile, error } = await supabase
      .from('driver_profiles')
      .insert({
        user_id: user.id,
        license_number,
        license_category,
        license_expiry,
        bank_name,
        bank_agency,
        bank_account,
        bank_account_type,
        pix_key,
        pix_key_type,
        verification_status: 'pending',
        documents_status: 'pending',
        is_verified: false,
        is_online: false,
        is_available: false,
        commission_rate: 20, // 20% comissao padrao
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating driver profile:', error)
      return NextResponse.json({ error: 'Erro ao criar perfil' }, { status: 500 })
    }

    // Atualiza tipo do usuario
    await supabase
      .from('profiles')
      .update({ user_type: 'driver' })
      .eq('id', user.id)

    return NextResponse.json({ driver: driverProfile }, { status: 201 })
  } catch (error) {
    console.error('Create driver error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH /api/driver - Atualiza status online/disponivel
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { is_online, is_available, current_latitude, current_longitude, current_heading } = body

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (is_online !== undefined) updates.is_online = is_online
    if (is_available !== undefined) updates.is_available = is_available
    if (current_latitude !== undefined) updates.current_latitude = current_latitude
    if (current_longitude !== undefined) updates.current_longitude = current_longitude
    if (current_heading !== undefined) updates.current_heading = current_heading
    
    if (current_latitude !== undefined || current_longitude !== undefined) {
      updates.last_location_update = new Date().toISOString()
    }

    const { data: driverProfile, error } = await supabase
      .from('driver_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating driver:', error)
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
    }

    return NextResponse.json({ driver: driverProfile })
  } catch (error) {
    console.error('Update driver error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
