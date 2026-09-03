"use server";

import webpush from "web-push";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_RESTAURANT_COOKIE } from "@/lib/get-owner-restaurant";
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
import { formatPrice } from "@/lib/utils";
import { isReservedSlug } from "@/lib/reserved-slugs";
import { buildFacebookUrl, buildInstagramUrl, buildTiktokUrl } from "@/lib/social-links";
import { imageExtension, validateImageFile } from "@/lib/file-validation";

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
    country: formData.get("country") ?? "",
    rif: formData.get("rif") ?? "",
    maps_url: formData.get("maps_url") ?? "",
    instagram_url: buildInstagramUrl(formData.get("instagram_handle") as string | null),
    tiktok_url: buildTiktokUrl(formData.get("tiktok_handle") as string | null),
    facebook_url: buildFacebookUrl(formData.get("facebook_handle") as string | null),
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
    allow_orders_when_closed: formData.get("allow_orders_when_closed") === "on",
    manages_delivery_staff: formData.get("manages_delivery_staff") === "on",
    manages_kitchen_staff: formData.get("manages_kitchen_staff") === "on",
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

// Chequeo de disponibilidad de URL mientras el dueño escribe el nombre del
// restaurante (tanto al crearlo como al editarlo). excludeRestaurantId deja
// que el propio slug actual de un restaurante no se marque como "en uso".
export async function checkSlugAvailability(
  slug: string,
  excludeRestaurantId?: string,
): Promise<{ available: boolean; suggestions: string[] }> {
  const { supabase } = await requireUser();
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return { available: false, suggestions: [] };

  const isTaken = async (candidate: string) => {
    if (isReservedSlug(candidate)) return true;
    let query = supabase.from("restaurants").select("id").eq("slug", candidate);
    if (excludeRestaurantId) query = query.neq("id", excludeRestaurantId);
    const { data } = await query.maybeSingle();
    return Boolean(data);
  };

  if (!(await isTaken(normalized))) {
    return { available: true, suggestions: [] };
  }

  // Genera candidatos (base-2, base-3, ...) y consulta cuáles ya existen
  // en una sola llamada, en vez de una por candidato.
  const candidates = Array.from({ length: 8 }, (_, i) => `${normalized}-${i + 2}`);
  const { data: takenRows } = await supabase
    .from("restaurants")
    .select("slug")
    .in("slug", candidates);
  const takenSet = new Set((takenRows ?? []).map((r) => r.slug));

  const suggestions = candidates
    .filter((c) => !takenSet.has(c) && !isReservedSlug(c))
    .slice(0, 3);

  return { available: false, suggestions };
}

// Crea un restaurante para el usuario logueado. Se usa tanto para la
// primera sucursal (formulario de onboarding en /admin cuando el dueño
// todavía no tiene ninguna) como para agregar sucursales adicionales
// desde /admin/restaurants/new — ya no hay límite de uno por dueño (ver
// 0051_multi_branch_restaurants.sql). La sucursal recién creada queda
// como la activa (cookie) para que el panel se abra mostrándola.
export async function createRestaurant(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();

  const parsed = parseRestaurantForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { data: trialPlan } = await supabase
    .from("subscription_plans")
    .select("duration_days")
    .eq("key", "trial")
    .maybeSingle();

  const { data: inserted, error } = await supabase
    .from("restaurants")
    .insert({
      ...parsed.data,
      delivery_zones: parseDeliveryZonesText(parsed.data.delivery_zones ?? ""),
      opening_hours: parseOpeningHoursForm(formData),
      services: parseServicesForm(formData),
      owner_id: user.id,
      plan_expires_at: computeExtendedExpiry(null, trialPlan?.duration_days ?? 15),
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return {
      error: error?.code === "23505" ? "Esa URL ya está en uso." : error?.message,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_RESTAURANT_COOKIE, inserted.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/admin");
  redirect("/admin");
}

// Cambia la sucursal activa del dueño (ver getOwnerRestaurant /
// getStaffRestaurant). Verifica que la sucursal sea suya antes de fijar
// la cookie, para que nadie pueda "cambiarse" a un restaurante ajeno
// adivinando su id.
export async function setActiveRestaurant(restaurantId: string) {
  const { supabase, user } = await requireUser();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!restaurant) throw new Error("No autorizado");

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_RESTAURANT_COOKIE, restaurantId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

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
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const path = `${userId}/${crypto.randomUUID()}.${imageExtension(file)}`;
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

  let url: string;
  try {
    url = await uploadImage(supabase, user.id, file);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No pudimos subir la imagen" };
  }
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
    } catch (err) {
      return { error: err instanceof Error ? err.message : "No pudimos subir la imagen" };
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
    } catch (err) {
      return { error: err instanceof Error ? err.message : "No pudimos subir la imagen" };
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

// Avisa por push al repartidor que le asignaron un pedido nuevo. Usa el
// mismo cliente autenticado del dueño/staff que hizo la asignación: la
// política RLS de delivery_push_subscriptions ya le permite leer las
// suscripciones de su propio personal de delivery.
async function notifyDeliveryStaffOfAssignment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  deliveryStaffId: string,
  order: {
    customer_name: string;
    total: number;
    currency: string;
    address: string | null;
  },
) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) return;

  const { data: subscriptions } = await supabase
    .from("delivery_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("delivery_staff_id", deliveryStaffId);
  if (!subscriptions || subscriptions.length === 0) return;

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const payload = JSON.stringify({
    title: "🔔 ¡Nuevo pedido para entregar!",
    body: `${order.customer_name} · ${formatPrice(order.total, order.currency)}${
      order.address ? ` · ${order.address}` : ""
    }`,
    url: "/delivery",
  });

  const expiredIds: string[] = [];
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if ([401, 403, 404, 410].includes(statusCode ?? 0)) {
          expiredIds.push(sub.id);
        }
      }
    }),
  );
  if (expiredIds.length > 0) {
    await supabase.from("delivery_push_subscriptions").delete().in("id", expiredIds);
  }
}

export async function assignDeliveryStaff(
  restaurantId: string,
  orderId: string,
  deliveryStaffId: string | null,
) {
  const { supabase } = await requireStaffAccess(restaurantId);
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      delivery_staff_id: deliveryStaffId,
      delivery_accepted_at: null,
      delivered_at: null,
    })
    .eq("id", orderId)
    .eq("restaurant_id", restaurantId)
    .select("customer_name, total, currency, address")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");

  if (deliveryStaffId && order) {
    after(() =>
      notifyDeliveryStaffOfAssignment(supabase, deliveryStaffId, order).catch(() => {}),
    );
  }
}

export async function setSentToKitchen(
  restaurantId: string,
  orderId: string,
  sent: boolean,
) {
  const { supabase } = await requireStaffAccess(restaurantId);
  const { error } = await supabase
    .from("orders")
    .update({
      sent_to_kitchen_at: sent ? new Date().toISOString() : null,
      kitchen_status: sent ? "queued" : null,
    })
    .eq("id", orderId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/kitchen-staff");
}

export async function setKitchenStatus(
  restaurantId: string,
  orderId: string,
  status: "queued" | "preparing" | "ready",
) {
  const { supabase } = await requireStaffAccess(restaurantId);
  const { error } = await supabase
    .from("orders")
    .update({ kitchen_status: status })
    .eq("id", orderId)
    .eq("restaurant_id", restaurantId)
    .not("sent_to_kitchen_at", "is", null);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/kitchen-staff");
}

export async function createOrderFromAdmin(
  restaurantId: string,
  input: {
    orderType: "delivery" | "pickup" | "dine_in";
    customerName: string;
    customerPhone: string;
    address?: string;
    tableNumber?: string;
    tableId?: string;
    deliveryZone?: string;
    deliveryFee?: number;
    packagingFee?: number;
    lines: { itemId: string; qty: number; extraNames: string[] }[];
    paymentMethod?: string;
    bankPaidFrom?: string;
    reference?: string;
    amountPaid?: string;
    receiptUrl?: string;
    changeFor?: string;
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
    table_id: input.tableId || null,
    delivery_zone: input.deliveryZone?.trim() || null,
    delivery_fee: deliveryFee,
    packaging_fee: packagingFee,
    items,
    total: itemsTotal + deliveryFee + packagingFee,
    currency: restaurant?.currency ?? "USD",
    payment_method: input.paymentMethod || null,
    bank_paid_from: input.bankPaidFrom || null,
    payment_reference: input.reference || null,
    amount_paid: input.amountPaid || null,
    receipt_url: input.receiptUrl || null,
    change_for: input.changeFor || null,
  });
  if (error) return { error: error.message };

  if (input.tableId) {
    const tableId = input.tableId;
    after(async () => {
      await supabase.rpc("mark_table_occupied", { p_table_id: tableId });
    });
  }

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

// Deja al dueño/staff confirmar desde el propio celular que las
// notificaciones sí le llegan a ese dispositivo, sin esperar un pedido
// real — manda a TODAS las suscripciones del restaurante (PC incluida)
// y limpia las que ya no sirven, igual que notifyAdminsOfNewOrder.
type SendTestAdminPushResult =
  | { error: string }
  | { sent: number; total: number; removed: number };

export async function sendTestAdminPush(
  restaurantId: string,
): Promise<SendTestAdminPushResult> {
  const { supabase } = await requireStaffAccess(restaurantId);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return { error: "Las notificaciones push no están configuradas en el servidor." };
  }

  const { data: subscriptions } = await supabase
    .from("admin_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("restaurant_id", restaurantId);
  if (!subscriptions || subscriptions.length === 0) {
    return { error: "No hay ninguna suscripción activa para este restaurante." };
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const payload = JSON.stringify({
    title: "🔔 Notificación de prueba",
    body: "Si ves esto, las alertas de pedidos funcionan en este dispositivo.",
    url: "/admin/orders",
  });

  let sent = 0;
  const expiredIds: string[] = [];
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent += 1;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        // 404/410: la suscripción ya no existe. 401/403: la clave VAPID
        // con la que se creó ya no es válida. En ambos casos nunca va a
        // funcionar y hay que borrarla para que el usuario pueda
        // volver a activarla desde cero.
        if ([401, 403, 404, 410].includes(statusCode ?? 0)) {
          expiredIds.push(sub.id);
        }
      }
    }),
  );

  if (expiredIds.length > 0) {
    await supabase.from("admin_push_subscriptions").delete().in("id", expiredIds);
  }

  return { sent, total: subscriptions.length, removed: expiredIds.length };
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}
