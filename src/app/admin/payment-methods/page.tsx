import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { parsePaymentMethods } from "@/lib/payment-methods";
import { getT } from "@/lib/i18n/locale";
import { SectionIntro } from "@/components/section-intro";
import { PaymentMethodsForm } from "./payment-methods-form";

export const metadata: Metadata = { title: "Métodos de pago" };

export default async function PaymentMethodsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { t } = await getT();

  const values = parsePaymentMethods(restaurant.payment_methods);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.adminPaymentMethodsPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.adminPaymentMethodsPage.subtitle}
        </p>
      </div>
      <SectionIntro
        restaurantId={restaurant.id}
        tipKey="payment-methods"
        icon={<CreditCard className="h-5 w-5" />}
        title={t.onboarding.paymentMethodsIntroTitle}
        body={t.onboarding.paymentMethodsIntroBody}
        dismissLabel={t.onboarding.dismiss}
      />
      <PaymentMethodsForm
        restaurantId={restaurant.id}
        values={values}
        t={t.paymentMethodsForm}
      />
    </div>
  );
}
