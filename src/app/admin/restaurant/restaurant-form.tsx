"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import type { Restaurant } from "@/lib/supabase/database.types";
import type { ActionState } from "@/app/admin/actions";

const CURRENCIES = ["USD", "VES", "EUR", "MXN", "COP", "ARS", "PEN"];

export function RestaurantForm({
  restaurant,
  action,
  submitLabel,
}: {
  restaurant?: Restaurant | null;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [name, setName] = useState(restaurant?.name ?? "");
  const [slug, setSlug] = useState(restaurant?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(restaurant));

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="name">Nombre del restaurante</Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="La Parrilla de Juan"
        />
      </div>

      <div>
        <Label htmlFor="slug">URL pública</Label>
        <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200">
          <span className="whitespace-nowrap bg-neutral-50 px-3 text-sm text-neutral-400">
            /r/
          </span>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="la-parrilla-de-juan"
            className="h-10 w-full border-0 bg-white px-1 text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={restaurant?.description ?? ""}
          placeholder="Cocina venezolana casera, especialidad en parrillas."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={restaurant?.phone ?? ""}
            placeholder="+58 412 0000000"
          />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={restaurant?.whatsapp ?? ""}
            placeholder="+58 412 0000000"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          defaultValue={restaurant?.address ?? ""}
          placeholder="Av. Bolívar, Maracay"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="theme_color">Color de marca</Label>
          <input
            id="theme_color"
            name="theme_color"
            type="color"
            defaultValue={restaurant?.theme_color ?? "#f97316"}
            className="h-10 w-full cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
          />
        </div>
        <div>
          <Label htmlFor="currency">Moneda</Label>
          <select
            id="currency"
            name="currency"
            defaultValue={restaurant?.currency ?? "USD"}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={restaurant?.is_published ?? false}
          className="h-4 w-4 rounded border-neutral-300"
        />
        Publicar menú (visible en tu URL pública)
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
