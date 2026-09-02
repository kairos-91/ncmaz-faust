"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSuperadmin } from "@/lib/superadmin";
import { computeExtendedExpiry } from "@/lib/subscription-plans";
import { parseBankNotification } from "@/lib/bank-notification-parser";
import { notifyPaymentApproved } from "@/lib/notify-admin-push";
import {
  PAYMENT_METHOD_IDS,
  PAYMENT_METHOD_META,
  type PaymentMethodValues,
} from "@/lib/payment-methods";

export type ActionState = { error?: string } | null;

async function requireSuperadmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isSuperadmin(user.email)) throw new Error("No autorizado");
  return { supabase, user };
}

// ── Restaurantes: plan y vencimiento ─────────────────────────────

export async function updateRestaurantPlan(
  restaurantId: string,
  input: { planKey: string; planExpiresAt: string | null },
) {
  const { supabase } = await requireSuperadmin();
  const { error } = await supabase
    .from("restaurants")
    .update({ plan: input.planKey, plan_expires_at: input.planExpiresAt })
    .eq("id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/superadmin/restaurants");
}

export async function updateRestaurantPartner(
  restaurantId: string,
  isPartner: boolean,
) {
  const { supabase } = await requireSuperadmin();
  const { error } = await supabase
    .from("restaurants")
    .update({ is_partner: isPartner })
    .eq("id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/superadmin/restaurants");
  revalidatePath("/");
}

export async function updateRestaurantVerified(
  restaurantId: string,
  isVerified: boolean,
) {
  const { supabase } = await requireSuperadmin();
  const { error } = await supabase
    .from("restaurants")
    .update({ is_verified: isVerified })
    .eq("id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/superadmin/restaurants");
  revalidatePath("/[slug]", "page");
}

// ── Pagos de suscripción ─────────────────────────────────────────

export async function updateSubscriptionPaymentStatus(
  paymentId: string,
  status: "approved" | "rejected",
) {
  const { supabase } = await requireSuperadmin();

  const { data: payment } = await supabase
    .from("subscription_payments")
    .select("id, restaurant_id, plan_id")
    .eq("id", paymentId)
    .single();
  if (!payment) throw new Error("Pago no encontrado");

  const { error } = await supabase
    .from("subscription_payments")
    .update({ status })
    .eq("id", paymentId);
  if (error) throw new Error(error.message);

  if (status === "approved" && payment.plan_id) {
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("key, duration_days")
      .eq("id", payment.plan_id)
      .single();
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("plan_expires_at")
      .eq("id", payment.restaurant_id)
      .single();

    if (plan) {
      const nextExpiry = computeExtendedExpiry(
        restaurant?.plan_expires_at ?? null,
        plan.duration_days,
      );
      await supabase
        .from("restaurants")
        .update({ plan: plan.key, plan_expires_at: nextExpiry })
        .eq("id", payment.restaurant_id);
    }
  }

  revalidatePath("/superadmin/payments");
  revalidatePath("/superadmin/restaurants");
}

// ── Notificaciones bancarias (verificación automática de pagos) ──

export async function testBankNotification(rawText: string) {
  const { supabase } = await requireSuperadmin();

  const { amount, reference, bank } = parseBankNotification(rawText);

  const { data, error } = await supabase.rpc("superadmin_test_bank_notification", {
    p_raw_text: rawText,
    p_source: "manual-test",
    p_bank: bank,
    p_amount: amount,
    p_reference: reference,
  });
  if (error) return { error: error.message };

  const match = data?.[0];
  if (match?.payment_id && match.restaurant_id) {
    after(() => notifyPaymentApproved(supabase, match.restaurant_id!, match.plan_expires_at));
  }

  revalidatePath("/superadmin/bank-notifications");
  revalidatePath("/superadmin/payments");
  revalidatePath("/superadmin/restaurants");
  return { matched: Boolean(match?.payment_id), parsed: { amount, reference, bank } };
}

export async function deleteBankNotification(id: string) {
  const { supabase } = await requireSuperadmin();
  const { error } = await supabase.from("bank_notifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/superadmin/bank-notifications");
}

export async function clearUnmatchedBankNotifications() {
  const { supabase } = await requireSuperadmin();
  const { error } = await supabase
    .from("bank_notifications")
    .delete()
    .is("matched_payment_id", null);
  if (error) throw new Error(error.message);
  revalidatePath("/superadmin/bank-notifications");
}

// ── Planes de suscripción ─────────────────────────────────────────

function parsePlanForm(formData: FormData) {
  const key = String(formData.get("key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!key || !name) return null;

  const oldPriceRaw = String(formData.get("old_price_usd") ?? "").trim();
  const features = String(formData.get("features") ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  return {
    key,
    name,
    price_usd: Number(formData.get("price_usd")) || 0,
    old_price_usd: oldPriceRaw ? Number(oldPriceRaw) : null,
    period: String(formData.get("period") ?? "/ mes").trim() || "/ mes",
    cta_label: String(formData.get("cta_label") ?? "Elegir plan").trim() || "Elegir plan",
    duration_days: Number(formData.get("duration_days")) || 30,
    highlight: formData.get("highlight") === "on",
    features,
    is_active: formData.get("is_active") === "on",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

export async function createPlan(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireSuperadmin();
  const parsed = parsePlanForm(formData);
  if (!parsed) return { error: "Nombre y key son requeridos" };

  const { error } = await supabase.from("subscription_plans").insert(parsed);
  if (error) {
    return {
      error: error.code === "23505" ? "Ya existe un plan con ese key" : error.message,
    };
  }

  revalidatePath("/superadmin/plans");
  revalidatePath("/");
  revalidatePath("/pricing");
  revalidatePath("/admin/subscription");
  return { error: undefined };
}

export async function updatePlan(
  planId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireSuperadmin();
  const parsed = parsePlanForm(formData);
  if (!parsed) return { error: "Nombre y key son requeridos" };

  const { error } = await supabase
    .from("subscription_plans")
    .update(parsed)
    .eq("id", planId);
  if (error) {
    return {
      error: error.code === "23505" ? "Ya existe un plan con ese key" : error.message,
    };
  }

  revalidatePath("/superadmin/plans");
  revalidatePath("/");
  revalidatePath("/pricing");
  revalidatePath("/admin/subscription");
  return { error: undefined };
}

export async function deletePlan(planId: string) {
  const { supabase } = await requireSuperadmin();
  const { error } = await supabase
    .from("subscription_plans")
    .delete()
    .eq("id", planId);
  if (error) throw new Error(error.message);

  revalidatePath("/superadmin/plans");
  revalidatePath("/");
  revalidatePath("/pricing");
}

// ── Métodos de pago de Levery (para recibir pagos de suscripción) ──

export async function updatePlatformPaymentMethods(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireSuperadmin();

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
    .from("platform_settings")
    .update({ payment_methods: values })
    .eq("id", true);
  if (error) return { error: error.message };

  revalidatePath("/superadmin/payment-methods");
  revalidatePath("/admin/subscription");
  return { error: undefined };
}

// ── WhatsApp de soporte de Levery ─────────────────────────────────

export async function updatePlatformWhatsapp(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireSuperadmin();

  const whatsappNumber = String(formData.get("whatsapp_number") ?? "")
    .trim()
    .replace(/[^0-9]/g, "");

  const { error } = await supabase
    .from("platform_settings")
    .update({ whatsapp_number: whatsappNumber })
    .eq("id", true);
  if (error) return { error: error.message };

  revalidatePath("/superadmin/payment-methods");
  revalidatePath("/admin/subscription");
  revalidatePath("/");
  return { error: undefined };
}
