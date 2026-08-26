import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { parsePaymentMethods } from "@/lib/payment-methods";
import { PlatformPaymentMethodsForm } from "./payment-methods-form";

export const metadata: Metadata = { title: "Métodos de pago · Superadmin" };

export default async function SuperadminPaymentMethodsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("platform_settings")
    .select("payment_methods")
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Métodos de pago de Levery</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Estos son los datos que ven los restaurantes al pagar su
          suscripción desde /admin/subscription.
        </p>
      </div>
      <PlatformPaymentMethodsForm
        values={parsePaymentMethods(settings?.payment_methods)}
      />
    </div>
  );
}
