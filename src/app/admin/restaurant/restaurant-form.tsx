"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { deliveryZonesToText, parseDeliveryZones } from "@/lib/delivery-zones";
import { OpeningHoursFields } from "./opening-hours-fields";
import { SERVICE_IDS, parseServices } from "@/lib/restaurant-services";
import type { Restaurant } from "@/lib/supabase/database.types";
import type { ActionState } from "@/app/admin/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const CURRENCIES = ["USD", "VES", "EUR", "MXN", "COP", "ARS", "PEN"];

export function RestaurantForm({
  restaurant,
  action,
  submitLabel,
  t,
  hoursT,
}: {
  restaurant?: Restaurant | null;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  t: Dictionary["restaurantForm"];
  hoursT: Dictionary["openingHours"];
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [name, setName] = useState(restaurant?.name ?? "");
  const [slug, setSlug] = useState(restaurant?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(restaurant));
  const selectedServices = parseServices(restaurant?.services);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <Label htmlFor="name">{t.nameLabel}</Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder={t.namePlaceholder}
        />
      </div>

      <div>
        <Label htmlFor="slug">{t.urlLabel}</Label>
        <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200 dark:border-neutral-700 dark:focus-within:border-neutral-500 dark:focus-within:ring-neutral-700">
          <span className="whitespace-nowrap bg-neutral-50 px-3 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
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
            placeholder={t.urlPlaceholder}
            className="h-10 w-full border-0 bg-white px-1 text-sm text-neutral-900 outline-none dark:bg-neutral-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">{t.descriptionLabel}</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={restaurant?.description ?? ""}
          placeholder={t.descriptionPlaceholder}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">{t.phoneLabel}</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={restaurant?.phone ?? ""}
            placeholder="+58 412 0000000"
          />
        </div>
        <div>
          <Label htmlFor="whatsapp">{t.whatsappLabel}</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            defaultValue={restaurant?.whatsapp ?? ""}
            placeholder="+58 412 0000000"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">{t.addressLabel}</Label>
        <Input
          id="address"
          name="address"
          defaultValue={restaurant?.address ?? ""}
          placeholder={t.addressPlaceholder}
        />
      </div>

      <div>
        <Label htmlFor="maps_url">{t.mapsUrlLabel}</Label>
        <Input
          id="maps_url"
          name="maps_url"
          type="url"
          defaultValue={restaurant?.maps_url ?? ""}
          placeholder={t.mapsUrlPlaceholder}
        />
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.mapsUrlHint}
        </p>
      </div>

      <div>
        <Label htmlFor="delivery_zones">{t.deliveryZonesLabel}</Label>
        <Textarea
          id="delivery_zones"
          name="delivery_zones"
          rows={3}
          defaultValue={deliveryZonesToText(parseDeliveryZones(restaurant?.delivery_zones))}
          placeholder={t.deliveryZonesPlaceholder}
        />
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.deliveryZonesHint}
        </p>
      </div>

      <div>
        <Label>{t.servicesLabel}</Label>
        <div className="mt-2 flex flex-wrap gap-4">
          {SERVICE_IDS.map((id) => (
            <label
              key={id}
              className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
            >
              <input
                type="checkbox"
                name="services"
                value={id}
                defaultChecked={selectedServices.includes(id)}
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
              />
              {id === "delivery"
                ? t.serviceDelivery
                : id === "pickup"
                  ? t.servicePickup
                  : t.serviceDineIn}
            </label>
          ))}
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.servicesHint}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="has_wifi"
            defaultChecked={restaurant?.has_wifi ?? false}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          {t.wifiLabel}
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="accepts_pets"
            defaultChecked={restaurant?.accepts_pets ?? false}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          {t.petsLabel}
        </label>
      </div>

      <OpeningHoursFields openingHours={restaurant?.opening_hours} t={hoursT} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="theme_color">{t.colorLabel}</Label>
          <input
            id="theme_color"
            name="theme_color"
            type="color"
            defaultValue={restaurant?.theme_color ?? "#f97316"}
            className="h-10 w-full cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div>
          <Label htmlFor="currency">{t.currencyLabel}</Label>
          <select
            id="currency"
            name="currency"
            defaultValue={restaurant?.currency ?? "USD"}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={restaurant?.is_published ?? false}
          className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
        />
        {t.publishLabel}
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? t.saving : submitLabel}
      </Button>
    </form>
  );
}
