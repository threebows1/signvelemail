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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          announcement: string | null
          created_at: string
          default_trial_days: number
          id: string
          maintenance_mode: boolean
          product_name: string
          signups_enabled: boolean
          support_email: string | null
          updated_at: string
        }
        Insert: {
          announcement?: string | null
          created_at?: string
          default_trial_days?: number
          id?: string
          maintenance_mode?: boolean
          product_name?: string
          signups_enabled?: boolean
          support_email?: string | null
          updated_at?: string
        }
        Update: {
          announcement?: string | null
          created_at?: string
          default_trial_days?: number
          id?: string
          maintenance_mode?: boolean
          product_name?: string
          signups_enabled?: boolean
          support_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      complimentary_access: {
        Row: {
          created_at: string
          duration: string
          email: string | null
          expires_at: string | null
          granted_by: string | null
          id: string
          note: string | null
          plan_id: string
          plan_name: string
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: string
          email?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          note?: string | null
          plan_id?: string
          plan_name?: string
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: string
          email?: string | null
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          note?: string | null
          plan_id?: string
          plan_name?: string
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          employee_limit: number
          features: Json
          id: string
          is_active: boolean
          monthly_cents: number
          name: string
          signature_limit: number
          sort_order: number
          tagline: string
          trial_days: number
          updated_at: string
          yearly_cents: number
        }
        Insert: {
          created_at?: string
          employee_limit?: number
          features?: Json
          id: string
          is_active?: boolean
          monthly_cents?: number
          name: string
          signature_limit?: number
          sort_order?: number
          tagline?: string
          trial_days?: number
          updated_at?: string
          yearly_cents?: number
        }
        Update: {
          created_at?: string
          employee_limit?: number
          features?: Json
          id?: string
          is_active?: boolean
          monthly_cents?: number
          name?: string
          signature_limit?: number
          sort_order?: number
          tagline?: string
          trial_days?: number
          updated_at?: string
          yearly_cents?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_active_at: string | null
          organization_name: string | null
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_active_at?: string | null
          organization_name?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          organization_name?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          billing_interval: string
          created_at: string
          currency: string
          id: string
          plan_id: string
          plan_name: string
          status: string
          stripe_reference: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number
          billing_interval?: string
          created_at?: string
          currency?: string
          id?: string
          plan_id?: string
          plan_name?: string
          status?: string
          stripe_reference?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          billing_interval?: string
          created_at?: string
          currency?: string
          id?: string
          plan_id?: string
          plan_name?: string
          status?: string
          stripe_reference?: string | null
          user_id?: string
        }
        Relationships: []
      }
      signatures: {
        Row: {
          created_at: string
          data: Json
          id: string
          name: string
          status: string
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          name?: string
          status?: string
          template_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          name?: string
          status?: string
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          billing_interval: string
          canceled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          id: string
          plan_id: string
          plan_name: string
          status: string
          stripe_reference: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          billing_interval?: string
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string
          plan_name?: string
          status?: string
          stripe_reference?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          billing_interval?: string
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          plan_id?: string
          plan_name?: string
          status?: string
          stripe_reference?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "manager" | "user"
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
    Enums: {
      app_role: ["admin", "manager", "user"],
    },
  },
} as const
