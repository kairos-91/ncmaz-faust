import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { getBcvRate } from "@/lib/bcv-rate";
import {
  PAYMENT_METHOD_META,
  enabledPaymentMethods,
  parsePaymentMethods,
} from "@/lib/payment-methods";
import { parseDeliveryZones } from "@/lib/delivery-zones";
import { CreateOrderForm } from "./create-order-form";

export const metadata: Metadata = { title: "Crear pedido" };

export default async function NewOrderPage() {
  const { restaurant } = await getStaffRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("is_available", true)
      .order("sort_order"),
  ]);

  const paymentMethods = parsePaymentMethods(restaurant.payment_methods);
  const needsBcvRate = enabledPaymentMethods(paymentMethods).some(
    (id) => PAYMENT_METHOD_META[id].convertToVes,
  );
  const bcvRate = needsBcvRate ? await getBcvRate(restaurant.currency) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.createOrderPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.createOrderPage.subtitle}
        </p>
      </div>
      <CreateOrderForm
        restaurantId={restaurant.id}
        currency={restaurant.currency}
        categories={categories ?? []}
        items={items ?? []}
        locale={locale}
        t={t.createOrderForm}
        backLabel={t.createOrderPage.back}
        paymentMethods={paymentMethods}
        bcvRate={bcvRate}
        deliveryZones={parseDeliveryZones(restaurant.delivery_zones)}
        packagingFeeEnabled={restaurant.packaging_fee_enabled}
        packagingFeeAmount={restaurant.packaging_fee}
      />
    </div>
  );
}
