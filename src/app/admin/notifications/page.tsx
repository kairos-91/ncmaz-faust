import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { NotificationsManager } from "./notifications-manager";

export const metadata: Metadata = { title: "Notificaciones" };

export default async function NotificationsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurant.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.notificationsPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.notificationsPage.subtitle}
        </p>
      </div>
      <NotificationsManager
        restaurantId={restaurant.id}
        subscriberCount={count ?? 0}
        locale={locale}
      />
    </div>
  );
}
