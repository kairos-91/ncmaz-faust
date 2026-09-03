import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import {
  computeSalesSummary,
  groupSalesByDay,
  groupSalesByMonth,
  lastNDays,
  lastNMonths,
} from "@/lib/sales";
import { getBcvRate } from "@/lib/bcv-rate";
import { SalesView } from "./sales-view";

export const metadata: Metadata = { title: "Ventas" };

export default async function SalesPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale } = await getT();

  const supabase = await createClient();
  const [{ data: orders }, bcvRate] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "total, status, created_at, payment_method, order_type, delivery_fee, delivery_staff_id, delivery_accepted_at",
      )
      .eq("restaurant_id", restaurant.id),
    restaurant.currency === "USD" || restaurant.currency === "EUR"
      ? getBcvRate(restaurant.currency)
      : Promise.resolve(null),
  ]);

  const deliveryStaffSharePercent = restaurant.delivery_fee_percentage_enabled
    ? restaurant.delivery_staff_fee_percentage
    : 100;
  const summary = computeSalesSummary(orders ?? [], new Date(), deliveryStaffSharePercent);
  const daily = groupSalesByDay(orders ?? [], deliveryStaffSharePercent);
  const dailyChart = lastNDays(daily, new Date(), 30);
  const monthlyChart = lastNMonths(
    groupSalesByMonth(orders ?? [], deliveryStaffSharePercent),
    new Date(),
    12,
  );

  return (
    <SalesView
      restaurantName={restaurant.name}
      currency={restaurant.currency}
      summary={summary}
      daily={daily}
      dailyChart={dailyChart}
      monthlyChart={monthlyChart}
      orders={orders ?? []}
      bcvRate={bcvRate?.rate ?? null}
      deliveryStaffSharePercent={deliveryStaffSharePercent}
      locale={locale}
    />
  );
}
