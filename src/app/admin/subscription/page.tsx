import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { getBcvRate } from "@/lib/bcv-rate";
import { createClient } from "@/lib/supabase/server";
import { parsePaymentMethods } from "@/lib/payment-methods";
import { getActivePlans } from "@/components/pricing-plans";
import { daysUntil } from "@/lib/subscription-plans";
import { SubscriptionView } from "./subscription-view";

export const metadata: Metadata = { title: "Suscripción" };

export default async function SubscriptionPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");

  const supabase = await createClient();
  const [plans, { data: settings }, bcvRate] = await Promise.all([
    getActivePlans(),
    supabase.from("platform_settings").select("payment_methods").single(),
    getBcvRate(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Suscripción</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Elige el plan que se ajuste a tu restaurante y actívalo con tu
          método de pago preferido.
        </p>
      </div>
      <SubscriptionView
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        currentPlanKey={restaurant.plan}
        daysLeft={daysUntil(restaurant.plan_expires_at)}
        plans={plans}
        platformPaymentMethods={parsePaymentMethods(settings?.payment_methods)}
        bcvRate={bcvRate}
      />
    </div>
  );
}
