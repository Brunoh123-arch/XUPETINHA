export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      address_history: {
        Row: {
          address: string
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          search_type: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          search_type?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          search_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_ride_value: number | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_ride_value?: number | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_ride_value?: number | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      driver_locations: {
        Row: {
          accuracy: number | null
          created_at: string | null
          driver_id: string
          heading: number | null
          id: string
          is_available: boolean | null
          last_updated: string | null
          latitude: number
          longitude: number
          speed: number | null
          updated_at: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          driver_id: string
          heading?: number | null
          id?: string
          is_available?: boolean | null
          last_updated?: string | null
          latitude?: number
          longitude?: number
          speed?: number | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          driver_id?: string
          heading?: number | null
          id?: string
          is_available?: boolean | null
          last_updated?: string | null
          latitude?: number
          longitude?: number
          speed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          acceptance_rate: number | null
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          cnh_expiry: string | null
          cnh_number: string | null
          cpf: string | null
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          document_url: string | null
          id: string
          is_available: boolean | null
          is_online: boolean | null
          is_verified: boolean | null
          last_verification_at: string | null
          mode: string | null
          pix_key: string | null
          rating: number | null
          rejection_count: number | null
          requires_verification: boolean | null
          total_earnings: number | null
          total_rides: number | null
          trust_score: number | null
          updated_at: string | null
          vehicle_brand: string | null
          vehicle_color: string | null
          vehicle_model: string | null
          vehicle_photo_url: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
          vehicle_year: number | null
          verification_attempts: number | null
          verification_photo_url: string | null
          verification_status: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          cnh_expiry?: string | null
          cnh_number?: string | null
          cpf?: string | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          document_url?: string | null
          id: string
          is_available?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          last_verification_at?: string | null
          mode?: string | null
          pix_key?: string | null
          rating?: number | null
          rejection_count?: number | null
          requires_verification?: boolean | null
          total_earnings?: number | null
          total_rides?: number | null
          trust_score?: number | null
          updated_at?: string | null
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_photo_url?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
          verification_attempts?: number | null
          verification_photo_url?: string | null
          verification_status?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          cnh_expiry?: string | null
          cnh_number?: string | null
          cpf?: string | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          document_url?: string | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          last_verification_at?: string | null
          mode?: string | null
          pix_key?: string | null
          rating?: number | null
          rejection_count?: number | null
          requires_verification?: boolean | null
          total_earnings?: number | null
          total_rides?: number | null
          trust_score?: number | null
          updated_at?: string | null
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_model?: string | null
          vehicle_photo_url?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
          verification_attempts?: number | null
          verification_photo_url?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      driver_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          driver_id: string
          id: string
          is_public: boolean | null
          rating: number
          reviewer_id: string
          ride_id: string | null
          tags: Json | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          driver_id: string
          id?: string
          is_public?: boolean | null
          rating: number
          reviewer_id: string
          ride_id?: string | null
          tags?: Json | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          driver_id?: string
          id?: string
          is_public?: boolean | null
          rating?: number
          reviewer_id?: string
          ride_id?: string | null
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_reviews_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      email_otps: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp?: string
          used?: boolean | null
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          notes: string | null
          resolved_at: string | null
          ride_id: string | null
          status: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          notes?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alerts_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string | null
          error_type: string | null
          id: string
          message: string | null
          stack: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          error_type?: string | null
          id?: string
          message?: string | null
          stack?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          error_type?: string | null
          id?: string
          message?: string | null
          stack?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_drivers: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          passenger_id: string
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          passenger_id: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          passenger_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_drivers_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          address: string
          created_at: string | null
          icon: string | null
          id: string
          label: string
          lat: number | null
          lng: number | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          icon?: string | null
          id?: string
          label: string
          lat?: number | null
          lng?: number | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          label?: string
          lat?: number | null
          lng?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_ride_members: {
        Row: {
          group_ride_id: string
          id: string
          joined_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          group_ride_id: string
          id?: string
          joined_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          group_ride_id?: string
          id?: string
          joined_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_ride_members_group_ride_id_fkey"
            columns: ["group_ride_id"]
            isOneToOne: false
            referencedRelation: "group_rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_ride_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_rides: {
        Row: {
          created_at: string | null
          dropoff_address: string | null
          dropoff_lat: number | null
          dropoff_lng: number | null
          id: string
          max_passengers: number | null
          name: string | null
          organizer_id: string
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          ride_id: string | null
          scheduled_time: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          dropoff_address?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          max_passengers?: number | null
          name?: string | null
          organizer_id: string
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          ride_id?: string | null
          scheduled_time?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          dropoff_address?: string | null
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          id?: string
          max_passengers?: number | null
          name?: string | null
          organizer_id?: string
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          ride_id?: string | null
          scheduled_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_rides_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_rides_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      hot_zones: {
        Row: {
          created_at: string | null
          id: string
          intensity: number | null
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          radius_meters: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intensity?: number | null
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          radius_meters?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intensity?: number | null
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          radius_meters?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          id: string
          period: string | null
          period_end: string | null
          period_start: string | null
          rank: number | null
          rating_avg: number | null
          rides_count: number | null
          score: number | null
          updated_at: string | null
          user_id: string
          user_type: string | null
        }
        Insert: {
          id?: string
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          rank?: number | null
          rating_avg?: number | null
          rides_count?: number | null
          score?: number | null
          updated_at?: string | null
          user_id: string
          user_type?: string | null
        }
        Update: {
          id?: string
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          rank?: number | null
          rating_avg?: number | null
          rides_count?: number | null
          score?: number | null
          updated_at?: string | null
          user_id?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          ride_id: string
          sender_id: string
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          ride_id: string
          sender_id: string
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          ride_id?: string
          sender_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_method: string
          pix_copy_paste: string | null
          pix_qr_code: string | null
          provider_ref: string | null
          ride_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_method: string
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          provider_ref?: string | null
          ride_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          provider_ref?: string | null
          ride_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_routes: {
        Row: {
          avg_duration: number | null
          avg_price: number | null
          created_at: string | null
          end_address: string
          end_latitude: number | null
          end_longitude: number | null
          id: string
          start_address: string
          start_latitude: number | null
          start_longitude: number | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          avg_duration?: number | null
          avg_price?: number | null
          created_at?: string | null
          end_address: string
          end_latitude?: number | null
          end_longitude?: number | null
          id?: string
          start_address: string
          start_latitude?: number | null
          start_longitude?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          avg_duration?: number | null
          avg_price?: number | null
          created_at?: string | null
          end_address?: string
          end_latitude?: number | null
          end_longitude?: number | null
          id?: string
          start_address?: string
          start_latitude?: number | null
          start_longitude?: number | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          likes_count: number | null
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_offers: {
        Row: {
          created_at: string | null
          driver_id: string
          eta_minutes: number | null
          expires_at: string | null
          id: string
          message: string | null
          offered_price: number
          ride_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          eta_minutes?: number | null
          expires_at?: string | null
          id?: string
          message?: string | null
          offered_price: number
          ride_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          eta_minutes?: number | null
          expires_at?: string | null
          id?: string
          message?: string | null
          offered_price?: number
          ride_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_offers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_offers_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          bio: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          current_mode: string | null
          email: string | null
          fcm_token: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_banned: boolean | null
          phone: string | null
          preferences: Json | null
          rating: number | null
          referral_code: string | null
          referred_by: string | null
          status: string | null
          total_rides: number | null
          total_saved: number | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          bio?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          current_mode?: string | null
          email?: string | null
          fcm_token?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          phone?: string | null
          preferences?: Json | null
          rating?: number | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string | null
          total_rides?: number | null
          total_saved?: number | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          bio?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          current_mode?: string | null
          email?: string | null
          fcm_token?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_banned?: boolean | null
          phone?: string | null
          preferences?: Json | null
          rating?: number | null
          referral_code?: string | null
          referred_by?: string | null
          status?: string | null
          total_rides?: number | null
          total_saved?: number | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          category_ratings: Json | null
          comment: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          rated_id: string
          rater_id: string
          reviewed_id: string | null
          reviewer_id: string | null
          ride_id: string
          score: number
        }
        Insert: {
          category_ratings?: Json | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          rated_id: string
          rater_id: string
          reviewed_id?: string | null
          reviewer_id?: string | null
          ride_id: string
          score: number
        }
        Update: {
          category_ratings?: Json | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          rated_id?: string
          rater_id?: string
          reviewed_id?: string | null
          reviewer_id?: string | null
          ride_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_rated_id_fkey"
            columns: ["rated_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          completed_at: string | null
          created_at: string | null
          id: string
          referred_id: string | null
          referrer_id: string
          reward_amount: number | null
          reward_paid: boolean | null
          status: string | null
        }
        Insert: {
          code: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id: string
          reward_amount?: number | null
          reward_paid?: boolean | null
          status?: string | null
        }
        Update: {
          code?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string
          reward_amount?: number | null
          reward_paid?: boolean | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_recordings: {
        Row: {
          created_at: string | null
          duration_sec: number | null
          file_url: string | null
          id: string
          ride_id: string
          size_bytes: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_sec?: number | null
          file_url?: string | null
          id?: string
          ride_id: string
          size_bytes?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_sec?: number | null
          file_url?: string | null
          id?: string
          ride_id?: string
          size_bytes?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_recordings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_recordings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_tracking: {
        Row: {
          accuracy: number | null
          created_at: string | null
          driver_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          ride_id: string
          speed: number | null
          timestamp: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          driver_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          ride_id: string
          speed?: number | null
          timestamp?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          driver_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          ride_id?: string
          speed?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_tracking_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_tracking_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          distance_km: number | null
          driver_id: string | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          estimated_duration_minutes: number | null
          final_price: number | null
          id: string
          notes: string | null
          passenger_id: string
          passenger_price_offer: number | null
          payment_method: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          scheduled_time: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_duration_minutes?: number | null
          final_price?: number | null
          id?: string
          notes?: string | null
          passenger_id: string
          passenger_price_offer?: number | null
          payment_method?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_duration_minutes?: number | null
          final_price?: number | null
          id?: string
          notes?: string | null
          passenger_id?: string
          passenger_price_offer?: number | null
          payment_method?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          scheduled_time?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          ride_id: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          ride_id?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          ride_id?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          payment_id: string | null
          plan: string
          price: number | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          plan?: string
          price?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          plan?: string
          price?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_admin: boolean | null
          read: boolean | null
          sender_id: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          read?: boolean | null
          sender_id: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          read?: boolean | null
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          priority: string | null
          ride_id: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          ride_id?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          ride_id?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          description: string | null
          icon: string | null
          id: string
          points: number | null
          title: string | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          description?: string | null
          icon?: string | null
          id?: string
          points?: number | null
          title?: string | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          description?: string | null
          icon?: string | null
          id?: string
          points?: number | null
          title?: string | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coupons: {
        Row: {
          coupon_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          used: boolean | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          used?: boolean | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_tokens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string | null
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_social_stats: {
        Row: {
          comments_received: number | null
          likes_received: number | null
          posts_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_received?: number | null
          likes_received?: number | null
          posts_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_received?: number | null
          likes_received?: number | null
          posts_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_social_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          pix_key: string | null
          reference_id: string | null
          reference_type: string | null
          ride_id: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          pix_key?: string | null
          reference_id?: string | null
          reference_type?: string | null
          ride_id?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          pix_key?: string | null
          reference_id?: string | null
          reference_type?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      social_post_likes: {
        Row: {
          created_at: string | null
          id: string | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_price_offer: {
        Args: { p_offer_id: string; p_passenger_id: string }
        Returns: Json
      }
      apply_coupon: {
        Args: { p_code: string; p_ride_value: number; p_user_id: string }
        Returns: Json
      }
      calculate_wallet_balance: { Args: { p_user_id: string }; Returns: number }
      cancel_ride: {
        Args: { p_reason?: string; p_ride_id: string; p_user_id: string }
        Returns: Json
      }
      check_and_grant_achievements: {
        Args: { p_user_id: string }
        Returns: Json
      }
      complete_ride: {
        Args: { p_driver_id: string; p_ride_id: string }
        Returns: Json
      }
      decrement_comment_count: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      find_nearby_drivers: {
        Args: {
          p_lat: number
          p_lng: number
          p_radius_km?: number
          p_vehicle_type?: string
        }
        Returns: {
          distance_km: number
          driver_id: string
          latitude: number
          longitude: number
          rating: number
          total_rides: number
          vehicle_type: string
        }[]
      }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      get_driver_dashboard_stats: {
        Args: { p_driver_id: string }
        Returns: Json
      }
      get_driver_stats: {
        Args: { p_driver_id: string; p_period?: string }
        Returns: Json
      }
      get_driver_wallet_balance: {
        Args: { p_driver_id: string }
        Returns: number
      }
      get_leaderboard:
        | {
            Args: { category?: string; limit_count?: number }
            Returns: {
              achievements_count: number
              avatar_url: string
              full_name: string
              id: string
              rank: number
              rating: number
              total_rides: number
              total_savings: number
            }[]
          }
        | {
            Args: { p_limit?: number; p_period?: string; p_user_type?: string }
            Returns: {
              avatar_url: string
              full_name: string
              rank: number
              rating_avg: number
              rides_count: number
              score: number
              user_id: string
            }[]
          }
      get_popular_routes: {
        Args: { p_limit?: number }
        Returns: {
          avg_duration: number
          avg_price: number
          end_address: string
          id: string
          start_address: string
          usage_count: number
        }[]
      }
      get_social_feed: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          comments_count: number
          created_at: string
          description: string
          has_liked: boolean
          id: string
          likes_count: number
          metadata: Json
          title: string
          type: string
          user_avatar: string
          user_id: string
          user_name: string
        }[]
      }
      increment: {
        Args: { column_name: string; row_id: string; table_name: string }
        Returns: undefined
      }
      increment_comment_count: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      request_withdrawal: {
        Args: { p_amount: number; p_driver_id: string; p_pix_key: string }
        Returns: Json
      }
      send_notification: {
        Args: {
          p_data?: Json
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      update_user_rating: { Args: { p_user_id: string }; Returns: undefined }
      upsert_driver_location: {
        Args: {
          p_driver_id: string
          p_heading?: number
          p_is_available?: boolean
          p_lat: number
          p_lng: number
          p_speed?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
