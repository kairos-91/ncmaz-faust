import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { getT } from "@/lib/i18n/locale";
import { AdminNav } from "./admin-nav";

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

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50 dark:bg-neutral-950 md:flex-row">
      <AdminNav
        email={userEmail}
        locale={locale}
        t={t.adminNav}
        pendingOrders={pendingOrders}
        isStaff={role === "staff"}
        restaurantId={restaurant?.id ?? null}
      />
      <main className="flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
