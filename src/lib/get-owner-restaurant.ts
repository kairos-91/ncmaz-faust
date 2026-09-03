import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { DeliveryStaff, Restaurant } from "@/lib/supabase/database.types";

export const ACTIVE_RESTAURANT_COOKIE = "active_restaurant_id";

// Un dueño puede tener varias sucursales (restaurants con el mismo
// owner_id, ver 0051_multi_branch_restaurants.sql). Cuál se muestra en el
// panel se decide con esta cookie (la fija el switcher de sucursales / al
// crear una nueva). Sin cookie, o si apunta a una sucursal que ya no le
// pertenece, se cae de vuelta a la más antigua para no dejar el panel sin
// restaurante.
function pickActiveRestaurant(
  restaurants: Restaurant[],
  activeId: string | null,
): Restaurant | null {
  if (restaurants.length === 0) return null;
  if (activeId) {
    const match = restaurants.find((r) => r.id === activeId);
    if (match) return match;
  }
  return restaurants[0];
}

async function getActiveRestaurantIdCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_RESTAURANT_COOKIE)?.value ?? null;
}

export async function getOwnerRestaurant(): Promise<{
  userEmail: string | null;
  restaurant: Restaurant | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userEmail: null, restaurant: null };

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const activeId = await getActiveRestaurantIdCookie();
  return {
    userEmail: user.email ?? null,
    restaurant: pickActiveRestaurant(restaurants ?? [], activeId),
  };
}

// Todas las sucursales del dueño logueado, para el switcher de /admin y
// la pantalla de "agregar sucursal". Devuelve [] si no hay sesión o el
// usuario no es dueño de ningún restaurante.
export async function getOwnerRestaurants(): Promise<Restaurant[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  return restaurants ?? [];
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
  avatarUrl: string | null;
  isGoogleAccount: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      userEmail: null,
      restaurant: null,
      role: null,
      avatarUrl: null,
      isGoogleAccount: false,
    };
  }

  // Google llena user_metadata.avatar_url (o .picture, según la versión
  // del flujo OAuth); las cuentas por correo no tienen ninguno de los dos.
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;
  const isGoogleAccount = user.app_metadata?.provider === "google";

  const { data: owned } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });
  if (owned && owned.length > 0) {
    const activeId = await getActiveRestaurantIdCookie();
    return {
      userEmail: user.email ?? null,
      restaurant: pickActiveRestaurant(owned, activeId),
      role: "owner",
      avatarUrl,
      isGoogleAccount,
    };
  }

  const { data: staffRow } = await supabase
    .from("restaurant_staff")
    .select("restaurant_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!staffRow) {
    return {
      userEmail: user.email ?? null,
      restaurant: null,
      role: null,
      avatarUrl,
      isGoogleAccount,
    };
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
    avatarUrl,
    isGoogleAccount,
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
