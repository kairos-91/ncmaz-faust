"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  categorySchema,
  menuItemSchema,
  restaurantSchema,
} from "@/lib/validations";
import { extrasTotal, parseExtras, parseExtrasText } from "@/lib/menu-item-extras";
import type { OrderItemSnapshot } from "@/lib/orders";
import { parseDeliveryZonesText } from "@/lib/delivery-zones";
import { DAY_KEYS, type DayHours } from "@/lib/opening-hours";
import { computeExtendedExpiry } from "@/lib/subscription-plans";
import { SERVICE_IDS, type ServiceId } from "@/lib/restaurant-services";

export type ActionState = { error?: string } | null;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function requireOwnedRestaurant(restaurantId: string) {
  const { supabase, user } = await requireUser();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_id")
    .eq("id", restaurantId)
    .single();
  if (!restaurant || restaurant.owner_id !== user.id) {
    throw new Error("No autorizado");
  }
  return { supabase, user };
}

// Como requireOwnedRestaurant, pero también deja pasar a un usuario
// agregado como staff del restaurante (ver restaurant_staff / RLS en
// 0017_restaurant_staff.sql). Úsala solo para categorías, menú y
// pedidos — el resto de las acciones (datos del restaurante, logo,
// pagos, suscripción) debe seguir usando requireOwnedRestaurant.
async function requireStaffAccess(restaurantId: string) {
  const { supabase, user } = await requireUser();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_id")
    .eq("id", restaurantId)
    .maybeSingle();
  if (restaurant && restaurant.owner_id === user.id) {
    return { supabase, user };
  }

  const { data: staffRow } = await supabase
    .from("restaurant_staff")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!staffRow) {
    throw new Error("No autorizado");
  }
  return { supabase, user };
}

function parseRestaurantForm(formData: FormData) {
  return restaurantSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    address: formData.get("address") ?? "",
    state: formData.get("state") ?? "",
    country: formData.get("country") || "Venezuela",
    maps_url: formData.get("maps_url") ?? "",
    instagram_url: formData.get("instagram_url") ?? "",
    tiktok_url: formData.get("tiktok_url") ?? "",
    facebook_url: formData.get("facebook_url") ?? "",
    phone: formData.get("phone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    theme_color: formData.get("theme_color") || "#f97316",
    currency: formData.get("currency") || "USD",
    is_published: formData.get("is_published") === "on",
    has_wifi: formData.get("has_wifi") === "on",
    accepts_pets: formData.get("accepts_pets") === "on",
    delivery_zones: formData.get("delivery_zones") ?? "",
    packaging_fee_enabled: formData.get("packaging_fee_enabled") === "on",
    packaging_fee: formData.get("packaging_fee") || "0",
  });
}

function parseServicesForm(formData: FormData): ServiceId[] {
  const values = formData.getAll("services").map(String);
  return SERVICE_IDS.filter((id) => values.includes(id));
}

function parseOpeningHoursForm(formData: FormData): DayHours[] {
  return DAY_KEYS.map((day) => ({
    day,
    open: String(formData.get(`hours.${day}.open`) ?? "08:00"),
    close: String(formData.get(`hours.${day}.close`) ?? "18:00"),
    closed: formData.get(`hours.${day}.closed`) === "on",
  }));
}

export async function createRestaurant(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const { count: existingCount } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id);
  if (existingCount && existingCount > 0) {
    redirect("/admin");
  }

  const parsed = parseRestaurantForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { data: trialPlan } = await supabase
    .from("subscription_plans")
    .select("duration_days")
    .eq("key", "trial")
    .maybeSingle();

  const { error } = await supabase.from("restaurants").insert({
    ...parsed.data,
    delivery_zones: parseDeliveryZonesText(parsed.data.delivery_zones ?? ""),
    opening_hours: parseOpeningHoursForm(formData),
    services: parseServicesForm(formData),
    owner_id: user.id,
    plan_expires_at: computeExtendedExpiry(null, trialPlan?.duration_days ?? 15),
  });

  if (error) {
    return {
      error: error.code === "23505" ? "Esa URL ya está en uso." : error.message,
    };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateRestaurant(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireOwnedRestaurant(restaurantId);
  const parsed = parseRestaurantForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { error } = await supabase
    .from("restaurants")
    .update({
      ...parsed.data,
      delivery_zones: parseDeliveryZonesText(parsed.data.delivery_zones ?? ""),
      opening_hours: parseOpeningHoursForm(formData),
      services: parseServicesForm(formData),
    })
    .eq("id", restaurantId);

  if (error) {
    return {
      error: error.code === "23505" ? "Esa URL ya está en uso." : error.message,
    };
  }

  revalidatePath("/admin/restaurant");
  revalidatePath(`/${parsed.data.slug}`);
  return { error: undefined };
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("menu-images")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("menu-images").getPublicUrl(path).data
    .publicUrl;
}

export async function updateRestaurantLogo(
  restaurantId: string,
  field: "logo_url" | "cover_url",
  formData: FormData,
) {
  const { supabase, user } = await requireOwnedRestaurant(restaurantId);
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Selecciona una imagen" };

  const url = await uploadImage(supabase, user.id, file);
  const update = field === "logo_url" ? { logo_url: url } : { cover_url: url };
  const { error } = await supabase
    .from("restaurants")
    .update(update)
    .eq("id", restaurantId);
  if (error) return { error: error.message };

  revalidatePath("/admin/restaurant");
  return { url };
}

export async function createCategory(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireStaffAccess(restaurantId);
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId);

  const { error } = await supabase.from("categories").insert({
    restaurant_id: restaurantId,
    name: parsed.data.name,
    sort_order: count ?? 0,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { error: undefined };
}

export async function renameCategory(
  restaurantId: string,
  categoryId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireStaffAccess(restaurantId);
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { error } = await supabase
    .from("categories")
    .update({ name: parsed.data.name })
    .eq("id", categoryId);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { error: undefined };
}

export async function deleteCategory(restaurantId: string, categoryId: string) {
  const { supabase } = await requireStaffAccess(restaurantId);
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/menu");
}

export async function moveCategory(
  restaurantId: string,
  categoryId: string,
  direction: "up" | "down",
) {
  const { supabase } = await requireStaffAccess(restaurantId);
  const { data: categories } = await supabase
    .from("categories")
    .select("id, sort_order")
    .eq("restaurant_id", restaurantId)
    .order("sort_order");
  if (!categories) return;

  const index = categories.findIndex((c) => c.id === categoryId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= categories.length) return;

  const current = categories[index];
  const swap = categories[swapIndex];

  await Promise.all([
    supabase
      .from("categories")
      .update({ sort_order: swap.sort_order })
      .eq("id", current.id),
    supabase
      .from("categories")
      .update({ sort_order: current.sort_order })
      .eq("id", swap.id),
  ]);

  revalidatePath("/admin/categories");
  revalidatePath("/admin/menu");
}

function parseMenuItemForm(formData: FormData) {
  return menuItemSchema.safeParse({
    category_id: formData.get("category_id"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    is_available: formData.get("is_available") === "on",
    is_featured: formData.get("is_featured") === "on",
    tags: formData.get("tags") ?? "",
    extras: formData.get("extras") ?? "",
  });
}

function toTagsArray(tags: string | undefined) {
  return (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createMenuItem(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireStaffAccess(restaurantId);
  const parsed = parseMenuItemForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  let image_url: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    try {
      image_url = await uploadImage(supabase, user.id, file);
    } catch {
      return { error: "No pudimos subir la imagen" };
    }
  }

  const { error } = await supabase.from("menu_items").insert({
    restaurant_id: restaurantId,
    category_id: parsed.data.category_id,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price: parsed.data.price,
    is_available: parsed.data.is_available,
    is_featured: parsed.data.is_featured,
    tags: toTagsArray(parsed.data.tags),
    extras: parseExtrasText(parsed.data.extras ?? ""),
    image_url,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/menu");
  return { error: undefined };
}

export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireStaffAccess(restaurantId);
  const parsed = parseMenuItemForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  let image_url: string | undefined;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    try {
      image_url = await uploadImage(supabase, user.id, file);
    } catch {
      return { error: "No pudimos subir la imagen" };
    }
  }

  const { error } = await supabase
    .from("menu_items")
    .update({
      category_id: parsed.data.category_id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      is_available: parsed.data.is_available,
      is_featured: parsed.data.is_featured,
      tags: toTagsArray(parsed.data.tags),
      extras: parseExtrasText(parsed.data.extras ?? ""),
      ...(image_url ? { image_url } : {}),
    })
    .eq("id", itemId);
  if (error) return { error: error.message };

  revalidatePath("/admin/menu");
  return { error: undefined };
}

export async function deleteMenuItem(restaurantId: string, itemId: string) {
  const { supabase } = await requireStaffAccess(restaurantId);
  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/menu");
}

export async function toggleAvailability(
  restaurantId: string,
  itemId: string,
  isAvailable: boolean,
) {
  const { supabase } = await requireStaffAccess(restaurantId);
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/menu");
}

export async function updateOrderStatus(
  restaurantId: string,
  orderId: string,
  status: "accepted" | "rejected" | "pending",
) {
  const { supabase } = await requireStaffAccess(restaurantId);
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

export async function createOrderFromAdmin(
  restaurantId: string,
  input: {
    orderType: "delivery" | "pickup" | "dine_in";
    customerName: string;
    customerPhone: string;
    address?: string;
    tableNumber?: string;
    deliveryFee?: number;
    packagingFee?: number;
    lines: { itemId: string; qty: number; extraNames: string[] }[];
  },
) {
  const { supabase } = await requireStaffAccess(restaurantId);

  if (!input.customerName.trim() || !input.customerPhone.trim()) {
    return { error: "Completa el nombre y teléfono del cliente" };
  }

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id, name, price, extras")
    .eq("restaurant_id", restaurantId);
  const itemsById = new Map((menuItems ?? []).map((mi) => [mi.id, mi]));

  const items: OrderItemSnapshot[] = [];
  let itemsTotal = 0;
  for (const line of input.lines) {
    const menuItem = itemsById.get(line.itemId);
    if (!menuItem || line.qty <= 0) continue;
    const unitPrice =
      menuItem.price + extrasTotal(parseExtras(menuItem.extras), line.extraNames);
    items.push({
      name: menuItem.name,
      qty: line.qty,
      unitPrice,
      extraNames: line.extraNames,
    });
    itemsTotal += unitPrice * line.qty;
  }
  if (items.length === 0) {
    return { error: "Agrega al menos un plato" };
  }

  const deliveryFee = input.deliveryFee ?? 0;
  const packagingFee = input.packagingFee ?? 0;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("currency")
    .eq("id", restaurantId)
    .single();

  const { error } = await supabase.from("orders").insert({
    restaurant_id: restaurantId,
    status: "accepted",
    order_type: input.orderType,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    address: input.address?.trim() || null,
    table_number: input.tableNumber?.trim() || null,
    delivery_fee: deliveryFee,
    packaging_fee: packagingFee,
    items,
    total: itemsTotal + deliveryFee + packagingFee,
    currency: restaurant?.currency ?? "USD",
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function subscribeAdminToPush(
  restaurantId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
) {
  const { supabase, user } = await requireStaffAccess(restaurantId);
  const { error } = await supabase.from("admin_push_subscriptions").upsert(
    {
      restaurant_id: restaurantId,
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "restaurant_id,endpoint" },
  );
  if (error) return { error: error.message };
  return { success: true };
}

export async function unsubscribeAdminFromPush(restaurantId: string, endpoint: string) {
  const { supabase } = await requireStaffAccess(restaurantId);
  await supabase
    .from("admin_push_subscriptions")
    .delete()
    .eq("restaurant_id", restaurantId)
    .eq("endpoint", endpoint);
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}
