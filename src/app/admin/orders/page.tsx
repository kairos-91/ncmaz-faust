import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { OrdersManager } from "./orders-manager";
import { NotifyOrdersButton } from "./notify-orders-button";

export const metadata: Metadata = { title: "Pedidos" };

export default async function OrdersPage() {
  const { restaurant } = await getStaffRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t.ordersPage.title}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t.ordersPage.subtitle}
          </p>
        </div>
        <NotifyOrdersButton restaurantId={restaurant.id} t={t.notifyOrders} />
      </div>
      <OrdersManager
        restaurantId={restaurant.id}
        currency={restaurant.currency}
        orders={orders ?? []}
        locale={locale}
        t={t.ordersManager}
      />
    </div>
  );
}
