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
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          points: number | null
          reward_type: string | null
          reward_value: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          reward_type?: string | null
          reward_value?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          points?: number | null
          reward_type?: string | null
          reward_value?: number | null
          title?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_super_admin: boolean | null
          permissions: Json | null
          role_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          permissions?: Json | null
          role_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          permissions?: Json | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      airports: {
        Row: {
          city: string | null
          code: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          pickup_instructions: string | null
          special_rules: Json | null
          state: string | null
          surcharge: number | null
        }
        Insert: {
          city?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          pickup_instructions?: string | null
          special_rules?: Json | null
          state?: string | null
          surcharge?: number | null
        }
        Update: {
          city?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          pickup_instructions?: string | null
          special_rules?: Json | null
          state?: string | null
          surcharge?: number | null
        }
        Relationships: []
      }
      analytics_daily: {
        Row: {
          active_drivers: number | null
          active_passengers: number | null
          avg_rating: number | null
          avg_ride_distance: number | null
          avg_ride_duration: number | null
          avg_ride_price: number | null
          cancelled_rides: number | null
          completed_rides: number | null
          created_at: string | null
          date: string
          id: string
          new_drivers: number | null
          new_passengers: number | null
          surge_rides: number | null
          total_commission: number | null
          total_revenue: number | null
          total_rides: number | null
        }
        Insert: {
          active_drivers?: number | null
          active_passengers?: number | null
          avg_rating?: number | null
          avg_ride_distance?: number | null
          avg_ride_duration?: number | null
          avg_ride_price?: number | null
          cancelled_rides?: number | null
          completed_rides?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_drivers?: number | null
          new_passengers?: number | null
          surge_rides?: number | null
          total_commission?: number | null
          total_revenue?: number | null
          total_rides?: number | null
        }
        Update: {
          active_drivers?: number | null
          active_passengers?: number | null
          avg_rating?: number | null
          avg_ride_distance?: number | null
          avg_ride_duration?: number | null
          avg_ride_price?: number | null
          cancelled_rides?: number | null
          completed_rides?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_drivers?: number | null
          new_passengers?: number | null
          surge_rides?: number | null
          total_commission?: number | null
          total_revenue?: number | null
          total_rides?: number | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_definitions: {
        Row: {
          category: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          reward_type: string | null
          reward_value: number
          starts_at: string
          target_value: number
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          reward_type?: string | null
          reward_value: number
          starts_at: string
          target_value: number
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          reward_type?: string | null
          reward_value?: number
          starts_at?: string
          target_value?: number
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          ride_id: string
          sender_id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          ride_id: string
          sender_id: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          ride_id?: string
          sender_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      city_zones: {
        Row: {
          boundaries: Json | null
          city: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          state: string | null
          surge_multiplier: number | null
        }
        Insert: {
          boundaries?: Json | null
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          state?: string | null
          surge_multiplier?: number | null
        }
        Update: {
          boundaries?: Json | null
          city?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          state?: string | null
          surge_multiplier?: number | null
        }
        Relationships: []
      }
      corporate_accounts: {
        Row: {
          address: string | null
          cnpj: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          discount_percentage: number | null
          id: string
          logo_url: string | null
          monthly_budget: number | null
          monthly_spent: number | null
          payment_terms: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          logo_url?: string | null
          monthly_budget?: number | null
          monthly_spent?: number | null
          payment_terms?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          logo_url?: string | null
          monthly_budget?: number | null
          monthly_spent?: number | null
          payment_terms?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      corporate_employees: {
        Row: {
          corporate_id: string
          created_at: string | null
          department: string | null
          employee_id: string | null
          id: string
          monthly_limit: number | null
          monthly_used: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          corporate_id: string
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: string
          monthly_limit?: number | null
          monthly_used?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          corporate_id?: string
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          id?: string
          monthly_limit?: number | null
          monthly_used?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_employees_corporate_id_fkey"
            columns: ["corporate_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_employees_user_id_fkey"
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
          discount_type: string | null
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
          discount_type?: string | null
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
          discount_type?: string | null
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
      driver_bonuses: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          driver_id: string
          id: string
          paid_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          driver_id: string
          id?: string
          paid_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          driver_id?: string
          id?: string
          paid_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_bonuses_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          created_at: string | null
          driver_id: string
          expires_at: string | null
          id: string
          rejection_reason: string | null
          status: string | null
          type: string
          updated_at: string | null
          url: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          url: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          expires_at?: string | null
          id?: string
          rejection_reason?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          url?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_earnings: {
        Row: {
          bonus_amount: number | null
          commission_amount: number | null
          created_at: string | null
          driver_id: string
          gross_amount: number
          id: string
          net_amount: number
          ride_id: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          bonus_amount?: number | null
          commission_amount?: number | null
          created_at?: string | null
          driver_id: string
          gross_amount: number
          id?: string
          net_amount: number
          ride_id?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          bonus_amount?: number | null
          commission_amount?: number | null
          created_at?: string | null
          driver_id?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          ride_id?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_earnings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          acceptance_rate: number | null
          address: string | null
          approved_at: string | null
          approved_by: string | null
          bank_account: string | null
          bank_account_type: string | null
          bank_agency: string | null
          bank_name: string | null
          city: string | null
          cnh_category: string | null
          cnh_document_url: string | null
          cnh_expiry: string | null
          cnh_number: string | null
          completion_rate: number | null
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          id: string
          is_available: boolean | null
          is_online: boolean | null
          is_verified: boolean | null
          last_location_update: string | null
          pix_key: string | null
          pix_key_type: string | null
          profile_photo_url: string | null
          rating: number | null
          rejection_reason: string | null
          selfie_url: string | null
          state: string | null
          status: string | null
          total_earnings: number | null
          total_rides: number | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account?: string | null
          bank_account_type?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          city?: string | null
          cnh_category?: string | null
          cnh_document_url?: string | null
          cnh_expiry?: string | null
          cnh_number?: string | null
          completion_rate?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          last_location_update?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          profile_photo_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          selfie_url?: string | null
          state?: string | null
          status?: string | null
          total_earnings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account?: string | null
          bank_account_type?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          city?: string | null
          cnh_category?: string | null
          cnh_document_url?: string | null
          cnh_expiry?: string | null
          cnh_number?: string | null
          completion_rate?: number | null
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_available?: boolean | null
          is_online?: boolean | null
          is_verified?: boolean | null
          last_location_update?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          profile_photo_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          selfie_url?: string | null
          state?: string | null
          status?: string | null
          total_earnings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
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
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string | null
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
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
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
          valid_until: string | null
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
          valid_until?: string | null
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
          valid_until?: string | null
        }
        Relationships: []
      }
      knowledge_base_articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string | null
          effective_date: string | null
          id: string
          is_current: boolean | null
          title: string
          type: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          is_current?: boolean | null
          title: string
          type: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          is_current?: boolean | null
          title?: string
          type?: string
          version?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string | null
          email: string | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          phone: string | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          phone?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          phone?: string | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          body_template: string
          channel: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          title_template: string
          type: string | null
          variables: Json | null
        }
        Insert: {
          body_template: string
          channel?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          title_template: string
          type?: string | null
          variables?: Json | null
        }
        Update: {
          body_template?: string
          channel?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          title_template?: string
          type?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          sent_at?: string | null
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
      partner_offers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          partner_id: string
          redemption_url: string | null
          title: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          partner_id: string
          redemption_url?: string | null
          title: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          partner_id?: string
          redemption_url?: string | null
          title?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_offers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          commission_rate: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          status: string | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          commission_rate?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          commission_rate?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_expiry: string | null
          card_holder_name: string | null
          card_last_four: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          metadata: Json | null
          provider: string | null
          provider_card_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          metadata?: Json | null
          provider?: string | null
          provider_card_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_expiry?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          metadata?: Json | null
          provider?: string | null
          provider_card_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
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
          card_brand: string | null
          card_last_four: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          installments: number | null
          metadata: Json | null
          method: string
          paid_at: string | null
          provider: string | null
          provider_payment_id: string | null
          provider_response: Json | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          ride_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          installments?: number | null
          metadata?: Json | null
          method: string
          paid_at?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_response?: Json | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          installments?: number | null
          metadata?: Json | null
          method?: string
          paid_at?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          provider_response?: Json | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          ride_id?: string | null
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
      points_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_user_id_fkey"
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
      pricing_rules: {
        Row: {
          conditions: Json | null
          created_at: string | null
          description: string | null
          fixed_amount: number | null
          id: string
          is_active: boolean | null
          multiplier: number | null
          name: string
          priority: number | null
          rule_type: string | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          fixed_amount?: number | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name: string
          priority?: number | null
          rule_type?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          fixed_amount?: number | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name?: string
          priority?: number | null
          rule_type?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
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
          wallet_balance: number | null
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
          wallet_balance?: number | null
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
          wallet_balance?: number | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_ride_value: number | null
          name: string
          starts_at: string | null
          target_conditions: Json | null
          target_users: string | null
          type: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_ride_value?: number | null
          name: string
          starts_at?: string | null
          target_conditions?: Json | null
          target_users?: string | null
          type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_ride_value?: number | null
          name?: string
          starts_at?: string | null
          target_conditions?: Json | null
          target_users?: string | null
          type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rated_id: string
          rater_id: string
          rating: number
          ride_id: string
          tags: string[] | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rated_id: string
          rater_id: string
          rating: number
          ride_id: string
          tags?: string[] | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rated_id?: string
          rater_id?: string
          rating?: number
          ride_id?: string
          tags?: string[] | null
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
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          reward_type: string | null
          reward_value: number | null
          rewarded_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          reward_type?: string | null
          reward_value?: number | null
          rewarded_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          reward_type?: string | null
          reward_value?: number | null
          rewarded_at?: string | null
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
      rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_cost: number
          redeemed_count: number | null
          stock: number | null
          type: string | null
          valid_until: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_cost: number
          redeemed_count?: number | null
          stock?: number | null
          type?: string | null
          valid_until?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_cost?: number
          redeemed_count?: number | null
          stock?: number | null
          type?: string | null
          valid_until?: string | null
          value?: number | null
        }
        Relationships: []
      }
      ride_bids: {
        Row: {
          bid_price: number | null
          created_at: string | null
          driver_id: string
          eta_minutes: number | null
          id: string
          ride_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bid_price?: number | null
          created_at?: string | null
          driver_id: string
          eta_minutes?: number | null
          id?: string
          ride_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_price?: number | null
          created_at?: string | null
          driver_id?: string
          eta_minutes?: number | null
          id?: string
          ride_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_bids_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_bids_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_locations: {
        Row: {
          accuracy: number | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string | null
          ride_id: string
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string | null
          ride_id: string
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string | null
          ride_id?: string
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_locations_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_stops: {
        Row: {
          address: string
          arrived_at: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          ride_id: string
          sort_order: number | null
        }
        Insert: {
          address: string
          arrived_at?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          ride_id: string
          sort_order?: number | null
        }
        Update: {
          address?: string
          arrived_at?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          ride_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_stops_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          accepted_at: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          category_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          completed_at: string | null
          coupon_id: string | null
          created_at: string | null
          destination_address: string | null
          destination_latitude: number | null
          destination_longitude: number | null
          discount_amount: number | null
          distance_km: number | null
          driver_earnings: number | null
          driver_feedback: string | null
          driver_id: string | null
          driver_rating: number | null
          duration_minutes: number | null
          estimated_distance: number | null
          estimated_duration: number | null
          estimated_price: number | null
          final_price: number | null
          id: string
          notes: string | null
          origin_address: string | null
          origin_latitude: number | null
          origin_longitude: number | null
          passenger_feedback: string | null
          passenger_id: string
          passenger_rating: number | null
          payment_method: string | null
          pickup_at: string | null
          pickup_code: string | null
          promotion_id: string | null
          route_polyline: string | null
          searched_at: string | null
          started_at: string | null
          status: string | null
          surge_multiplier: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          completed_at?: string | null
          coupon_id?: string | null
          created_at?: string | null
          destination_address?: string | null
          destination_latitude?: number | null
          destination_longitude?: number | null
          discount_amount?: number | null
          distance_km?: number | null
          driver_earnings?: number | null
          driver_feedback?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          duration_minutes?: number | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          notes?: string | null
          origin_address?: string | null
          origin_latitude?: number | null
          origin_longitude?: number | null
          passenger_feedback?: string | null
          passenger_id: string
          passenger_rating?: number | null
          payment_method?: string | null
          pickup_at?: string | null
          pickup_code?: string | null
          promotion_id?: string | null
          route_polyline?: string | null
          searched_at?: string | null
          started_at?: string | null
          status?: string | null
          surge_multiplier?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          completed_at?: string | null
          coupon_id?: string | null
          created_at?: string | null
          destination_address?: string | null
          destination_latitude?: number | null
          destination_longitude?: number | null
          discount_amount?: number | null
          distance_km?: number | null
          driver_earnings?: number | null
          driver_feedback?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          duration_minutes?: number | null
          estimated_distance?: number | null
          estimated_duration?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          notes?: string | null
          origin_address?: string | null
          origin_latitude?: number | null
          origin_longitude?: number | null
          passenger_feedback?: string | null
          passenger_id?: string
          passenger_rating?: number | null
          payment_method?: string | null
          pickup_at?: string | null
          pickup_code?: string | null
          promotion_id?: string | null
          route_polyline?: string | null
          searched_at?: string | null
          started_at?: string | null
          status?: string | null
          surge_multiplier?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rides_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          address: string
          created_at: string | null
          icon: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          sort_order: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          icon?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_rides: {
        Row: {
          category_id: string | null
          created_at: string | null
          destination_address: string
          destination_latitude: number | null
          destination_longitude: number | null
          id: string
          notes: string | null
          origin_address: string
          origin_latitude: number | null
          origin_longitude: number | null
          passenger_id: string
          ride_id: string | null
          scheduled_for: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          destination_address: string
          destination_latitude?: number | null
          destination_longitude?: number | null
          id?: string
          notes?: string | null
          origin_address: string
          origin_latitude?: number | null
          origin_longitude?: number | null
          passenger_id: string
          ride_id?: string | null
          scheduled_for: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          destination_address?: string
          destination_latitude?: number | null
          destination_longitude?: number | null
          id?: string
          notes?: string | null
          origin_address?: string
          origin_latitude?: number | null
          origin_longitude?: number | null
          passenger_id?: string
          ride_id?: string | null
          scheduled_for?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_rides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_rides_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_rides_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          variables?: Json | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_period: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_rides: number | null
          name: string
          price: number
          sort_order: number | null
        }
        Insert: {
          billing_period?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_rides?: number | null
          name: string
          price: number
          sort_order?: number | null
        }
        Update: {
          billing_period?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_rides?: number | null
          name?: string
          price?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
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
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          ride_id: string | null
          satisfaction_rating: number | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      system_config: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string | null
          id: string
          level: string | null
          message: string
          metadata: Json | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string | null
          message: string
          metadata?: Json | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string | null
          message?: string
          metadata?: Json | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      terms_acceptances: {
        Row: {
          accepted_at: string | null
          id: string
          ip_address: string | null
          terms_version_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          ip_address?: string | null
          terms_version_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          ip_address?: string | null
          terms_version_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_acceptances_terms_version_id_fkey"
            columns: ["terms_version_id"]
            isOneToOne: false
            referencedRelation: "terms_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_acceptances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_versions: {
        Row: {
          content: string
          created_at: string | null
          effective_date: string | null
          id: string
          is_current: boolean | null
          title: string
          type: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          is_current?: boolean | null
          title: string
          type: string
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          effective_date?: string | null
          id?: string
          is_current?: boolean | null
          title?: string
          type?: string
          version?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          progress: number | null
          reward_claimed_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          reward_claimed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          reward_claimed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_challenges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedbacks: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          message: string
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedbacks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "feedback_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedbacks_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feedbacks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          available_points: number | null
          created_at: string | null
          id: string
          level: number | null
          level_name: string | null
          spent_points: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_points?: number | null
          created_at?: string | null
          id?: string
          level?: number | null
          level_name?: string | null
          spent_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_points?: number | null
          created_at?: string | null
          id?: string
          level?: number | null
          level_name?: string | null
          spent_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          points_spent: number
          redeemed_at: string | null
          reward_id: string
          ride_id: string | null
          status: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          points_spent: number
          redeemed_at?: string | null
          reward_id: string
          ride_id?: string | null
          status?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          reward_id?: string
          ride_id?: string | null
          status?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          provider: string | null
          provider_subscription_id: string | null
          rides_used: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          provider?: string | null
          provider_subscription_id?: string | null
          rides_used?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          provider?: string | null
          provider_subscription_id?: string | null
          rides_used?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_categories: {
        Row: {
          base_price: number | null
          created_at: string | null
          description: string | null
          display_name: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          max_passengers: number | null
          min_price: number | null
          name: string
          price_per_km: number | null
          price_per_minute: number | null
          sort_order: number | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_passengers?: number | null
          min_price?: number | null
          name: string
          price_per_km?: number | null
          price_per_minute?: number | null
          sort_order?: number | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          max_passengers?: number | null
          min_price?: number | null
          name?: string
          price_per_km?: number | null
          price_per_minute?: number | null
          sort_order?: number | null
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          multiplier: number | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          multiplier?: number | null
          name?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          category_id: string | null
          chassis: string | null
          color: string | null
          created_at: string | null
          document_url: string | null
          driver_id: string
          id: string
          inspection_expiry: string | null
          inspection_url: string | null
          insurance_expiry: string | null
          insurance_url: string | null
          is_active: boolean | null
          is_verified: boolean | null
          make: string
          model: string
          photos: Json | null
          plate: string
          renavam: string | null
          type_id: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          category_id?: string | null
          chassis?: string | null
          color?: string | null
          created_at?: string | null
          document_url?: string | null
          driver_id: string
          id?: string
          inspection_expiry?: string | null
          inspection_url?: string | null
          insurance_expiry?: string | null
          insurance_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          make: string
          model: string
          photos?: Json | null
          plate: string
          renavam?: string | null
          type_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          category_id?: string | null
          chassis?: string | null
          color?: string | null
          created_at?: string | null
          document_url?: string | null
          driver_id?: string
          id?: string
          inspection_expiry?: string | null
          inspection_url?: string | null
          insurance_expiry?: string | null
          insurance_url?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          make?: string
          model?: string
          photos?: Json | null
          plate?: string
          renavam?: string | null
          type_id?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
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
          user_id: string
          wallet_id: string
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
          user_id: string
          wallet_id: string
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
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          pending_balance: number | null
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          pending_balance?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          pending_balance?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string | null
          id: string
          payload: Json | null
          processed_at: string | null
          provider: string
          response_code: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed_at?: string | null
          provider: string
          response_code?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed_at?: string | null
          provider?: string
          response_code?: number | null
          status?: string | null
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          created_at: string | null
          id: string
          method: string | null
          pix_key: string | null
          pix_key_type: string | null
          processed_at: string | null
          processed_by: string | null
          provider_response: Json | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          processed_at?: string | null
          processed_by?: string | null
          provider_response?: Json | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          processed_at?: string | null
          processed_by?: string | null
          provider_response?: Json | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_driver: { Args: never; Returns: boolean }
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
