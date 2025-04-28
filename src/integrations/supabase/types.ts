export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      availability: {
        Row: {
          availability: string
          f_listing_id: number
        }
        Insert: {
          availability: string
          f_listing_id: number
        }
        Update: {
          availability?: string
          f_listing_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_f_listing_id_fkey"
            columns: ["f_listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      booking: {
        Row: {
          check_in_date: string
          check_out_date: string
          duration: number | null
          f_listing_id: number
          reservation_confirmation: string | null
          reservation_status: string | null
        }
        Insert: {
          check_in_date: string
          check_out_date: string
          duration?: number | null
          f_listing_id: number
          reservation_confirmation?: string | null
          reservation_status?: string | null
        }
        Update: {
          check_in_date?: string
          check_out_date?: string
          duration?: number | null
          f_listing_id?: number
          reservation_confirmation?: string | null
          reservation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_f_listing_id_fkey"
            columns: ["f_listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      guests: {
        Row: {
          bio: string | null
          date: string | null
          f_username: string
          rating: number | null
        }
        Insert: {
          bio?: string | null
          date?: string | null
          f_username: string
          rating?: number | null
        }
        Update: {
          bio?: string | null
          date?: string | null
          f_username?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_f_username_fkey"
            columns: ["f_username"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["username"]
          },
        ]
      }
      host_review: {
        Row: {
          f_guest_username: string
          f_host_username: string
          review_date: string
          review_text: string | null
        }
        Insert: {
          f_guest_username: string
          f_host_username: string
          review_date: string
          review_text?: string | null
        }
        Update: {
          f_guest_username?: string
          f_host_username?: string
          review_date?: string
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "host_review_f_guest_username_fkey"
            columns: ["f_guest_username"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["f_username"]
          },
          {
            foreignKeyName: "host_review_f_host_username_fkey"
            columns: ["f_host_username"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["f_username"]
          },
        ]
      }
      hosts: {
        Row: {
          bio: string | null
          date: string | null
          f_username: string
          rating: number | null
        }
        Insert: {
          bio?: string | null
          date?: string | null
          f_username: string
          rating?: number | null
        }
        Update: {
          bio?: string | null
          date?: string | null
          f_username?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hosts_f_username_fkey"
            columns: ["f_username"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["username"]
          },
        ]
      }
      listing: {
        Row: {
          contact_info: string | null
          description: string | null
          host_username: string | null
          listing_id: number
          location_id: number | null
          price: number | null
        }
        Insert: {
          contact_info?: string | null
          description?: string | null
          host_username?: string | null
          listing_id?: number
          location_id?: number | null
          price?: number | null
        }
        Update: {
          contact_info?: string | null
          description?: string | null
          host_username?: string | null
          listing_id?: number
          location_id?: number | null
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_host_fk"
            columns: ["host_username"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["username"]
          },
          {
            foreignKeyName: "listing_location_fk"
            columns: ["location_id"]
            isOneToOne: true
            referencedRelation: "locations"
            referencedColumns: ["location_id"]
          },
        ]
      }
      locations: {
        Row: {
          city: string
          loc_type: string | null
          location_id: number
          number_of_listings: number | null
          state: string
          street: string
          zip_code: number
        }
        Insert: {
          city: string
          loc_type?: string | null
          location_id?: number
          number_of_listings?: number | null
          state: string
          street: string
          zip_code: number
        }
        Update: {
          city?: string
          loc_type?: string | null
          location_id?: number
          number_of_listings?: number | null
          state?: string
          street?: string
          zip_code?: number
        }
        Relationships: []
      }
      message: {
        Row: {
          f_guest_username: string | null
          f_host_username: string | null
          message_id: number
          receiver_id: string | null
          sender_id: string | null
          text: string | null
        }
        Insert: {
          f_guest_username?: string | null
          f_host_username?: string | null
          message_id?: number
          receiver_id?: string | null
          sender_id?: string | null
          text?: string | null
        }
        Update: {
          f_guest_username?: string | null
          f_host_username?: string | null
          message_id?: number
          receiver_id?: string | null
          sender_id?: string | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_f_guest_username_fkey"
            columns: ["f_guest_username"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["username"]
          },
          {
            foreignKeyName: "message_f_host_username_fkey"
            columns: ["f_host_username"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["username"]
          },
          {
            foreignKeyName: "message_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["username"]
          },
          {
            foreignKeyName: "message_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["username"]
          },
        ]
      }
      photos: {
        Row: {
          f_location_id: number | null
          photo_time: string | null
          photoid: number
        }
        Insert: {
          f_location_id?: number | null
          photo_time?: string | null
          photoid?: number
        }
        Update: {
          f_location_id?: number | null
          photo_time?: string | null
          photoid?: number
        }
        Relationships: [
          {
            foreignKeyName: "photos_location_fk"
            columns: ["f_location_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["location_id"]
          },
        ]
      }
      review: {
        Row: {
          f_guest_username: string
          f_listing_id: number
          r_full_address: string | null
          reply: string | null
          review_date: string | null
          review_text: string | null
        }
        Insert: {
          f_guest_username: string
          f_listing_id: number
          r_full_address?: string | null
          reply?: string | null
          review_date?: string | null
          review_text?: string | null
        }
        Update: {
          f_guest_username?: string
          f_listing_id?: number
          r_full_address?: string | null
          reply?: string | null
          review_date?: string | null
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_f_guest_username_fkey"
            columns: ["f_guest_username"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["f_username"]
          },
          {
            foreignKeyName: "review_f_listing_id_fkey"
            columns: ["f_listing_id"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      saved_listings: {
        Row: {
          f_username: string
          listings: number
        }
        Insert: {
          f_username: string
          listings: number
        }
        Update: {
          f_username?: string
          listings?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_listings_f_username_fkey"
            columns: ["f_username"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["username"]
          },
          {
            foreignKeyName: "saved_listings_listings_fkey"
            columns: ["listings"]
            isOneToOne: false
            referencedRelation: "listing"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      user: {
        Row: {
          email: string
          mode: Database["public"]["Enums"]["user_mode"]
          password: string
          username: string
        }
        Insert: {
          email: string
          mode: Database["public"]["Enums"]["user_mode"]
          password: string
          username: string
        }
        Update: {
          email?: string
          mode?: Database["public"]["Enums"]["user_mode"]
          password?: string
          username?: string
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
      user_mode: "guest" | "host"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_mode: ["guest", "host"],
    },
  },
} as const
