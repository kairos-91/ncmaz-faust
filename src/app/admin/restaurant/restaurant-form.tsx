"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn, slugify } from "@/lib/utils";
import { DeliveryZonesFields } from "./delivery-zones-fields";
import { extractSocialHandle } from "@/lib/social-links";
import { OpeningHoursFields } from "./opening-hours-fields";
import { SERVICE_IDS, parseServices } from "@/lib/restaurant-services";
import { VENEZUELAN_STATES } from "@/lib/venezuelan-states";
import type { Restaurant } from "@/lib/supabase/database.types";
import { checkSlugAvailability, type ActionState } from "@/app/admin/actions";
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
  const [packagingFeeEnabled, setPackagingFeeEnabled] = useState(
    restaurant?.packaging_fee_enabled ?? false,
  );
  const selectedServices = parseServices(restaurant?.services);

  // slugResult solo se actualiza dentro del callback async (nunca de
  // forma síncrona en el efecto): "checking"/"idle" salen de comparar el
  // slug actual contra el último resultado ya resuelto, en vez de guardar
  // ese estado intermedio aparte.
  const [slugResult, setSlugResult] = useState<{
    slug: string;
    available: boolean;
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    if (!slug || slug.length < 2 || slug === (restaurant?.slug ?? "")) return;
    const timeout = setTimeout(() => {
      checkSlugAvailability(slug, restaurant?.id).then((result) => {
        setSlugResult({ slug, available: result.available, suggestions: result.suggestions });
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [slug, restaurant?.id, restaurant?.slug]);

  const slugCheck: {
    status: "idle" | "checking" | "available" | "unavailable";
    suggestions: string[];
  } =
    !slug || slug.length < 2 || slug === (restaurant?.slug ?? "")
      ? { status: "idle", suggestions: [] }
      : !slugResult || slugResult.slug !== slug
        ? { status: "checking", suggestions: [] }
        : {
            status: slugResult.available ? "available" : "unavailable",
            suggestions: slugResult.suggestions,
          };

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
            /
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
        {slugCheck.status === "checking" && (
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-500">
            {t.slugChecking}
          </p>
        )}
        {slugCheck.status === "available" && (
          <p className="mt-1.5 text-xs text-green-600 dark:text-green-500">
            {t.slugAvailable}
          </p>
        )}
        {slugCheck.status === "unavailable" && (
          <div className="mt-1.5 space-y-1.5">
            <p className="text-xs text-red-600">{t.slugUnavailable}</p>
            {slugCheck.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {slugCheck.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setSlugTouched(true);
                      setSlug(suggestion);
                    }}
                    className={cn(
                      "rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700",
                      "hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800",
                    )}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="state">{t.stateLabel}</Label>
          <Input
            id="state"
            name="state"
            defaultValue={restaurant?.state ?? ""}
            placeholder={t.stateSelectPlaceholder}
          />
        </div>
        <div>
          <Label htmlFor="country">{t.countryLabel}</Label>
          <select
            id="country"
            name="country"
            defaultValue={restaurant?.country ?? ""}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
          >
            <option value="">{t.countrySelectPlaceholder}</option>
            {VENEZUELAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="rif">{t.rifLabel}</Label>
        <p className="mt-1 mb-2 text-xs text-neutral-500 dark:text-neutral-500">
          {t.rifHint}
        </p>
        <Input
          id="rif"
          name="rif"
          defaultValue={restaurant?.rif ?? ""}
          placeholder="J-12345678-9"
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
        <Label>{t.socialLabel}</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="instagram_handle" className="text-xs font-normal text-neutral-500 dark:text-neutral-500">
              {t.instagramLabel}
            </Label>
            <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200 dark:border-neutral-700 dark:focus-within:border-neutral-500 dark:focus-within:ring-neutral-700">
              <span className="whitespace-nowrap bg-neutral-50 px-2.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                instagram.com/
              </span>
              <input
                id="instagram_handle"
                name="instagram_handle"
                defaultValue={extractSocialHandle(restaurant?.instagram_url)}
                placeholder="turestaurante"
                className="h-10 w-full min-w-0 bg-white px-2 text-sm text-neutral-900 outline-none dark:bg-neutral-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tiktok_handle" className="text-xs font-normal text-neutral-500 dark:text-neutral-500">
              {t.tiktokLabel}
            </Label>
            <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200 dark:border-neutral-700 dark:focus-within:border-neutral-500 dark:focus-within:ring-neutral-700">
              <span className="whitespace-nowrap bg-neutral-50 px-2.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                tiktok.com/@
              </span>
              <input
                id="tiktok_handle"
                name="tiktok_handle"
                defaultValue={extractSocialHandle(restaurant?.tiktok_url)}
                placeholder="turestaurante"
                className="h-10 w-full min-w-0 bg-white px-2 text-sm text-neutral-900 outline-none dark:bg-neutral-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="facebook_handle" className="text-xs font-normal text-neutral-500 dark:text-neutral-500">
              {t.facebookLabel}
            </Label>
            <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200 dark:border-neutral-700 dark:focus-within:border-neutral-500 dark:focus-within:ring-neutral-700">
              <span className="whitespace-nowrap bg-neutral-50 px-2.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                facebook.com/
              </span>
              <input
                id="facebook_handle"
                name="facebook_handle"
                defaultValue={extractSocialHandle(restaurant?.facebook_url)}
                placeholder="turestaurante"
                className="h-10 w-full min-w-0 bg-white px-2 text-sm text-neutral-900 outline-none dark:bg-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.socialHint}
        </p>
      </div>

      <DeliveryZonesFields deliveryZones={restaurant?.delivery_zones} t={t} />

      <div>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="packaging_fee_enabled"
            checked={packagingFeeEnabled}
            onChange={(e) => setPackagingFeeEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          {t.packagingFeeEnableLabel}
        </label>
        <div className="mt-2 max-w-[160px]">
          <Label htmlFor="packaging_fee">{t.packagingFeeAmountLabel}</Label>
          <Input
            id="packaging_fee"
            name="packaging_fee"
            type="number"
            min="0"
            step="0.01"
            disabled={!packagingFeeEnabled}
            defaultValue={restaurant?.packaging_fee ?? 0}
          />
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.packagingFeeHint}
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

      <div>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="allow_orders_when_closed"
            defaultChecked={restaurant?.allow_orders_when_closed ?? false}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          {t.allowOrdersWhenClosedLabel}
        </label>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.allowOrdersWhenClosedHint}
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="manages_delivery_staff"
            defaultChecked={restaurant?.manages_delivery_staff ?? false}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          {t.managesDeliveryStaffLabel}
        </label>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.managesDeliveryStaffHint}
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="manages_kitchen_staff"
            defaultChecked={restaurant?.manages_kitchen_staff ?? false}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          {t.managesKitchenStaffLabel}
        </label>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.managesKitchenStaffHint}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="theme_color">{t.colorLabel}</Label>
          <input
            id="theme_color"
            name="theme_color"
            type="color"
            defaultValue={restaurant?.theme_color ?? "#84cc16"}
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
      {state && !state.error && !isPending && (
        <p className="text-sm text-green-600 dark:text-green-500">{t.saved}</p>
      )}

      <Button
        type="submit"
        disabled={
          isPending || slugCheck.status === "checking" || slugCheck.status === "unavailable"
        }
      >
        {isPending ? t.saving : submitLabel}
      </Button>
    </form>
  );
}
