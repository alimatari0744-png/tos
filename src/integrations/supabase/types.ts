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
      cities: {
        Row: {
          created_at: string
          id: string
          label_ar: string
          label_en: string
          lat: number
          lng: number
          region_id: string
          sort: number
        }
        Insert: {
          created_at?: string
          id: string
          label_ar: string
          label_en?: string
          lat?: number
          lng?: number
          region_id: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          label_ar?: string
          label_en?: string
          lat?: number
          lng?: number
          region_id?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          city_id: string
          created_at: string
          id: string
          label_ar: string
          label_en: string
          sort: number
        }
        Insert: {
          city_id: string
          created_at?: string
          id: string
          label_ar: string
          label_en?: string
          sort?: number
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          label_ar?: string
          label_en?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "districts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          age: number | null
          area: number
          bathrooms: number | null
          bedrooms: number | null
          city_id: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          desire: string
          district_id: string
          id: string
          image: string | null
          images: string[]
          lat: number | null
          license: string | null
          living_rooms: number | null
          lng: number | null
          price: number
          ref: string
          sort: number
          status: string
          street: number | null
          street_west: number | null
          type_id: string
          updated_at: string
          usage: string
        }
        Insert: {
          age?: number | null
          area?: number
          bathrooms?: number | null
          bedrooms?: number | null
          city_id: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          desire?: string
          district_id: string
          id?: string
          image?: string | null
          images?: string[]
          lat?: number | null
          license?: string | null
          living_rooms?: number | null
          lng?: number | null
          price?: number
          ref: string
          sort?: number
          status?: string
          street?: number | null
          street_west?: number | null
          type_id: string
          updated_at?: string
          usage?: string
        }
        Update: {
          age?: number | null
          area?: number
          bathrooms?: number | null
          bedrooms?: number | null
          city_id?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          desire?: string
          district_id?: string
          id?: string
          image?: string | null
          images?: string[]
          lat?: number | null
          license?: string | null
          living_rooms?: number | null
          lng?: number | null
          price?: number
          ref?: string
          sort?: number
          status?: string
          street?: number | null
          street_west?: number | null
          type_id?: string
          updated_at?: string
          usage?: string
        }
        Relationships: []
      }
      property_interests: {
        Row: {
          created_at: string
          id: string
          name: string | null
          phone: string | null
          property_ref: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          property_ref?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          property_ref?: string | null
        }
        Relationships: []
      }
      property_requests: {
        Row: {
          budget: string | null
          created_at: string
          details: Json | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      property_types: {
        Row: {
          created_at: string
          id: string
          label_ar: string
          label_en: string
          sort: number
          usage: string
        }
        Insert: {
          created_at?: string
          id: string
          label_ar: string
          label_en: string
          sort?: number
          usage: string
        }
        Update: {
          created_at?: string
          id?: string
          label_ar?: string
          label_en?: string
          sort?: number
          usage?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string
          id: string
          label_ar: string
          label_en: string
          sort: number
        }
        Insert: {
          created_at?: string
          id: string
          label_ar: string
          label_en?: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          label_ar?: string
          label_en?: string
          sort?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          hero_image: string | null
          hero_subtitle_ar: string | null
          hero_subtitle_en: string | null
          hero_title_ar: string | null
          hero_title_en: string | null
          id: boolean
          logo_image: string | null
          prev_hero_image: string | null
          prev_logo_image: string | null
          primary_color: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          hero_image?: string | null
          hero_subtitle_ar?: string | null
          hero_subtitle_en?: string | null
          hero_title_ar?: string | null
          hero_title_en?: string | null
          id?: boolean
          logo_image?: string | null
          prev_hero_image?: string | null
          prev_logo_image?: string | null
          primary_color?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          hero_image?: string | null
          hero_subtitle_ar?: string | null
          hero_subtitle_en?: string | null
          hero_title_ar?: string | null
          hero_title_en?: string | null
          id?: boolean
          logo_image?: string | null
          prev_hero_image?: string | null
          prev_logo_image?: string | null
          primary_color?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      taxonomy_options: {
        Row: {
          created_at: string
          id: string
          key: string
          kind: string
          label_ar: string
          label_en: string
          sort: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          kind: string
          label_ar: string
          label_en?: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          kind?: string
          label_ar?: string
          label_en?: string
          sort?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
