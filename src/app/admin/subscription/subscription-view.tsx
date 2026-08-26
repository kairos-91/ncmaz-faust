"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentMethods } from "./payment-methods";
import type { BcvRate } from "@/lib/bcv-rate";
import type { PaymentMethodValues } from "@/lib/payment-methods";
import { formatPlanPrice, type SubscriptionPlan } from "@/lib/subscription-plans";

export function SubscriptionView({
  restaurantId,
  restaurantName,
  currentPlanKey,
  daysLeft,
  plans,
  platformPaymentMethods,
  bcvRate,
}: {
  restaurantId: string;
  restaurantName: string;
  currentPlanKey: string;
  daysLeft: number | null;
  plans: SubscriptionPlan[];
  platformPaymentMethods: PaymentMethodValues;
  bcvRate: BcvRate | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentPlan = plans.find((p) => p.key === currentPlanKey) ?? null;
  const selectedPlan = plans.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Tu plan actual
        </p>
        <p className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
          {currentPlan?.name ?? currentPlanKey}
        </p>
        {daysLeft !== null && (
          <p
            className={cn(
              "mt-1 text-sm font-medium",
              daysLeft <= 3
                ? "text-red-600 dark:text-red-400"
                : "text-neutral-500 dark:text-neutral-400",
            )}
          >
            {daysLeft > 0
              ? `Vence en ${daysLeft} ${daysLeft === 1 ? "día" : "días"}`
              : daysLeft === 0
                ? "Tu plan vence hoy"
                : `Tu plan venció hace ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "día" : "días"}`}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlanKey;
          return (
            <div
              key={plan.id}
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
                {plan.oldPriceUsd && (
                  <span className="text-sm text-red-500 line-through">
                    {formatPlanPrice(plan.oldPriceUsd)}
                  </span>
                )}
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatPlanPrice(plan.priceUsd)}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {plan.period}
                </span>
              </div>

              {isCurrent ? (
                <span className="mt-5 flex items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <Check className="h-4 w-4" /> Plan actual
                </span>
              ) : plan.priceUsd === 0 ? (
                <span className="mt-5 flex items-center justify-center rounded-full px-4 py-2 text-sm text-neutral-400 dark:text-neutral-600">
                  Plan gratuito
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedId(selectedId === plan.id ? null : plan.id)
                  }
                  className={cn(
                    "mt-5 rounded-full px-4 py-2 text-sm font-semibold",
                    selectedId === plan.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700",
                  )}
                >
                  {selectedId === plan.id
                    ? "Ocultar formas de pago"
                    : plan.ctaLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedPlan && (
        <PaymentMethods
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          plan={selectedPlan}
          platformPaymentMethods={platformPaymentMethods}
          bcvRate={bcvRate}
        />
      )}
    </div>
  );
}
