import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { PaymentsManager } from "./payments-manager";

export const metadata: Metadata = { title: "Pagos · Superadmin" };

export default async function SuperadminPaymentsPage() {
  const supabase = await createClient();
  const [{ data: payments }, { data: restaurants }, { locale, t }] = await Promise.all([
    supabase
      .from("subscription_payments")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("restaurants").select("id, name, slug"),
    getT(),
  ]);

  const restaurantInfo: Record<string, { name: string; slug: string }> = {};
  for (const r of restaurants ?? []) {
    restaurantInfo[r.id] = { name: r.name, slug: r.slug };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.superadminPaymentsPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.superadminPaymentsPage.subtitle}
        </p>
      </div>
      <PaymentsManager
        payments={payments ?? []}
        restaurantInfo={restaurantInfo}
        locale={locale}
        t={t.superadminPayments}
      />
    </div>
  );
}
