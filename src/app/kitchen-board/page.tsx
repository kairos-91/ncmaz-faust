import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { KitchenBoard } from "@/app/admin/kitchen-staff/kitchen-board";

export const metadata: Metadata = { title: "Pantalla de cocina" };

export default async function KitchenBoardPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  if (!restaurant.manages_kitchen_staff) redirect("/admin/restaurant");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: kitchenOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .not("sent_to_kitchen_at", "is", null);

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-6 dark:bg-neutral-950">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {restaurant.name}
        </h1>
        <Link
          href="/admin/kitchen-staff"
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white"
        >
          {t.kitchenBoard.backToAdmin}
        </Link>
      </div>
      <KitchenBoard restaurantId={restaurant.id} orders={kitchenOrders ?? []} locale={locale} />
    </div>
  );
}
