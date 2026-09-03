"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tableSchema } from "@/lib/validations";

type ActionState = { error?: string } | null;

async function requireOwnedRestaurant(restaurantId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_id")
    .eq("id", restaurantId)
    .single();
  if (!restaurant || restaurant.owner_id !== user.id) {
    throw new Error("No autorizado");
  }
  return supabase;
}

function parseTableForm(formData: FormData) {
  return tableSchema.safeParse({
    zone: formData.get("zone") ?? "",
    name: formData.get("name"),
    capacity: formData.get("capacity"),
  });
}

export async function createTable(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const parsed = parseTableForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { count } = await supabase
    .from("restaurant_tables")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId);

  const { error } = await supabase.from("restaurant_tables").insert({
    restaurant_id: restaurantId,
    zone: parsed.data.zone,
    name: parsed.data.name,
    capacity: parsed.data.capacity,
    sort_order: count ?? 0,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/tables");
  return { error: undefined };
}

export async function updateTable(
  restaurantId: string,
  tableId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const parsed = parseTableForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { error } = await supabase
    .from("restaurant_tables")
    .update({
      zone: parsed.data.zone,
      name: parsed.data.name,
      capacity: parsed.data.capacity,
    })
    .eq("id", tableId)
    .eq("restaurant_id", restaurantId);
  if (error) return { error: error.message };

  revalidatePath("/admin/tables");
  return { error: undefined };
}

export async function deleteTable(restaurantId: string, tableId: string) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("restaurant_tables")
    .delete()
    .eq("id", tableId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tables");
}

export async function setTableOccupied(
  restaurantId: string,
  tableId: string,
  occupied: boolean,
) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("restaurant_tables")
    .update({ is_occupied: occupied })
    .eq("id", tableId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/tables");
}
