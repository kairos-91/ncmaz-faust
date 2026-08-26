"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function SuperadminNav({
  email,
  locale,
  t,
  pendingPayments = 0,
}: {
  email: string | null;
  locale: Locale;
  t: Dictionary["superadminNav"];
  pendingPayments?: number;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/superadmin/restaurants", label: t.restaurants },
    { href: "/superadmin/payments", label: t.payments, badge: pendingPayments },
    { href: "/superadmin/plans", label: t.plans },
    { href: "/superadmin/payment-methods", label: t.paymentMethods },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:h-screen md:w-56 md:border-r md:sticky md:top-0">
      <div>
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <div className="flex items-center justify-between">
            <Link href="/admin">
              <Logo height={36} />
            </Link>
            <div className="flex items-center gap-1 md:hidden">
              <LanguageToggle locale={locale} />
              <ThemeToggle />
            </div>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-lime-600 dark:text-lime-400">
            {t.badge}
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:flex-col md:overflow-visible md:pb-0">
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
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            {t.backToRestaurant}
          </Link>
        </nav>
      </div>
      <div className="border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div className="mb-2 hidden items-center justify-between md:flex">
          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
            {t.theme}
          </span>
          <div className="flex items-center gap-1">
            <LanguageToggle locale={locale} />
            <ThemeToggle />
          </div>
        </div>
        <p className="mb-2 truncate text-xs text-neutral-600 dark:text-neutral-500">
          {email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {t.logout}
          </button>
        </form>
      </div>
    </aside>
  );
}
