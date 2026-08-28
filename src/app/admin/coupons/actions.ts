"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { couponSchema } from "@/lib/validations";
import { DAY_KEYS } from "@/lib/opening-hours";
import { PAYMENT_METHOD_IDS } from "@/lib/payment-methods";

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
    min_order_amount: formData.get("min_order_amount") || "0",
    max_total_uses: formData.get("max_total_uses") || "0",
    max_uses_per_customer: formData.get("max_uses_per_customer") || "0",
    starts_at: formData.get("starts_at") || undefined,
    valid_time_start: formData.get("valid_time_start") || undefined,
    valid_time_end: formData.get("valid_time_end") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const validDays = formData
    .getAll("valid_days")
    .map(String)
    .filter((d) => (DAY_KEYS as string[]).includes(d));
  const validPaymentMethods = formData
    .getAll("valid_payment_methods")
    .map(String)
    .filter((m) => (PAYMENT_METHOD_IDS as string[]).includes(m));

  const { error } = await supabase.from("coupons").insert({
    restaurant_id: restaurantId,
    code: parsed.data.code.toUpperCase(),
    discount_type: parsed.data.discount_type,
    discount_value: parsed.data.discount_value,
    expires_at: parsed.data.expires_at
      ? new Date(parsed.data.expires_at).toISOString()
      : null,
    min_order_amount: parsed.data.min_order_amount,
    max_total_uses: parsed.data.max_total_uses > 0 ? parsed.data.max_total_uses : null,
    max_uses_per_customer:
      parsed.data.max_uses_per_customer > 0 ? parsed.data.max_uses_per_customer : null,
    starts_at: parsed.data.starts_at
      ? new Date(parsed.data.starts_at).toISOString()
      : null,
    valid_time_start: parsed.data.valid_time_start || null,
    valid_time_end: parsed.data.valid_time_end || null,
    valid_days: validDays,
    valid_payment_methods: validPaymentMethods,
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
