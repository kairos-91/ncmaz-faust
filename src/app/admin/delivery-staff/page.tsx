import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { DeliveryStaffManager } from "./delivery-staff-manager";

export const metadata: Metadata = { title: "Personal de delivery" };

export default async function DeliveryStaffPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  if (!restaurant.manages_delivery_staff) redirect("/admin/restaurant");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("delivery_staff")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.deliveryStaffPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.deliveryStaffPage.subtitle}
        </p>
      </div>
      <DeliveryStaffManager
        restaurantId={restaurant.id}
        staff={staff ?? []}
        locale={locale}
      />
    </div>
  );
}
