"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Store, Check } from "lucide-react";
import { setActiveRestaurant } from "@/app/admin/actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import type { Restaurant } from "@/lib/supabase/database.types";

export function BranchSwitcher({
  restaurants,
  currentRestaurantId,
  locale,
}: {
  restaurants: Restaurant[];
  currentRestaurantId: string;
  locale: Locale;
}) {
  const t = getDictionary(locale).branchSwitcher;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const current = restaurants.find((r) => r.id === currentRestaurantId);
  if (!current) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[10rem] items-center gap-1.5 rounded-full border border-neutral-200 py-1 pl-2.5 pr-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800 sm:max-w-[14rem]"
        aria-label={t.label}
      >
        <Store className="h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
        <span className="truncate">{current.name}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
            {t.label}
          </div>

          {restaurants.map((r) => (
            <form key={r.id} action={setActiveRestaurant.bind(null, r.id)}>
              <button
                type="submit"
                disabled={r.id === currentRestaurantId}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-default dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {r.id === currentRestaurantId && (
                    <Check className="h-4 w-4 text-lime-600 dark:text-lime-400" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">{r.name}</span>
              </button>
            </form>
          ))}

          <div className="my-1 h-px bg-neutral-100 dark:bg-neutral-800" />

          <Link
            href="/admin/restaurants/new"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-lime-700 hover:bg-lime-50 dark:text-lime-400 dark:hover:bg-lime-400/10"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {t.addBranch}
          </Link>
        </div>
      )}
    </div>
  );
}
