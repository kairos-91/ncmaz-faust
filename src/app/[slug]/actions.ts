"use server";

import webpush from "web-push";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations";
import { ORDER_TYPE_LABELS, type OrderItemSnapshot } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

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
    tableNumber?: string;
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      restaurant_id: restaurantId,
      order_type: input.orderType,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      address: input.address?.trim() || null,
      table_number: input.tableNumber?.trim() || null,
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
  if (!file.type.startsWith("image/")) {
    return { error: "El comprobante debe ser una imagen" };
  }

  const supabase = await createClient();
  const ext = file.type.split("/")[1] ?? "png";
  const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("order-receipts")
    .upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const url = supabase.storage.from("order-receipts").getPublicUrl(path).data
    .publicUrl;
  return { url };
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
