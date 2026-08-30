import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { KitchenBoard } from "./kitchen-board";
import { KitchenStaffManager } from "./kitchen-staff-manager";

export const metadata: Metadata = { title: "Cocina" };

export default async function KitchenStaffPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  if (!restaurant.manages_kitchen_staff) redirect("/admin/restaurant");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const [{ data: staff }, { data: kitchenOrders }] = await Promise.all([
    supabase
      .from("kitchen_staff")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .not("sent_to_kitchen_at", "is", null),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">{t.kitchenStaffPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.kitchenStaffPage.subtitle}
        </p>
      </div>

      <KitchenBoard restaurantId={restaurant.id} orders={kitchenOrders ?? []} t={t.kitchenBoard} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          {t.kitchenBoard.staffRosterTitle}
        </h2>
        <KitchenStaffManager restaurantId={restaurant.id} staff={staff ?? []} locale={locale} />
      </div>
    </div>
  );
}
