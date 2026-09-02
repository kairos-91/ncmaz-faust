import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { daysUntil } from "@/lib/subscription-plans";

// Mismo mecanismo que notifyAdminsOfNewOrder en [slug]/actions.ts:
// admin_push_subscriptions es la suscripción del dueño/staff del
// restaurante (no la de sus clientes), pensada para avisos del sistema
// como "nuevo pedido" — y ahora también "pago validado".
export async function sendAdminPush(
  supabase: SupabaseClient<Database>,
  restaurantId: string,
  payload: { title: string; body: string; url: string },
) {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) return;

  const { data: subscriptions } = await supabase.rpc("get_admin_push_subscriptions", {
    p_restaurant_id: restaurantId,
  });
  if (!subscriptions || subscriptions.length === 0) return;

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const json = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json,
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if ([401, 403, 404, 410].includes(statusCode ?? 0)) {
          await supabase.rpc("delete_admin_push_subscription", { p_endpoint: sub.endpoint });
        }
      }
    }),
  );
}

export async function notifyPaymentApproved(
  supabase: SupabaseClient<Database>,
  restaurantId: string,
  planExpiresAt: string | null,
) {
  const days = daysUntil(planExpiresAt);
  const daysText =
    days === null ? "" : ` Te quedan ${days} ${days === 1 ? "día" : "días"} en tu plan.`;

  await sendAdminPush(supabase, restaurantId, {
    title: "Pago validado exitosamente ❤️",
    body: `Gracias.${daysText}`,
    url: "/admin/subscription",
  });
}
