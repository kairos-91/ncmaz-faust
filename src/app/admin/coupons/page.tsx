import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { enabledPaymentMethods, parsePaymentMethods } from "@/lib/payment-methods";
import { parseValidDays, parseValidPaymentMethods } from "@/lib/coupons";
import { CouponsManager } from "./coupons-manager";

export const metadata: Metadata = { title: "Cupones" };

export default async function CouponsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  const paymentMethodIds = enabledPaymentMethods(
    parsePaymentMethods(restaurant.payment_methods),
  );
  const parsedCoupons = (coupons ?? []).map((c) => ({
    ...c,
    valid_days: parseValidDays(c.valid_days),
    valid_payment_methods: parseValidPaymentMethods(c.valid_payment_methods),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.couponsPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.couponsPage.subtitle}
        </p>
      </div>
      <CouponsManager
        restaurantId={restaurant.id}
        currency={restaurant.currency}
        coupons={parsedCoupons}
        paymentMethodIds={paymentMethodIds}
        locale={locale}
      />
    </div>
  );
}
