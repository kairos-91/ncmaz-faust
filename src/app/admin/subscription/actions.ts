"use server";

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyPaymentApproved } from "@/lib/notify-admin-push";

export async function createSubscriptionPayment(
  restaurantId: string,
  input: {
    planId: string;
    planName: string;
    amountUsd: number;
    paymentMethod?: string;
    bankPaidFrom?: string;
    reference?: string;
    amountPaidBs?: string;
    receiptUrl?: string;
  },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const { data: payment, error } = await supabase
    .from("subscription_payments")
    .insert({
      restaurant_id: restaurantId,
      plan_id: input.planId,
      plan_name: input.planName,
      amount_usd: input.amountUsd,
      payment_method: input.paymentMethod || null,
      bank_paid_from: input.bankPaidFrom || null,
      payment_reference: input.reference || null,
      amount_paid_bs: input.amountPaidBs || null,
      receipt_url: input.receiptUrl || null,
    })
    .select("id")
    .single();
  if (error || !payment) {
    return { error: error?.message ?? "No pudimos reportar el pago" };
  }

  // Si la notificación del banco ya había llegado antes de que el
  // restaurante terminara de llenar este formulario, se aprueba al toque
  // en vez de esperar a que llegue una notificación nueva.
  const { data: matchData } = await supabase.rpc("match_new_subscription_payment", {
    p_payment_id: payment.id,
  });
  const match = matchData?.[0];
  const matched = Boolean(match?.matched);

  if (matched && match?.restaurant_id) {
    after(() => notifyPaymentApproved(supabase, match.restaurant_id!, match.plan_expires_at));
  }

  return { error: undefined, matched, planExpiresAt: match?.plan_expires_at ?? null };
}

export async function uploadPaymentProof(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autorizado" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No se recibió ninguna imagen" };
  if (!file.type.startsWith("image/")) {
    return { error: "El comprobante debe ser una imagen" };
  }

  const ext = file.type.split("/")[1] ?? "png";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("payment-proofs")
    .upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const url = supabase.storage.from("payment-proofs").getPublicUrl(path).data
    .publicUrl;
  return { url };
}
