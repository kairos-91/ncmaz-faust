"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  categorySchema,
  menuItemSchema,
  restaurantSchema,
} from "@/lib/validations";

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

function parseRestaurantForm(formData: FormData) {
  return restaurantSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    address: formData.get("address") ?? "",
    phone: formData.get("phone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    theme_color: formData.get("theme_color") || "#f97316",
    currency: formData.get("currency") || "USD",
    is_published: formData.get("is_published") === "on",
  });
}

export async function createRestaurant(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, user } = await requireUser();
  const parsed = parseRestaurantForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { error } = await supabase
    .from("restaurants")
    .insert({ ...parsed.data, owner_id: user.id });

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
    .update(parsed.data)
    .eq("id", restaurantId);

  if (error) {
    return {
      error: error.code === "23505" ? "Esa URL ya está en uso." : error.message,
    };
  }

  revalidatePath("/admin/restaurant");
  revalidatePath(`/r/${parsed.data.slug}`);
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
  const { supabase } = await requireOwnedRestaurant(restaurantId);
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
  const { supabase } = await requireOwnedRestaurant(restaurantId);
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
  const { supabase } = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);
  if (error) throw new Error(error.message);
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
  const { supabase, user } = await requireOwnedRestaurant(restaurantId);
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
  const { supabase, user } = await requireOwnedRestaurant(restaurantId);
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
      ...(image_url ? { image_url } : {}),
    })
    .eq("id", itemId);
  if (error) return { error: error.message };

  revalidatePath("/admin/menu");
  return { error: undefined };
}

export async function deleteMenuItem(restaurantId: string, itemId: string) {
  const { supabase } = await requireOwnedRestaurant(restaurantId);
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
  const { supabase } = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/menu");
}

export async function signOut() {
  const { supabase } = await requireUser();
  await supabase.auth.signOut();
  redirect("/login");
}
