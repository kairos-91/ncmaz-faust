import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { getBcvRate } from "@/lib/bcv-rate";
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

  const needsBcvRate = (orders ?? []).some(
    (o) => o.payment_method === "pago_movil" || o.payment_method === "transferencia",
  );
  const bcvRate = needsBcvRate ? await getBcvRate() : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t.ordersPage.title}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t.ordersPage.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <NotifyOrdersButton restaurantId={restaurant.id} locale={locale} />
          <Link
            href="/admin/orders/new"
            className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            {t.ordersPage.createOrder}
          </Link>
        </div>
      </div>
      <OrdersManager
        restaurantId={restaurant.id}
        currency={restaurant.currency}
        orders={orders ?? []}
        locale={locale}
        t={t.ordersManager}
        bcvRate={bcvRate}
      />
    </div>
  );
}
