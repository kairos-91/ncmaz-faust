import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { toSubscriptionPlan } from "@/lib/subscription-plans";
import { getT } from "@/lib/i18n/locale";
import { PlansManager } from "./plans-manager";

export const metadata: Metadata = { title: "Planes · Superadmin" };

export default async function SuperadminPlansPage() {
  const supabase = await createClient();
  const [{ data: plans }, { t }] = await Promise.all([
    supabase.from("subscription_plans").select("*").order("sort_order"),
    getT(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.superadminPlansPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.superadminPlansPage.subtitle}
        </p>
      </div>
      <PlansManager
        plans={(plans ?? []).map(toSubscriptionPlan)}
        t={{ ...t.common, ...t.superadminPlans }}
        formT={t.superadminPlanForm}
      />
    </div>
  );
}
