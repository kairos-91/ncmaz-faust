"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Receipt, Sparkles, CreditCard, ArrowLeft, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SuperadminNav({
  t,
  pendingPayments = 0,
}: {
  t: Dictionary["superadminNav"];
  pendingPayments?: number;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/superadmin/restaurants", label: t.restaurants, icon: Store },
    {
      href: "/superadmin/payments",
      label: t.payments,
      icon: Receipt,
      badge: pendingPayments,
    },
    {
      href: "/superadmin/bank-notifications",
      label: t.bankNotifications,
      icon: Landmark,
    },
    { href: "/superadmin/plans", label: t.plans, icon: Sparkles },
    {
      href: "/superadmin/payment-methods",
      label: t.paymentMethods,
      icon: CreditCard,
    },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:h-[calc(100vh-4rem)] md:w-56 md:border-r md:sticky md:top-16">
      <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:overflow-y-auto md:py-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
              pathname.startsWith(link.href) &&
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
        <Link
          href="/admin"
          className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          {t.backToRestaurant}
        </Link>
      </nav>
    </aside>
  );
}
