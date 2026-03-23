'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      wallet:wallet(balance, bonus_balance),
      loyalty:loyalty_points(points, tier)
    `)
    .eq('id', user.id)
    .single()

  return profile
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const updates: Record<string, unknown> = {}

  const fullName = formData.get('full_name')
  const phone = formData.get('phone')
  const cpf = formData.get('cpf')
  const birthDate = formData.get('birth_date')
  const bio = formData.get('bio')

  if (fullName) updates.full_name = fullName
  if (phone) updates.phone = phone
  if (cpf) updates.cpf = cpf
  if (birthDate) updates.birth_date = birthDate
  if (bio) updates.bio = bio

  updates.updated_at = new Date().toISOString()

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return { error: 'Erro ao atualizar perfil' }
  }

  revalidatePath('/uppi/profile')
  return { profile }
}

export async function getFavoriteLocations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: locations } = await supabase
    .from('favorite_locations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return locations || []
}

export async function addFavoriteLocation(data: {
  name: string
  address: string
  latitude: number
  longitude: number
  is_home?: boolean
  is_work?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  // Se for home ou work, remove o anterior
  if (data.is_home || data.is_work) {
    await supabase
      .from('favorite_locations')
      .update({ is_home: false, is_work: false })
      .eq('user_id', user.id)
      .eq(data.is_home ? 'is_home' : 'is_work', true)
  }

  const { data: location, error } = await supabase
    .from('favorite_locations')
    .insert({
      user_id: user.id,
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      is_home: data.is_home || false,
      is_work: data.is_work || false,
      icon: data.is_home ? 'home' : data.is_work ? 'briefcase' : 'star',
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding favorite location:', error)
    return { error: 'Erro ao adicionar local' }
  }

  revalidatePath('/uppi/favorites')
  return { location }
}

export async function removeFavoriteLocation(locationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { error } = await supabase
    .from('favorite_locations')
    .delete()
    .eq('id', locationId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error removing favorite location:', error)
    return { error: 'Erro ao remover local' }
  }

  revalidatePath('/uppi/favorites')
  return { success: true }
}

export async function getEmergencyContacts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: contacts } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })

  return contacts || []
}

export async function addEmergencyContact(data: {
  name: string
  phone: string
  relationship?: string
  is_primary?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  // Se for primario, remove o anterior
  if (data.is_primary) {
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: false })
      .eq('user_id', user.id)
      .eq('is_primary', true)
  }

  const { data: contact, error } = await supabase
    .from('emergency_contacts')
    .insert({
      user_id: user.id,
      name: data.name,
      phone: data.phone,
      relationship: data.relationship,
      is_primary: data.is_primary || false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding emergency contact:', error)
    return { error: 'Erro ao adicionar contato' }
  }

  revalidatePath('/uppi/safety')
  return { contact }
}

export async function getPaymentMethods() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data: methods } = await supabase
    .from('payment_methods')
    .select('id, type, brand, last_four, is_default')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  return methods || []
}

export async function setDefaultPaymentMethod(methodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  // Remove default de todos
  await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('user_id', user.id)

  // Define novo default
  const { error } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', methodId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error setting default payment method:', error)
    return { error: 'Erro ao definir metodo padrao' }
  }

  revalidatePath('/uppi/payment')
  return { success: true }
}
