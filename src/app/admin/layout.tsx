import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { getT } from "@/lib/i18n/locale";
import { isOpenNow, parseOpeningHours } from "@/lib/opening-hours";
import { getBcvRate } from "@/lib/bcv-rate";
import { AdminNav } from "./admin-nav";
import { AdminTopBar } from "./admin-topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userEmail, restaurant, role } = await getStaffRestaurant();
  if (!userEmail) redirect("/login");
  const { locale, t } = await getT();

  let pendingOrders = 0;
  if (restaurant) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id)
      .eq("status", "pending");
    pendingOrders = count ?? 0;
  }

  const hasOpeningHours =
    Array.isArray(restaurant?.opening_hours) && restaurant.opening_hours.length > 0;
  const openNow = hasOpeningHours
    ? isOpenNow(parseOpeningHours(restaurant!.opening_hours))
    : null;

  const bcvRate = await getBcvRate();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 dark:bg-neutral-950">
      <AdminTopBar
        email={userEmail}
        locale={locale}
        t={t.adminNav}
        openNow={openNow}
        bcvRate={bcvRate}
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminNav
          email={userEmail}
          t={t.adminNav}
          pendingOrders={pendingOrders}
          isStaff={role === "staff"}
          restaurantId={restaurant?.id ?? null}
        />
        <main className="flex-1 px-4 py-8 md:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
