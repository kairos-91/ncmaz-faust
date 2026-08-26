"use server";

import { createClient } from "@/lib/supabase/server";

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

  const { error } = await supabase.from("subscription_payments").insert({
    restaurant_id: restaurantId,
    plan_id: input.planId,
    plan_name: input.planName,
    amount_usd: input.amountUsd,
    payment_method: input.paymentMethod || null,
    bank_paid_from: input.bankPaidFrom || null,
    payment_reference: input.reference || null,
    amount_paid_bs: input.amountPaidBs || null,
    receipt_url: input.receiptUrl || null,
  });
  if (error) return { error: error.message };

  return { error: undefined };
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
