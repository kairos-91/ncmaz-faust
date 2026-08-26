"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  createMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateMenuItem,
} from "@/app/admin/actions";
import { MenuItemForm } from "./menu-item-form";
import type { Category, MenuItem } from "@/lib/supabase/database.types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type T = Dictionary["common"] & Dictionary["menuManager"];

export function MenuManager({
  restaurantId,
  currency,
  categories,
  items,
  t,
  formT,
}: {
  restaurantId: string;
  currency: string;
  categories: Category[];
  items: MenuItem[];
  t: T;
  formT: Dictionary["menuItemForm"];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const boundCreate = createMenuItem.bind(null, restaurantId);

  const byCategory = categories.map((category) => ({
    category,
    items: items.filter((item) => item.category_id === category.id),
  }));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        {adding ? (
          <MenuItemForm
            categories={categories}
            action={boundCreate}
            submitLabel={formT.addSubmit}
            onSuccess={() => setAdding(false)}
            t={formT}
          />
        ) : (
          <Button onClick={() => setAdding(true)}>{t.addDish}</Button>
        )}
      </div>

      {byCategory.map(({ category, items }) => (
        <div key={category.id}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            {category.name}
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.noItems}</p>
          ) : (
            <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
              {items.map((item) =>
                editingId === item.id ? (
                  <li key={item.id} className="p-5">
                    <MenuItemForm
                      categories={categories}
                      item={item}
                      action={updateMenuItem.bind(null, restaurantId, item.id)}
                      submitLabel={t.saveChanges}
                      onSuccess={() => setEditingId(null)}
                      t={formT}
                    />
                    <button
                      className="mt-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                      onClick={() => setEditingId(null)}
                    >
                      {t.cancel}
                    </button>
                  </li>
                ) : (
                  <MenuItemRow
                    key={item.id}
                    restaurantId={restaurantId}
                    item={item}
                    currency={currency}
                    onEdit={() => setEditingId(item.id)}
                    t={t}
                  />
                ),
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function MenuItemRow({
  restaurantId,
  item,
  currency,
  onEdit,
  t,
}: {
  restaurantId: string;
  item: MenuItem;
  currency: string;
  onEdit: () => void;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
        {item.image_url && (
          <Image
            src={item.image_url}
            alt={item.name}
            width={48}
            height={48}
            className="h-full w-full object-cover"
            unoptimized
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium text-neutral-900 dark:text-white",
            !item.is_available && "text-neutral-400 line-through",
          )}
        >
          {item.name}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatPrice(item.price, currency)}
        </p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            toggleAvailability(restaurantId, item.id, !item.is_available),
          )
        }
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
          item.is_available
            ? "bg-green-50 text-green-700"
            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
        )}
      >
        {item.is_available ? t.available : t.soldOut}
      </button>
      <button
        type="button"
        className="shrink-0 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        onClick={onEdit}
      >
        {t.edit}
      </button>
      <button
        type="button"
        disabled={isPending}
        className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
        onClick={() => {
          if (!confirm(t.deleteConfirm(item.name))) return;
          startTransition(() => deleteMenuItem(restaurantId, item.id));
        }}
      >
        {t.delete}
      </button>
    </li>
  );
}
