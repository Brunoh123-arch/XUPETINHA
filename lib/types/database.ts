export type UserType = 'passenger' | 'driver' | 'admin'
export type RideStatus = 'pending' | 'negotiating' | 'accepted' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled' | 'failed'
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired'
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'wallet'
export type VehicleType = 'economy' | 'electric' | 'premium' | 'suv' | 'moto'
export type TransactionType = 'credit' | 'debit' | 'withdrawal' | 'refund' | 'bonus'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
export type SubscriptionPlan = 'basic' | 'plus' | 'premium'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'paused'
export type SupportCategory = 'general' | 'payment' | 'driver' | 'safety' | 'technical' | 'other'
export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent'
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface Profile {
  id: string
  email?: string
  full_name: string
  phone: string
  avatar_url?: string
  user_type: UserType
  is_admin: boolean
  is_banned: boolean
  banned_at?: string
  ban_reason?: string
  status?: 'active' | 'inactive' | 'suspended'
  rating?: number
  total_rides?: number
  current_mode?: 'passenger' | 'driver' | 'admin'
  referral_code?: string
  referred_by?: string
  cpf?: string
  birth_date?: string
  bio?: string
  total_saved?: number
  referral_credits?: number
  trust_score?: number
  trust_level?: string
  preferences?: {
    haptic?: boolean
    animations?: boolean
    dark_mode?: 'auto' | 'light' | 'dark'
    language?: string
    [key: string]: any
  }
  created_at: string
  updated_at: string
}

export interface DriverProfile {
  id: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_plate: string
  vehicle_color: string
  vehicle_type: VehicleType | string
  vehicle_year?: number
  is_verified: boolean
  is_available: boolean
  current_lat?: number
  current_lng?: number
  total_earnings?: number
  rating?: number
  total_rides?: number
  acceptance_rate?: number
  trust_score?: number
  rejection_count?: number
  mode?: 'passenger' | 'driver'
  license_number?: string
  license_category?: string
  cnh_number?: string
  cnh_expiry?: string
  document_url?: string
  last_verification_at?: string
  verification_photo_url?: string
  verification_status?: VerificationStatus
  requires_verification?: boolean
  verification_attempts?: number
  created_at: string
  updated_at: string
}

export interface Ride {
  id: string
  passenger_id: string
  driver_id?: string
  vehicle_type?: VehicleType
  pickup_lat?: number
  pickup_lng?: number
  pickup_address: string
  dropoff_lat?: number
  dropoff_lng?: number
  dropoff_address: string
  distance_km?: number
  estimated_duration_minutes?: number
  passenger_price_offer?: number
  final_price?: number
  payment_method?: PaymentMethod
  status: RideStatus
  scheduled_time?: string
  started_at?: string
  completed_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PriceOffer {
  id: string
  ride_id: string
  driver_id: string
  offered_price: number
  message?: string
  status: OfferStatus
  eta_minutes?: number
  created_at: string
  updated_at: string
  driver?: Profile & { driver_profile?: DriverProfile }
}

export interface RideOffer extends PriceOffer {}

export interface Rating {
  id: string
  ride_id: string
  rater_id: string
  rated_id: string
  category_id?: string
  score: number
  comment?: string
  category_ratings?: Record<string, number>
  is_anonymous?: boolean
  response_text?: string
  response_at?: string
  is_reported?: boolean
  report_reason?: string
  created_at: string
}

export interface Review {
  id: string
  ride_id: string
  reviewer_id: string
  reviewed_id: string
  rating: number
  comment?: string
  tags?: string[]
  is_driver_review: boolean
  created_at: string
}

export interface DriverReview {
  id: string
  driver_id: string
  reviewer_id: string
  ride_id?: string
  rating: number
  comment?: string
  tags?: string[]
  is_public: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  data?: any
  metadata?: any
  /** Alias consistente com o banco (is_read) */
  is_read: boolean
  /** Backward compat — algumas partes ainda usam read */
  read?: boolean
  read_at?: string
  ride_id?: string
  created_at: string
}

export interface Message {
  id: string
  ride_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'audio' | 'location'
  read: boolean
  created_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  ride_id?: string
  subject: string
  category: SupportCategory
  status: SupportStatus
  priority: SupportPriority
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  content: string
  is_admin: boolean
  read: boolean
  created_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description?: string
  ride_id?: string
  status: TransactionStatus
  reference_id?: string
  created_at: string
}

export interface UserWallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_ride_value?: number
  max_discount?: number
  usage_limit?: number
  usage_count: number
  valid_from: string
  valid_until?: string
  is_active: boolean
  created_at: string
}

export interface UserCoupon {
  id: string
  user_id: string
  coupon_id: string
  used: boolean
  used_at?: string
  expires_at?: string
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  label: string
  address: string
  lat?: number
  lng?: number
  icon?: string
  created_at: string
}

export interface EmergencyContact {
  id: string
  user_id: string
  name: string
  phone: string
  relationship?: string
  is_primary: boolean
  created_at: string
}

export interface EmergencyAlert {
  id: string
  user_id: string
  ride_id?: string
  type: 'sos' | 'suspicious' | 'accident' | 'other'
  status: 'active' | 'resolved' | 'false_alarm'
  lat?: number
  lng?: number
  notes?: string
  resolved_at?: string
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id?: string
  code: string
  status: 'pending' | 'completed' | 'expired'
  reward_amount?: number
  reward_paid: boolean
  created_at: string
  completed_at?: string
}

export interface ReferralAchievement {
  id: string
  user_id: string
  milestone: number
  reward_type: 'coupon' | 'cash' | 'badge'
  reward_value?: number
  achieved_at: string
}

export interface SocialPost {
  id: string
  user_id: string
  content: string
  type: 'text' | 'ride' | 'tip' | 'photo' | 'achievement'
  image_url?: string
  ride_id?: string
  likes_count: number
  comments_count: number
  is_pinned: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  parent_id?: string
  content: string
  likes_count: number
  is_active: boolean
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  started_at: string
  expires_at?: string
  cancelled_at?: string
  price?: number
  payment_id?: string
  created_at: string
}

export interface Promotion {
  id: string
  title: string
  description?: string
  discount_percentage?: number
  discount_amount?: number
  start_date: string
  end_date: string
  is_active: boolean
  target_users?: any
  created_at: string
}

export interface ScheduledRide {
  id: string
  passenger_id: string
  origin_address: string
  origin_lat?: number
  origin_lng?: number
  dest_address: string
  dest_lat?: number
  dest_lng?: number
  scheduled_at: string
  estimated_price?: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ride_id?: string
  notes?: string
  created_at: string
}

export interface GroupRide {
  id: string
  organizer_id: string
  ride_id?: string
  name?: string
  max_passengers: number
  share_code?: string
  status: 'open' | 'full' | 'started' | 'completed' | 'cancelled'
  created_at: string
}

export interface GroupRideParticipant {
  id: string
  group_ride_id: string
  user_id: string
  status: 'joined' | 'left' | 'removed'
  joined_at: string
}

export interface DriverLocation {
  id: string
  driver_id: string
  latitude: number
  longitude: number
  heading?: number
  speed?: number
  accuracy?: number
  is_available: boolean
  last_updated: string
  created_at: string
  updated_at: string
}

export interface RideTracking {
  id: string
  ride_id: string
  driver_id: string
  latitude: number
  longitude: number
  speed?: number
  heading?: number
  accuracy?: number
  timestamp: string
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement: string
  title: string
  description?: string
  icon?: string
  points: number
  unlocked_at: string
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  user_type: 'passenger' | 'driver'
  period: 'weekly' | 'monthly' | 'alltime'
  score: number
  rank?: number
  rides_count?: number
  rating_avg?: number
  period_start?: string
  period_end?: string
  updated_at: string
}

export interface HotZone {
  id: string
  name: string
  latitude: number
  longitude: number
  /** Raio em metros */
  radius_meters: number
  /** Intensidade de demanda: 0.0 (baixa) a 1.0 (altíssima) */
  intensity: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface PopularRoute {
  id: string
  start_address: string
  end_address: string
  start_latitude: number
  start_longitude: number
  end_latitude: number
  end_longitude: number
  usage_count: number
  avg_price?: number
  avg_duration?: number
  created_at: string
  updated_at: string
}

export interface PricingRule {
  id: string
  name: string
  rule_type: string
  base_price?: number
  price_per_km?: number
  price_per_minute?: number
  min_price?: number
  multiplier?: number
  conditions?: any
  active: boolean
  priority: number
  valid_from?: string
  valid_until?: string
  created_at: string
  updated_at: string
}

export interface NotificationPreference {
  id: string
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  sms_enabled: boolean
  ride_updates: boolean
  promotional: boolean
  chat_messages: boolean
  payment_updates: boolean
  driver_arrival: boolean
  trip_completed: boolean
  created_at: string
  updated_at: string
}

export interface UserOnboarding {
  id: string
  user_id: string
  step: string
  completed: boolean
  step_completed: number
  completed_at?: string
  skipped: boolean
  data?: any
  preferences?: any
  created_at: string
  updated_at: string
}

export interface AddressSearchHistory {
  id: string
  user_id: string
  address: string
  latitude: number
  longitude: number
  search_type?: string
  created_at: string
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event_type: string
  payload: any
  status: 'pending' | 'success' | 'failed'
  response_code?: number
  response_body?: string
  attempts: number
  max_attempts: number
  next_retry_at?: string
  delivered_at?: string
  created_at: string
}

export interface DriverVerification {
  id: string
  driver_id: string
  verification_type: string
  status: VerificationStatus
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  notes?: string
  documents?: any
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id?: string
  ride_id?: string
  reason: string
  description?: string
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
}

export interface SmsDelivery {
  id: string
  user_id?: string
  phone: string
  message: string
  type: 'otp' | 'ride_update' | 'marketing' | 'alert'
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  provider_id?: string
  cost?: number
  error?: string
  sent_at?: string
  delivered_at?: string
  created_at: string
}

export interface RideRecording {
  id: string
  ride_id: string
  user_id: string
  file_url?: string
  duration_sec?: number
  size_bytes?: number
  status: 'processing' | 'ready' | 'failed' | 'deleted'
  created_at: string
}

export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  auth_key?: string
  p256dh_key?: string
  device_type?: 'web' | 'ios' | 'android'
  is_active: boolean
  created_at: string
}

// ============================================================
// NOVOS TIPOS - Tabelas adicionadas na migration 009
// ============================================================

export interface ScheduledRide {
  id: string
  passenger_id: string
  driver_id?: string
  ride_id?: string
  origin_address: string
  origin_lat?: number
  origin_lng?: number
  dest_address: string
  dest_lat?: number
  dest_lng?: number
  scheduled_at: string
  estimated_price?: number
  vehicle_type: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'driver_assigned'
  notes?: string
  driver_confirmed_at?: string
  created_at: string
  updated_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  topic: string
  status: 'open' | 'waiting' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  ride_id?: string
  assigned_to?: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id?: string
  sender_type: 'user' | 'agent' | 'system'
  sender_name?: string
  message: string
  attachments?: any[]
  read_at?: string
  created_at: string
}

export interface FamilyMember {
  id: string
  user_id: string
  name: string
  phone: string
  relationship: string
  can_track_rides: boolean
  notify_on_start: boolean
  notify_on_end: boolean
  is_primary: boolean
  created_at: string
}

export interface User2FA {
  id: string
  user_id: string
  is_enabled: boolean
  secret?: string
  backup_codes?: string[]
  enabled_at?: string
  last_used_at?: string
  created_at: string
}

export interface DeliveryOrder {
  id: string
  user_id: string
  driver_id?: string
  pickup_address: string
  pickup_lat?: number
  pickup_lng?: number
  dropoff_address: string
  dropoff_lat?: number
  dropoff_lng?: number
  recipient_name?: string
  recipient_phone?: string
  package_description?: string
  package_size: 'small' | 'medium' | 'large' | 'extra_large'
  package_weight_kg?: number
  is_fragile: boolean
  requires_signature: boolean
  estimated_price?: number
  final_price?: number
  status: 'pending' | 'accepted' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled' | 'failed'
  tracking_code: string
  notes?: string
  photo_on_delivery_url?: string
  delivered_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
}

export interface IntercityRide {
  id: string
  passenger_id: string
  driver_id?: string
  origin_city: string
  origin_state?: string
  origin_address?: string
  dest_city: string
  dest_state?: string
  dest_address?: string
  distance_km?: number
  departure_time: string
  estimated_arrival?: string
  available_seats: number
  booked_seats: number
  price_per_seat: number
  vehicle_type: string
  allow_pets: boolean
  allow_luggage: boolean
  status: 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface IntercityBooking {
  id: string
  intercity_ride_id: string
  passenger_id: string
  seats: number
  total_price?: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
}

export interface UserSettings {
  user_id: string
  notifications_rides: boolean
  notifications_promotions: boolean
  notifications_chat: boolean
  notifications_system: boolean
  recording_enabled: boolean
  recording_auto: boolean
  two_factor_enabled: boolean
  biometric_enabled: boolean
  share_location_family: boolean
  dark_mode: string
  language: string
  haptic_enabled: boolean
  map_provider: string
  updated_at: string
}

export interface ReferralAchievement {
  id: string
  user_id: string
  achievement_id: string
  title: string
  description?: string
  icon: string
  reward_credits: number
  unlocked_at: string
}
