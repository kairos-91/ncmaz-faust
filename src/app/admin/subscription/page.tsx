import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { getBcvRate } from "@/lib/bcv-rate";
import { createClient } from "@/lib/supabase/server";
import { parsePaymentMethods } from "@/lib/payment-methods";
import { getActivePlans } from "@/components/pricing-plans";
import { daysUntil } from "@/lib/subscription-plans";
import { getT } from "@/lib/i18n/locale";
import { SubscriptionView } from "./subscription-view";

export const metadata: Metadata = { title: "Suscripción" };

export default async function SubscriptionPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const [plans, { data: settings }, bcvRate] = await Promise.all([
    getActivePlans(),
    supabase.from("platform_settings").select("payment_methods").single(),
    getBcvRate(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.subscriptionPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.subscriptionPage.subtitle}
        </p>
      </div>
      <SubscriptionView
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        currentPlanKey={restaurant.plan}
        daysLeft={daysUntil(restaurant.plan_expires_at)}
        plans={plans}
        platformPaymentMethods={parsePaymentMethods(settings?.payment_methods)}
        bcvRate={bcvRate}
        locale={locale}
        t={t.subscriptionView}
        paymentT={t.subscriptionPaymentMethods}
        pricingT={t.pricingSection}
      />
    </div>
  );
}
