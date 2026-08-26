import type { Metadata } from "next";
import Link from "next/link";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { createRestaurant } from "./actions";
import { RestaurantForm } from "./restaurant/restaurant-form";
import { QrCard } from "./qr-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Resumen" };

export default async function AdminDashboardPage() {
  const { restaurant } = await getOwnerRestaurant();
  const { t } = await getT();

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
        />
      </div>
    );
  }

  const supabase = await createClient();
  const [{ count: categoryCount }, { count: itemCount }] = await Promise.all([
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
  ]);

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

      <div className="flex flex-wrap gap-3">
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
    </div>
  );
}
