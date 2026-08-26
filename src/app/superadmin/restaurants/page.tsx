import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getActivePlans } from "@/components/pricing-plans";
import { RestaurantsManager } from "./restaurants-manager";

export const metadata: Metadata = { title: "Restaurantes · Superadmin" };

export default async function SuperadminRestaurantsPage() {
  const supabase = await createClient();
  const [{ data: restaurants }, plans] = await Promise.all([
    supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false }),
    getActivePlans(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Restaurantes</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Administra el plan y el vencimiento de cada restaurante, y envía
          alertas de vencimiento por WhatsApp.
        </p>
      </div>
      <RestaurantsManager restaurants={restaurants ?? []} plans={plans} />
    </div>
  );
}
