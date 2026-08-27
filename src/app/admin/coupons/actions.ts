"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { couponSchema } from "@/lib/validations";

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

export async function createCoupon(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireOwnedRestaurant(restaurantId);

  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    discount_type: formData.get("discount_type"),
    discount_value: formData.get("discount_value"),
    expires_at: formData.get("expires_at") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { error } = await supabase.from("coupons").insert({
    restaurant_id: restaurantId,
    code: parsed.data.code.toUpperCase(),
    discount_type: parsed.data.discount_type,
    discount_value: parsed.data.discount_value,
    expires_at: parsed.data.expires_at
      ? new Date(parsed.data.expires_at).toISOString()
      : null,
  });
  if (error) {
    return {
      error: error.code === "23505" ? "Ya existe un cupón con ese código." : error.message,
    };
  }

  revalidatePath("/admin/coupons");
  return { error: undefined };
}

export async function toggleCouponActive(
  restaurantId: string,
  couponId: string,
  isActive: boolean,
) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("coupons")
    .update({ is_active: isActive })
    .eq("id", couponId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(restaurantId: string, couponId: string) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", couponId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}
