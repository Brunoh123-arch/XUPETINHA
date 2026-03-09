import { createClient } from '@/lib/supabase/client'

export interface ReviewData {
  ride_id: string
  // Aceita tanto os campos canônicos (rater_id/rated_id) quanto os aliases
  // usados pela review page (reviewer_id/reviewee_id)
  rater_id?: string
  rated_id?: string
  reviewer_id?: string
  reviewee_id?: string
  score?: number
  rating?: number
  comment?: string
  tags?: string[]
  is_anonymous?: boolean
  category_ratings?: Record<string, number>
}

export interface ReviewStats {
  average_rating: number
  total_reviews: number
  rating_distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

class ReviewService {
  private supabase = createClient()

  async submitReview(data: ReviewData) {
    try {
      // Normaliza aliases: reviewer_id → rater_id, reviewee_id → rated_id
      const raterId = data.rater_id || data.reviewer_id
      const ratedId = data.rated_id || data.reviewee_id
      // Normaliza aliases: rating → score
      const score = data.score ?? data.rating ?? 0

      if (!raterId || !ratedId) {
        return { success: false, error: 'IDs de avaliador e avaliado são obrigatórios' }
      }

      if (score < 1 || score > 5) {
        return { success: false, error: 'Nota deve ser entre 1 e 5' }
      }

      // Insert review
      const { data: review, error } = await this.supabase
        .from('ratings')
        .insert({
          ride_id: data.ride_id,
          rater_id: raterId,
          rated_id: ratedId,
          score,
          comment: data.comment || null,
          is_anonymous: data.is_anonymous ?? false,
          category_ratings: data.category_ratings ?? null,
        })
        .select()
        .single()

      if (error) {
        console.error('[v0] Error submitting review:', error)
        return { success: false, error: error.message }
      }

      // Update rated user's rating
      await this.updateUserRating(ratedId)

      return { success: true, review }
    } catch (error) {
      console.error('[v0] Unexpected error submitting review:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }

  async getReviewsForUser(userId: string, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('ratings')
        .select(`
          *,
          reviewer:profiles!ratings_rater_id_fkey(id, full_name, avatar_url),
          ride:rides(pickup_address, dropoff_address, created_at)
        `)
        .eq('rated_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { success: true, reviews: data }
    } catch (error) {
      console.error('[v0] Error fetching reviews:', error)
      return { success: false, error: 'Erro ao carregar avaliações', reviews: [] }
    }
  }

  async getReviewStats(userId: string): Promise<ReviewStats> {
    try {
      // Usa a coluna correta: 'score' (não 'rating') e o FK correto: 'rated_id' (não 'reviewee_id')
      const { data, error } = await this.supabase
        .from('ratings')
        .select('score')
        .eq('rated_id', userId)

      if (error) throw error

      const total = data.length
      if (total === 0) {
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }

      const sum = data.reduce((acc, r) => acc + (r.score ?? 0), 0)
      const average = sum / total

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      data.forEach(r => {
        const key = (r.score ?? 0) as keyof typeof distribution
        if (key >= 1 && key <= 5) distribution[key]++
      })

      return {
        average_rating: Number(average.toFixed(1)),
        total_reviews: total,
        rating_distribution: distribution
      }
    } catch (error) {
      console.error('[v0] Error getting review stats:', error)
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    }
  }

  private async updateUserRating(userId: string) {
    const stats = await this.getReviewStats(userId)
    
    // Atualiza apenas o campo 'rating' (total_reviews não existe na tabela profiles)
    await this.supabase
      .from('profiles')
      .update({
        rating: stats.average_rating,
      })
      .eq('id', userId)
  }

  async hasUserReviewedRide(userId: string, rideId: string) {
    try {
      // Usa o FK correto: 'rater_id' (não 'reviewer_id')
      const { data } = await this.supabase
        .from('ratings')
        .select('id')
        .eq('rater_id', userId)
        .eq('ride_id', rideId)
        .maybeSingle()

      return { hasReviewed: !!data, error: null }
    } catch (error) {
      return { hasReviewed: false, error: null }
    }
  }

  // Get suggested tags based on rating
  getSuggestedTags(rating: number): string[] {
    if (rating >= 4) {
      return [
        'Educado',
        'Pontual',
        'Carro limpo',
        'Direção segura',
        'Conversa agradável',
        'Profissional',
        'Rápido',
        'Atencioso'
      ]
    } else if (rating === 3) {
      return [
        'Ok',
        'Normal',
        'Atrasou um pouco',
        'Poderia melhorar',
        'Razoável'
      ]
    } else {
      return [
        'Atrasou muito',
        'Mal educado',
        'Carro sujo',
        'Direção perigosa',
        'Cancelou',
        'Não recomendo',
        'Rota errada'
      ]
    }
  }
}

export const reviewService = new ReviewService()
