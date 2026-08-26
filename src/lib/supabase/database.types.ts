export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          cover_url: string | null;
          address: string | null;
          phone: string | null;
          whatsapp: string | null;
          theme_color: string;
          currency: string;
          is_published: boolean;
          plan: string;
          payment_methods: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          theme_color?: string;
          currency?: string;
          is_published?: boolean;
          plan?: string;
          payment_methods?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          theme_color?: string;
          currency?: string;
          is_published?: boolean;
          plan?: string;
          payment_methods?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          is_featured: boolean;
          tags: string[];
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_id: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          is_featured?: boolean;
          tags?: string[];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          category_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          is_featured?: boolean;
          tags?: string[];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
