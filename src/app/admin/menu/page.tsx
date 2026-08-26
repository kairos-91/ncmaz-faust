import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { MenuManager } from "./menu-manager";

export const metadata: Metadata = { title: "Menú" };

export default async function MenuPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
  ]);

  if (!categories || categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <p className="mb-3 text-sm text-neutral-600 dark:text-neutral-400">
          {t.menuPage.noCategories}
        </p>
        <Link
          href="/admin/categories"
          className="text-sm font-medium text-neutral-900 underline dark:text-white"
        >
          {t.menuPage.goToCategories}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.menuPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.menuPage.subtitle}
        </p>
      </div>
      <MenuManager
        restaurantId={restaurant.id}
        currency={restaurant.currency}
        categories={categories}
        items={items ?? []}
        locale={locale}
        formT={t.menuItemForm}
      />
    </div>
  );
}
