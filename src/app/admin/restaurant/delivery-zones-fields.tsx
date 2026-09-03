"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { parseDeliveryZones, type DeliveryZone } from "@/lib/delivery-zones";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Json } from "@/lib/supabase/database.types";

export function DeliveryZonesFields({
  deliveryZones,
  t,
}: {
  deliveryZones: Json | null | undefined;
  t: Dictionary["restaurantForm"];
}) {
  const [zones, setZones] = useState<DeliveryZone[]>(() =>
    parseDeliveryZones(deliveryZones),
  );

  const update = (index: number, patch: Partial<DeliveryZone>) => {
    setZones((prev) => prev.map((z, i) => (i === index ? { ...z, ...patch } : z)));
  };

  const remove = (index: number) => {
    setZones((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label>{t.deliveryZonesLabel}</Label>
      {zones.length > 0 && (
        <div className="mt-2 space-y-2">
          {zones.map((zone, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                name={`delivery_zones.${index}.name`}
                value={zone.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder={t.deliveryZonesNamePlaceholder}
                className="h-10 w-full min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              <input
                name={`delivery_zones.${index}.fee`}
                type="number"
                min="0"
                step="0.01"
                value={zone.fee}
                onChange={(e) => update(index, { fee: Number(e.target.value) })}
                placeholder={t.deliveryZonesFeePlaceholder}
                className="h-10 w-24 shrink-0 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={t.deliveryZonesRemove}
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
        onClick={() => setZones((prev) => [...prev, { name: "", fee: 0 }])}
      >
        <Plus className="h-3.5 w-3.5" />
        {t.deliveryZonesAdd}
      </Button>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
        {t.deliveryZonesHint}
      </p>
    </div>
  );
}
