import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PaymentsManager } from "./payments-manager";

export const metadata: Metadata = { title: "Pagos · Superadmin" };

export default async function SuperadminPaymentsPage() {
  const supabase = await createClient();
  const [{ data: payments }, { data: restaurants }] = await Promise.all([
    supabase
      .from("subscription_payments")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("restaurants").select("id, name, slug"),
  ]);

  const restaurantInfo: Record<string, { name: string; slug: string }> = {};
  for (const r of restaurants ?? []) {
    restaurantInfo[r.id] = { name: r.name, slug: r.slug };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pagos de suscripción</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Pagos que los restaurantes han hecho para activar o renovar su
          plan. Revisa el comprobante y aprueba o rechaza — al aprobar se
          extiende automáticamente el vencimiento del plan.
        </p>
      </div>
      <PaymentsManager
        payments={payments ?? []}
        restaurantInfo={restaurantInfo}
      />
    </div>
  );
}
