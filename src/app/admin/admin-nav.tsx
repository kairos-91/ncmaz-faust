"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  TrendingUp,
  Users,
  Store,
  Tags,
  UtensilsCrossed,
  ClipboardList,
  Star,
  Ticket,
  Bell,
  UserPlus,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Bike,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSuperadmin } from "@/lib/superadmin";
import { createClient } from "@/lib/supabase/client";
import { playNotificationChime, unlockNotificationSound } from "@/lib/notification-sound";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AdminNav({
  email,
  t,
  pendingOrders: initialPendingOrders = 0,
  isStaff = false,
  restaurantId = null,
  hasDeliveryStaff = false,
  hasKitchenStaff = false,
}: {
  email: string | null;
  t: Dictionary["adminNav"];
  pendingOrders?: number;
  isStaff?: boolean;
  restaurantId?: string | null;
  hasDeliveryStaff?: boolean;
  hasKitchenStaff?: boolean;
}) {
  const pathname = usePathname();
  const [pendingOrders, setPendingOrders] = useState(initialPendingOrders);
  const [prevInitial, setPrevInitial] = useState(initialPendingOrders);
  const [realtimeOffline, setRealtimeOffline] = useState(false);
  const [unseenPending, setUnseenPending] = useState(0);
  const unseenPendingRef = useRef(0);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (initialPendingOrders !== prevInitial) {
    setPrevInitial(initialPendingOrders);
    setPendingOrders(initialPendingOrders);
  }
  // Visitar /admin/orders cuenta como "ya vi los pedidos nuevos".
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (pathname === "/admin/orders") setUnseenPending(0);
  }

  useEffect(() => {
    unseenPendingRef.current = unseenPending;
  }, [unseenPending]);

  useEffect(() => {
    const unlock = () => unlockNotificationSound();
    document.addEventListener("pointerdown", unlock, { once: true });
    return () => document.removeEventListener("pointerdown", unlock);
  }, []);

  // Repite la campanita cada 20s (hasta 5 veces) mientras haya un pedido
  // nuevo sin revisar, para que se note aunque no estés mirando la
  // pantalla justo cuando llegó.
  const hasUnseenPending = unseenPending > 0;
  useEffect(() => {
    if (!hasUnseenPending) return;
    let repeats = 0;
    const interval = setInterval(() => {
      if (unseenPendingRef.current === 0) {
        clearInterval(interval);
        return;
      }
      repeats += 1;
      playNotificationChime();
      if (repeats >= 5) clearInterval(interval);
    }, 20000);
    return () => clearInterval(interval);
  }, [hasUnseenPending]);

  useEffect(() => {
    if (!restaurantId) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // Hay que esperar a que la sesión termine de cargar antes de suscribirse:
    // si el canal se abre antes de que el cliente confirme el usuario logueado,
    // Realtime lo autentica como visitante anónimo y, como la política RLS de
    // "orders" solo permite ver pedidos al dueño, nunca llegan los cambios —
    // sin ningún error visible (el canal igual queda "conectado").
    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`orders-badge-${restaurantId}`)
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
              setUnseenPending((n) => n + 1);
              playNotificationChime();
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
              setUnseenPending((n) => n + 1);
              playNotificationChime();
            }
          },
        )
        .subscribe((status) => {
          setRealtimeOffline(status === "CHANNEL_ERROR" || status === "TIMED_OUT");
        });
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  const allLinks = [
    { href: "/admin", label: t.summary, icon: Home, badge: pendingOrders, ownerOnly: true },
    { href: "/admin/analytics", label: t.analytics, icon: BarChart3, ownerOnly: true },
    { href: "/admin/sales", label: t.sales, icon: TrendingUp, ownerOnly: true },
    { href: "/admin/customers", label: t.customers, icon: Users, ownerOnly: true },
    { href: "/admin/restaurant", label: t.myRestaurant, icon: Store, ownerOnly: true },
    { href: "/admin/categories", label: t.categories, icon: Tags, ownerOnly: false },
    { href: "/admin/menu", label: t.menu, icon: UtensilsCrossed, ownerOnly: false },
    {
      href: "/admin/orders",
      label: t.orders,
      icon: ClipboardList,
      badge: pendingOrders,
      ownerOnly: false,
    },
    {
      href: "/admin/delivery-staff",
      label: t.deliveryStaff,
      icon: Bike,
      ownerOnly: true,
      requiresFlag: hasDeliveryStaff,
    },
    {
      href: "/admin/kitchen-staff",
      label: t.kitchenStaff,
      icon: ChefHat,
      ownerOnly: true,
      requiresFlag: hasKitchenStaff,
    },
    { href: "/admin/reviews", label: t.reviews, icon: Star, ownerOnly: true },
    { href: "/admin/coupons", label: t.coupons, icon: Ticket, ownerOnly: true },
    { href: "/admin/notifications", label: t.notifications, icon: Bell, ownerOnly: true },
    { href: "/admin/team", label: t.team, icon: UserPlus, ownerOnly: true },
    {
      href: "/admin/payment-methods",
      label: t.paymentMethods,
      icon: CreditCard,
      ownerOnly: true,
    },
    { href: "/admin/subscription", label: t.subscription, icon: Sparkles, ownerOnly: true },
  ];
  const links = allLinks.filter(
    (link) =>
      (!isStaff || !link.ownerOnly) &&
      ("requiresFlag" in link ? link.requiresFlag : true),
  );

  return (
    <aside className="flex w-full shrink-0 flex-col border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:h-screen md:w-56 md:border-r md:sticky md:top-0">
      <div className="md:flex md:min-h-0 md:flex-1 md:flex-col">
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 pt-3 md:flex-1 md:flex-col md:overflow-y-auto md:pb-2 md:pt-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
                pathname === link.href &&
                  "bg-neutral-900 text-white hover:bg-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-white",
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
              {!!link.badge && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
                  {link.badge > 99 ? "99+" : link.badge}
                </span>
              )}
            </Link>
          ))}
          {isSuperadmin(email) && (
            <Link
              href="/superadmin"
              className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-lime-700 hover:bg-lime-50 dark:text-lime-400 dark:hover:bg-lime-400/10"
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {t.superadminPanel}
            </Link>
          )}
        </nav>
      </div>
      {realtimeOffline && (
        <div className="shrink-0 border-t border-neutral-100 px-5 py-3 dark:border-neutral-800">
          <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            {t.realtimeOffline}
          </p>
        </div>
      )}
    </aside>
  );
}
