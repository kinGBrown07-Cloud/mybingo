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
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          coins: number
          points: number
          vip_level_id: string | null
          referrer_id: string | null
          role: 'USER' | 'ADMIN'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          coins?: number
          points?: number
          vip_level_id?: string | null
          referrer_id?: string | null
          role?: 'USER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          coins?: number
          points?: number
          vip_level_id?: string | null
          referrer_id?: string | null
          role?: 'USER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          game_type: GameType
          bet_amount: number
          prize: number | null
          has_won: boolean
          use_coins: boolean
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          game_type: GameType
          bet_amount: number
          prize?: number | null
          has_won?: boolean
          use_coins: boolean
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: GameType
          bet_amount?: number
          prize?: number | null
          has_won?: boolean
          use_coins?: boolean
          created_at?: string
          completed_at?: string | null
        }
      }
      card_flips: {
        Row: {
          id: string
          session_id: string
          card_index: number
          is_winning: boolean
          prize: number | null
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          card_index: number
          is_winning: boolean
          prize?: number | null
          points_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          card_index?: number
          is_winning?: boolean
          prize?: number | null
          points_earned?: number
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: TransactionType
          amount: number
          coins_amount: number
          status: TransactionStatus
          session_id: string | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: TransactionType
          amount: number
          coins_amount: number
          status?: TransactionStatus
          session_id?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: TransactionType
          amount?: number
          coins_amount?: number
          status?: TransactionStatus
          session_id?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
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
      game_type: GameType
      transaction_type: TransactionType
      transaction_status: TransactionStatus
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
