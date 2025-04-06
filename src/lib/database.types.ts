
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
          created_at: string | null
          email: string
          password_hash: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          email: string
          password_hash: string
        }
        Update: {
          id?: string
          created_at?: string | null
          email?: string
          password_hash?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          id: string
          created_at: string | null
          user_id: string | null
          name: string
          expiry_date: string
          quantity: number | null
          unit: string | null
          category: string | null
          receipt_id: string | null
          consumed: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          name: string
          expiry_date: string
          quantity?: number | null
          unit?: string | null
          category?: string | null
          receipt_id?: string | null
          consumed?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          name?: string
          expiry_date?: string
          quantity?: number | null
          unit?: string | null
          category?: string | null
          receipt_id?: string | null
          consumed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "food_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_items_receipt_id_fkey"
            columns: ["receipt_id"]
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          }
        ]
      }
      receipts: {
        Row: {
          id: string
          user_id: string | null
          receipt_url: string
          uploaded_at: string | null
          store_name: string | null
          purchase_date: string | null
          total_amount: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          receipt_url: string
          uploaded_at?: string | null
          store_name?: string | null
          purchase_date?: string | null
          total_amount?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          receipt_url?: string
          uploaded_at?: string | null
          store_name?: string | null
          purchase_date?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_recipes: {
        Row: {
          id: string
          created_at: string | null
          user_id: string | null
          food_items: string
          suggested_recipe: string
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          food_items: string
          suggested_recipe: string
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          food_items?: string
          suggested_recipe?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recipes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
