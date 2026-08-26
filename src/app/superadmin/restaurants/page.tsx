import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getActivePlans } from "@/components/pricing-plans";
import { getT } from "@/lib/i18n/locale";
import { RestaurantsManager } from "./restaurants-manager";

export const metadata: Metadata = { title: "Restaurantes · Superadmin" };

export default async function SuperadminRestaurantsPage() {
  const supabase = await createClient();
  const [{ data: restaurants }, plans, { locale, t }] = await Promise.all([
    supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false }),
    getActivePlans(),
    getT(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.superadminRestaurantsPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.superadminRestaurantsPage.subtitle}
        </p>
      </div>
      <RestaurantsManager
        restaurants={restaurants ?? []}
        plans={plans}
        locale={locale}
      />
    </div>
  );
}
