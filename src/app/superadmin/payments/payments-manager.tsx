"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { PAYMENT_METHOD_META, type PaymentMethodId } from "@/lib/payment-methods";
import { updateSubscriptionPaymentStatus } from "../actions";
import type { SubscriptionPayment } from "@/lib/supabase/database.types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

type Status = "pending" | "approved" | "rejected";
type T = Dictionary["superadminPayments"];

export function PaymentsManager({
  payments,
  restaurantInfo,
  locale,
  t,
}: {
  payments: SubscriptionPayment[];
  restaurantInfo: Record<string, { name: string; slug: string }>;
  locale: Locale;
  t: T;
}) {
  const [filter, setFilter] = useState<Status | "all">("pending");
  const visible =
    filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const statusFilters: { id: Status | "all"; label: string }[] = [
    { id: "pending", label: t.filters.pending },
    { id: "approved", label: t.filters.approved },
    { id: "rejected", label: t.filters.rejected },
    { id: "all", label: t.filters.all },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statusFilters.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              filter === id
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800",
            )}
          >
            {label}
            {id !== "all" && (
              <span className="ml-1 opacity-60">
                ({payments.filter((p) => p.status === id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
          {t.empty}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              restaurant={restaurantInfo[payment.restaurant_id]}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentCard({
  payment,
  restaurant,
  locale,
  t,
}: {
  payment: SubscriptionPayment;
  restaurant?: { name: string; slug: string };
  locale: Locale;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();
  const methodMeta = payment.payment_method
    ? PAYMENT_METHOD_META[payment.payment_method as PaymentMethodId]
    : null;

  const setStatus = (status: "approved" | "rejected") =>
    startTransition(() => updateSubscriptionPaymentStatus(payment.id, status));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {restaurant?.name ?? t.deletedRestaurant}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Plan {payment.plan_name} · {formatPrice(payment.amount_usd, "USD")}
          </p>
        </div>
        <StatusBadge status={payment.status as Status} t={t} />
      </div>

      <div className="mt-3 grid gap-1 text-sm text-neutral-700 dark:text-neutral-300">
        {methodMeta && (
          <p className="font-medium text-neutral-900 dark:text-white">
            {methodMeta.label}
          </p>
        )}
        {payment.bank_paid_from && (
          <p>
            {t.bankFrom}: {payment.bank_paid_from}
          </p>
        )}
        {payment.payment_reference && (
          <p>
            {t.reference}: {payment.payment_reference}
          </p>
        )}
        {payment.amount_paid_bs && (
          <p>
            {t.amountPaid}: Bs {payment.amount_paid_bs}
          </p>
        )}
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {new Date(payment.created_at).toLocaleString(locale === "en" ? "en-US" : "es-VE", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      {payment.receipt_url && (
        <a
          href={payment.receipt_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700"
        >
          <Image
            src={payment.receipt_url}
            alt={t.receiptAlt}
            width={96}
            height={96}
            className="h-24 w-24 object-cover"
            unoptimized
          />
        </a>
      )}

      {payment.status === "pending" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus("approved")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {t.approve}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus("rejected")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950"
          >
            <X className="h-4 w-4" />
            {t.reject}
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, t }: { status: Status; t: T }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "pending" &&
          "bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400",
        status === "approved" &&
          "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400",
        status === "rejected" &&
          "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-400",
      )}
    >
      {t.statuses[status]}
    </span>
  );
}
