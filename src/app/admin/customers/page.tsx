import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { computeCustomerStats } from "@/lib/customers";
import { CustomersView } from "./customers-view";

export const metadata: Metadata = { title: "Clientes" };

export default async function CustomersPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("customer_name, customer_phone, total, status, created_at")
    .eq("restaurant_id", restaurant.id);

  const customers = computeCustomerStats(orders ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.customersPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.customersPage.subtitle}
        </p>
      </div>
      <CustomersView
        customers={customers}
        currency={restaurant.currency}
        locale={locale}
        t={t.customersPage}
      />
    </div>
  );
}
