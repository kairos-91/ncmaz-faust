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
          maps_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          theme_color: string;
          currency: string;
          is_published: boolean;
          plan: string;
          plan_expires_at: string | null;
          payment_methods: Json;
          delivery_zones: Json;
          opening_hours: Json;
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
          maps_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          theme_color?: string;
          currency?: string;
          is_published?: boolean;
          plan?: string;
          plan_expires_at?: string | null;
          payment_methods?: Json;
          delivery_zones?: Json;
          opening_hours?: Json;
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
          maps_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          theme_color?: string;
          currency?: string;
          is_published?: boolean;
          plan?: string;
          plan_expires_at?: string | null;
          payment_methods?: Json;
          delivery_zones?: Json;
          opening_hours?: Json;
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
          extras: Json;
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
          extras?: Json;
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
          extras?: Json;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          status: string;
          order_type: string;
          customer_name: string;
          customer_phone: string;
          address: string | null;
          table_number: string | null;
          items: Json;
          total: number;
          currency: string;
          payment_method: string | null;
          bank_paid_from: string | null;
          payment_reference: string | null;
          amount_paid: string | null;
          receipt_url: string | null;
          delivery_zone: string | null;
          delivery_fee: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          status?: string;
          order_type: string;
          customer_name: string;
          customer_phone: string;
          address?: string | null;
          table_number?: string | null;
          items?: Json;
          total?: number;
          currency?: string;
          payment_method?: string | null;
          bank_paid_from?: string | null;
          payment_reference?: string | null;
          amount_paid?: string | null;
          receipt_url?: string | null;
          delivery_zone?: string | null;
          delivery_fee?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          status?: string;
          order_type?: string;
          customer_name?: string;
          customer_phone?: string;
          address?: string | null;
          table_number?: string | null;
          items?: Json;
          total?: number;
          currency?: string;
          payment_method?: string | null;
          bank_paid_from?: string | null;
          payment_reference?: string | null;
          amount_paid?: string | null;
          receipt_url?: string | null;
          delivery_zone?: string | null;
          delivery_fee?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string;
          key: string;
          name: string;
          price_usd: number;
          old_price_usd: number | null;
          period: string;
          cta_label: string;
          duration_days: number;
          highlight: boolean;
          features: Json;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          price_usd?: number;
          old_price_usd?: number | null;
          period?: string;
          cta_label?: string;
          duration_days?: number;
          highlight?: boolean;
          features?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          name?: string;
          price_usd?: number;
          old_price_usd?: number | null;
          period?: string;
          cta_label?: string;
          duration_days?: number;
          highlight?: boolean;
          features?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscription_payments: {
        Row: {
          id: string;
          restaurant_id: string;
          plan_id: string | null;
          plan_name: string;
          amount_usd: number;
          payment_method: string | null;
          bank_paid_from: string | null;
          payment_reference: string | null;
          amount_paid_bs: string | null;
          receipt_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          plan_id?: string | null;
          plan_name: string;
          amount_usd?: number;
          payment_method?: string | null;
          bank_paid_from?: string | null;
          payment_reference?: string | null;
          amount_paid_bs?: string | null;
          receipt_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          plan_id?: string | null;
          plan_name?: string;
          amount_usd?: number;
          payment_method?: string | null;
          bank_paid_from?: string | null;
          payment_reference?: string | null;
          amount_paid_bs?: string | null;
          receipt_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      platform_settings: {
        Row: {
          id: boolean;
          payment_methods: Json;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          payment_methods?: Json;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          payment_methods?: Json;
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
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type SubscriptionPlanRow =
  Database["public"]["Tables"]["subscription_plans"]["Row"];
export type SubscriptionPayment =
  Database["public"]["Tables"]["subscription_payments"]["Row"];
export type PlatformSettings =
  Database["public"]["Tables"]["platform_settings"]["Row"];
