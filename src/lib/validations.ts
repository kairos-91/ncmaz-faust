import { z } from "zod";

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
  phone: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  theme_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  currency: z.string().min(3).max(3),
  is_published: z.boolean(),
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
