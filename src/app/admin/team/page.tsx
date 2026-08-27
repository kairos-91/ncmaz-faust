import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { TeamManager } from "./team-manager";

export const metadata: Metadata = { title: "Equipo" };

export default async function TeamPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("restaurant_staff")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.teamPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.teamPage.subtitle}
        </p>
      </div>
      <TeamManager restaurantId={restaurant.id} staff={staff ?? []} locale={locale} />
    </div>
  );
}
