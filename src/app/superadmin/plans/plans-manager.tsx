"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createPlan, deletePlan, updatePlan } from "../actions";
import { PlanForm } from "./plan-form";
import { formatPlanPrice, type SubscriptionPlan } from "@/lib/subscription-plans";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type T = Dictionary["common"] & Dictionary["superadminPlans"];

export function PlansManager({
  plans,
  t,
  formT,
}: {
  plans: SubscriptionPlan[];
  t: T;
  formT: Dictionary["superadminPlanForm"];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        {adding ? (
          <>
            <PlanForm
              action={createPlan}
              submitLabel={formT.createSubmit}
              onSuccess={() => setAdding(false)}
              t={formT}
            />
            <button
              className="mt-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              onClick={() => setAdding(false)}
            >
              {t.cancel}
            </button>
          </>
        ) : (
          <Button onClick={() => setAdding(true)}>{t.newPlan}</Button>
        )}
      </div>

      <div className="space-y-3">
        {plans.map((plan) =>
          editingId === plan.id ? (
            <div
              key={plan.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <PlanForm
                plan={plan}
                action={updatePlan.bind(null, plan.id)}
                submitLabel={formT.saveSubmit}
                onSuccess={() => setEditingId(null)}
                t={formT}
              />
              <button
                className="mt-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                onClick={() => setEditingId(null)}
              >
                {t.cancel}
              </button>
            </div>
          ) : (
            <div
              key={plan.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                  {plan.name}
                  {!plan.isActive && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-normal text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      {t.inactiveBadge}
                    </span>
                  )}
                  {plan.highlight && (
                    <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[11px] font-normal text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
                      {t.highlightBadge}
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  key: {plan.key} · {formatPlanPrice(plan.priceUsd)} {plan.period} ·{" "}
                  {plan.durationDays} {t.daysUnit}
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  onClick={() => setEditingId(plan.id)}
                >
                  {t.edit}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  className="text-xs font-medium text-red-500 hover:text-red-700"
                  onClick={() => {
                    if (!confirm(t.deleteConfirm(plan.name))) return;
                    startTransition(() => deletePlan(plan.id));
                  }}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
