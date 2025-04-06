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
