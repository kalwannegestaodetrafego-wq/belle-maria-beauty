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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          reason: string | null
          target_id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          reason?: string | null
          target_id: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          target_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address: string | null
          amount_cents: number
          category: string | null
          checklist_infra: boolean
          checklist_materials: boolean
          checklist_pets: boolean
          checklist_terms: boolean
          client_id: string
          client_name: string | null
          created_at: string
          fee_cents: number
          id: string
          notes: string | null
          payment_method: string
          payment_status: string
          preferred_times: string | null
          professional_id: string | null
          professional_name: string
          receipt_code: string | null
          residence_details: string | null
          salon_name: string | null
          scheduled_for: string | null
          service_name: string
          service_pin: string
          status: string
          updated_at: string
          urgency_fee: boolean
        }
        Insert: {
          address?: string | null
          amount_cents?: number
          category?: string | null
          checklist_infra?: boolean
          checklist_materials?: boolean
          checklist_pets?: boolean
          checklist_terms?: boolean
          client_id: string
          client_name?: string | null
          created_at?: string
          fee_cents?: number
          id?: string
          notes?: string | null
          payment_method?: string
          payment_status?: string
          preferred_times?: string | null
          professional_id?: string | null
          professional_name: string
          receipt_code?: string | null
          residence_details?: string | null
          salon_name?: string | null
          scheduled_for?: string | null
          service_name: string
          service_pin?: string
          status?: string
          updated_at?: string
          urgency_fee?: boolean
        }
        Update: {
          address?: string | null
          amount_cents?: number
          category?: string | null
          checklist_infra?: boolean
          checklist_materials?: boolean
          checklist_pets?: boolean
          checklist_terms?: boolean
          client_id?: string
          client_name?: string | null
          created_at?: string
          fee_cents?: number
          id?: string
          notes?: string | null
          payment_method?: string
          payment_status?: string
          preferred_times?: string | null
          professional_id?: string | null
          professional_name?: string
          receipt_code?: string | null
          residence_details?: string | null
          salon_name?: string | null
          scheduled_for?: string | null
          service_name?: string
          service_pin?: string
          status?: string
          updated_at?: string
          urgency_fee?: boolean
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_path: string
          owner_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_path: string
          owner_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_path?: string
          owner_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          address: string | null
          bio: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          identity_back_doc_path: string | null
          identity_doc_path: string | null
          phone: string | null
          residence_details: string | null
          salon_name: string | null
          selfie_path: string | null
          updated_at: string
          verification_rejection_reason: string | null
          verification_reviewed_at: string | null
          verification_reviewed_by: string | null
          verification_status: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          address?: string | null
          bio?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          identity_back_doc_path?: string | null
          identity_doc_path?: string | null
          phone?: string | null
          residence_details?: string | null
          salon_name?: string | null
          selfie_path?: string | null
          updated_at?: string
          verification_rejection_reason?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          address?: string | null
          bio?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          identity_back_doc_path?: string | null
          identity_doc_path?: string | null
          phone?: string | null
          residence_details?: string | null
          salon_name?: string | null
          selfie_path?: string | null
          updated_at?: string
          verification_rejection_reason?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          photo_path: string | null
          professional_id: string | null
          professional_name: string | null
          rating: number
          tags: string | null
        }
        Insert: {
          author_id: string
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          photo_path?: string | null
          professional_id?: string | null
          professional_name?: string | null
          rating: number
          tags?: string | null
        }
        Update: {
          author_id?: string
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          photo_path?: string | null
          professional_id?: string | null
          professional_name?: string | null
          rating?: number
          tags?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_fk"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          duration_min: number
          id: string
          name: string
          owner_id: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          duration_min?: number
          id?: string
          name: string
          owner_id: string
          price_cents?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          duration_min?: number
          id?: string
          name?: string
          owner_id?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_entries: {
        Row: {
          amount_cents: number
          booking_id: string | null
          created_at: string
          id: string
          kind: string
          label: string
          owner_id: string
        }
        Insert: {
          amount_cents: number
          booking_id?: string | null
          created_at?: string
          id?: string
          kind: string
          label: string
          owner_id: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          label?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_entries_booking_fk"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          owner_id: string
          pix_key: string | null
          status: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          owner_id: string
          pix_key?: string | null
          status?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          owner_id?: string
          pix_key?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bm_admin_escrow: {
        Args: { _booking_id: string; _release: boolean }
        Returns: undefined
      }
      bm_review_identity: {
        Args: { _approve: boolean; _profile_id: string; _reason?: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "cliente" | "profissional" | "salao"
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      account_type: ["cliente", "profissional", "salao"],
      app_role: ["admin"],
    },
  },
} as const
