import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { SubscriptionView } from "./subscription-view";

export const metadata: Metadata = { title: "Suscripción" };

export default async function SubscriptionPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");

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
        restaurantName={restaurant.name}
        currentPlan={restaurant.plan}
      />
    </div>
  );
}
