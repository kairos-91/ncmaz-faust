import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { CategoryManager } from "./category-manager";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriesPage() {
  const { restaurant } = await getStaffRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.categoriesPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.categoriesPage.subtitle}
        </p>
      </div>
      <CategoryManager
        restaurantId={restaurant.id}
        categories={categories ?? []}
        locale={locale}
      />
    </div>
  );
}
