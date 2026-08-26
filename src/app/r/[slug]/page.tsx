import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBcvRate } from "@/lib/bcv-rate";
import {
  enabledPaymentMethods,
  parsePaymentMethods,
  PAYMENT_METHOD_META,
} from "@/lib/payment-methods";
import { parseDeliveryZones } from "@/lib/delivery-zones";
import { parseOpeningHours, isOpenNow, getDayKey, type DayKey } from "@/lib/opening-hours";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { MenuView } from "./menu-view";

type Params = { slug: string };

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

async function getRestaurant(slug: string) {
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!restaurant) return null;

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("is_available", true)
      .order("sort_order"),
  ]);

  return { restaurant, categories: categories ?? [], items: items ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurant(slug);
  if (!data) return { title: "Menú no encontrado" };
  return {
    title: data.restaurant.name,
    description:
      data.restaurant.description ??
      `Menú digital de ${data.restaurant.name}`,
  };
}

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const data = await getRestaurant(slug);
  if (!data) notFound();

  const { restaurant, categories, items } = data;
  const paymentMethods = parsePaymentMethods(restaurant.payment_methods);
  const needsBcvRate = enabledPaymentMethods(paymentMethods).some(
    (id) => PAYMENT_METHOD_META[id].convertToVes,
  );
  const bcvRate = needsBcvRate ? await getBcvRate() : null;

  const hasOpeningHours =
    Array.isArray(restaurant.opening_hours) && restaurant.opening_hours.length > 0;
  const openingHours = parseOpeningHours(restaurant.opening_hours);
  const openNow = hasOpeningHours ? isOpenNow(openingHours) : null;
  const todayKey = getDayKey(new Date());

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 dark:bg-neutral-950">
      <div
        className="relative h-32 w-full bg-cover bg-center sm:h-48"
        style={{
          backgroundColor: restaurant.theme_color,
          backgroundImage: restaurant.cover_url
            ? `url(${restaurant.cover_url})`
            : undefined,
        }}
      >
        <div className="absolute right-4 top-4">
          <div className="rounded-full bg-black/20 backdrop-blur">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-2xl px-4">
        <div className="relative z-10 -mt-10 flex items-end gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-neutral-50 bg-white shadow-sm dark:border-neutral-950 dark:bg-neutral-900">
            {restaurant.logo_url ? (
              <Image
                src={restaurant.logo_url}
                alt={restaurant.name}
                width={80}
                height={80}
                className="h-full w-full object-contain p-1.5"
                unoptimized
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xl font-semibold text-white"
                style={{ backgroundColor: restaurant.theme_color }}
              >
                {restaurant.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {restaurant.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            {restaurant.address && restaurant.maps_url && (
              <a
                href={restaurant.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium"
              >
                📍 {restaurant.address}
              </a>
            )}
            {restaurant.address && !restaurant.maps_url && (
              <span>📍 {restaurant.address}</span>
            )}
            {!restaurant.address && restaurant.maps_url && (
              <a
                href={restaurant.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium"
              >
                📍 Ubicación
              </a>
            )}
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone.replace(/[^0-9+]/g, "")}`}
                className="font-medium"
              >
                📞 {restaurant.phone}
              </a>
            )}
            {restaurant.whatsapp && (
              <a
                href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                className="font-medium text-green-600 dark:text-green-400"
              >
                💬 WhatsApp
              </a>
            )}
          </div>

          {hasOpeningHours && (
            <div className="mt-2">
              <details className="group">
                <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                      openNow
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    }`}
                  >
                    ● {openNow ? "Abierto ahora" : "Cerrado ahora"}
                  </span>
                  <span className="text-neutral-500 underline-offset-2 group-open:hidden dark:text-neutral-500">
                    Ver horario
                  </span>
                  <span className="hidden text-neutral-500 group-open:inline dark:text-neutral-500">
                    Ocultar horario
                  </span>
                </summary>
                <ul className="mt-2 space-y-0.5 rounded-lg border border-neutral-200 p-3 text-xs dark:border-neutral-800">
                  {openingHours.map((h) => (
                    <li
                      key={h.day}
                      className={`flex justify-between gap-4 ${
                        h.day === todayKey
                          ? "font-semibold text-neutral-900 dark:text-white"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <span>{DAY_LABELS[h.day]}</span>
                      <span>{h.closed ? "Cerrado" : `${h.open} – ${h.close}`}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>

        {categories.length === 0 || items.length === 0 ? (
          <p className="mt-10 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Este restaurante aún no publicó su menú.
          </p>
        ) : (
          <MenuView
            categories={categories}
            items={items}
            currency={restaurant.currency}
            themeColor={restaurant.theme_color}
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            whatsapp={restaurant.whatsapp}
            paymentMethods={paymentMethods}
            bcvRate={bcvRate}
            deliveryZones={parseDeliveryZones(restaurant.delivery_zones)}
          />
        )}

        <p className="mt-12 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400 dark:text-neutral-600">
          Hecho con{" "}
          <Link href="/" className="inline-flex">
            <Logo height={14} />
          </Link>
        </p>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
