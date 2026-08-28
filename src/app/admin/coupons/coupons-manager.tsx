"use client";

import { useActionState, useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";
import { DAY_KEYS, type DayKey } from "@/lib/opening-hours";
import { PAYMENT_METHOD_META, type PaymentMethodId } from "@/lib/payment-methods";
import { createCoupon, deleteCoupon, toggleCouponActive } from "./actions";
import type { Coupon } from "@/lib/coupons";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["common"] & Dictionary["couponManager"];

export function CouponsManager({
  restaurantId,
  currency,
  coupons,
  paymentMethodIds,
  locale,
}: {
  restaurantId: string;
  currency: string;
  coupons: Coupon[];
  paymentMethodIds: PaymentMethodId[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t: T = { ...dict.common, ...dict.couponManager };
  const boundCreate = createCoupon.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(boundCreate, null);
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [showConditions, setShowConditions] = useState(false);
  const [validDays, setValidDays] = useState<DayKey[]>(DAY_KEYS);

  const toggleDay = (day: DayKey) => {
    setValidDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

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
        className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        </div>

        <button
          type="button"
          onClick={() => setShowConditions((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showConditions ? t.hideConditions : t.showConditions}
        </button>

        {showConditions && (
          <div className="space-y-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {t.conditionsTitle}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                {t.conditionsHint}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="min_order_amount">{t.minOrderLabel}</Label>
                <Input
                  id="min_order_amount"
                  name="min_order_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="max_total_uses">{t.maxTotalUsesLabel}</Label>
                <Input
                  id="max_total_uses"
                  name="max_total_uses"
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t.unlimitedPlaceholder}
                />
              </div>
              <div>
                <Label htmlFor="max_uses_per_customer">
                  {t.maxUsesPerCustomerLabel}
                </Label>
                <Input
                  id="max_uses_per_customer"
                  name="max_uses_per_customer"
                  type="number"
                  min="0"
                  step="1"
                  placeholder={t.unlimitedPlaceholder}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="starts_at">{t.startsAtLabel}</Label>
                <Input id="starts_at" name="starts_at" type="date" />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <Label>{t.validTimeLabel}</Label>
                <div className="flex items-center gap-2">
                  <input
                    name="valid_time_start"
                    type="time"
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                  <span className="text-sm text-neutral-400">–</span>
                  <input
                    name="valid_time_end"
                    type="time"
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>{t.validDaysLabel}</Label>
              <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-500">
                {t.validDaysHint}
              </p>
              <div className="flex flex-wrap gap-2">
                {DAY_KEYS.map((day) => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      name="valid_days"
                      value={day}
                      checked={validDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "block cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium",
                        validDays.includes(day)
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                          : "border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-500",
                      )}
                    >
                      {t.days[day]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>{t.validPaymentMethodsLabel}</Label>
              <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-500">
                {t.validPaymentMethodsHint}
              </p>
              {paymentMethodIds.length === 0 ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-500">
                  {t.noPaymentMethodsConfigured}
                </p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {paymentMethodIds.map((id) => (
                    <label
                      key={id}
                      className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <input
                        type="checkbox"
                        name="valid_payment_methods"
                        value={id}
                        className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                      />
                      {PAYMENT_METHOD_META[id].label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-end">
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
