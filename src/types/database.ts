export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          username: string
          role: string
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          address: string | null
          city: string | null
          country: string
          postal_code: string | null
          points: number
          total_games_played: number
          created_at: string
          updated_at: string
          last_login_at: string | null
          is_verified: boolean
          is_active: boolean
          currency: string
          points_rate: number
          region: string
          verification_expires: string | null
          verification_token: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          username: string
          role?: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          address?: string | null
          city?: string | null
          country: string
          postal_code?: string | null
          points?: number
          total_games_played?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_verified?: boolean
          is_active?: boolean
          currency: string
          points_rate?: number
          region: string
          verification_expires?: string | null
          verification_token?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          username?: string
          role?: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          address?: string | null
          city?: string | null
          country?: string
          postal_code?: string | null
          points?: number
          total_games_played?: number
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
          is_verified?: boolean
          is_active?: boolean
          currency?: string
          points_rate?: number
          region?: string
          verification_expires?: string | null
          verification_token?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          first_name: string
          last_name: string
          phone_number: string | null
          birthdate: string | null
          country: string
          region: string
          currency: string
          coins: number
          points: number
          points_rate: number
          vip_level_id: string | null
          referrer_id: string | null
          terms_accepted: boolean
          terms_accepted_at: string | null
          referral_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          first_name: string
          last_name: string
          phone_number?: string | null
          birthdate?: string | null
          country: string
          region: string
          currency: string
          coins?: number
          points?: number
          points_rate?: number
          vip_level_id?: string | null
          referrer_id?: string | null
          terms_accepted: boolean
          terms_accepted_at?: string | null
          referral_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          first_name?: string
          last_name?: string
          phone_number?: string | null
          birthdate?: string | null
          country?: string
          region?: string
          currency?: string
          coins?: number
          points?: number
          points_rate?: number
          vip_level_id?: string | null
          referrer_id?: string | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          referral_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_type: string
          bet_amount: number
          use_coins: boolean
          has_won: boolean
          matched_pairs: number
          result: Json | null
          created_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          game_type: string
          bet_amount: number
          use_coins: boolean
          has_won?: boolean
          matched_pairs?: number
          result?: Json | null
          created_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: string
          bet_amount?: number
          use_coins?: boolean
          has_won?: boolean
          matched_pairs?: number
          result?: Json | null
          created_at?: string
          ended_at?: string | null
        }
      }
      card_flips: {
        Row: {
          id: string
          game_session_id: string
          card_index: number
          is_matched: boolean
          created_at: string
        }
        Insert: {
          id?: string
          game_session_id: string
          card_index: number
          is_matched?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          game_session_id?: string
          card_index?: number
          is_matched?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          status: string
          points_amount: number
          created_at: string
          description: string | null
          game_session_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          status?: string
          points_amount: number
          created_at?: string
          description?: string | null
          game_session_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          status?: string
          points_amount?: number
          created_at?: string
          description?: string | null
          game_session_id?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          commission_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          commission_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          name: string
          description: string
          type: 'POINTS_PACK' | 'COMMUNITY_GAME' | 'VIP_BONUS' | 'SUPER_LOT'
          start_date: string
          end_date: string
          points_required: number | null
          points_bonus: number | null
          prize_value: number | null
          prize_description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          type: 'POINTS_PACK' | 'COMMUNITY_GAME' | 'VIP_BONUS' | 'SUPER_LOT'
          start_date: string
          end_date: string
          points_required?: number | null
          points_bonus?: number | null
          prize_value?: number | null
          prize_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          type?: 'POINTS_PACK' | 'COMMUNITY_GAME' | 'VIP_BONUS' | 'SUPER_LOT'
          start_date?: string
          end_date?: string
          points_required?: number | null
          points_bonus?: number | null
          prize_value?: number | null
          prize_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string
          cause_description: string
          target_amount: number
          current_amount: number
          image_url: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          cause_description: string
          target_amount: number
          current_amount?: number
          image_url: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          cause_description?: string
          target_amount?: number
          current_amount?: number
          image_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vip_levels: {
        Row: {
          id: string
          name: string
          level: number
          points_required: number
          cashback_rate: number
          bonus_multiplier: number
          exclusive_promotions: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          level: number
          points_required: number
          cashback_rate: number
          bonus_multiplier: number
          exclusive_promotions: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: number
          points_required?: number
          cashback_rate?: number
          bonus_multiplier?: number
          exclusive_promotions?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      super_lot_entries: {
        Row: {
          id: string
          user_id: string
          promotion_id: string
          tickets_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          promotion_id: string
          tickets_count: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          promotion_id?: string
          tickets_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'USER' | 'ADMIN' | 'MODERATOR'
      game_type: 'FOODS' | 'MODE' | 'JACKPOT'
      transaction_type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND'
      transaction_status: 'PENDING' | 'COMPLETED' | 'FAILED'
      region: 'BLACK_AFRICA' | 'NORTH_AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA'
    }
  }
}

export type GameType = 'CLASSIC' | 'MAGIC' | 'GOLD'
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN' | 'REFUND' | 'COMMISSION' | 'ADMIN_CREDIT'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Types dérivés pour une utilisation plus facile
export type Profile = Tables<'profiles'>
export type GameSession = Tables<'game_sessions'>
export type CardFlip = Tables<'card_flips'>
export type Transaction = Tables<'transactions'>
export type Referral = Tables<'referrals'>
export type Promotion = Tables<'promotions'>
export type Community = Tables<'communities'>
export type VipLevel = Tables<'vip_levels'>
export type SuperLotEntry = Tables<'super_lot_entries'>

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  birthdate: string;
  balance: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
  isVerified: boolean;
  isActive: boolean;
  referralCode: string;
  referrerId?: string;
}
