import type { Json } from "@/lib/supabase/database.types";

export type SubscriptionPlan = {
  id: string;
  key: string;
  name: string;
  priceUsd: number;
  oldPriceUsd: number | null;
  period: string;
  ctaLabel: string;
  durationDays: number;
  highlight: boolean;
  features: string[];
  isActive: boolean;
  sortOrder: number;
};

type PlanRow = {
  id: string;
  key: string;
  name: string;
  price_usd: number;
  old_price_usd: number | null;
  period: string;
  cta_label: string;
  duration_days: number;
  highlight: boolean;
  features: Json;
  is_active: boolean;
  sort_order: number;
};

export function toSubscriptionPlan(row: PlanRow): SubscriptionPlan {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    priceUsd: Number(row.price_usd) || 0,
    oldPriceUsd: row.old_price_usd === null ? null : Number(row.old_price_usd),
    period: row.period,
    ctaLabel: row.cta_label,
    durationDays: row.duration_days,
    highlight: row.highlight,
    features: Array.isArray(row.features) ? row.features.map(String) : [],
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function daysUntil(dateIso: string | null) {
  if (!dateIso) return null;
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
}

export function computeExtendedExpiry(
  currentExpiresAt: string | null,
  durationDays: number,
) {
  const now = new Date();
  const base =
    currentExpiresAt && new Date(currentExpiresAt) > now
      ? new Date(currentExpiresAt)
      : now;
  return new Date(base.getTime() + durationDays * 86_400_000).toISOString();
}

export function formatPlanPrice(priceUsd: number) {
  return priceUsd === 0
    ? "Gratis"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(priceUsd);
}
