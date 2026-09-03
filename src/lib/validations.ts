import { z } from "zod";
import { isReservedSlug } from "@/lib/reserved-slugs";

export const signupSchema = z.object({
  fullName: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.email("Correo inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Correo inválido"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const restaurantSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto").max(80),
  slug: z
    .string()
    .min(2, "La URL es muy corta")
    .max(60)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Solo minúsculas, números y guiones, sin espacios",
    ),
  description: z.string().max(500).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  state: z.string().max(60).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  rif: z.string().max(20).optional().or(z.literal("")),
  maps_url: z.string().max(500).optional().or(z.literal("")),
  instagram_url: z.string().max(500).optional().or(z.literal("")),
  tiktok_url: z.string().max(500).optional().or(z.literal("")),
  facebook_url: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  theme_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  currency: z.string().min(3).max(3),
  is_published: z.boolean(),
  has_wifi: z.boolean(),
  accepts_pets: z.boolean(),
  delivery_zones: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        fee: z.coerce.number().min(0),
      }),
    )
    .max(50),
  packaging_fee_enabled: z.boolean(),
  packaging_fee: z.coerce.number().min(0, "El costo no puede ser negativo"),
  delivery_fee_percentage_enabled: z.boolean(),
  delivery_staff_fee_percentage: z.coerce
    .number()
    .min(0, "El porcentaje no puede ser negativo")
    .max(100, "El porcentaje no puede ser mayor a 100"),
  allow_orders_when_closed: z.boolean(),
  manages_delivery_staff: z.boolean(),
  manages_kitchen_staff: z.boolean(),
}).refine((data) => !isReservedSlug(data.slug), {
  message: "Esa URL no está disponible, elige otra",
  path: ["slug"],
});
export type RestaurantInput = z.infer<typeof restaurantSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(60),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const menuItemSchema = z.object({
  category_id: z.uuid("Selecciona una categoría"),
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  is_available: z.boolean(),
  is_featured: z.boolean(),
  tags: z.string().max(200).optional().or(z.literal("")),
  extras: z.string().max(1000).optional().or(z.literal("")),
});
export type MenuItemInput = z.infer<typeof menuItemSchema>;

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(2, "El código es muy corto")
      .max(30)
      .regex(/^[a-zA-Z0-9-]+$/, "Solo letras, números y guiones"),
    discount_type: z.enum(["percent", "fixed"]),
    discount_value: z.coerce.number().positive("Debe ser mayor a 0"),
    expires_at: z.string().optional().or(z.literal("")),
    min_order_amount: z.coerce.number().min(0, "No puede ser negativo"),
    max_total_uses: z.coerce.number().int().min(0, "No puede ser negativo"),
    max_uses_per_customer: z.coerce.number().int().min(0, "No puede ser negativo"),
    starts_at: z.string().optional().or(z.literal("")),
    valid_time_start: z.string().optional().or(z.literal("")),
    valid_time_end: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => data.discount_type !== "percent" || data.discount_value <= 100,
    { message: "El porcentaje no puede ser mayor a 100", path: ["discount_value"] },
  );
export type CouponInput = z.infer<typeof couponSchema>;

export const reviewSchema = z.object({
  customer_name: z.string().min(1, "Ingresa tu nombre").max(80),
  rating: z.coerce.number().int().min(1, "Selecciona una calificación").max(5),
  comment: z.string().max(500).optional().or(z.literal("")),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const staffMemberSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto").max(80),
  phone: z.string().max(30).optional().or(z.literal("")),
});
export type StaffMemberInput = z.infer<typeof staffMemberSchema>;

export const tableSchema = z.object({
  zone: z.string().max(60).optional().or(z.literal("")).transform((v) => v ?? ""),
  name: z.string().min(1, "Ponle un nombre o número a la mesa").max(40),
  capacity: z.coerce.number().int().min(1, "Mínimo 1 persona").max(100),
});
export type TableInput = z.infer<typeof tableSchema>;

export const pushNotificationSchema = z.object({
  title: z.string().min(1, "Escribe un título").max(65),
  body: z.string().min(1, "Escribe un mensaje").max(200),
  url: z.string().max(200).optional().or(z.literal("")),
});
export type PushNotificationInput = z.infer<typeof pushNotificationSchema>;
