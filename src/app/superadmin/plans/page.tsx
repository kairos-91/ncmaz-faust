import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { toSubscriptionPlan } from "@/lib/subscription-plans";
import { PlansManager } from "./plans-manager";

export const metadata: Metadata = { title: "Planes · Superadmin" };

export default async function SuperadminPlansPage() {
  const supabase = await createClient();
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Planes de suscripción</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Crea y edita los planes que se muestran en la landing y en
          /admin/subscription. Desactiva un plan para dejar de mostrarlo sin
          borrarlo.
        </p>
      </div>
      <PlansManager plans={(plans ?? []).map(toSubscriptionPlan)} />
    </div>
  );
}
