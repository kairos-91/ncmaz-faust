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
import {
  parseOpeningHours,
  isOpenNow,
  getNextOpening,
  getDayKey,
  formatTime12h,
  type DayKey,
} from "@/lib/opening-hours";
import { parseServices, type ServiceId } from "@/lib/restaurant-services";
import { ThemeToggle } from "@/components/theme-toggle";
import { SocialLinks } from "@/components/social-links";
import { Logo } from "@/components/logo";
import { MenuView } from "./menu-view";
import { PwaActions } from "./pwa-actions";
import { WriteReviewButton } from "./write-review-button";

type Params = { slug: string };

const SERVICE_LABELS: Record<ServiceId, string> = {
  delivery: "🛵 Delivery",
  pickup: "🥡 Para llevar",
  dine_in: "🍽️ Comer en el local",
};

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

  const [{ data: categories }, { data: items }, { data: ratingRows }] =
    await Promise.all([
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
      supabase.rpc("restaurant_rating", { p_restaurant_id: restaurant.id }),
    ]);

  return {
    restaurant,
    categories: categories ?? [],
    items: items ?? [],
    avgRating: ratingRows?.[0]?.avg_rating ?? null,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRestaurant(slug);
  if (!data) return { title: "Menú no encontrado" };
  const logo = data.restaurant.logo_url ?? undefined;
  return {
    title: data.restaurant.name,
    description:
      data.restaurant.description ??
      `Menú digital de ${data.restaurant.name}`,
    manifest: `/${slug}/manifest.webmanifest`,
    icons: logo ? { icon: logo, apple: logo } : undefined,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: data.restaurant.name,
    },
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

  const { restaurant, categories, items, avgRating } = data;

  const isSubscriptionExpired =
    restaurant.plan_expires_at !== null &&
    new Date(restaurant.plan_expires_at).getTime() < new Date().getTime();

  if (isSubscriptionExpired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 px-4 text-center dark:bg-neutral-950">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900">
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt={restaurant.name}
              width={64}
              height={64}
              className="h-full w-full object-contain p-2"
              unoptimized
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-lg font-semibold text-white"
              style={{ backgroundColor: restaurant.theme_color }}
            >
              {restaurant.name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {restaurant.name}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
            Este menú no está disponible en este momento. Vuelve más tarde.
          </p>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400 dark:text-neutral-600">
          Hecho con{" "}
          <Link href="/" className="inline-flex">
            <Logo height={22} />
          </Link>
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  await supabase.from("menu_views").insert({ restaurant_id: restaurant.id });

  const paymentMethods = parsePaymentMethods(restaurant.payment_methods);
  const needsBcvRate = enabledPaymentMethods(paymentMethods).some(
    (id) => PAYMENT_METHOD_META[id].convertToVes,
  );
  const bcvRate = needsBcvRate ? await getBcvRate() : null;

  const services = parseServices(restaurant.services);
  const hasAmenities = services.length > 0 || restaurant.has_wifi || restaurant.accepts_pets;
  const hasContactInfo = Boolean(
    restaurant.address || restaurant.maps_url || restaurant.phone || restaurant.whatsapp,
  );
  const hasSocialLinks = Boolean(
    restaurant.instagram_url || restaurant.tiktok_url || restaurant.facebook_url,
  );

  const hasOpeningHours =
    Array.isArray(restaurant.opening_hours) && restaurant.opening_hours.length > 0;
  const openingHours = parseOpeningHours(restaurant.opening_hours);
  const openNow = hasOpeningHours ? isOpenNow(openingHours) : null;
  const todayKey = getDayKey(new Date());

  const orderingAllowed = !hasOpeningHours || openNow === true;
  const nextOpening = !orderingAllowed ? getNextOpening(openingHours) : null;
  const closedMessage = orderingAllowed
    ? null
    : nextOpening
      ? `Estamos cerrados. Abrimos ${nextOpening.isToday ? "hoy" : `el ${DAY_LABELS[nextOpening.day].toLowerCase()}`} a las ${formatTime12h(nextOpening.time)}.`
      : "Estamos cerrados por el momento.";

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
        <div className="relative z-10 -mt-10 flex items-end justify-center gap-4">
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

        <div className="mt-3 text-center">
          <h1 className="flex items-center justify-center gap-1.5 text-2xl font-semibold text-neutral-900 dark:text-white">
            {restaurant.name}
            {restaurant.is_verified && (
              <svg
                viewBox="0 0 24 24"
                fill="#3897F0"
                className="h-5 w-5 shrink-0"
                aria-label="Verificado"
              >
                <title>Verificado</title>
                <path d="M23.00 12.00 22.75 12.70 22.06 13.32 21.12 13.81 20.16 14.19 19.41 14.52 19.02 14.91 19.02 15.46 19.32 16.22 19.73 17.17 20.05 18.18 20.10 19.10 19.78 19.78 19.10 20.10 18.18 20.05 17.17 19.73 16.23 19.32 15.46 19.02 14.91 19.02 14.52 19.41 14.19 20.16 13.81 21.12 13.32 22.06 12.70 22.75 12.00 23.00 11.30 22.75 10.68 22.06 10.19 21.12 9.81 20.16 9.48 19.41 9.09 19.02 8.54 19.02 7.78 19.32 6.83 19.73 5.82 20.05 4.90 20.10 4.22 19.78 3.90 19.10 3.95 18.18 4.27 17.17 4.68 16.22 4.98 15.46 4.98 14.91 4.59 14.52 3.84 14.19 2.88 13.81 1.94 13.32 1.25 12.70 1.00 12.00 1.25 11.30 1.94 10.68 2.88 10.19 3.84 9.81 4.59 9.48 4.98 9.09 4.98 8.54 4.68 7.77 4.27 6.83 3.95 5.82 3.90 4.90 4.22 4.22 4.90 3.90 5.82 3.95 6.83 4.27 7.77 4.68 8.54 4.98 9.09 4.98 9.48 4.59 9.81 3.84 10.19 2.88 10.68 1.94 11.30 1.25 12.00 1.00 12.70 1.25 13.32 1.94 13.81 2.88 14.19 3.84 14.52 4.59 14.91 4.98 15.46 4.98 16.23 4.68 17.17 4.27 18.18 3.95 19.10 3.90 19.78 4.22 20.10 4.90 20.05 5.82 19.73 6.83 19.32 7.77 19.02 8.54 19.02 9.09 19.41 9.48 20.16 9.81 21.12 10.19 22.06 10.68 22.75 11.30 23.00 12.00Z" />
                <path
                  d="M8.8 12.3l2.2 2.2 4.2-4.6"
                  stroke="#fff"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            )}
          </h1>
          {(restaurant.state || restaurant.country) && (
            <p className="mx-auto mt-0.5 flex w-fit items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
              <span>📍</span>
              {[restaurant.state, restaurant.country].filter(Boolean).join(", ")}
            </p>
          )}
          {avgRating !== null && (
            <p className="mx-auto mt-1 flex w-fit items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="text-amber-400">★</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {avgRating}
              </span>
            </p>
          )}
          {restaurant.description && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {restaurant.description}
            </p>
          )}
          <div className="mt-2">
            <details className="group">
                <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 text-xs">
                  {hasOpeningHours && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                        openNow
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      }`}
                    >
                      ● {openNow ? "Abierto" : "Cerrado"}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold group-open:hidden"
                    style={{
                      borderColor: restaurant.theme_color,
                      color: restaurant.theme_color,
                      backgroundColor: `${restaurant.theme_color}1A`,
                    }}
                  >
                    Más información
                  </span>
                  <span
                    className="hidden items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold group-open:inline-flex"
                    style={{
                      borderColor: restaurant.theme_color,
                      color: restaurant.theme_color,
                      backgroundColor: `${restaurant.theme_color}1A`,
                    }}
                  >
                    Ocultar información
                  </span>
                </summary>

                <div className="mt-2 space-y-3 rounded-lg border border-neutral-200 p-3 text-xs dark:border-neutral-800">
                  {hasContactInfo && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-600 dark:text-neutral-400">
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
                  )}

                  {hasSocialLinks && (
                    <SocialLinks
                      instagramUrl={restaurant.instagram_url}
                      tiktokUrl={restaurant.tiktok_url}
                      facebookUrl={restaurant.facebook_url}
                    />
                  )}

                  {hasAmenities && (
                    <div className="flex flex-wrap gap-1.5">
                      {services.map((id) => (
                        <span
                          key={id}
                          className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {SERVICE_LABELS[id]}
                        </span>
                      ))}
                      {restaurant.has_wifi && (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          📶 WiFi
                        </span>
                      )}
                      {restaurant.accepts_pets && (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          🐾 Acepta mascotas
                        </span>
                      )}
                    </div>
                  )}

                  {hasOpeningHours && (
                    <ul className="space-y-0.5">
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
                          <span>
                            {h.closed
                              ? "Cerrado"
                              : `${formatTime12h(h.open)} – ${formatTime12h(h.close)}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <PwaActions
                      slug={slug}
                      restaurantId={restaurant.id}
                      themeColor={restaurant.theme_color}
                    />
                    <WriteReviewButton
                      restaurantId={restaurant.id}
                      themeColor={restaurant.theme_color}
                    />
                  </div>
                </div>
              </details>
            </div>
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
            packagingFeeEnabled={restaurant.packaging_fee_enabled}
            packagingFeeAmount={restaurant.packaging_fee}
            orderingAllowed={orderingAllowed}
            closedMessage={closedMessage}
          />
        )}

        <p className="mt-12 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400 dark:text-neutral-600">
          Hecho con{" "}
          <Link href="/" className="inline-flex">
            <Logo height={22} />
          </Link>
        </p>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
