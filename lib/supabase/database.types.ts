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
          condition_type: string
          condition_value: number
          created_at: string | null
          description: string
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          points_reward: number | null
        }
        Insert: {
          category?: string | null
          condition_type: string
          condition_value: number
          created_at?: string | null
          description: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_reward?: number | null
        }
        Update: {
          category?: string | null
          condition_type?: string
          condition_value?: number
          created_at?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_reward?: number | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          latitude: number | null
          longitude: number | null
          neighborhood: string | null
          number: string | null
          state: string
          street: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          state: string
          street: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string | null
          number?: string | null
          state?: string
          street?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
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
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_super_admin?: boolean | null
          role_id?: string | null
          user_id?: string | null
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
          city: string
          created_at: string | null
          iata_code: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          state: string
        }
        Insert: {
          city: string
          created_at?: string | null
          iata_code?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          state: string
        }
        Update: {
          city?: string
          created_at?: string | null
          iata_code?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          state?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
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
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
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
      banners: {
        Row: {
          action_url: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          sort_order: number | null
          starts_at: string | null
          target_audience: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          sort_order?: number | null
          starts_at?: string | null
          target_audience?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          sort_order?: number | null
          starts_at?: string | null
          target_audience?: string | null
          title?: string
        }
        Relationships: []
      }
      blacklist: {
        Row: {
          added_by: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          reason: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blacklist_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blacklist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_id: string | null
          blocker_id: string | null
          created_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id?: string | null
          blocker_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string | null
          blocker_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cashback_earned: {
        Row: {
          amount: number
          created_at: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          percentage: number | null
          ride_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          percentage?: number | null
          ride_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          percentage?: number | null
          ride_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cashback_earned_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_earned_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string | null
          description: string
          ends_at: string | null
          id: string
          is_active: boolean | null
          name: string
          reward_bonus: number | null
          reward_points: number | null
          starts_at: string | null
          target_audience: string | null
          target_value: number
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          reward_bonus?: number | null
          reward_points?: number | null
          starts_at?: string | null
          target_audience?: string | null
          target_value: number
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          reward_bonus?: number | null
          reward_points?: number | null
          starts_at?: string | null
          target_audience?: string | null
          target_value?: number
          type?: string | null
        }
        Relationships: []
      }
      complaint_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string
          evidence_urls: Json | null
          id: string
          reported_id: string | null
          reporter_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          ride_id: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description: string
          evidence_urls?: Json | null
          id?: string
          reported_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string
          evidence_urls?: Json | null
          id?: string
          reported_id?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_reports_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_accounts: {
        Row: {
          account_manager: string | null
          address: string | null
          balance: number | null
          billing_cycle: string | null
          city: string | null
          cnpj: string
          contract_url: string | null
          created_at: string | null
          credit_limit: number | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          account_manager?: string | null
          address?: string | null
          balance?: number | null
          billing_cycle?: string | null
          city?: string | null
          cnpj: string
          contract_url?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          account_manager?: string | null
          address?: string | null
          balance?: number | null
          billing_cycle?: string | null
          city?: string | null
          cnpj?: string
          contract_url?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_accounts_account_manager_fkey"
            columns: ["account_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_users: {
        Row: {
          corporate_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          monthly_limit: number | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          corporate_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_limit?: number | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          corporate_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_limit?: number | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_users_corporate_id_fkey"
            columns: ["corporate_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usages: {
        Row: {
          coupon_id: string | null
          discount_amount: number
          id: string
          ride_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          discount_amount: number
          id?: string
          ride_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          discount_amount?: number
          id?: string
          ride_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_categories: Json | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_fare: number | null
          name: string
          per_user_limit: number | null
          type: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          applicable_categories?: Json | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_fare?: number | null
          name: string
          per_user_limit?: number | null
          type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          applicable_categories?: Json | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_fare?: number | null
          name?: string
          per_user_limit?: number | null
          type?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string
          id: string
          is_verified: boolean | null
          mime_type: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          mime_type?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_availability: {
        Row: {
          accuracy: number | null
          created_at: string | null
          current_ride_id: string | null
          driver_id: string | null
          heading: number | null
          id: string
          is_available: boolean | null
          last_ping_at: string | null
          latitude: number | null
          longitude: number | null
          speed: number | null
          updated_at: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          current_ride_id?: string | null
          driver_id?: string | null
          heading?: number | null
          id?: string
          is_available?: boolean | null
          last_ping_at?: string | null
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          current_ride_id?: string | null
          driver_id?: string | null
          heading?: number | null
          id?: string
          is_available?: boolean | null
          last_ping_at?: string | null
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_availability_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_bonuses: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          driver_id: string | null
          id: string
          paid_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          created_at: string | null
          driver_id: string | null
          expires_at: string | null
          file_url: string
          id: string
          rejection_reason: string | null
          status: string | null
          type: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          expires_at?: string | null
          file_url: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          expires_at?: string | null
          file_url?: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_earnings: {
        Row: {
          available_at: string | null
          bonus_amount: number | null
          commission_amount: number
          commission_rate: number
          created_at: string | null
          driver_id: string | null
          gross_amount: number
          id: string
          net_amount: number
          ride_id: string | null
          status: string | null
          withdrawn_at: string | null
        }
        Insert: {
          available_at?: string | null
          bonus_amount?: number | null
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          driver_id?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          ride_id?: string | null
          status?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          available_at?: string | null
          bonus_amount?: number | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          driver_id?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          ride_id?: string | null
          status?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_earnings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      driver_location_history: {
        Row: {
          driver_id: string | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string | null
        }
        Insert: {
          driver_id?: string | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string | null
        }
        Update: {
          driver_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_location_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          accuracy: number | null
          driver_id: string | null
          heading: number | null
          id: string
          is_active: boolean | null
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
          is_active?: boolean | null
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
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          speed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_performance: {
        Row: {
          acceptance_rate: number | null
          avg_rating: number | null
          cancellation_rate: number | null
          completion_rate: number | null
          driver_id: string | null
          id: string
          last_30_days_earnings: number | null
          last_30_days_rides: number | null
          total_online_hours: number | null
          total_rides: number | null
          updated_at: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          avg_rating?: number | null
          cancellation_rate?: number | null
          completion_rate?: number | null
          driver_id?: string | null
          id?: string
          last_30_days_earnings?: number | null
          last_30_days_rides?: number | null
          total_online_hours?: number | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          avg_rating?: number | null
          cancellation_rate?: number | null
          completion_rate?: number | null
          driver_id?: string | null
          id?: string
          last_30_days_earnings?: number | null
          last_30_days_rides?: number | null
          total_online_hours?: number | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_performance_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          bank_account: Json | null
          bg_check_status: string | null
          commission_rate: number | null
          created_at: string | null
          current_zone: string | null
          id: string
          is_online: boolean | null
          level: string | null
          license_category: string | null
          license_expiry: string | null
          license_number: string | null
          notes: string | null
          pix_key: string | null
          pix_key_type: string | null
          rating: number | null
          status: string | null
          streak_days: number | null
          total_earnings: number | null
          total_rides: number | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          bank_account?: Json | null
          bg_check_status?: string | null
          commission_rate?: number | null
          created_at?: string | null
          current_zone?: string | null
          id?: string
          is_online?: boolean | null
          level?: string | null
          license_category?: string | null
          license_expiry?: string | null
          license_number?: string | null
          notes?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          rating?: number | null
          status?: string | null
          streak_days?: number | null
          total_earnings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          bank_account?: Json | null
          bg_check_status?: string | null
          commission_rate?: number | null
          created_at?: string | null
          current_zone?: string | null
          id?: string
          is_online?: boolean | null
          level?: string | null
          license_category?: string | null
          license_expiry?: string | null
          license_number?: string | null
          notes?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          rating?: number | null
          status?: string | null
          streak_days?: number | null
          total_earnings?: number | null
          total_rides?: number | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_profiles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_ratings: {
        Row: {
          created_at: string | null
          driver_id: string | null
          id: string
          passenger_id: string | null
          rating: number
          review: string | null
          ride_id: string | null
          tags: Json | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          passenger_id?: string | null
          rating: number
          review?: string | null
          ride_id?: string | null
          tags?: Json | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          passenger_id?: string | null
          rating?: number
          review?: string | null
          ride_id?: string | null
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_ratings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: true
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_verifications: {
        Row: {
          created_at: string | null
          driver_id: string | null
          id: string
          provider: string | null
          reference_id: string | null
          result: Json | null
          status: string | null
          type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          provider?: string | null
          reference_id?: string | null
          result?: Json | null
          status?: string | null
          type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          provider?: string | null
          reference_id?: string | null
          result?: Json | null
          status?: string | null
          type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_verifications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_withdrawals: {
        Row: {
          amount: number
          bank_data: Json | null
          created_at: string | null
          driver_id: string | null
          gateway_id: string | null
          id: string
          method: string | null
          notes: string | null
          pix_key: string | null
          pix_key_type: string | null
          processed_at: string | null
          processed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_data?: Json | null
          created_at?: string | null
          driver_id?: string | null
          gateway_id?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_data?: Json | null
          created_at?: string | null
          driver_id?: string | null
          gateway_id?: string | null
          id?: string
          method?: string | null
          notes?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_withdrawals_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_withdrawals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_alerts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          resolved_at: string | null
          resolved_by: string | null
          ride_id: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone: string
          relationship?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string
          relationship?: string | null
          user_id?: string | null
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
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          target_audience: string | null
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
          target_audience?: string | null
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
          target_audience?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fare_rules: {
        Row: {
          category_id: string | null
          condition: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          rule_type: string | null
          value: number
        }
        Insert: {
          category_id?: string | null
          condition?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rule_type?: string | null
          value: number
        }
        Update: {
          category_id?: string | null
          condition?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rule_type?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fare_rules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ride_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_events: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      geographic_zones: {
        Row: {
          center_lat: number | null
          center_lng: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          polygon: Json | null
          type: string | null
        }
        Insert: {
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          polygon?: Json | null
          type?: string | null
        }
        Update: {
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          polygon?: Json | null
          type?: string | null
        }
        Relationships: []
      }
      hot_zones: {
        Row: {
          created_at: string | null
          demand_level: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          radius_meters: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          demand_level?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          radius_meters?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          demand_level?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          radius_meters?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hotels: {
        Row: {
          address: string
          city: string
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          stars: number | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          stars?: number | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          stars?: number | null
        }
        Relationships: []
      }
      in_app_messages: {
        Row: {
          action_url: string | null
          body: string
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          target_audience: string | null
          title: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          target_audience?: string | null
          title: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          target_audience?: string | null
          title?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          coverage_amount: number | null
          created_at: string | null
          document_url: string | null
          driver_id: string | null
          end_date: string
          id: string
          policy_number: string
          premium: number | null
          provider: string
          start_date: string
          status: string | null
          type: string | null
          vehicle_id: string | null
        }
        Insert: {
          coverage_amount?: number | null
          created_at?: string | null
          document_url?: string | null
          driver_id?: string | null
          end_date: string
          id?: string
          policy_number: string
          premium?: number | null
          provider: string
          start_date: string
          status?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Update: {
          coverage_amount?: number | null
          created_at?: string | null
          document_url?: string | null
          driver_id?: string | null
          end_date?: string
          id?: string
          policy_number?: string
          premium?: number | null
          provider?: string
          start_date?: string
          status?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_policies_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard: {
        Row: {
          created_at: string | null
          id: string
          period: string | null
          period_end: string | null
          period_start: string | null
          rank: number | null
          rides_count: number | null
          score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          rank?: number | null
          rides_count?: number | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          rank?: number | null
          rides_count?: number | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
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
          is_read: boolean | null
          metadata: Json | null
          read_at: string | null
          ride_id: string | null
          sender_id: string | null
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          read_at?: string | null
          ride_id?: string | null
          sender_id?: string | null
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          read_at?: string | null
          ride_id?: string | null
          sender_id?: string | null
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
          action_url: string | null
          body: string
          created_at: string | null
          data: Json | null
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
          action_url?: string | null
          body: string
          created_at?: string | null
          data?: Json | null
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
          action_url?: string | null
          body?: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
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
      passenger_ratings: {
        Row: {
          created_at: string | null
          driver_id: string | null
          id: string
          passenger_id: string | null
          rating: number
          review: string | null
          ride_id: string | null
          tags: Json | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          passenger_id?: string | null
          rating: number
          review?: string | null
          ride_id?: string | null
          tags?: Json | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          passenger_id?: string | null
          rating?: number
          review?: string | null
          ride_id?: string | null
          tags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "passenger_ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passenger_ratings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passenger_ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: true
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          driver_amount: number | null
          failed_at: string | null
          gateway: string | null
          gateway_id: string | null
          gateway_response: Json | null
          id: string
          metadata: Json | null
          method: string
          paid_at: string | null
          payer_id: string | null
          pix_expiry: string | null
          pix_qr_code: string | null
          pix_qr_code_base64: string | null
          platform_fee: number | null
          receiver_id: string | null
          ride_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          driver_amount?: number | null
          failed_at?: string | null
          gateway?: string | null
          gateway_id?: string | null
          gateway_response?: Json | null
          id?: string
          metadata?: Json | null
          method: string
          paid_at?: string | null
          payer_id?: string | null
          pix_expiry?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          platform_fee?: number | null
          receiver_id?: string | null
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          driver_amount?: number | null
          failed_at?: string | null
          gateway?: string | null
          gateway_id?: string | null
          gateway_response?: Json | null
          id?: string
          metadata?: Json | null
          method?: string
          paid_at?: string | null
          payer_id?: string | null
          pix_expiry?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          platform_fee?: number | null
          receiver_id?: string | null
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      peak_hours: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          id: string
          is_active: boolean | null
          name: string
          start_time: string
          surge_multiplier: number | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          id?: string
          is_active?: boolean | null
          name: string
          start_time: string
          surge_multiplier?: number | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_time?: string
          surge_multiplier?: number | null
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          active_drivers: number | null
          active_users: number | null
          avg_ride_fare: number | null
          avg_wait_time_min: number | null
          cancelled_rides: number | null
          completed_rides: number | null
          created_at: string | null
          date: string
          id: string
          new_users: number | null
          platform_revenue: number | null
          total_drivers: number | null
          total_revenue: number | null
          total_rides: number | null
          total_users: number | null
        }
        Insert: {
          active_drivers?: number | null
          active_users?: number | null
          avg_ride_fare?: number | null
          avg_wait_time_min?: number | null
          cancelled_rides?: number | null
          completed_rides?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_users?: number | null
          platform_revenue?: number | null
          total_drivers?: number | null
          total_revenue?: number | null
          total_rides?: number | null
          total_users?: number | null
        }
        Update: {
          active_drivers?: number | null
          active_users?: number | null
          avg_ride_fare?: number | null
          avg_wait_time_min?: number | null
          cancelled_rides?: number | null
          completed_rides?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_users?: number | null
          platform_revenue?: number | null
          total_drivers?: number | null
          total_revenue?: number | null
          total_rides?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          amount: number
          created_at: string | null
          expires_at: string | null
          id: string
          reason: string
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_destinations: {
        Row: {
          address: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          ride_count: number | null
        }
        Insert: {
          address: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          ride_count?: number | null
        }
        Update: {
          address?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          ride_count?: number | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
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
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          bio: string | null
          cpf: string | null
          created_at: string | null
          currency: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          is_banned: boolean | null
          is_verified: boolean | null
          language: string | null
          last_seen_at: string | null
          onboarding_completed: boolean | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_seen_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          bio?: string | null
          cpf?: string | null
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          is_banned?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          last_seen_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          banner_url: string | null
          conditions: Json | null
          created_at: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          name: string
          starts_at: string | null
          target_audience: string | null
          type: string | null
          value: number | null
        }
        Insert: {
          banner_url?: string | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          starts_at?: string | null
          target_audience?: string | null
          type?: string | null
          value?: number | null
        }
        Update: {
          banner_url?: string | null
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          starts_at?: string | null
          target_audience?: string | null
          type?: string | null
          value?: number | null
        }
        Relationships: []
      }
      push_log: {
        Row: {
          body: string
          created_at: string | null
          error: string | null
          id: string
          platform: string | null
          status: string | null
          title: string
          token: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          error?: string | null
          id?: string
          platform?: string | null
          status?: string | null
          title: string
          token?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          error?: string | null
          id?: string
          platform?: string | null
          status?: string | null
          title?: string
          token?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string | null
          device_id: string | null
          device_name: string | null
          id: string
          is_active: boolean | null
          platform: string | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          referrer_id: string | null
          reward_referred: number | null
          reward_referrer: number | null
          status: string | null
        }
        Insert: {
          code: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          reward_referred?: number | null
          reward_referrer?: number | null
          status?: string | null
        }
        Update: {
          code?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          reward_referred?: number | null
          reward_referrer?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
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
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          gateway_refund_id: string | null
          id: string
          notes: string | null
          payment_id: string | null
          processed_at: string | null
          processed_by: string | null
          reason: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          gateway_refund_id?: string | null
          id?: string
          notes?: string | null
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          gateway_refund_id?: string | null
          id?: string
          notes?: string | null
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_claimed: boolean | null
          points: number | null
          type: string
          user_id: string | null
          value: number | null
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_claimed?: boolean | null
          points?: number | null
          type: string
          user_id?: string | null
          value?: number | null
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_claimed?: boolean | null
          points?: number | null
          type?: string
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_categories: {
        Row: {
          base_fare: number | null
          created_at: string | null
          description: string | null
          features: Json | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          max_capacity: number | null
          min_fare: number | null
          name: string
          per_km_rate: number | null
          per_minute_rate: number | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          base_fare?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          min_fare?: number | null
          name: string
          per_km_rate?: number | null
          per_minute_rate?: number | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          base_fare?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          max_capacity?: number | null
          min_fare?: number | null
          name?: string
          per_km_rate?: number | null
          per_minute_rate?: number | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ride_disputes: {
        Row: {
          against: string | null
          created_at: string | null
          description: string
          id: string
          refund_amount: number | null
          reported_by: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          ride_id: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          against?: string | null
          created_at?: string | null
          description: string
          id?: string
          refund_amount?: number | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          against?: string | null
          created_at?: string | null
          description?: string
          id?: string
          refund_amount?: number | null
          reported_by?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          ride_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_disputes_against_fkey"
            columns: ["against"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_disputes_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_disputes_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_history: {
        Row: {
          created_at: string | null
          id: string
          ride_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ride_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ride_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_history_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_offers: {
        Row: {
          created_at: string | null
          distance_to_pickup_km: number | null
          driver_id: string | null
          eta_minutes: number | null
          expires_at: string | null
          id: string
          offered_fare: number | null
          responded_at: string | null
          ride_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          distance_to_pickup_km?: number | null
          driver_id?: string | null
          eta_minutes?: number | null
          expires_at?: string | null
          id?: string
          offered_fare?: number | null
          responded_at?: string | null
          ride_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          distance_to_pickup_km?: number | null
          driver_id?: string | null
          eta_minutes?: number | null
          expires_at?: string | null
          id?: string
          offered_fare?: number | null
          responded_at?: string | null
          ride_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_offers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_offers_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          ride_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          ride_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_reports_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_tracking: {
        Row: {
          driver_id: string | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string | null
          ride_id: string | null
          speed: number | null
        }
        Insert: {
          driver_id?: string | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string | null
          ride_id?: string | null
          speed?: number | null
        }
        Update: {
          driver_id?: string | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string | null
          ride_id?: string | null
          speed?: number | null
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
          accepted_at: string | null
          actual_distance_km: number | null
          actual_duration_min: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          category_id: string | null
          completed_at: string | null
          coupon_code: string | null
          created_at: string | null
          destination_address: string
          destination_lat: number
          destination_lng: number
          discount_amount: number | null
          driver_id: string | null
          driver_rating: number | null
          driver_review: string | null
          estimated_distance_km: number | null
          estimated_duration_min: number | null
          estimated_fare: number | null
          final_fare: number | null
          id: string
          is_scheduled: boolean | null
          notes: string | null
          origin_address: string
          origin_lat: number
          origin_lng: number
          passenger_id: string | null
          passenger_rating: number | null
          passenger_review: string | null
          payment_method: string | null
          payment_status: string | null
          pickup_at: string | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          surge_multiplier: number | null
          updated_at: string | null
          vehicle_id: string | null
          waypoints: Json | null
        }
        Insert: {
          accepted_at?: string | null
          actual_distance_km?: number | null
          actual_duration_min?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string | null
          completed_at?: string | null
          coupon_code?: string | null
          created_at?: string | null
          destination_address: string
          destination_lat: number
          destination_lng: number
          discount_amount?: number | null
          driver_id?: string | null
          driver_rating?: number | null
          driver_review?: string | null
          estimated_distance_km?: number | null
          estimated_duration_min?: number | null
          estimated_fare?: number | null
          final_fare?: number | null
          id?: string
          is_scheduled?: boolean | null
          notes?: string | null
          origin_address: string
          origin_lat: number
          origin_lng: number
          passenger_id?: string | null
          passenger_rating?: number | null
          passenger_review?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_at?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          surge_multiplier?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          waypoints?: Json | null
        }
        Update: {
          accepted_at?: string | null
          actual_distance_km?: number | null
          actual_duration_min?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string | null
          completed_at?: string | null
          coupon_code?: string | null
          created_at?: string | null
          destination_address?: string
          destination_lat?: number
          destination_lng?: number
          discount_amount?: number | null
          driver_id?: string | null
          driver_rating?: number | null
          driver_review?: string | null
          estimated_distance_km?: number | null
          estimated_duration_min?: number | null
          estimated_fare?: number | null
          final_fare?: number | null
          id?: string
          is_scheduled?: boolean | null
          notes?: string | null
          origin_address?: string
          origin_lat?: number
          origin_lng?: number
          passenger_id?: string | null
          passenger_rating?: number | null
          passenger_review?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_at?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          surge_multiplier?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ride_categories"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "rides_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_addresses: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          latitude: number
          longitude: number
          type: string | null
          use_count: number | null
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          latitude: number
          longitude: number
          type?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          latitude?: number
          longitude?: number
          type?: string | null
          use_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_addresses_user_id_fkey"
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
          destination_lat: number
          destination_lng: number
          estimated_fare: number | null
          id: string
          notes: string | null
          origin_address: string
          origin_lat: number
          origin_lng: number
          passenger_id: string | null
          payment_method: string | null
          ride_id: string | null
          scheduled_at: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          destination_address: string
          destination_lat: number
          destination_lng: number
          estimated_fare?: number | null
          id?: string
          notes?: string | null
          origin_address: string
          origin_lat: number
          origin_lng: number
          passenger_id?: string | null
          payment_method?: string | null
          ride_id?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          destination_address?: string
          destination_lat?: number
          destination_lng?: number
          estimated_fare?: number | null
          id?: string
          notes?: string | null
          origin_address?: string
          origin_lat?: number
          origin_lng?: number
          passenger_id?: string | null
          payment_method?: string | null
          ride_id?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_rides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ride_categories"
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
      service_areas: {
        Row: {
          city: string
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          polygon: Json | null
          state: string
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          polygon?: Json | null
          state: string
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          polygon?: Json | null
          state?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          image_urls: Json | null
          is_approved: boolean | null
          is_public: boolean | null
          likes_count: number | null
          ride_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_urls?: Json | null
          is_approved?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          ride_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_urls?: Json | null
          is_approved?: boolean | null
          is_public?: boolean | null
          likes_count?: number | null
          ride_id?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      sos_events: {
        Row: {
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          resolved_at: string | null
          ride_id: string | null
          status: string | null
          triggered_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          status?: string | null
          triggered_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          resolved_at?: string | null
          ride_id?: string | null
          status?: string | null
          triggered_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sos_events_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sos_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          sender_id: string | null
          ticket_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          sender_id?: string | null
          ticket_id?: string | null
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
          closed_at: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolution: string | null
          ride_id: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolution?: string | null
          ride_id?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolution?: string | null
          ride_id?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
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
      terms_agreements: {
        Row: {
          agreed_at: string | null
          id: string
          ip_address: string | null
          terms_version: string
          user_id: string | null
        }
        Insert: {
          agreed_at?: string | null
          id?: string
          ip_address?: string | null
          terms_version: string
          user_id?: string | null
        }
        Update: {
          agreed_at?: string | null
          id?: string
          ip_address?: string | null
          terms_version?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terms_agreements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_score: {
        Row: {
          created_at: string | null
          flags: Json | null
          id: string
          last_calculated_at: string | null
          level: string | null
          score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          flags?: Json | null
          id?: string
          last_calculated_at?: string | null
          level?: string | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          flags?: Json | null
          id?: string
          last_calculated_at?: string | null
          level?: string | null
          score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_score_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_2fa: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled_at: string | null
          id: string
          is_enabled: boolean | null
          secret: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          secret?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_2fa_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
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
      user_challenges: {
        Row: {
          challenge_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          progress: number | null
          reward_claimed: boolean | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          reward_claimed?: boolean | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          reward_claimed?: boolean | null
          user_id?: string | null
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
      user_points: {
        Row: {
          available_points: number | null
          created_at: string | null
          id: string
          level: string | null
          level_progress: number | null
          lifetime_points: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available_points?: number | null
          created_at?: string | null
          id?: string
          level?: string | null
          level_progress?: number | null
          lifetime_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available_points?: number | null
          created_at?: string | null
          id?: string
          level?: string | null
          level_progress?: number | null
          lifetime_points?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
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
      user_preferences: {
        Row: {
          created_at: string | null
          dark_mode: boolean | null
          email_enabled: boolean | null
          id: string
          language: string | null
          notifications_payment: boolean | null
          notifications_promo: boolean | null
          notifications_ride: boolean | null
          notifications_social: boolean | null
          preferred_category: string | null
          preferred_payment: string | null
          push_enabled: boolean | null
          share_location: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dark_mode?: boolean | null
          email_enabled?: boolean | null
          id?: string
          language?: string | null
          notifications_payment?: boolean | null
          notifications_promo?: boolean | null
          notifications_ride?: boolean | null
          notifications_social?: boolean | null
          preferred_category?: string | null
          preferred_payment?: string | null
          push_enabled?: boolean | null
          share_location?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dark_mode?: boolean | null
          email_enabled?: boolean | null
          id?: string
          language?: string | null
          notifications_payment?: boolean | null
          notifications_promo?: boolean | null
          notifications_ride?: boolean | null
          notifications_social?: boolean | null
          preferred_category?: string | null
          preferred_payment?: string | null
          push_enabled?: boolean | null
          share_location?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_id: string | null
          device_name: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_active_at: string | null
          location: string | null
          platform: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          device_name?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_active_at?: string | null
          location?: string | null
          platform?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          device_name?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_active_at?: string | null
          location?: string | null
          platform?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          created_at: string | null
          driver_id: string | null
          id: string
          inspection_date: string | null
          inspector: string | null
          next_inspection_date: string | null
          notes: string | null
          report_url: string | null
          status: string | null
          type: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          inspection_date?: string | null
          inspector?: string | null
          next_inspection_date?: string | null
          notes?: string | null
          report_url?: string | null
          status?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          id?: string
          inspection_date?: string | null
          inspector?: string | null
          next_inspection_date?: string | null
          notes?: string | null
          report_url?: string | null
          status?: string | null
          type?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          capacity: number | null
          color: string
          created_at: string | null
          driver_id: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          license_plate: string
          make: string
          model: string
          photo_url: string | null
          renavam: string | null
          updated_at: string | null
          vehicle_type: string | null
          year: number
        }
        Insert: {
          capacity?: number | null
          color: string
          created_at?: string | null
          driver_id?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_plate: string
          make: string
          model: string
          photo_url?: string | null
          renavam?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year: number
        }
        Update: {
          capacity?: number | null
          color?: string
          created_at?: string | null
          driver_id?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          license_plate?: string
          make?: string
          model?: string
          photo_url?: string | null
          renavam?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_topups: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          gateway: string | null
          gateway_id: string | null
          id: string
          metadata: Json | null
          method: string | null
          pix_expiry: string | null
          pix_qr_code: string | null
          pix_qr_code_base64: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          wallet_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          gateway?: string | null
          gateway_id?: string | null
          id?: string
          metadata?: Json | null
          method?: string | null
          pix_expiry?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          gateway?: string | null
          gateway_id?: string | null
          id?: string
          metadata?: Json | null
          method?: string | null
          pix_expiry?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_topups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_topups_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string | null
          wallet_id: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string | null
          wallet_id?: string | null
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
          bonus_balance: number | null
          cashback_balance: number | null
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          bonus_balance?: number | null
          cashback_balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          bonus_balance?: number | null
          cashback_balance?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_fare: {
        Args: {
          p_category_id: string
          p_distance_km: number
          p_duration_min: number
          p_surge?: number
        }
        Returns: number
      }
      find_nearby_drivers: {
        Args: {
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km?: number
        }
        Returns: {
          distance_km: number
          driver_id: string
          heading: number
          latitude: number
          longitude: number
          speed: number
        }[]
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
