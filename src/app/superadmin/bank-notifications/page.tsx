import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { BankNotificationsManager } from "./bank-notifications-manager";

export const metadata: Metadata = { title: "Notificaciones bancarias · Superadmin" };

export default async function SuperadminBankNotificationsPage() {
  const supabase = await createClient();
  const [{ data: notifications }, { locale, t }] = await Promise.all([
    supabase
      .from("bank_notifications")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(100),
    getT(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const webhookUrl = `${siteUrl}/api/bank-notifications`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {t.superadminBankNotificationsPage.title}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.superadminBankNotificationsPage.subtitle}
        </p>
      </div>
      <BankNotificationsManager
        notifications={notifications ?? []}
        webhookUrl={webhookUrl}
        locale={locale}
      />
    </div>
  );
}
