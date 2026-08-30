"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Bike, Check, Store, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseOrderItems } from "@/lib/orders";
import { createClient } from "@/lib/supabase/client";
import { setKitchenStatus, setSentToKitchen } from "@/app/admin/actions";
import type { Order } from "@/lib/supabase/database.types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type T = Dictionary["kitchenBoard"];
type KitchenStatus = "queued" | "preparing" | "ready";

const ORDER_TYPE_ICONS = {
  delivery: Bike,
  pickup: Store,
  dine_in: UtensilsCrossed,
} as const;

export function KitchenBoard({
  restaurantId,
  orders: initialOrders,
  t,
}: {
  restaurantId: string;
  orders: Order[];
  t: T;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [prevInitialOrders, setPrevInitialOrders] = useState(initialOrders);
  if (initialOrders !== prevInitialOrders) {
    setPrevInitialOrders(initialOrders);
    setOrders(initialOrders);
  }

  // Refresca el "hace X min" de cada tarjeta sin depender de que llegue
  // un cambio por realtime.
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`kitchen-board-${restaurantId}`)
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
              const inKitchen = Boolean(updated.sent_to_kitchen_at);
              const exists = prev.some((o) => o.id === updated.id);
              if (inKitchen && exists) {
                return prev.map((o) => (o.id === updated.id ? updated : o));
              }
              if (inKitchen && !exists) {
                return [...prev, updated];
              }
              if (!inKitchen && exists) {
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
  }, [restaurantId]);

  const byStatus = (status: KitchenStatus) =>
    orders
      .filter((o) => (o.kitchen_status ?? "queued") === status)
      .sort(
        (a, b) =>
          new Date(a.sent_to_kitchen_at ?? a.created_at).getTime() -
          new Date(b.sent_to_kitchen_at ?? b.created_at).getTime(),
      );

  const queued = byStatus("queued");
  const preparing = byStatus("preparing");
  const ready = byStatus("ready");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Column title={t.queuedColumn} empty={t.queuedEmpty} count={queued.length}>
        {queued.map((order) => (
          <KitchenTicket key={order.id} restaurantId={restaurantId} order={order} t={t} />
        ))}
      </Column>
      <Column title={t.preparingColumn} empty={t.preparingEmpty} count={preparing.length}>
        {preparing.map((order) => (
          <KitchenTicket key={order.id} restaurantId={restaurantId} order={order} t={t} />
        ))}
      </Column>
      <Column title={t.readyColumn} empty={t.readyEmpty} count={ready.length}>
        {ready.map((order) => (
          <KitchenTicket key={order.id} restaurantId={restaurantId} order={order} t={t} />
        ))}
      </Column>
    </div>
  );
}

function Column({
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
      <h3 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
        {title} <span className="text-neutral-400">({count})</span>
      </h3>
      <div className="space-y-3">
        {count === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center text-xs text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500">
            {empty}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function minutesSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function KitchenTicket({
  restaurantId,
  order,
  t,
}: {
  restaurantId: string;
  order: Order;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();
  const items = parseOrderItems(order.items);
  const Icon = ORDER_TYPE_ICONS[order.order_type as keyof typeof ORDER_TYPE_ICONS];
  const status = (order.kitchen_status ?? "queued") as KitchenStatus;
  const minutes = minutesSince(order.sent_to_kitchen_at ?? order.created_at);
  const isLate = minutes >= 15;
  const isVeryLate = minutes >= 25;

  const advance = (next: KitchenStatus) =>
    startTransition(() => setKitchenStatus(restaurantId, order.id, next));
  const complete = () =>
    startTransition(() => setSentToKitchen(restaurantId, order.id, false));

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />}
          {order.order_type === "dine_in" && order.table_number
            ? `${t.table} ${order.table_number}`
            : order.customer_name}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
            isVeryLate
              ? "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-400"
              : isLate
                ? "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
          )}
        >
          {t.minutesAgo(minutes)}
        </span>
      </div>

      <ul className="mt-2 space-y-1">
        {items.map((line, i) => (
          <li key={i} className="text-sm text-neutral-700 dark:text-neutral-300">
            <span className="font-medium">{line.qty}x</span> {line.name}
            {line.extraNames.length > 0 && (
              <span className="text-neutral-500 dark:text-neutral-500">
                {" "}
                (+ {line.extraNames.join(", ")})
              </span>
            )}
            {line.note && (
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                📝 {line.note}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        {status === "queued" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => advance("preparing")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <ArrowRight className="h-4 w-4" />
            {t.startPreparing}
          </button>
        )}
        {status === "preparing" && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => advance("queued")}
              className="flex items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
              aria-label={t.back}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => advance("ready")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {t.markReady}
            </button>
          </>
        )}
        {status === "ready" && (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={() => advance("preparing")}
              className="flex items-center justify-center rounded-full border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
              aria-label={t.back}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={complete}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Check className="h-4 w-4" />
              {t.complete}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
