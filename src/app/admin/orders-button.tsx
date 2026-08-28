"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function OrdersButton({
  restaurantId,
  initialPendingOrders,
  label,
}: {
  restaurantId: string;
  initialPendingOrders: number;
  label: string;
}) {
  const [pendingOrders, setPendingOrders] = useState(initialPendingOrders);
  const [prevInitial, setPrevInitial] = useState(initialPendingOrders);
  if (initialPendingOrders !== prevInitial) {
    setPrevInitial(initialPendingOrders);
    setPendingOrders(initialPendingOrders);
  }

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // Espera a que la sesión termine de cargar antes de suscribirse (ver
    // admin-nav.tsx): si no, el canal se autentica como anónimo y nunca
    // recibe los cambios porque RLS solo deja ver los pedidos al dueño.
    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`orders-dashboard-${restaurantId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload) => {
            if ((payload.new as { status?: string }).status === "pending") {
              setPendingOrders((n) => n + 1);
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          (payload) => {
            const oldStatus = (payload.old as { status?: string }).status;
            const newStatus = (payload.new as { status?: string }).status;
            if (oldStatus === "pending" && newStatus !== "pending") {
              setPendingOrders((n) => Math.max(0, n - 1));
            } else if (oldStatus !== "pending" && newStatus === "pending") {
              setPendingOrders((n) => n + 1);
            }
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  return (
    <Link href="/admin/orders">
      <Button variant="secondary">
        {label}
        {pendingOrders > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
            {pendingOrders > 99 ? "99+" : pendingOrders}
          </span>
        )}
      </Button>
    </Link>
  );
}
