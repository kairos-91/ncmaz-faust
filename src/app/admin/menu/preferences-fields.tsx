"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { parsePreferences } from "@/lib/menu-item-preferences";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Json } from "@/lib/supabase/database.types";

export function PreferencesFields({
  preferences,
  t,
}: {
  preferences: Json | null | undefined;
  t: Dictionary["menuItemForm"];
}) {
  const [rows, setRows] = useState<string[]>(() => parsePreferences(preferences));

  const update = (index: number, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? value : r)));
  };

  const remove = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label>{t.preferencesLabel}</Label>
      {rows.length > 0 && (
        <div className="mt-2 space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                name={`preferences.${index}`}
                value={row}
                onChange={(e) => update(index, e.target.value)}
                placeholder={t.preferencesNamePlaceholder}
                className="h-10 w-full min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={t.preferencesRemove}
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
        onClick={() => setRows((prev) => [...prev, ""])}
      >
        <Plus className="h-3.5 w-3.5" />
        {t.preferencesAdd}
      </Button>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
        {t.preferencesHint}
      </p>
    </div>
  );
}
