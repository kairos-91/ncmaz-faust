"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, MapPin, MessageCircle, Package, Phone, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { parseOrderItems } from "@/lib/orders";
import { caracasDayKey } from "@/lib/sales";
import { createClient } from "@/lib/supabase/client";
import {
  acceptDeliveryAssignment,
  markOrderDelivered,
  rejectDeliveryAssignment,
} from "./actions";
import { NotifyDeliveryButton } from "./notify-delivery-button";
import { buildMapsUrl } from "@/lib/maps";
import type { Order } from "@/lib/supabase/database.types";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["deliveryPortal"];

export function DeliveryPanel({
  restaurantId,
  currency,
  deliveryStaffId,
  orders: initialOrders,
  deliveryStaffSharePercent = 100,
  locale,
}: {
  restaurantId: string;
  currency: string;
  deliveryStaffId: string;
  orders: Order[];
  deliveryStaffSharePercent?: number;
  locale: Locale;
}) {
  const t = getDictionary(locale).deliveryPortal;
  const [orders, setOrders] = useState(initialOrders);
  const [prevInitialOrders, setPrevInitialOrders] = useState(initialOrders);
  if (initialOrders !== prevInitialOrders) {
    setPrevInitialOrders(initialOrders);
    setOrders(initialOrders);
  }

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`delivery-orders-${deliveryStaffId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload) => {
            const updated = payload.new as Order;
            setOrders((prev) => {
              const isMine = updated.delivery_staff_id === deliveryStaffId;
              const exists = prev.some((o) => o.id === updated.id);
              if (isMine && exists) {
                return prev.map((o) => (o.id === updated.id ? updated : o));
              }
              if (isMine && !exists) {
                return [updated, ...prev];
              }
              if (!isMine && exists) {
                return prev.filter((o) => o.id !== updated.id);
              }
              return prev;
            });
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [restaurantId, deliveryStaffId]);

  const todayKey = caracasDayKey(new Date());
  const pending = orders.filter((o) => !o.delivery_accepted_at && !o.delivered_at);
  const onTheWay = orders.filter((o) => o.delivery_accepted_at && !o.delivered_at);
  const deliveredToday = orders.filter(
    (o) => o.delivered_at && caracasDayKey(new Date(o.delivered_at)) === todayKey,
  );
  const earningsToday = deliveredToday.reduce(
    (sum, o) => sum + (o.delivery_fee ?? 0) * (deliveryStaffSharePercent / 100),
    0,
  );

  return (
    <div className="space-y-6">
      <NotifyDeliveryButton locale={locale} />

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
          {t.earningsToday}
        </p>
        <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
          {formatPrice(earningsToday, currency)}
        </p>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
          {t.deliveriesToday(deliveredToday.length)}
        </p>
      </div>

      <Section title={t.pendingSection} empty={t.pendingEmpty} count={pending.length}>
        {pending.map((order) => (
          <DeliveryOrderCard
            key={order.id}
            order={order}
            currency={currency}
            locale={locale}
            t={t}
            action="respond"
          />
        ))}
      </Section>

      <Section title={t.onTheWaySection} empty={t.onTheWayEmpty} count={onTheWay.length}>
        {onTheWay.map((order) => (
          <DeliveryOrderCard
            key={order.id}
            order={order}
            currency={currency}
            locale={locale}
            t={t}
            action="deliver"
          />
        ))}
      </Section>

      <Section
        title={t.deliveredTodaySection}
        empty={t.deliveredTodayEmpty}
        count={deliveredToday.length}
      >
        {deliveredToday.map((order) => (
          <DeliveryOrderCard
            key={order.id}
            order={order}
            currency={currency}
            locale={locale}
            t={t}
            action="none"
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  empty,
  count,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
        {title} {count > 0 && <span className="text-neutral-400">({count})</span>}
      </h2>
      {count === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
          {empty}
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

function DeliveryOrderCard({
  order,
  currency,
  locale,
  t,
  action,
}: {
  order: Order;
  currency: string;
  locale: Locale;
  t: T;
  action: "respond" | "deliver" | "none";
}) {
  const [isPending, startTransition] = useTransition();
  const items = useMemo(() => parseOrderItems(order.items), [order.items]);
  const whatsappHref = `https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}`;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {order.customer_name}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-green-600 hover:underline dark:text-green-400"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
              {t.whatsappButton}
            </a>
            <a
              href={`tel:${order.customer_phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-1.5 text-sm text-neutral-600 hover:underline dark:text-neutral-400"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {t.callButton}
            </a>
          </div>
        </div>
        <p className="shrink-0 text-xs text-neutral-500 dark:text-neutral-500">
          {new Date(order.created_at).toLocaleTimeString(locale === "en" ? "en-US" : "es-VE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {order.address && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {order.address}
          {order.delivery_zone && ` · ${order.delivery_zone}`}
        </p>
      )}
      {order.lat !== null && order.lng !== null && (
        <a
          href={buildMapsUrl(order.lat, order.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-5 mt-1 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          {t.viewOnMap}
        </a>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-500">
        <Package className="h-3.5 w-3.5 shrink-0" />
        {items.map((line) => `${line.qty}x ${line.name}`).join(", ")}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 dark:border-neutral-800">
        <span className="text-sm text-neutral-500 dark:text-neutral-500">{t.total}</span>
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
          {formatPrice(order.total, currency)}
        </span>
      </div>
      {order.delivery_fee > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-500">
            {t.deliveryFee}
          </span>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {formatPrice(order.delivery_fee, currency)}
          </span>
        </div>
      )}

      {action === "respond" && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => acceptDeliveryAssignment(order.id))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {t.accept}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => rejectDeliveryAssignment(order.id))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950"
          >
            <X className="h-4 w-4" />
            {t.reject}
          </button>
        </div>
      )}
      {action === "deliver" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => markOrderDelivered(order.id))}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Check className="h-4 w-4" />
          {t.markDelivered}
        </button>
      )}
    </div>
  );
}
