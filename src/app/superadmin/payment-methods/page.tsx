import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { parsePaymentMethods } from "@/lib/payment-methods";
import { getT } from "@/lib/i18n/locale";
import { PlatformPaymentMethodsForm } from "./payment-methods-form";

export const metadata: Metadata = { title: "Métodos de pago · Superadmin" };

export default async function SuperadminPaymentMethodsPage() {
  const supabase = await createClient();
  const [{ data: settings }, { t }] = await Promise.all([
    supabase.from("platform_settings").select("payment_methods").single(),
    getT(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {t.superadminPaymentMethodsPage.title}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.superadminPaymentMethodsPage.subtitle}
        </p>
      </div>
      <PlatformPaymentMethodsForm
        values={parsePaymentMethods(settings?.payment_methods)}
        t={t.paymentMethodsForm}
      />
    </div>
  );
}
