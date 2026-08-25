"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/components/pricing-plans";
import { PaymentMethods } from "./payment-methods";

const PLAN_KEYS = ["trial", "pro", "annual"] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

const CURRENT_PLAN_LABEL: Record<PlanKey, string> = {
  trial: "Prueba gratis",
  pro: "Pro",
  annual: "Anual",
};

export function SubscriptionView({
  restaurantName,
  currentPlan,
}: {
  restaurantName: string;
  currentPlan: string;
}) {
  const normalizedPlan = (
    PLAN_KEYS.includes(currentPlan as PlanKey) ? currentPlan : "trial"
  ) as PlanKey;
  const [selected, setSelected] = useState<PlanKey | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Tu plan actual
        </p>
        <p className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
          {CURRENT_PLAN_LABEL[normalizedPlan]}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((plan, index) => {
          const key = PLAN_KEYS[index];
          const isCurrent = key === normalizedPlan;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                plan.highlight
                  ? "border-lime-500/50 dark:border-lime-400/40"
                  : "border-neutral-200 dark:border-neutral-800",
                "bg-white dark:bg-neutral-900",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-500 px-3 py-1 text-xs font-semibold text-white dark:bg-lime-400 dark:text-neutral-950">
                  Más popular
                </span>
              )}
              <p className="text-center text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {plan.name}
              </p>
              <div className="mt-2 flex items-baseline justify-center gap-1.5">
                {plan.oldPrice && (
                  <span className="text-sm text-red-500 line-through">
                    {plan.oldPrice}
                  </span>
                )}
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {plan.period}
                </span>
              </div>

              {isCurrent ? (
                <span className="mt-5 flex items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <Check className="h-4 w-4" /> Plan actual
                </span>
              ) : key === "trial" ? (
                <span className="mt-5 flex items-center justify-center rounded-full px-4 py-2 text-sm text-neutral-400 dark:text-neutral-600">
                  Ya usaste tu prueba
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelected(selected === key ? null : key)}
                  className={cn(
                    "mt-5 rounded-full px-4 py-2 text-sm font-semibold",
                    selected === key
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700",
                  )}
                >
                  {selected === key ? "Ocultar formas de pago" : `Elegir ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <PaymentMethods
          restaurantName={restaurantName}
          planLabel={PLANS[PLAN_KEYS.indexOf(selected)].name}
          planPrice={`${PLANS[PLAN_KEYS.indexOf(selected)].price} ${PLANS[PLAN_KEYS.indexOf(selected)].period}`}
        />
      )}
    </div>
  );
}
