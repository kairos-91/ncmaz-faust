"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { parseOpeningHours, type DayHours } from "@/lib/opening-hours";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Json } from "@/lib/supabase/database.types";

export function OpeningHoursFields({
  openingHours,
  t,
}: {
  openingHours: Json | null | undefined;
  t: Dictionary["openingHours"];
}) {
  const [hours, setHours] = useState<DayHours[]>(() => parseOpeningHours(openingHours));

  const update = (day: DayHours["day"], patch: Partial<DayHours>) => {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  };

  return (
    <div>
      <Label>{t.title}</Label>
      <div className="mt-2 space-y-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
        {hours.map((h) => (
          <div
            key={h.day}
            className="grid grid-cols-[5.5rem_1fr_1fr_auto] items-center gap-2"
          >
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              {t.days[h.day]}
            </span>
            <input
              type="time"
              name={`hours.${h.day}.open`}
              value={h.open}
              disabled={h.closed}
              onChange={(e) => update(h.day, { open: e.target.value })}
              className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-2 text-sm text-neutral-900 outline-none disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
            <input
              type="time"
              name={`hours.${h.day}.close`}
              value={h.close}
              disabled={h.closed}
              onChange={(e) => update(h.day, { close: e.target.value })}
              className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-2 text-sm text-neutral-900 outline-none disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
            <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                name={`hours.${h.day}.closed`}
                checked={h.closed}
                onChange={(e) => update(h.day, { closed: e.target.checked })}
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
              />
              {t.closedLabel}
            </label>
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">{t.hint}</p>
    </div>
  );
}
