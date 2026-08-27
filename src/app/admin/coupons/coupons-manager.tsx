"use client";

import { useActionState, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { createCoupon, deleteCoupon, toggleCouponActive } from "./actions";
import type { Coupon } from "@/lib/coupons";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["common"] & Dictionary["couponManager"];

export function CouponsManager({
  restaurantId,
  currency,
  coupons,
  locale,
}: {
  restaurantId: string;
  currency: string;
  coupons: Coupon[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t: T = { ...dict.common, ...dict.couponManager };
  const boundCreate = createCoupon.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(boundCreate, null);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {coupons.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {t.empty}
          </li>
        )}
        {coupons.map((coupon) => (
          <CouponRow
            key={coupon.id}
            restaurantId={restaurantId}
            coupon={coupon}
            currency={currency}
            t={t}
          />
        ))}
      </ul>

      <form
        action={formAction}
        className="grid grid-cols-2 gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-4"
      >
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="code">{t.codeLabel}</Label>
          <Input id="code" name="code" placeholder="BIENVENIDO10" required />
        </div>
        <div>
          <Label htmlFor="discount_type">{t.typeLabel}</Label>
          <select
            id="discount_type"
            name="discount_type"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
          >
            <option value="percent">{t.typePercent}</option>
            <option value="fixed">{t.typeFixed}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="discount_value">
            {discountType === "percent" ? t.valuePercentLabel : t.valueFixedLabel}
          </Label>
          <Input
            id="discount_value"
            name="discount_value"
            type="number"
            min="0"
            step="0.01"
            placeholder={discountType === "percent" ? "10" : "5"}
            required
          />
        </div>
        <div>
          <Label htmlFor="expires_at">{t.expiresLabel}</Label>
          <Input id="expires_at" name="expires_at" type="date" />
        </div>
        <div className="col-span-2 flex items-end sm:col-span-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? t.creating : t.create}
          </Button>
        </div>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}

function CouponRow({
  restaurantId,
  coupon,
  currency,
  t,
}: {
  restaurantId: string;
  coupon: Coupon;
  currency: string;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();
  const isExpired = coupon.expires_at !== null && new Date(coupon.expires_at) < new Date();

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
          {coupon.code}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {coupon.discount_type === "percent"
            ? `${coupon.discount_value}%`
            : formatPrice(coupon.discount_value, currency)}
          {coupon.expires_at &&
            ` · ${t.expiresOn} ${new Date(coupon.expires_at).toLocaleDateString()}`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isExpired && (
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {t.expired}
          </span>
        )}
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              toggleCouponActive(restaurantId, coupon.id, !coupon.is_active),
            )
          }
          className={
            coupon.is_active
              ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }
        >
          {coupon.is_active ? t.active : t.inactive}
        </button>
        <button
          type="button"
          disabled={isPending}
          className="text-xs font-medium text-red-500 hover:text-red-700"
          onClick={() => {
            if (!confirm(t.deleteConfirm(coupon.code))) return;
            startTransition(() => deleteCoupon(restaurantId, coupon.id));
          }}
        >
          {t.delete}
        </button>
      </div>
    </li>
  );
}
