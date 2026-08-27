import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { topOrderedItems } from "@/lib/orders";

export const metadata: Metadata = { title: "Analíticas" };

export default async function AnalyticsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { t } = await getT();

  const supabase = await createClient();
  const since30d = new Date(new Date().getTime() - 30 * 86400000).toISOString();

  const [
    { count: totalViews },
    { count: views30d },
    { count: totalOrders },
    { count: orders30d },
    { data: ordersItems },
  ] = await Promise.all([
    supabase
      .from("menu_views")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("menu_views")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", since30d),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", since30d),
    supabase.from("orders").select("items").eq("restaurant_id", restaurant.id),
  ]);

  const topItems = topOrderedItems((ordersItems ?? []).map((o) => o.items));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.analyticsPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.analyticsPage.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t.analyticsPage.totalViews} value={totalViews ?? 0} />
        <StatCard label={t.analyticsPage.views30d} value={views30d ?? 0} />
        <StatCard label={t.analyticsPage.totalOrders} value={totalOrders ?? 0} />
        <StatCard label={t.analyticsPage.orders30d} value={orders30d ?? 0} />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          {t.analyticsPage.topItems}
        </h2>
        {topItems.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t.analyticsPage.noOrders}
          </p>
        ) : (
          <ol className="space-y-2">
            {topItems.map((item, index) => (
              <li
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-neutral-800 dark:text-neutral-200">
                  {index + 1}. {item.name}
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {item.qty} {t.analyticsPage.unitsSold}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
    </div>
  );
}
