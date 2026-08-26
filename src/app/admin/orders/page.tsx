import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { OrdersManager } from "./orders-manager";

export const metadata: Metadata = { title: "Pedidos" };

export default async function OrdersPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pedidos</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Pedidos hechos desde tu menú público. Acepta o rechaza cada uno.
        </p>
      </div>
      <OrdersManager
        restaurantId={restaurant.id}
        currency={restaurant.currency}
        orders={orders ?? []}
      />
    </div>
  );
}
