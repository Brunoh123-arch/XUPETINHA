import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/categories - Lista categorias de veiculos
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: categories, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
