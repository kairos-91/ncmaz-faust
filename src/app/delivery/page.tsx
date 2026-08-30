import { redirect } from "next/navigation";
import { getDeliveryStaffSession } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { DeliveryPanel } from "./delivery-panel";

export default async function DeliveryPage() {
  const { restaurant, deliveryStaff } = await getDeliveryStaffSession();
  if (!restaurant || !deliveryStaff) redirect("/delivery");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("delivery_staff_id", deliveryStaff.id)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(150);

  return (
    <DeliveryPanel
      restaurantId={restaurant.id}
      currency={restaurant.currency}
      deliveryStaffId={deliveryStaff.id}
      orders={orders ?? []}
      locale={locale}
      t={t.deliveryPortal}
    />
  );
}
