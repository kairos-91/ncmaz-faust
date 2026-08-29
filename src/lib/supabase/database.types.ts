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
          state: string | null;
          country: string;
          maps_url: string | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          facebook_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          theme_color: string;
          currency: string;
          is_published: boolean;
          is_partner: boolean;
          is_verified: boolean;
          plan: string;
          plan_expires_at: string | null;
          payment_methods: Json;
          delivery_zones: Json;
          opening_hours: Json;
          services: Json;
          has_wifi: boolean;
          accepts_pets: boolean;
          packaging_fee_enabled: boolean;
          packaging_fee: number;
          allow_orders_when_closed: boolean;
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
          state?: string | null;
          country?: string;
          maps_url?: string | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          facebook_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          theme_color?: string;
          currency?: string;
          is_published?: boolean;
          is_partner?: boolean;
          is_verified?: boolean;
          plan?: string;
          plan_expires_at?: string | null;
          payment_methods?: Json;
          delivery_zones?: Json;
          opening_hours?: Json;
          services?: Json;
          has_wifi?: boolean;
          accepts_pets?: boolean;
          packaging_fee_enabled?: boolean;
          packaging_fee?: number;
          allow_orders_when_closed?: boolean;
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
          state?: string | null;
          country?: string;
          maps_url?: string | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          facebook_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          theme_color?: string;
          currency?: string;
          is_published?: boolean;
          is_partner?: boolean;
          is_verified?: boolean;
          plan?: string;
          plan_expires_at?: string | null;
          payment_methods?: Json;
          delivery_zones?: Json;
          opening_hours?: Json;
          services?: Json;
          has_wifi?: boolean;
          accepts_pets?: boolean;
          packaging_fee_enabled?: boolean;
          packaging_fee?: number;
          allow_orders_when_closed?: boolean;
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
          change_for: string | null;
          delivery_zone: string | null;
          delivery_fee: number;
          coupon_code: string | null;
          discount_amount: number;
          packaging_fee: number;
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
          change_for?: string | null;
          delivery_zone?: string | null;
          delivery_fee?: number;
          coupon_code?: string | null;
          discount_amount?: number;
          packaging_fee?: number;
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
          change_for?: string | null;
          delivery_zone?: string | null;
          delivery_fee?: number;
          coupon_code?: string | null;
          discount_amount?: number;
          packaging_fee?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_views: {
        Row: {
          id: string;
          restaurant_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          restaurant_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_push_subscriptions: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          restaurant_id: string;
          customer_name: string;
          rating: number;
          comment: string | null;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          customer_name: string;
          rating: number;
          comment?: string | null;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          customer_name?: string;
          rating?: number;
          comment?: string | null;
          is_visible?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          restaurant_id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          is_active: boolean;
          expires_at: string | null;
          min_order_amount: number;
          max_total_uses: number | null;
          max_uses_per_customer: number | null;
          starts_at: string | null;
          valid_time_start: string | null;
          valid_time_end: string | null;
          valid_days: Json;
          valid_payment_methods: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          is_active?: boolean;
          expires_at?: string | null;
          min_order_amount?: number;
          max_total_uses?: number | null;
          max_uses_per_customer?: number | null;
          starts_at?: string | null;
          valid_time_start?: string | null;
          valid_time_end?: string | null;
          valid_days?: Json;
          valid_payment_methods?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          code?: string;
          discount_type?: string;
          discount_value?: number;
          is_active?: boolean;
          expires_at?: string | null;
          min_order_amount?: number;
          max_total_uses?: number | null;
          max_uses_per_customer?: number | null;
          starts_at?: string | null;
          valid_time_start?: string | null;
          valid_time_end?: string | null;
          valid_days?: Json;
          valid_payment_methods?: Json;
          created_at?: string;
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
          whatsapp_number: string;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          payment_methods?: Json;
          whatsapp_number?: string;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          payment_methods?: Json;
          whatsapp_number?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      restaurant_staff: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          user_id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      add_restaurant_staff: {
        Args: { p_restaurant_id: string; p_email: string };
        Returns: undefined;
      };
      restaurant_rating: {
        Args: { p_restaurant_id: string };
        Returns: { avg_rating: number | null; review_count: number }[];
      };
      get_admin_push_subscriptions: {
        Args: { p_restaurant_id: string };
        Returns: { endpoint: string; p256dh: string; auth: string }[];
      };
      delete_admin_push_subscription: {
        Args: { p_endpoint: string };
        Returns: undefined;
      };
      get_coupon_usage: {
        Args: { p_restaurant_id: string; p_code: string; p_customer_phone: string };
        Returns: { total_uses: number; customer_uses: number }[];
      };
      get_platform_whatsapp_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
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
