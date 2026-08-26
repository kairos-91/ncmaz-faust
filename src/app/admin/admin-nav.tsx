"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/restaurant", label: "Mi restaurante" },
  { href: "/admin/categories", label: "Categorías" },
  { href: "/admin/menu", label: "Menú" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/payment-methods", label: "Métodos de pago" },
  { href: "/admin/subscription", label: "Suscripción" },
];

export function AdminNav({ email }: { email: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:h-screen md:w-56 md:border-r md:sticky md:top-0">
      <div>
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo height={36} />
            </Link>
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:flex-col md:overflow-visible md:pb-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
                pathname === link.href &&
                  "bg-neutral-900 text-white hover:bg-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div className="mb-2 hidden items-center justify-between md:flex">
          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
            Tema
          </span>
          <ThemeToggle />
        </div>
        <p className="mb-2 truncate text-xs text-neutral-600 dark:text-neutral-500">
          {email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
