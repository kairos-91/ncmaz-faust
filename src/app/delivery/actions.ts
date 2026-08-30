"use server";

import webpush from "web-push";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireDeliveryStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: deliveryStaff } = await supabase
    .from("delivery_staff")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!deliveryStaff) throw new Error("No autorizado");

  return { supabase, deliveryStaffId: deliveryStaff.id };
}

export async function acceptDeliveryAssignment(orderId: string) {
  const { supabase, deliveryStaffId } = await requireDeliveryStaff();
  const { error } = await supabase
    .from("orders")
    .update({ delivery_accepted_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("delivery_staff_id", deliveryStaffId);
  if (error) throw new Error(error.message);
  revalidatePath("/delivery");
}

export async function rejectDeliveryAssignment(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_delivery_assignment", {
    p_order_id: orderId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/delivery");
}

export async function markOrderDelivered(orderId: string) {
  const { supabase, deliveryStaffId } = await requireDeliveryStaff();
  const { error } = await supabase
    .from("orders")
    .update({ delivered_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("delivery_staff_id", deliveryStaffId);
  if (error) throw new Error(error.message);
  revalidatePath("/delivery");
}

export async function subscribeDeliveryToPush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const { supabase, deliveryStaffId } = await requireDeliveryStaff();
  const { error } = await supabase.from("delivery_push_subscriptions").upsert(
    {
      delivery_staff_id: deliveryStaffId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "delivery_staff_id,endpoint" },
  );
  if (error) return { error: error.message };
  return { success: true };
}

export async function unsubscribeDeliveryFromPush(endpoint: string) {
  const { supabase, deliveryStaffId } = await requireDeliveryStaff();
  await supabase
    .from("delivery_push_subscriptions")
    .delete()
    .eq("delivery_staff_id", deliveryStaffId)
    .eq("endpoint", endpoint);
}

// Deja al repartidor confirmar desde su propio celular que las
// notificaciones sí le llegan, sin esperar a que le asignen un pedido
// real — manda a todas las suscripciones de este repartidor y limpia
// las que ya no sirven, igual que sendTestAdminPush.
type SendTestDeliveryPushResult =
  | { error: string }
  | { sent: number; total: number; removed: number };

export async function sendTestDeliveryPush(): Promise<SendTestDeliveryPushResult> {
  const { supabase, deliveryStaffId } = await requireDeliveryStaff();

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return { error: "Las notificaciones push no están configuradas en el servidor." };
  }

  const { data: subscriptions } = await supabase
    .from("delivery_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("delivery_staff_id", deliveryStaffId);
  if (!subscriptions || subscriptions.length === 0) {
    return { error: "No hay ninguna suscripción activa en este dispositivo." };
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const payload = JSON.stringify({
    title: "🔔 Notificación de prueba",
    body: "Si ves esto, las alertas de pedidos nuevos funcionan en este dispositivo.",
    url: "/delivery",
  });

  let sent = 0;
  const expiredIds: string[] = [];
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent += 1;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if ([401, 403, 404, 410].includes(statusCode ?? 0)) {
          expiredIds.push(sub.id);
        }
      }
    }),
  );

  if (expiredIds.length > 0) {
    await supabase.from("delivery_push_subscriptions").delete().in("id", expiredIds);
  }

  return { sent, total: subscriptions.length, removed: expiredIds.length };
}
