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
      criteria: {
        Row: {
          active: boolean
          description: string
          id: string
          max_score: number
          name: string
          sort: number
          weight: number
        }
        Insert: {
          active?: boolean
          description?: string
          id?: string
          max_score?: number
          name: string
          sort?: number
          weight?: number
        }
        Update: {
          active?: boolean
          description?: string
          id?: string
          max_score?: number
          name?: string
          sort?: number
          weight?: number
        }
        Relationships: []
      }
      feedback: {
        Row: {
          author_id: string
          author_name: string | null
          created_at: string
          id: string
          idea_id: string
          is_staff: boolean
          message: string
        }
        Insert: {
          author_id: string
          author_name?: string | null
          created_at?: string
          id?: string
          idea_id: string
          is_staff?: boolean
          message: string
        }
        Update: {
          author_id?: string
          author_name?: string | null
          created_at?: string
          id?: string
          idea_id?: string
          is_staff?: boolean
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_events: {
        Row: {
          actor_id: string | null
          created_at: string
          from_stage: Database["public"]["Enums"]["idea_stage"] | null
          id: string
          idea_id: string
          note: string | null
          to_stage: Database["public"]["Enums"]["idea_stage"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          from_stage?: Database["public"]["Enums"]["idea_stage"] | null
          id?: string
          idea_id: string
          note?: string | null
          to_stage: Database["public"]["Enums"]["idea_stage"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          from_stage?: Database["public"]["Enums"]["idea_stage"] | null
          id?: string
          idea_id?: string
          note?: string | null
          to_stage?: Database["public"]["Enums"]["idea_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "idea_events_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          avg_score: number | null
          category: string
          company_name: string
          created_at: string
          id: string
          impact: string
          owner_id: string
          problem: string
          reference: string
          solution: string
          stage: Database["public"]["Enums"]["idea_stage"]
          submitted_at: string | null
          target_market: string
          team_size: number
          title: string
          updated_at: string
          youth_shareholding: number
        }
        Insert: {
          avg_score?: number | null
          category?: string
          company_name?: string
          created_at?: string
          id?: string
          impact?: string
          owner_id: string
          problem?: string
          reference?: string
          solution?: string
          stage?: Database["public"]["Enums"]["idea_stage"]
          submitted_at?: string | null
          target_market?: string
          team_size?: number
          title: string
          updated_at?: string
          youth_shareholding?: number
        }
        Update: {
          avg_score?: number | null
          category?: string
          company_name?: string
          created_at?: string
          id?: string
          impact?: string
          owner_id?: string
          problem?: string
          reference?: string
          solution?: string
          stage?: Database["public"]["Enums"]["idea_stage"]
          submitted_at?: string | null
          target_market?: string
          team_size?: number
          title?: string
          updated_at?: string
          youth_shareholding?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          youth_shareholding: number | null
        }
        Insert: {
          age?: number | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          youth_shareholding?: number | null
        }
        Update: {
          age?: number | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          youth_shareholding?: number | null
        }
        Relationships: []
      }
      scores: {
        Row: {
          comment: string | null
          created_at: string
          criterion_id: string
          evaluator_id: string
          id: string
          idea_id: string
          score: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          criterion_id: string
          evaluator_id: string
          id?: string
          idea_id: string
          score: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          criterion_id?: string
          evaluator_id?: string
          id?: string
          idea_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "scores_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_idea: {
        Args: {
          _idea_id: string
          _note: string
          _to: Database["public"]["Enums"]["idea_stage"]
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      set_user_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      submit_idea: { Args: { _idea_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "submitter" | "evaluator" | "adjudicator" | "admin"
      idea_stage:
        | "draft"
        | "submitted"
        | "screening"
        | "evaluation"
        | "adjudication"
        | "revision_requested"
        | "approved"
        | "awarded"
        | "rejected"
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
      app_role: ["submitter", "evaluator", "adjudicator", "admin"],
      idea_stage: [
        "draft",
        "submitted",
        "screening",
        "evaluation",
        "adjudication",
        "revision_requested",
        "approved",
        "awarded",
        "rejected",
      ],
    },
  },
} as const
