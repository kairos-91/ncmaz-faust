import { createClient } from "@/lib/supabase/server";
import type { DeliveryStaff, Restaurant } from "@/lib/supabase/database.types";

export async function getOwnerRestaurant(): Promise<{
  userEmail: string | null;
  restaurant: Restaurant | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userEmail: null, restaurant: null };

  // .eq + .maybeSingle() sin límite lanza un error si el dueño terminó con
  // más de un restaurante (no debería pasar, pero no hay constraint que lo
  // impida) — eso lo resolvía como "sin restaurante" en silencio y mandaba
  // al usuario de vuelta a la pantalla de "crear restaurante". Con
  // .order + .limit(1) siempre nos quedamos con el más antiguo en vez de
  // que la consulta falle.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return { userEmail: user.email ?? null, restaurant };
}

export type StaffRole = "owner" | "staff";

/**
 * Como getOwnerRestaurant, pero también resuelve el restaurante para un
 * usuario agregado como staff (no dueño). Solo la usan las páginas que
 * el staff puede ver (menú, categorías, pedidos) — el resto del admin
 * sigue usando getOwnerRestaurant para no darle acceso de más.
 */
export async function getStaffRestaurant(): Promise<{
  userEmail: string | null;
  restaurant: Restaurant | null;
  role: StaffRole | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userEmail: null, restaurant: null, role: null };

  const { data: owned } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (owned) {
    return { userEmail: user.email ?? null, restaurant: owned, role: "owner" };
  }

  const { data: staffRow } = await supabase
    .from("restaurant_staff")
    .select("restaurant_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!staffRow) {
    return { userEmail: user.email ?? null, restaurant: null, role: null };
  }

  const { data: staffRestaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", staffRow.restaurant_id)
    .maybeSingle();

  return {
    userEmail: user.email ?? null,
    restaurant: staffRestaurant,
    role: staffRestaurant ? "staff" : null,
  };
}

/**
 * Resuelve la sesión de un repartidor: el usuario logueado debe estar
 * vinculado (por user_id) a una fila de delivery_staff — ver
 * link_delivery_staff_user en 0041_delivery_staff_accounts.sql. Usa esto
 * solo en /delivery, no en el admin.
 */
export async function getDeliveryStaffSession(): Promise<{
  userEmail: string | null;
  restaurant: Restaurant | null;
  deliveryStaff: DeliveryStaff | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userEmail: null, restaurant: null, deliveryStaff: null };

  const { data: deliveryStaff } = await supabase
    .from("delivery_staff")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!deliveryStaff) {
    return { userEmail: user.email ?? null, restaurant: null, deliveryStaff: null };
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", deliveryStaff.restaurant_id)
    .maybeSingle();

  return { userEmail: user.email ?? null, restaurant, deliveryStaff };
}
