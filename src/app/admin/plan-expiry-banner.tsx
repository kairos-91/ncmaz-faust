import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function PlanExpiryBanner({
  isPaidPlan,
  daysLeft,
  planDurationDays,
  t,
  subscriptionT,
}: {
  isPaidPlan: boolean;
  daysLeft: number;
  planDurationDays: number | null;
  t: Dictionary["planBanner"];
  subscriptionT: Pick<Dictionary["subscriptionView"], "daysLeft" | "dueToday" | "daysOverdue">;
}) {
  const urgent = daysLeft <= 3;
  const timeText =
    daysLeft > 0
      ? subscriptionT.daysLeft(daysLeft)
      : daysLeft === 0
        ? subscriptionT.dueToday
        : subscriptionT.daysOverdue(Math.abs(daysLeft));

  const progress =
    planDurationDays && planDurationDays > 0
      ? (planDurationDays - Math.max(0, Math.min(daysLeft, planDurationDays))) /
        planDurationDays
      : null;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        urgent
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
          : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            className={`font-semibold ${
              urgent
                ? "text-red-800 dark:text-red-300"
                : "text-amber-800 dark:text-amber-300"
            }`}
          >
            {isPaidPlan ? t.proTitle : t.trialTitle}
          </p>
          <p
            className={`mt-0.5 text-sm ${
              urgent
                ? "text-red-700 dark:text-red-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {timeText}. {isPaidPlan ? t.proHint : t.trialHint}
          </p>
        </div>
        <Link href="/admin/subscription">
          <Button variant={urgent ? "primary" : "secondary"}>
            {isPaidPlan ? t.renew : t.activate}
          </Button>
        </Link>
      </div>
      {progress !== null && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/60 dark:bg-black/20">
          <div
            className={`h-full rounded-full ${urgent ? "bg-red-500" : "bg-amber-500"}`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
