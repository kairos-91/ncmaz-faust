import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import {
  computeSalesSummary,
  groupSalesByDay,
  groupSalesByMonth,
  lastNDays,
  lastNMonths,
} from "@/lib/sales";
import { formatPrice } from "@/lib/utils";
import { getBcvRate, formatBs } from "@/lib/bcv-rate";
import { createRestaurant } from "./actions";
import { RestaurantForm } from "./restaurant/restaurant-form";
import { QrCard } from "./qr-card";
import { Button } from "@/components/ui/button";
import { SalesCharts } from "./sales/sales-charts";

export const metadata: Metadata = { title: "Resumen" };

export default async function AdminDashboardPage() {
  const { restaurant, role } = await getStaffRestaurant();
  const { t } = await getT();

  if (role === "staff") redirect("/admin/orders");

  if (!restaurant) {
    return (
      <div>
        <h1 className="mb-1 text-xl font-semibold">{t.dashboard.createTitle}</h1>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
          {t.dashboard.createSubtitle}
        </p>
        <RestaurantForm
          action={createRestaurant}
          submitLabel={t.dashboard.createSubmitLabel}
          t={t.restaurantForm}
          hoursT={t.openingHours}
        />
      </div>
    );
  }

  const supabase = await createClient();
  const [{ count: categoryCount }, { count: itemCount }, { data: orders }, bcvRate] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id),
      supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurant.id),
      supabase
        .from("orders")
        .select("total, status, created_at")
        .eq("restaurant_id", restaurant.id),
      restaurant.currency === "USD" ? getBcvRate() : Promise.resolve(null),
    ]);

  const sales = computeSalesSummary(orders ?? []);
  const bsFor = (amountUsd: number) =>
    bcvRate ? formatBs(amountUsd, bcvRate.rate) : null;
  const dailyChart = lastNDays(groupSalesByDay(orders ?? []), new Date(), 30);
  const monthlyChart = lastNMonths(groupSalesByMonth(orders ?? []), new Date(), 12);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const publicUrl = `${siteUrl}/r/${restaurant.slug}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">{t.dashboard.greeting(restaurant.name)}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {restaurant.is_published ? t.dashboard.published : t.dashboard.unpublished}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label={t.dashboard.categoriesLabel} value={categoryCount ?? 0} />
        <StatCard label={t.dashboard.dishesLabel} value={itemCount ?? 0} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          {t.dashboard.salesTitle}
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t.dashboard.salesToday}
            value={formatPrice(sales.today, restaurant.currency)}
            subValue={bsFor(sales.today)}
          />
          <StatCard
            label={t.dashboard.salesMonth}
            value={formatPrice(sales.month, restaurant.currency)}
            subValue={bsFor(sales.month)}
          />
          <StatCard
            label={t.dashboard.salesYear}
            value={formatPrice(sales.year, restaurant.currency)}
            subValue={bsFor(sales.year)}
          />
          <StatCard
            label={t.dashboard.salesAllTime}
            value={formatPrice(sales.allTime, restaurant.currency)}
            subValue={bsFor(sales.allTime)}
          />
        </div>
      </div>

      <SalesCharts
        daily={dailyChart}
        monthly={monthlyChart}
        currency={restaurant.currency}
        dailyTitle={t.salesPage.dailyChartTitle}
        monthlyTitle={t.salesPage.monthlyChartTitle}
        orderSingular={t.salesPage.orderSingular}
        orderPlural={t.salesPage.orderPlural}
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/sales">
          <Button variant="secondary">{t.dashboard.viewSales}</Button>
        </Link>
        <Link href="/admin/categories">
          <Button variant="secondary">{t.dashboard.manageCategories}</Button>
        </Link>
        <Link href="/admin/menu">
          <Button variant="secondary">{t.dashboard.manageMenu}</Button>
        </Link>
        <Link href="/admin/subscription">
          <Button variant="secondary">{t.dashboard.viewPlans}</Button>
        </Link>
      </div>

      <QrCard
        publicUrl={publicUrl}
        t={{ qrTitle: t.dashboard.qrTitle, qrHint: t.dashboard.qrHint }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: number | string;
  subValue?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-2xl font-semibold">{value}</p>
      {subValue && (
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {subValue}
        </p>
      )}
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
    </div>
  );
}
