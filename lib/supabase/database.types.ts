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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ab_test_participants: {
        Row: {
          converted: boolean | null
          created_at: string | null
          id: string
          test_name: string
          user_id: string | null
          variant: string
        }
        Insert: {
          converted?: boolean | null
          created_at?: string | null
          id?: string
          test_name: string
          user_id?: string | null
          variant: string
        }
        Update: {
          converted?: boolean | null
          created_at?: string | null
          id?: string
          test_name?: string
          user_id?: string | null
          variant?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          badge_id: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          key: string
          name: string
          points: number | null
          required_value: number | null
          type: string | null
        }
        Insert: {
          badge_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          name: string
          points?: number | null
          required_value?: number | null
          type?: string | null
        }
        Update: {
          badge_id?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          name?: string
          points?: number | null
          required_value?: number | null
          type?: string | null
        }
        Relationships: []
      }
      address_history: {
        Row: {
          address: string
          created_at: string | null
          id: string
          last_used_at: string | null
          latitude: number | null
          longitude: number | null
          place_id: string | null
          search_type: string | null
          use_count: number | null
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          search_type?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          latitude?: number | null
          longitude?: number | null
          place_id?: string | null
          search_type?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          permissions: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      airports: {
        Row: {
          city: string
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          name: string
          state: string | null
        }
        Insert: {
          city: string
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          state?: string | null
        }
        Update: {
          city?: string
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          action_text: string | null
          action_url: string | null
          content: string
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          starts_at: string | null
          target_audience: string | null
          title: string
          type: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          starts_at?: string | null
          target_audience?: string | null
          title: string
          type: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          starts_at?: string | null
          target_audience?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      app_banners: {
        Row: {
          action_url: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          starts_at: string | null
          subtitle: string | null
          target_audience: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          starts_at?: string | null
          subtitle?: string | null
          target_audience?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          starts_at?: string | null
          subtitle?: string | null
          target_audience?: string | null
          title?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          location: unknown | null
          media_url: string | null
          message_type: string | null
          read_at: string | null
          room_id: string | null
          sender_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          location?: unknown | null
          media_url?: string | null
          message_type?: string | null
          read_at?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          location?: unknown | null
          media_url?: string | null
          message_type?: string | null
          read_at?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          closed_at: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          passenger_id: string | null
          ride_id: string | null
          status: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          passenger_id?: string | null
          ride_id?: string | null
          status?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          passenger_id?: string | null
          ride_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      city_configurations: {
        Row: {
          city: string
          country: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          launch_date: string | null
          settings: Json | null
          state: string
          timezone: string | null
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          settings?: Json | null
          state: string
          timezone?: string | null
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          settings?: Json | null
          state?: string
          timezone?: string | null
        }
        Relationships: []
      }
      city_zones: {
        Row: {
          city: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          polygon: Json | null
          updated_at: string | null
          zone_type: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          polygon?: Json | null
          updated_at?: string | null
          zone_type?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          polygon?: Json | null
          updated_at?: string | null
          zone_type?: string | null
        }
        Relationships: []
      }
      corporate_accounts: {
        Row: {
          address: string | null
          billing_email: string | null
          cnpj: string | null
          company_name: string
          contract_url: string | null
          created_at: string | null
          credit_balance: number | null
          current_spend: number | null
          email: string
          id: string
          monthly_limit: number | null
          payment_method_id: string | null
          phone: string | null
          status: string | null
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          cnpj?: string | null
          company_name: string
          contract_url?: string | null
          created_at?: string | null
          credit_balance?: number | null
          current_spend?: number | null
          email: string
          id?: string
          monthly_limit?: number | null
          payment_method_id?: string | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          cnpj?: string | null
          company_name?: string
          contract_url?: string | null
          created_at?: string | null
          credit_balance?: number | null
          current_spend?: number | null
          email?: string
          id?: string
          monthly_limit?: number | null
          payment_method_id?: string | null
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      coupon_uses: {
        Row: {
          coupon_id: string | null
          discount_applied: number
          id: string
          ride_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          discount_applied: number
          id?: string
          ride_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          discount_applied?: number
          id?: string
          ride_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applicable_categories: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          first_ride_only: boolean | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          max_uses: number | null
          max_uses_per_user: number | null
          min_fare: number | null
          uses_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          first_ride_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_fare?: number | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          first_ride_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_fare?: number | null
          uses_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      delivery_orders: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          delivery_address: string
          delivery_lat: number | null
          delivery_lng: number | null
          driver_id: string | null
          id: string
          item_description: string | null
          item_weight_kg: number | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          price: number | null
          recipient_name: string | null
          recipient_phone: string | null
          sender_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_address: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          driver_id?: string | null
          id?: string
          item_description?: string | null
          item_weight_kg?: number | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          price?: number | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sender_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string
          delivery_lat?: number | null
          delivery_lng?: number | null
          driver_id?: string | null
          id?: string
          item_description?: string | null
          item_weight_kg?: number | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          price?: number | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sender_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      driver_documents: {
        Row: {
          created_at: string | null
          document_number: string | null
          document_type: string
          document_url: string
          driver_id: string | null
          expiry_date: string | null
          id: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_number?: string | null
          document_type: string
          document_url: string
          driver_id?: string | null
          expiry_date?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_number?: string | null
          document_type?: string
          document_url?: string
          driver_id?: string | null
          expiry_date?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_earnings: {
        Row: {
          amount: number
          available_at: string | null
          bonus_amount: number | null
          commission_amount: number
          commission_rate: number
          created_at: string | null
          driver_id: string | null
          id: string
          net_amount: number
          ride_id: string | null
          status: string | null
          tips_amount: number | null
          type: string
        }
        Insert: {
          amount: number
          available_at?: string | null
          bonus_amount?: number | null
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          driver_id?: string | null
          id?: string
          net_amount: number
          ride_id?: string | null
          status?: string | null
          tips_amount?: number | null
          type: string
        }
        Update: {
          amount?: number
          available_at?: string | null
          bonus_amount?: number | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          driver_id?: string | null
          id?: string
          net_amount?: number
          ride_id?: string | null
          status?: string | null
          tips_amount?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_levels: {
        Row: {
          avg_rating: number | null
          created_at: string | null
          driver_id: string | null
          id: string
          rides_count: number | null
          tier: string | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          avg_rating?: number | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rides_count?: number | null
          tier?: string | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          avg_rating?: number | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rides_count?: number | null
          tier?: string | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      driver_locations: {
        Row: {
          accuracy: number | null
          driver_id: string | null
          heading: number | null
          id: string
          is_online: boolean | null
          latitude: number
          longitude: number
          speed: number | null
          updated_at: string | null
        }
        Insert: {
          accuracy?: number | null
          driver_id?: string | null
          heading?: number | null
          id?: string
          is_online?: boolean | null
          latitude: number
          longitude: number
          speed?: number | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number | null
          driver_id?: string | null
          heading?: number | null
          id?: string
          is_online?: boolean | null
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
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          bio: string | null
          cover_photo_url: string | null
          created_at: string | null
          driver_id: string | null
          featured_until: string | null
          id: string
          is_featured: boolean | null
          languages: string[] | null
          profile_photo_url: string | null
          specialties: string[] | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          driver_id?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          languages?: string[] | null
          profile_photo_url?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          driver_id?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          languages?: string[] | null
          profile_photo_url?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          is_public: boolean | null
          rating: number
          responded_at: string | null
          response: string | null
          reviewer_id: string | null
          ride_id: string | null
          tags: string[] | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          is_public?: boolean | null
          rating: number
          responded_at?: string | null
          response?: string | null
          reviewer_id?: string | null
          ride_id?: string | null
          tags?: string[] | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          is_public?: boolean | null
          rating?: number
          responded_at?: string | null
          response?: string | null
          reviewer_id?: string | null
          ride_id?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      driver_stats: {
        Row: {
          average_rating: number | null
          created_at: string | null
          date: string
          driver_id: string | null
          gross_earnings: number | null
          id: string
          net_earnings: number | null
          online_hours: number | null
          rides_cancelled: number | null
          rides_completed: number | null
          tips_received: number | null
          total_distance: number | null
          total_duration: number | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          date: string
          driver_id?: string | null
          gross_earnings?: number | null
          id?: string
          net_earnings?: number | null
          online_hours?: number | null
          rides_cancelled?: number | null
          rides_completed?: number | null
          tips_received?: number | null
          total_distance?: number | null
          total_duration?: number | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          date?: string
          driver_id?: string | null
          gross_earnings?: number | null
          id?: string
          net_earnings?: number | null
          online_hours?: number | null
          rides_cancelled?: number | null
          rides_completed?: number | null
          tips_received?: number | null
          total_distance?: number | null
          total_duration?: number | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          acceptance_rate: number | null
          background_check_date: string | null
          background_check_status: string | null
          cancellation_rate: number | null
          created_at: string | null
          current_location: unknown | null
          id: string
          is_available: boolean | null
          is_online: boolean | null
          last_location_update: string | null
          license_category: string
          license_expiry: string
          license_number: string
          license_state: string
          license_verified: boolean | null
          rating: number | null
          status: string | null
          total_earnings: number | null
          total_rides: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          background_check_date?: string | null
          background_check_status?: string | null
          cancellation_rate?: number | null
          created_at?: string | null
          current_location?: unknown | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          last_location_update?: string | null
          license_category: string
          license_expiry: string
          license_number: string
          license_state: string
          license_verified?: boolean | null
          rating?: number | null
          status?: string | null
          total_earnings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          background_check_date?: string | null
          background_check_status?: string | null
          cancellation_rate?: number | null
          created_at?: string | null
          current_location?: unknown | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          last_location_update?: string | null
          license_category?: string
          license_expiry?: string
          license_number?: string
          license_state?: string
          license_verified?: boolean | null
          rating?: number | null
          status?: string | null
          total_earnings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
          alert_type: string
          audio_recording_url: string | null
          created_at: string | null
          id: string
          location: unknown | null
          notes: string | null
          notified_authorities: boolean | null
          notified_contacts: string[] | null
          responded_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          ride_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          audio_recording_url?: string | null
          created_at?: string | null
          id?: string
          location?: unknown | null
          notes?: string | null
          notified_authorities?: boolean | null
          notified_contacts?: string[] | null
          responded_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          audio_recording_url?: string | null
          created_at?: string | null
          id?: string
          location?: unknown | null
          notes?: string | null
          notified_authorities?: boolean | null
          notified_contacts?: string[] | null
          responded_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      faq_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          not_helpful_count: number | null
          question: string
          sort_order: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          not_helpful_count?: number | null
          question: string
          sort_order?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          not_helpful_count?: number | null
          question?: string
          sort_order?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          question: string
          target_audience: string | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question: string
          target_audience?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question?: string
          target_audience?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      favorite_locations: {
        Row: {
          address: string | null
          created_at: string | null
          icon: string | null
          id: string
          label: string
          lat: number | null
          lng: number | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          label: string
          lat?: number | null
          lng?: number | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          label?: string
          lat?: number | null
          lng?: number | null
          user_id?: string
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          platform: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          conditions: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          name: string
          rollout_percentage: number | null
          target_groups: string[] | null
          target_users: string[] | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          rollout_percentage?: number | null
          target_groups?: string[] | null
          target_users?: string[] | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          rollout_percentage?: number | null
          target_groups?: string[] | null
          target_users?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      geographic_zones: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          polygon: Json | null
          radius_km: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          polygon?: Json | null
          radius_km?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          polygon?: Json | null
          radius_km?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      group_ride_participants: {
        Row: {
          group_ride_id: string
          id: string
          joined_at: string | null
          payment_id: string | null
          seats: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          group_ride_id: string
          id?: string
          joined_at?: string | null
          payment_id?: string | null
          seats?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          group_ride_id?: string
          id?: string
          joined_at?: string | null
          payment_id?: string | null
          seats?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      group_rides: {
        Row: {
          created_at: string | null
          destination_address: string
          destination_lat: number | null
          destination_lng: number | null
          driver_id: string | null
          id: string
          max_passengers: number | null
          notes: string | null
          organizer_id: string
          origin_address: string
          origin_lat: number | null
          origin_lng: number | null
          price_per_seat: number | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination_address: string
          destination_lat?: number | null
          destination_lng?: number | null
          driver_id?: string | null
          id?: string
          max_passengers?: number | null
          notes?: string | null
          organizer_id: string
          origin_address: string
          origin_lat?: number | null
          origin_lng?: number | null
          price_per_seat?: number | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination_address?: string
          destination_lat?: number | null
          destination_lng?: number | null
          driver_id?: string | null
          id?: string
          max_passengers?: number | null
          notes?: string | null
          organizer_id?: string
          origin_address?: string
          origin_lat?: number | null
          origin_lng?: number | null
          price_per_seat?: number | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      in_app_messages: {
        Row: {
          action_text: string | null
          action_url: string | null
          body: string
          created_at: string | null
          expires_at: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          body: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          body?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      intercity_bookings: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          passenger_id: string
          payment_id: string | null
          ride_id: string
          seats: number | null
          status: string | null
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          passenger_id: string
          payment_id?: string | null
          ride_id: string
          seats?: number | null
          status?: string | null
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          passenger_id?: string
          payment_id?: string | null
          ride_id?: string
          seats?: number | null
          status?: string | null
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      intercity_rides: {
        Row: {
          arrival_at: string | null
          created_at: string | null
          departure_at: string | null
          destination_address: string | null
          destination_city: string
          destination_lat: number | null
          destination_lng: number | null
          driver_id: string | null
          id: string
          notes: string | null
          origin_address: string | null
          origin_city: string
          origin_lat: number | null
          origin_lng: number | null
          passenger_id: string
          price: number | null
          seats: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          arrival_at?: string | null
          created_at?: string | null
          departure_at?: string | null
          destination_address?: string | null
          destination_city: string
          destination_lat?: number | null
          destination_lng?: number | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          origin_address?: string | null
          origin_city: string
          origin_lat?: number | null
          origin_lng?: number | null
          passenger_id: string
          price?: number | null
          seats?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          arrival_at?: string | null
          created_at?: string | null
          departure_at?: string | null
          destination_address?: string | null
          destination_city?: string
          destination_lat?: number | null
          destination_lng?: number | null
          driver_id?: string | null
          id?: string
          notes?: string | null
          origin_address?: string | null
          origin_city?: string
          origin_lat?: number | null
          origin_lng?: number | null
          passenger_id?: string
          price?: number | null
          seats?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      intercity_routes: {
        Row: {
          base_price: number
          created_at: string | null
          destination_city: string
          destination_state: string
          distance_km: number
          estimated_duration_minutes: number
          id: string
          is_active: boolean | null
          origin_city: string
          origin_state: string
        }
        Insert: {
          base_price: number
          created_at?: string | null
          destination_city: string
          destination_state: string
          distance_km: number
          estimated_duration_minutes: number
          id?: string
          is_active?: boolean | null
          origin_city: string
          origin_state: string
        }
        Update: {
          base_price?: number
          created_at?: string | null
          destination_city?: string
          destination_state?: string
          distance_km?: number
          estimated_duration_minutes?: number
          id?: string
          is_active?: boolean | null
          origin_city?: string
          origin_state?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          id: string
          period: string
          points: number | null
          rank: number | null
          updated_at: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          id?: string
          period?: string
          points?: number | null
          rank?: number | null
          updated_at?: string | null
          user_id: string
          user_type?: string
        }
        Update: {
          id?: string
          period?: string
          points?: number | null
          rank?: number | null
          updated_at?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          published_at: string | null
          title: string
          type: string
          updated_at: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          title: string
          type: string
          updated_at?: string | null
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          available_points: number | null
          created_at: string | null
          id: string
          lifetime_points: number | null
          tier: string | null
          tier_progress: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_points?: number | null
          created_at?: string | null
          id?: string
          lifetime_points?: number | null
          tier?: string | null
          tier_progress?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_points?: number | null
          created_at?: string | null
          id?: string
          lifetime_points?: number | null
          tier?: string | null
          tier_progress?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_tier: string | null
          name: string
          points_required: number
          quantity_available: number | null
          quantity_redeemed: number | null
          reward_type: string
          reward_value: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_tier?: string | null
          name: string
          points_required: number
          quantity_available?: number | null
          quantity_redeemed?: number | null
          reward_type: string
          reward_value?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_tier?: string | null
          name?: string
          points_required?: number
          quantity_available?: number | null
          quantity_redeemed?: number | null
          reward_type?: string
          reward_value?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          badge_url: string | null
          benefits: Json | null
          color: string | null
          created_at: string | null
          id: string
          min_points: number
          multiplier: number | null
          name: string
        }
        Insert: {
          badge_url?: string | null
          benefits?: Json | null
          color?: string | null
          created_at?: string | null
          id?: string
          min_points: number
          multiplier?: number | null
          name: string
        }
        Update: {
          badge_url?: string | null
          benefits?: Json | null
          color?: string | null
          created_at?: string | null
          id?: string
          min_points?: number
          multiplier?: number | null
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          receiver_id: string | null
          ride_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          receiver_id?: string | null
          ride_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          receiver_id?: string | null
          ride_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string | null
          data: Json | null
          id: string
          image_url: string | null
          is_read: boolean | null
          read_at: string | null
          sent_via: string[] | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          sent_via?: string[] | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          sent_via?: string[] | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      partner_companies: {
        Row: {
          address: string | null
          cnpj: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          max_employees: number | null
          name: string
          plan: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_employees?: number | null
          name: string
          plan?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_employees?: number | null
          name?: string
          plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_disputes: {
        Row: {
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string
          payment_id: string | null
          reason: string
          resolution: string | null
          resolved_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          payment_id?: string | null
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          payment_id?: string | null
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          billing_address: Json | null
          brand: string | null
          created_at: string | null
          expiry_month: number | null
          expiry_year: number | null
          holder_name: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_verified: boolean | null
          last_four: string | null
          provider: string | null
          token: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          brand?: string | null
          created_at?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          holder_name?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_verified?: boolean | null
          last_four?: string | null
          provider?: string | null
          token?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          brand?: string | null
          created_at?: string | null
          expiry_month?: number | null
          expiry_year?: number | null
          holder_name?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_verified?: boolean | null
          last_four?: string | null
          provider?: string | null
          token?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_splits: {
        Row: {
          amount_per_person: number
          created_at: string | null
          expires_at: string | null
          id: string
          initiator_id: string | null
          ride_id: string | null
          split_count: number
          status: string | null
          total_amount: number
        }
        Insert: {
          amount_per_person: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          initiator_id?: string | null
          ride_id?: string | null
          split_count: number
          status?: string | null
          total_amount: number
        }
        Update: {
          amount_per_person?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          initiator_id?: string | null
          ride_id?: string | null
          split_count?: number
          status?: string | null
          total_amount?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          paid_at: string | null
          payment_method_id: string | null
          provider: string | null
          provider_response: Json | null
          provider_transaction_id: string | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          ride_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          payment_method_id?: string | null
          provider?: string | null
          provider_response?: Json | null
          provider_transaction_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          payment_method_id?: string | null
          provider?: string | null
          provider_response?: Json | null
          provider_transaction_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone: string
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone: string
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone?: string
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      price_offers: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          driver_id: string | null
          expires_at: string | null
          id: string
          message: string | null
          offered_price: number
          original_price: number | null
          rejected_at: string | null
          ride_id: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          offered_price: number
          original_price?: number | null
          rejected_at?: string | null
          ride_id?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          driver_id?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          offered_price?: number
          original_price?: number | null
          rejected_at?: string | null
          ride_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_offers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
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
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          is_verified: boolean | null
          phone: string | null
          rating: number | null
          total_rides: number | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_verified?: boolean | null
          phone?: string | null
          rating?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      promo_campaigns: {
        Row: {
          budget: number | null
          campaign_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order: number | null
          name: string
          spent: number | null
          starts_at: string
          target_audience: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          budget?: number | null
          campaign_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order?: number | null
          name: string
          spent?: number | null
          starts_at: string
          target_audience?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          budget?: number | null
          campaign_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order?: number | null
          name?: string
          spent?: number | null
          starts_at?: string
          target_audience?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          max_uses: number | null
          max_uses_per_user: number | null
          min_ride_value: number | null
          starts_at: string | null
          target_user_type: string | null
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_ride_value?: number | null
          starts_at?: string | null
          target_user_type?: string | null
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_ride_value?: number | null
          starts_at?: string | null
          target_user_type?: string | null
          uses_count?: number | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applicable_categories: string[] | null
          applicable_days: number[] | null
          applicable_hours: number[] | null
          applicable_regions: string[] | null
          budget: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          max_uses: number | null
          max_uses_per_user: number | null
          min_fare: number | null
          name: string
          promotion_type: string
          spent: number | null
          starts_at: string
          target_audience: string | null
          uses_count: number | null
          value: number
          value_type: string
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_days?: number[] | null
          applicable_hours?: number[] | null
          applicable_regions?: string[] | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_fare?: number | null
          name: string
          promotion_type: string
          spent?: number | null
          starts_at: string
          target_audience?: string | null
          uses_count?: number | null
          value: number
          value_type: string
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_days?: number[] | null
          applicable_hours?: number[] | null
          applicable_regions?: string[] | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_fare?: number | null
          name?: string
          promotion_type?: string
          spent?: number | null
          starts_at?: string
          target_audience?: string | null
          uses_count?: number | null
          value?: number
          value_type?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          rated_id: string | null
          rater_id: string | null
          rating: number
          ride_id: string | null
          tags: string[] | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          rated_id?: string | null
          rater_id?: string | null
          rating: number
          ride_id?: string | null
          tags?: string[] | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          rated_id?: string | null
          rater_id?: string | null
          rating?: number
          ride_id?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_referrals: number | null
          referee_bonus: number | null
          referral_count: number | null
          referrer_bonus: number | null
          total_earned: number | null
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_referrals?: number | null
          referee_bonus?: number | null
          referral_count?: number | null
          referrer_bonus?: number | null
          total_earned?: number | null
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_referrals?: number | null
          referee_bonus?: number | null
          referral_count?: number | null
          referrer_bonus?: number | null
          total_earned?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          qualified_at: string | null
          referee_bonus_amount: number | null
          referee_bonus_paid: boolean | null
          referee_id: string | null
          referral_code_id: string | null
          referrer_bonus_amount: number | null
          referrer_bonus_paid: boolean | null
          referrer_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          qualified_at?: string | null
          referee_bonus_amount?: number | null
          referee_bonus_paid?: boolean | null
          referee_id?: string | null
          referral_code_id?: string | null
          referrer_bonus_amount?: number | null
          referrer_bonus_paid?: boolean | null
          referrer_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          qualified_at?: string | null
          referee_bonus_amount?: number | null
          referee_bonus_paid?: boolean | null
          referee_id?: string | null
          referral_code_id?: string | null
          referrer_bonus_amount?: number | null
          referrer_bonus_paid?: boolean | null
          referrer_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      ride_cancellations: {
        Row: {
          cancelled_by_id: string | null
          cancelled_by_type: string
          created_at: string | null
          fee_charged: number | null
          fee_waived: boolean | null
          id: string
          reason_code: string
          reason_text: string | null
          ride_id: string | null
          waiver_reason: string | null
        }
        Insert: {
          cancelled_by_id?: string | null
          cancelled_by_type: string
          created_at?: string | null
          fee_charged?: number | null
          fee_waived?: boolean | null
          id?: string
          reason_code: string
          reason_text?: string | null
          ride_id?: string | null
          waiver_reason?: string | null
        }
        Update: {
          cancelled_by_id?: string | null
          cancelled_by_type?: string
          created_at?: string | null
          fee_charged?: number | null
          fee_waived?: boolean | null
          id?: string
          reason_code?: string
          reason_text?: string | null
          ride_id?: string | null
          waiver_reason?: string | null
        }
        Relationships: []
      }
      ride_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          latitude: number | null
          longitude: number | null
          ride_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          ride_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          ride_id?: string | null
        }
        Relationships: []
      }
      ride_ratings: {
        Row: {
          created_at: string | null
          driver_comment: string | null
          driver_rating: number | null
          driver_tags: string[] | null
          id: string
          passenger_comment: string | null
          passenger_rating: number | null
          passenger_tags: string[] | null
          rated_at: string | null
          ride_id: string | null
        }
        Insert: {
          created_at?: string | null
          driver_comment?: string | null
          driver_rating?: number | null
          driver_tags?: string[] | null
          id?: string
          passenger_comment?: string | null
          passenger_rating?: number | null
          passenger_tags?: string[] | null
          rated_at?: string | null
          ride_id?: string | null
        }
        Update: {
          created_at?: string | null
          driver_comment?: string | null
          driver_rating?: number | null
          driver_tags?: string[] | null
          id?: string
          passenger_comment?: string | null
          passenger_rating?: number | null
          passenger_tags?: string[] | null
          rated_at?: string | null
          ride_id?: string | null
        }
        Relationships: []
      }
      rides: {
        Row: {
          accepted_at: string | null
          actual_distance: number | null
          actual_duration: number | null
          base_fare: number
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          category: string
          completed_at: string | null
          coupon_id: string | null
          created_at: string | null
          discount_amount: number | null
          distance_fare: number | null
          driver_arrived_at: string | null
          driver_id: string | null
          dropoff_address: string
          dropoff_location: unknown
          dropoff_place_id: string | null
          estimated_distance: number | null
          estimated_duration: number | null
          final_fare: number | null
          has_luggage: boolean | null
          has_pet: boolean | null
          id: string
          is_scheduled: boolean | null
          notes: string | null
          paid_at: string | null
          passenger_count: number | null
          passenger_id: string | null
          payment_method_id: string | null
          payment_status: string | null
          pickup_address: string
          pickup_location: unknown
          pickup_place_id: string | null
          requested_at: string | null
          requires_child_seat: boolean | null
          requires_wheelchair_access: boolean | null
          route_polyline: string | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          surge_amount: number | null
          surge_multiplier: number | null
          time_fare: number | null
          tip_amount: number | null
          toll_amount: number | null
          total_fare: number
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          actual_distance?: number | null
          actual_duration?: number | null
          base_fare: number
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          category: string
          completed_at?: string | null
          coupon_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          distance_fare?: number | null
          driver_arrived_at?: string | null
          driver_id?: string | null
          dropoff_address: string
          dropoff_location: unknown
          dropoff_place_id?: string | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          final_fare?: number | null
          has_luggage?: boolean | null
          has_pet?: boolean | null
          id?: string
          is_scheduled?: boolean | null
          notes?: string | null
          paid_at?: string | null
          passenger_count?: number | null
          passenger_id?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          pickup_address: string
          pickup_location: unknown
          pickup_place_id?: string | null
          requested_at?: string | null
          requires_child_seat?: boolean | null
          requires_wheelchair_access?: boolean | null
          route_polyline?: string | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          surge_amount?: number | null
          surge_multiplier?: number | null
          time_fare?: number | null
          tip_amount?: number | null
          toll_amount?: number | null
          total_fare: number
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          actual_distance?: number | null
          actual_duration?: number | null
          base_fare?: number
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          category?: string
          completed_at?: string | null
          coupon_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          distance_fare?: number | null
          driver_arrived_at?: string | null
          driver_id?: string | null
          dropoff_address?: string
          dropoff_location?: unknown
          dropoff_place_id?: string | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          final_fare?: number | null
          has_luggage?: boolean | null
          has_pet?: boolean | null
          id?: string
          is_scheduled?: boolean | null
          notes?: string | null
          paid_at?: string | null
          passenger_count?: number | null
          passenger_id?: string | null
          payment_method_id?: string | null
          payment_status?: string | null
          pickup_address?: string
          pickup_location?: unknown
          pickup_place_id?: string | null
          requested_at?: string | null
          requires_child_seat?: boolean | null
          requires_wheelchair_access?: boolean | null
          route_polyline?: string | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          surge_amount?: number | null
          surge_multiplier?: number | null
          time_fare?: number | null
          tip_amount?: number | null
          toll_amount?: number | null
          total_fare?: number
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
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
      safety_reports: {
        Row: {
          action_taken: string | null
          created_at: string | null
          description: string
          evidence_urls: string[] | null
          id: string
          report_type: string
          reported_id: string | null
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          ride_id: string | null
          severity: string | null
          status: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          description: string
          evidence_urls?: string[] | null
          id?: string
          report_type: string
          reported_id?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          ride_id?: string | null
          severity?: string | null
          status?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          description?: string
          evidence_urls?: string[] | null
          id?: string
          report_type?: string
          reported_id?: string | null
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          ride_id?: string | null
          severity?: string | null
          status?: string | null
        }
        Relationships: []
      }
      saved_places: {
        Row: {
          address: string
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string | null
          location: unknown
          name: string
          place_id: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          location: unknown
          name: string
          place_id?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          location?: unknown
          name?: string
          place_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scheduled_rides: {
        Row: {
          category: string
          created_at: string | null
          dropoff_address: string
          dropoff_location: unknown
          id: string
          notes: string | null
          passenger_id: string | null
          pickup_address: string
          pickup_location: unknown
          reminder_sent: boolean | null
          ride_id: string | null
          scheduled_for: string
          status: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          dropoff_address: string
          dropoff_location: unknown
          id?: string
          notes?: string | null
          passenger_id?: string | null
          pickup_address: string
          pickup_location: unknown
          reminder_sent?: boolean | null
          ride_id?: string | null
          scheduled_for: string
          status?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          dropoff_address?: string
          dropoff_location?: unknown
          id?: string
          notes?: string | null
          passenger_id?: string | null
          pickup_address?: string
          pickup_location?: unknown
          reminder_sent?: boolean | null
          ride_id?: string | null
          scheduled_for?: string
          status?: string | null
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          area: unknown
          city: string
          country: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          name: string
          state: string
          timezone: string | null
        }
        Insert: {
          area: unknown
          city: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          state: string
          timezone?: string | null
        }
        Update: {
          area?: unknown
          city?: string
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          state?: string
          timezone?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          achievement_id: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_pinned: boolean | null
          likes_count: number | null
          ride_id: string | null
          shares_count: number | null
          type: string | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          achievement_id?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          ride_id?: string | null
          shares_count?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          achievement_id?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean | null
          likes_count?: number | null
          ride_id?: string | null
          shares_count?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      sos_alerts: {
        Row: {
          alert_type: string
          audio_url: string | null
          authorities_notified: boolean | null
          contacts_notified: string[] | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          ride_id: string | null
          status: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          alert_type: string
          audio_url?: string | null
          authorities_notified?: boolean | null
          contacts_notified?: string[] | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          alert_type?: string
          audio_url?: string | null
          authorities_notified?: boolean | null
          contacts_notified?: string[] | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      sos_events: {
        Row: {
          created_at: string | null
          id: string
          lat: number | null
          lng: number | null
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
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
          resolved_by?: string | null
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
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          payment_method_id: string | null
          plan_name: string
          price: number
          starts_at: string
          status: string | null
          trial_ends_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          payment_method_id?: string | null
          plan_name: string
          price: number
          starts_at: string
          status?: string | null
          trial_ends_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          payment_method_id?: string | null
          plan_name?: string
          price?: number
          starts_at?: string
          status?: string | null
          trial_ends_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          id: string
          is_from_support: boolean | null
          is_read: boolean | null
          message: string
          read_at: string | null
          sender_id: string | null
          ticket_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_from_support?: boolean | null
          is_read?: boolean | null
          message: string
          read_at?: string | null
          sender_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_from_support?: boolean | null
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          sender_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
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
          assigned_to: string | null
          attachments: string[] | null
          category: string
          closed_at: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          ride_id: string | null
          satisfaction_rating: number | null
          status: string | null
          subcategory: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: string[] | null
          category: string
          closed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          subcategory?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: string[] | null
          category?: string
          closed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          subcategory?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      surge_pricing: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          multiplier: number
          reason: string | null
          starts_at: string
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number
          reason?: string | null
          starts_at: string
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number
          reason?: string | null
          starts_at?: string
          zone_id?: string | null
        }
        Relationships: []
      }
      surge_zones: {
        Row: {
          area: unknown
          created_at: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          multiplier: number
          name: string | null
          reason: string | null
          starts_at: string | null
        }
        Insert: {
          area: unknown
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          multiplier: number
          name?: string | null
          reason?: string | null
          starts_at?: string | null
        }
        Update: {
          area?: unknown
          created_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number
          name?: string | null
          reason?: string | null
          starts_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      terms_acceptances: {
        Row: {
          accepted_at: string | null
          id: string
          ip_address: string | null
          terms_version_id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          ip_address?: string | null
          terms_version_id: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          ip_address?: string | null
          terms_version_id?: string
          user_id?: string
        }
        Relationships: []
      }
      terms_versions: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          published_at: string | null
          type: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          type: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          published_at?: string | null
          type?: string
          version?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          status: string | null
          type: string
          user_id: string | null
          wallet_id: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type: string
          user_id?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
          wallet_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_id: string
          device_name: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          last_active_at: string | null
          os_version: string | null
          push_token: string | null
          user_id: string | null
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_id: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          os_version?: string | null
          push_token?: string | null
          user_id?: string | null
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_id?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          os_version?: string | null
          push_token?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          device_id: string | null
          ended_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity_at: string | null
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          device_id?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          device_id?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          sound_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
          vibration_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          sound_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
          vibration_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          sound_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
          vibration_enabled?: boolean | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          avg_rating: number | null
          created_at: string | null
          favorite_category: string | null
          id: string
          last_ride_at: string | null
          most_visited_place: string | null
          streak_days: number | null
          total_distance: number | null
          total_rides: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avg_rating?: number | null
          created_at?: string | null
          favorite_category?: string | null
          id?: string
          last_ride_at?: string | null
          most_visited_place?: string | null
          streak_days?: number | null
          total_distance?: number | null
          total_rides?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avg_rating?: number | null
          created_at?: string | null
          favorite_category?: string | null
          id?: string
          last_ride_at?: string | null
          most_visited_place?: string | null
          streak_days?: number | null
          total_distance?: number | null
          total_rides?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_verifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          rejection_reason: string | null
          status: string | null
          user_id: string | null
          verification_data: Json | null
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          user_id?: string | null
          verification_data?: Json | null
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          user_id?: string | null
          verification_data?: Json | null
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      vehicle_categories: {
        Row: {
          base_multiplier: number | null
          created_at: string | null
          description: string | null
          display_name: string
          features: string[] | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          min_seats: number | null
          min_year: number | null
          name: string
          sort_order: number | null
        }
        Insert: {
          base_multiplier?: number | null
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: string[] | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          min_seats?: number | null
          min_year?: number | null
          name: string
          sort_order?: number | null
        }
        Update: {
          base_multiplier?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: string[] | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          min_seats?: number | null
          min_year?: number | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          category: string
          chassis: string | null
          color: string
          created_at: string | null
          crlv_url: string | null
          driver_id: string | null
          fuel_type: string | null
          has_air_conditioning: boolean | null
          has_child_seat: boolean | null
          has_pet_friendly: boolean | null
          has_wheelchair_access: boolean | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          model: string
          photo_url: string | null
          plate: string
          renavam: string | null
          seats: number | null
          status: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          brand: string
          category: string
          chassis?: string | null
          color: string
          created_at?: string | null
          crlv_url?: string | null
          driver_id?: string | null
          fuel_type?: string | null
          has_air_conditioning?: boolean | null
          has_child_seat?: boolean | null
          has_pet_friendly?: boolean | null
          has_wheelchair_access?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          model: string
          photo_url?: string | null
          plate: string
          renavam?: string | null
          seats?: number | null
          status?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          brand?: string
          category?: string
          chassis?: string | null
          color?: string
          created_at?: string | null
          crlv_url?: string | null
          driver_id?: string | null
          fuel_type?: string | null
          has_air_conditioning?: boolean | null
          has_child_seat?: boolean | null
          has_pet_friendly?: boolean | null
          has_wheelchair_access?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          model?: string
          photo_url?: string | null
          plate?: string
          renavam?: string | null
          seats?: number | null
          status?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string | null
          type: string
          user_id: string | null
          wallet_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type: string
          user_id?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
          wallet_id?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          last_transaction_at: string | null
          pending_balance: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          last_transaction_at?: string | null
          pending_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          last_transaction_at?: string | null
          pending_balance?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_ride_fare: {
        Args: {
          p_category: string
          p_distance_km: number
          p_duration_minutes: number
          p_surge_multiplier?: number
        }
        Returns: {
          base_fare: number
          distance_fare: number
          surge_amount: number
          time_fare: number
          total_fare: number
        }[]
      }
      find_nearby_drivers: {
        Args: {
          p_category: string
          p_limit?: number
          p_location: unknown
          p_radius_meters?: number
        }
        Returns: {
          avatar_url: string
          distance_meters: number
          driver_id: string
          eta_minutes: number
          full_name: string
          rating: number
          user_id: string
          vehicle_brand: string
          vehicle_color: string
          vehicle_model: string
          vehicle_plate: string
        }[]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_in_service_area: {
        Args: { p_location: unknown }
        Returns: boolean
      }
      update_driver_rating: {
        Args: { p_driver_id: string }
        Returns: undefined
      }
      update_user_rating: {
        Args: { p_user_id: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
