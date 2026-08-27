"use server";

import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { pushNotificationSchema } from "@/lib/validations";

type ActionState = { error?: string; sent?: number } | null;

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

export async function sendPushNotification(
  restaurantId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await requireOwnedRestaurant(restaurantId);

  const parsed = pushNotificationSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    url: formData.get("url") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return { error: "Las notificaciones push no están configuradas en el servidor." };
  }
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const { data: subscriptions, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("restaurant_id", restaurantId);
  if (subsError) return { error: subsError.message };
  if (!subscriptions || subscriptions.length === 0) {
    return { error: "Todavía no tienes clientes suscritos a las notificaciones." };
  }

  const payload = JSON.stringify({
    title: parsed.data.title.trim(),
    body: parsed.data.body.trim(),
    url: parsed.data.url?.trim() || undefined,
  });

  const expiredIds: string[] = [];
  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
        sent += 1;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expiredIds.push(sub.id);
        }
      }
    }),
  );

  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  return { sent };
}
