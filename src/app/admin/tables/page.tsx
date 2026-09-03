import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { TablesManager } from "./tables-manager";

export const metadata: Metadata = { title: "Mesas" };

export default async function TablesPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: tables } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const publicUrl = `${siteUrl}/${restaurant.slug}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.tablesPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.tablesPage.subtitle}
        </p>
      </div>
      <TablesManager
        restaurantId={restaurant.id}
        tables={tables ?? []}
        publicUrl={publicUrl}
        themeColor={restaurant.theme_color}
        restaurantLogoUrl={restaurant.logo_url}
        locale={locale}
      />
    </div>
  );
}
