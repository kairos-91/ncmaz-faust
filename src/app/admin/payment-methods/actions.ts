"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  PAYMENT_METHOD_IDS,
  PAYMENT_METHOD_META,
  type PaymentMethodValues,
} from "@/lib/payment-methods";

type ActionState = { error?: string } | null;

export async function updatePaymentMethods(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_id")
    .eq("id", restaurantId)
    .single();
  if (!restaurant || restaurant.owner_id !== user.id) {
    return { error: "No autorizado" };
  }

  const values = {} as PaymentMethodValues;
  for (const id of PAYMENT_METHOD_IDS) {
    const meta = PAYMENT_METHOD_META[id];
    const entry: Record<string, unknown> = {
      enabled: formData.get(`${id}.enabled`) === "on",
    };
    for (const field of meta.fields) {
      entry[field.key] = String(formData.get(`${id}.${field.key}`) ?? "").trim();
    }
    values[id] = entry as never;
  }

  const { error } = await supabase
    .from("restaurants")
    .update({ payment_methods: values })
    .eq("id", restaurantId);
  if (error) return { error: error.message };

  revalidatePath("/admin/payment-methods");
  return { error: undefined };
}
