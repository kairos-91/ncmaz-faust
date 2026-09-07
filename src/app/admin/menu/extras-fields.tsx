"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { parseExtras, type MenuItemExtra } from "@/lib/menu-item-extras";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Json } from "@/lib/supabase/database.types";

export function ExtrasFields({
  extras,
  t,
}: {
  extras: Json | null | undefined;
  t: Dictionary["menuItemForm"];
}) {
  const [rows, setRows] = useState<MenuItemExtra[]>(() => parseExtras(extras));

  const update = (index: number, patch: Partial<MenuItemExtra>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const remove = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label>{t.extrasLabel}</Label>
      {rows.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2 px-0.5">
            <span className="w-full min-w-0 flex-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {t.extrasNameColumnLabel}
            </span>
            <span className="w-24 shrink-0 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {t.extrasPriceColumnLabel}
            </span>
            <span className="w-9 shrink-0" />
          </div>
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                name={`extras.${index}.name`}
                value={row.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder={t.extrasNamePlaceholder}
                className="h-10 w-full min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              <input
                name={`extras.${index}.price`}
                type="number"
                min="0"
                step="0.01"
                value={row.price}
                onChange={(e) => update(index, { price: Number(e.target.value) })}
                placeholder={t.extrasPricePlaceholder}
                className="h-10 w-24 shrink-0 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={t.extrasRemove}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-2"
        onClick={() => setRows((prev) => [...prev, { name: "", price: 0 }])}
      >
        <Plus className="h-3.5 w-3.5" />
        {t.extrasAdd}
      </Button>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">{t.extrasHint}</p>
    </div>
  );
}
