"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { staffMemberSchema } from "@/lib/validations";

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

export async function createDeliveryStaff(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireOwnedRestaurant(restaurantId);

  const parsed = staffMemberSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { error } = await supabase.from("delivery_staff").insert({
    restaurant_id: restaurantId,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/delivery-staff");
  return { error: undefined };
}

export async function toggleDeliveryStaffActive(
  restaurantId: string,
  staffId: string,
  isActive: boolean,
) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("delivery_staff")
    .update({ is_active: isActive })
    .eq("id", staffId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/delivery-staff");
}

export async function deleteDeliveryStaff(restaurantId: string, staffId: string) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("delivery_staff")
    .delete()
    .eq("id", staffId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/delivery-staff");
}

export async function linkDeliveryStaffUser(
  restaurantId: string,
  staffId: string,
  email: string,
): Promise<ActionState> {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase.rpc("link_delivery_staff_user", {
    p_delivery_staff_id: staffId,
    p_email: email,
  });

  if (error) {
    if (error.message.includes("user_not_found")) {
      return {
        error: "Ese correo no tiene una cuenta en Levery. Pídele que se registre primero en /signup.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/delivery-staff");
  return { error: undefined };
}

export async function unlinkDeliveryStaffUser(restaurantId: string, staffId: string) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("delivery_staff")
    .update({ user_id: null })
    .eq("id", staffId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/delivery-staff");
}
