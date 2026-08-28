import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { computeSalesSummary, groupSalesByDay } from "@/lib/sales";
import { SalesView } from "./sales-view";

export const metadata: Metadata = { title: "Ventas" };

export default async function SalesPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale } = await getT();

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("total, status, created_at")
    .eq("restaurant_id", restaurant.id);

  const summary = computeSalesSummary(orders ?? []);
  const daily = groupSalesByDay(orders ?? []);

  return (
    <SalesView
      restaurantName={restaurant.name}
      currency={restaurant.currency}
      summary={summary}
      daily={daily}
      locale={locale}
    />
  );
}
