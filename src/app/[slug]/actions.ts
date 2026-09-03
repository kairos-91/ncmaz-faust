"use server";

import webpush from "web-push";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations";
import { ORDER_TYPE_LABELS, type OrderItemSnapshot } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { imageExtension, validateImageFile } from "@/lib/file-validation";
import { checkIpRateLimit } from "@/lib/rate-limit";
import {
  parseValidDays,
  parseValidPaymentMethods,
  validateCoupon,
  type Coupon,
} from "@/lib/coupons";

async function notifyAdminsOfNewOrder(
  restaurantId: string,
  input: {
    orderType: string;
    customerName: string;
    total: number;
    currency: string;
  },
) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) return;

  const supabase = await createClient();
  const { data: subscriptions } = await supabase.rpc("get_admin_push_subscriptions", {
    p_restaurant_id: restaurantId,
  });
  if (!subscriptions || subscriptions.length === 0) return;

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const orderTypeLabel = ORDER_TYPE_LABELS[input.orderType] ?? input.orderType;
  const payload = JSON.stringify({
    title: "🔔 ¡Nuevo pedido!",
    body: `${input.customerName} · ${orderTypeLabel} · ${formatPrice(input.total, input.currency)}`,
    url: "/admin/orders",
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        // 404/410: la suscripción ya no existe. 401/403: quedó firmada con
        // una clave VAPID que ya no es válida. Ambos casos son
        // permanentes — hay que borrarla para que el usuario pueda
        // volver a activar las notificaciones desde cero.
        if ([401, 403, 404, 410].includes(statusCode ?? 0)) {
          await supabase.rpc("delete_admin_push_subscription", {
            p_endpoint: sub.endpoint,
          });
        }
      }
    }),
  );
}

export async function createOrder(
  restaurantId: string,
  input: {
    orderType: "delivery" | "pickup" | "dine_in";
    customerName: string;
    customerPhone: string;
    address?: string;
    lat?: number;
    lng?: number;
    tableNumber?: string;
    tableId?: string;
    deliveryZone?: string;
    deliveryFee?: number;
    packagingFee?: number;
    couponCode?: string;
    discountAmount?: number;
    items: OrderItemSnapshot[];
    total: number;
    currency: string;
    paymentMethod?: string;
    bankPaidFrom?: string;
    reference?: string;
    amountPaid?: string;
    receiptUrl?: string;
    changeFor?: string;
  },
) {
  if (!input.customerName.trim() || !input.customerPhone.trim()) {
    return { error: "Faltan los datos del cliente" };
  }

  const canProceed = await checkIpRateLimit(`order:${restaurantId}`, 8, 900);
  if (!canProceed) {
    return { error: "Hiciste demasiados pedidos en poco tiempo. Intenta de nuevo en unos minutos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      restaurant_id: restaurantId,
      order_type: input.orderType,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      address: input.address?.trim() || null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      table_number: input.tableNumber?.trim() || null,
      table_id: input.tableId || null,
      delivery_zone: input.deliveryZone?.trim() || null,
      delivery_fee: input.deliveryFee ?? 0,
      packaging_fee: input.packagingFee ?? 0,
      coupon_code: input.couponCode?.trim() || null,
      discount_amount: input.discountAmount ?? 0,
      items: input.items,
      total: input.total,
      currency: input.currency,
      payment_method: input.paymentMethod || null,
      bank_paid_from: input.bankPaidFrom || null,
      payment_reference: input.reference || null,
      amount_paid: input.amountPaid || null,
      receipt_url: input.receiptUrl || null,
      change_for: input.changeFor || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (input.tableId) {
    const tableId = input.tableId;
    after(async () => {
      await supabase.rpc("mark_table_occupied", { p_table_id: tableId });
    });
  }

  after(() =>
    notifyAdminsOfNewOrder(restaurantId, {
      orderType: input.orderType,
      customerName: input.customerName.trim(),
      total: input.total,
      currency: input.currency,
    }).catch(() => {}),
  );

  return { id: data.id };
}

export async function uploadOrderReceipt(
  restaurantId: string,
  formData: FormData,
) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No se recibió ninguna imagen" };
  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  const canProceed = await checkIpRateLimit("order-receipt", 15, 900);
  if (!canProceed) {
    return { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." };
  }

  const supabase = await createClient();
  const path = `${restaurantId}/${crypto.randomUUID()}.${imageExtension(file)}`;
  const { error } = await supabase.storage
    .from("order-receipts")
    .upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const url = supabase.storage.from("order-receipts").getPublicUrl(path).data
    .publicUrl;
  return { url };
}

// Antes esto corría directo en el navegador con el cliente anon —
// cualquiera podía probar códigos de cupón a la velocidad que quisiera
// sin pasar por ningún límite. Moverlo a una Server Action deja aplicar
// checkIpRateLimit; RLS sigue siendo la misma (lectura pública de
// coupons ya existía), esto solo cierra la puerta a probar códigos sin
// límite alguno.
export async function checkCoupon(
  restaurantId: string,
  input: {
    code: string;
    customerPhone: string;
    orderTotal: number;
    currency: string;
    paymentMethodId: string | null;
  },
): Promise<
  | { error: string }
  | { coupon: Coupon; usage: { totalUses: number; customerUses: number } }
> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { error: "Ingresa un código de cupón" };

  const canProceed = await checkIpRateLimit(`coupon:${restaurantId}`, 20, 600);
  if (!canProceed) {
    return { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("coupons")
    .select(
      "id, code, discount_type, discount_value, is_active, expires_at, min_order_amount, max_total_uses, max_uses_per_customer, starts_at, valid_time_start, valid_time_end, valid_days, valid_payment_methods",
    )
    .eq("restaurant_id", restaurantId)
    .eq("code", code)
    .maybeSingle();
  if (!data) {
    return { error: "Ese cupón no existe o ya venció." };
  }

  const coupon: Coupon = {
    id: data.id,
    code: data.code,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    is_active: data.is_active,
    expires_at: data.expires_at,
    min_order_amount: data.min_order_amount,
    max_total_uses: data.max_total_uses,
    max_uses_per_customer: data.max_uses_per_customer,
    starts_at: data.starts_at,
    valid_time_start: data.valid_time_start,
    valid_time_end: data.valid_time_end,
    valid_days: parseValidDays(data.valid_days),
    valid_payment_methods: parseValidPaymentMethods(data.valid_payment_methods),
  };

  let usage = { totalUses: 0, customerUses: 0 };
  if (coupon.max_total_uses !== null || coupon.max_uses_per_customer !== null) {
    const { data: usageRows } = await supabase.rpc("get_coupon_usage", {
      p_restaurant_id: restaurantId,
      p_code: coupon.code,
      p_customer_phone: input.customerPhone.trim(),
    });
    const row = usageRows?.[0];
    if (row) usage = { totalUses: row.total_uses, customerUses: row.customer_uses };
  }

  const result = validateCoupon(coupon, {
    orderTotal: input.orderTotal,
    currency: input.currency,
    paymentMethodId: input.paymentMethodId,
    totalUses: usage.totalUses,
    customerUses: usage.customerUses,
  });
  if (!result.valid) {
    return { error: result.reason ?? "Este cupón no se puede usar." };
  }

  return { coupon, usage };
}

export async function createReview(
  restaurantId: string,
  input: { customerName: string; rating: number; comment: string },
) {
  const parsed = reviewSchema.safeParse({
    customer_name: input.customerName,
    rating: input.rating,
    comment: input.comment,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const canProceed = await checkIpRateLimit(`review:${restaurantId}`, 5, 3600);
  if (!canProceed) {
    return { error: "Ya dejaste varias reseñas seguidas. Intenta de nuevo más tarde." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    restaurant_id: restaurantId,
    customer_name: parsed.data.customer_name.trim(),
    rating: parsed.data.rating,
    comment: parsed.data.comment?.trim() || null,
  });
  if (error) return { error: error.message };

  return { success: true };
}

export async function subscribeToPush(
  restaurantId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
) {
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      restaurant_id: restaurantId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "restaurant_id,endpoint" },
  );
  if (error) return { error: error.message };
  return { success: true };
}
