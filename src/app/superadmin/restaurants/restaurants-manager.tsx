"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { daysUntil, type SubscriptionPlan } from "@/lib/subscription-plans";
import { updateRestaurantPlan } from "../actions";
import type { Restaurant } from "@/lib/supabase/database.types";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["common"] & Dictionary["superadminRestaurants"];

export function RestaurantsManager({
  restaurants,
  plans,
  locale,
}: {
  restaurants: Restaurant[];
  plans: SubscriptionPlan[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t: T = { ...dict.common, ...dict.superadminRestaurants };
  const [editingId, setEditingId] = useState<string | null>(null);

  if (restaurants.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        {t.empty}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {restaurants.map((restaurant) => (
        <RestaurantRow
          key={restaurant.id}
          restaurant={restaurant}
          plans={plans}
          editing={editingId === restaurant.id}
          onToggleEdit={() =>
            setEditingId(editingId === restaurant.id ? null : restaurant.id)
          }
          t={t}
        />
      ))}
    </div>
  );
}

function RestaurantRow({
  restaurant,
  plans,
  editing,
  onToggleEdit,
  t,
}: {
  restaurant: Restaurant;
  plans: SubscriptionPlan[];
  editing: boolean;
  onToggleEdit: () => void;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();
  const [planKey, setPlanKey] = useState(restaurant.plan);
  const [expiresAt, setExpiresAt] = useState(
    restaurant.plan_expires_at ? restaurant.plan_expires_at.slice(0, 10) : "",
  );

  const days = daysUntil(restaurant.plan_expires_at);
  const plan = plans.find((p) => p.key === restaurant.plan);

  const fillFromPlanDuration = () => {
    const selectedPlan = plans.find((p) => p.key === planKey);
    if (!selectedPlan) return;
    const now = new Date();
    const base =
      restaurant.plan_expires_at && new Date(restaurant.plan_expires_at) > now
        ? new Date(restaurant.plan_expires_at)
        : now;
    const next = new Date(
      base.getTime() + selectedPlan.durationDays * 86_400_000,
    );
    setExpiresAt(next.toISOString().slice(0, 10));
  };

  const save = () => {
    startTransition(() =>
      updateRestaurantPlan(restaurant.id, {
        planKey,
        planExpiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      }).then(() => onToggleEdit()),
    );
  };

  const alertMessage = t.alertMessage(
    restaurant.name,
    `${plan?.name ?? restaurant.plan} ${
      days !== null && days >= 0 ? t.daysRemainingShort(days) : t.expiredGeneric
    }`,
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {restaurant.name}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            /{restaurant.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {plan?.name ?? restaurant.plan}
          </span>
          {days !== null && (
            <span
              className={cn(
                "text-xs font-medium",
                days <= 3
                  ? "text-red-600 dark:text-red-400"
                  : "text-neutral-500 dark:text-neutral-400",
              )}
            >
              {days >= 0 ? t.daysRemaining(days) : t.expiredDaysAgo(Math.abs(days))}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onToggleEdit}
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          {editing ? t.cancel : t.editPlan}
        </button>
        {restaurant.whatsapp && (
          <a
            href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(alertMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400"
          >
            {t.sendAlert}
          </a>
        )}
      </div>

      {editing && (
        <div className="mt-4 grid gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {t.planLabel}
            </label>
            <select
              value={planKey}
              onChange={(e) => setPlanKey(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            >
              {!plans.some((p) => p.key === restaurant.plan) && (
                <option value={restaurant.plan}>{restaurant.plan}</option>
              )}
              {plans.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {t.expiresLabel}
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={fillFromPlanDuration}
              className="h-10 flex-1 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              {t.useDuration}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={save}
              className="h-10 flex-1 rounded-lg bg-neutral-900 px-3 text-xs font-semibold text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
            >
              {isPending ? t.saving : t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
