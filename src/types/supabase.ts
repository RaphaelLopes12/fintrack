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
          full_name: string | null
          avatar_url: string | null
          preferred_theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          preferred_theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon: string
          color: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          icon?: string
          color?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          icon?: string
          color?: string
          is_default?: boolean
          created_at?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          id: string
          user_id: string
          name: string
          last_four_digits: string
          brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'other'
          card_limit: number
          billing_day: number
          due_day: number
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          last_four_digits: string
          brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'other'
          card_limit?: number
          billing_day: number
          due_day: number
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          last_four_digits?: string
          brand?: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'other'
          card_limit?: number
          billing_day?: number
          due_day?: number
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string
          credit_card_id: string | null
          type: 'income' | 'expense'
          amount: number
          description: string
          date: string
          is_recurring: boolean
          recurring_frequency: 'weekly' | 'monthly' | 'yearly' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          credit_card_id?: string | null
          type: 'income' | 'expense'
          amount: number
          description: string
          date: string
          is_recurring?: boolean
          recurring_frequency?: 'weekly' | 'monthly' | 'yearly' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          credit_card_id?: string | null
          type?: 'income' | 'expense'
          amount?: number
          description?: string
          date?: string
          is_recurring?: boolean
          recurring_frequency?: 'weekly' | 'monthly' | 'yearly' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_credit_card_id_fkey'
            columns: ['credit_card_id']
            isOneToOne: false
            referencedRelation: 'credit_cards'
            referencedColumns: ['id']
          },
        ]
      }
      credit_card_invoices: {
        Row: {
          id: string
          credit_card_id: string
          month: number
          year: number
          total_amount: number
          is_paid: boolean
          paid_at: string | null
          due_date: string
          created_at: string
        }
        Insert: {
          id?: string
          credit_card_id: string
          month: number
          year: number
          total_amount?: number
          is_paid?: boolean
          paid_at?: string | null
          due_date: string
          created_at?: string
        }
        Update: {
          id?: string
          credit_card_id?: string
          month?: number
          year?: number
          total_amount?: number
          is_paid?: boolean
          paid_at?: string | null
          due_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credit_card_invoices_credit_card_id_fkey'
            columns: ['credit_card_id']
            isOneToOne: false
            referencedRelation: 'credit_cards'
            referencedColumns: ['id']
          },
        ]
      }
      shared_access: {
        Row: {
          id: string
          owner_id: string
          shared_with_id: string | null
          shared_with_email: string
          permission: 'viewer' | 'editor'
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          shared_with_id?: string | null
          shared_with_email: string
          permission?: 'viewer' | 'editor'
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          shared_with_id?: string | null
          shared_with_email?: string
          permission?: 'viewer' | 'editor'
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          accepted_at?: string | null
        }
        Relationships: []
      }
      recurring_expenses: {
        Row: {
          id: string
          user_id: string
          credit_card_id: string | null
          category_id: string
          description: string
          amount: number
          start_date: string
          end_date: string | null
          frequency: 'weekly' | 'monthly' | 'yearly'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          credit_card_id?: string | null
          category_id: string
          description: string
          amount: number
          start_date: string
          end_date?: string | null
          frequency: 'weekly' | 'monthly' | 'yearly'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          credit_card_id?: string | null
          category_id?: string
          description?: string
          amount?: number
          start_date?: string
          end_date?: string | null
          frequency?: 'weekly' | 'monthly' | 'yearly'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recurring_expenses_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recurring_expenses_credit_card_id_fkey'
            columns: ['credit_card_id']
            isOneToOne: false
            referencedRelation: 'credit_cards'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      get_monthly_summary: {
        Args: {
          p_user_id: string
          p_month: number
          p_year: number
        }
        Returns: {
          total_income: number
          total_expenses: number
          balance: number
          transaction_count: number
        }[]
      }
      get_category_breakdown: {
        Args: {
          p_user_id: string
          p_month: number
          p_year: number
          p_type?: string
        }
        Returns: {
          category_id: string
          category_name: string
          category_icon: string
          category_color: string
          total: number
          percentage: number
        }[]
      }
      seed_default_categories: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      resolve_pending_shares: {
        Args: Record<string, never>
        Returns: undefined
      }
      check_user_exists: {
        Args: {
          p_email: string
        }
        Returns: {
          user_name: string
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
