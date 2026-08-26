"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Bike, Check, Store, UtensilsCrossed, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { parseOrderItems, type OrderStatus } from "@/lib/orders";
import { PAYMENT_METHOD_META, type PaymentMethodId } from "@/lib/payment-methods";
import { updateOrderStatus } from "@/app/admin/actions";
import type { Order } from "@/lib/supabase/database.types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["ordersManager"];

const ORDER_TYPE_ICONS = {
  delivery: Bike,
  pickup: Store,
  dine_in: UtensilsCrossed,
} as const;

export function OrdersManager({
  restaurantId,
  currency,
  orders,
  locale,
  t,
}: {
  restaurantId: string;
  currency: string;
  orders: Order[];
  locale: Locale;
  t: T;
}) {
  const [filter, setFilter] = useState<OrderStatus | "all">("pending");
  const visibleOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statusFilters: { id: OrderStatus | "all"; label: string }[] = [
    { id: "pending", label: t.filters.pending },
    { id: "accepted", label: t.filters.accepted },
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
                ({orders.filter((o) => o.status === id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
          {t.empty}
        </p>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              restaurantId={restaurantId}
              currency={currency}
              order={order}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  restaurantId,
  currency,
  order,
  locale,
  t,
}: {
  restaurantId: string;
  currency: string;
  order: Order;
  locale: Locale;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();
  const items = parseOrderItems(order.items);
  const Icon = ORDER_TYPE_ICONS[order.order_type as keyof typeof ORDER_TYPE_ICONS];
  const methodMeta = order.payment_method
    ? PAYMENT_METHOD_META[order.payment_method as PaymentMethodId]
    : null;

  const setStatus = (status: OrderStatus) =>
    startTransition(() => updateOrderStatus(restaurantId, order.id, status));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />}
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {t.orderTypes[order.order_type as keyof typeof t.orderTypes] ??
              order.order_type}
          </span>
          <StatusBadge status={order.status as OrderStatus} t={t} />
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {new Date(order.created_at).toLocaleString(locale === "en" ? "en-US" : "es-VE", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
            {t.customer}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
            {order.customer_name}
          </p>
          <a
            href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-600 hover:underline dark:text-green-400"
          >
            {order.customer_phone}
          </a>
          {order.order_type === "delivery" && order.address && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              📍 {order.address}
            </p>
          )}
          {order.order_type === "dine_in" && order.table_number && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {t.table}: {order.table_number}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
            {t.payment}
          </p>
          {methodMeta ? (
            <div className="mt-1 space-y-0.5 text-sm text-neutral-700 dark:text-neutral-300">
              <p className="font-medium text-neutral-900 dark:text-white">
                {methodMeta.label}
              </p>
              {order.bank_paid_from && (
                <p>
                  {t.bankFrom}: {order.bank_paid_from}
                </p>
              )}
              {order.payment_reference && (
                <p>
                  {t.reference}: {order.payment_reference}
                </p>
              )}
              {order.amount_paid && (
                <p>
                  {t.amountPaid}: Bs {order.amount_paid}
                </p>
              )}
              {order.receipt_url && (
                <a
                  href={order.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  <Image
                    src={order.receipt_url}
                    alt={t.receiptAlt}
                    width={96}
                    height={96}
                    className="h-24 w-24 object-cover"
                    unoptimized
                  />
                </a>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
              {t.noPaymentMethod}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
          {t.dishes}
        </p>
        <ul className="mt-1 space-y-1">
          {items.map((line, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 text-sm text-neutral-700 dark:text-neutral-300"
            >
              <span>
                {line.qty}x {line.name}
                {line.extraNames.length > 0 && (
                  <span className="text-neutral-500 dark:text-neutral-500">
                    {" "}
                    (+ {line.extraNames.join(", ")})
                  </span>
                )}
              </span>
              <span className="shrink-0 font-medium text-neutral-900 dark:text-white">
                {formatPrice(line.unitPrice * line.qty, currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {t.total}
          </span>
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {formatPrice(order.total, currency)}
          </span>
        </div>
      </div>

      {order.status === "pending" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setStatus("accepted")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {t.accept}
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

function StatusBadge({ status, t }: { status: OrderStatus; t: T }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "pending" &&
          "bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400",
        status === "accepted" &&
          "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400",
        status === "rejected" &&
          "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-400",
      )}
    >
      {t.statuses[status]}
    </span>
  );
}
