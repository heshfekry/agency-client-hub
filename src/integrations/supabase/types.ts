export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      gate_responses: {
        Row: {
          answer: string
          created_at: string
          id: string
          role: string
          structured_answer: string | null
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          role: string
          structured_answer?: string | null
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          role?: string
          structured_answer?: string | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          id: string
          url: string
          answers: Json
          results: Json
          overall_score: number
          gate_answer: string | null
          gate_role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          answers: Json
          results: Json
          overall_score: number
          gate_answer?: string | null
          gate_role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          answers?: Json
          results?: Json
          overall_score?: number
          gate_answer?: string | null
          gate_role?: string | null
          created_at?: string
        }
        Relationships: []
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
    ? R
    : never
  : never

export const Constants = {
  public: { Enums: {} },
} as const
