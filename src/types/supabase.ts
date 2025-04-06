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
          email_verified: boolean | null
          username: string | null
          hashed_password: string
          first_name: string | null
          last_name: string | null
          name: string | null
          phone_number: string | null
          country: string | null
          region: 'BLACK_AFRICA' | 'NORTH_AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA'
          currency: string
          points: number
          points_rate: number
          role: 'USER' | 'ADMIN' | 'MODERATOR'
          is_active: boolean
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          email_verified?: boolean | null
          username?: string | null
          hashed_password: string
          first_name?: string | null
          last_name?: string | null
          name?: string | null
          phone_number?: string | null
          country?: string | null
          region?: 'BLACK_AFRICA' | 'NORTH_AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA'
          currency?: string
          points?: number
          points_rate?: number
          role?: 'USER' | 'ADMIN' | 'MODERATOR'
          is_active?: boolean
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          email_verified?: boolean | null
          username?: string | null
          hashed_password?: string
          first_name?: string | null
          last_name?: string | null
          name?: string | null
          phone_number?: string | null
          country?: string | null
          region?: 'BLACK_AFRICA' | 'NORTH_AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA'
          currency?: string
          points?: number
          points_rate?: number
          role?: 'USER' | 'ADMIN' | 'MODERATOR'
          is_active?: boolean
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          name: string
          type: 'CLASSIC' | 'MAGIC' | 'GOLD'
          description: string | null
          image_url: string | null
          min_points: number
          max_points: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'CLASSIC' | 'MAGIC' | 'GOLD'
          description?: string | null
          image_url?: string | null
          min_points?: number
          max_points?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'CLASSIC' | 'MAGIC' | 'GOLD'
          description?: string | null
          image_url?: string | null
          min_points?: number
          max_points?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_treasury: {
        Row: {
          id: string
          amount: number
          currency: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          currency?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          currency?: string
          updated_at?: string
        }
      }
      affiliate_earnings: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          amount?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          first_name: string
          last_name: string
          phone: string | null
          country: string
          terms_accepted: boolean
          terms_accepted_at: string | null
          points: number
          coins: number
          affiliate_code: string
          referred_by: string | null
          affiliate_earnings: number
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          first_name: string
          last_name: string
          phone?: string | null
          country: string
          terms_accepted: boolean
          terms_accepted_at?: string | null
          points?: number
          coins?: number
          affiliate_code: string
          referred_by?: string | null
          affiliate_earnings?: number
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          country?: string
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          points?: number
          coins?: number
          affiliate_code?: string
          referred_by?: string | null
          affiliate_earnings?: number
          updated_at?: string
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          type: "CLASSIC" | "MAGIC" | "GOLD"
          bet_amount: number
          has_won: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "CLASSIC" | "MAGIC" | "GOLD"
          bet_amount: number
          has_won?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "CLASSIC" | "MAGIC" | "GOLD"
          bet_amount?: number
          has_won?: boolean
          created_at?: string
        }
      }
      card_flips: {
        Row: {
          id: string
          session_id: string
          card_index: number
          is_match: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          card_index: number
          is_match: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          card_index?: number
          is_match?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: "DEPOSIT" | "WITHDRAWAL" | "BET" | "WIN" | "REFUND"
          status: "PENDING" | "COMPLETED" | "FAILED"
          payment_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: "DEPOSIT" | "WITHDRAWAL" | "BET" | "WIN" | "REFUND"
          status?: "PENDING" | "COMPLETED" | "FAILED"
          payment_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: "DEPOSIT" | "WITHDRAWAL" | "BET" | "WIN" | "REFUND"
          status?: "PENDING" | "COMPLETED" | "FAILED"
          payment_id?: string | null
          metadata?: Json
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
      [_ in never]: never
    }
  }
}
