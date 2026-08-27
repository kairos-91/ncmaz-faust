"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function addStaffMember(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Ingresa un correo" };

  const { error } = await supabase.rpc("add_restaurant_staff", {
    p_restaurant_id: restaurantId,
    p_email: email,
  });

  if (error) {
    if (error.message.includes("user_not_found")) {
      return {
        error: "Ese correo no tiene una cuenta en Levery. Pídele que se registre primero.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/team");
  return { error: undefined };
}

export async function removeStaffMember(restaurantId: string, staffId: string) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("restaurant_staff")
    .delete()
    .eq("id", staffId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/team");
}
