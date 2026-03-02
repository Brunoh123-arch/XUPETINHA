import { createClient } from '@/lib/supabase/client'
import type { Favorite } from '@/lib/types/database'

export const favoritesService = {
  async addFavorite(userId: string, data: {
    address: string
    lat: number
    lng: number
    label?: string
    icon?: string
  }) {
    const supabase = createClient()
    
    // Schema real: colunas "latitude"/"longitude"/"label"
    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        address: data.address,
        latitude: data.lat,
        longitude: data.lng,
        label: data.label || 'Local Salvo',
        icon: data.icon || null,
      })
      .select()
      .single()

    return {
      success: !error,
      favorite,
      error: error?.message,
    }
  },

  async getFavorites(userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return {
      success: !error,
      favorites: data as Favorite[] | null,
      error: error?.message,
    }
  },

  async removeFavorite(favoriteId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId)

    return {
      success: !error,
      error: error?.message,
    }
  },

  async updateFavorite(favoriteId: string, updates: {
    label?: string
    icon?: string
  }) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('favorites')
      .update(updates)
      .eq('id', favoriteId)
      .select()
      .single()

    return {
      success: !error,
      favorite: data,
      error: error?.message,
    }
  },
}
