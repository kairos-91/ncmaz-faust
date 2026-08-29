import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";

async function getPartnerRestaurants() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, name, slug, logo_url")
    .eq("is_partner", true)
    .eq("is_published", true)
    .order("name");
  return data ?? [];
}

export async function PartnersSection() {
  const [partners, { t }] = await Promise.all([getPartnerRestaurants(), getT()]);
  if (partners.length === 0) return null;

  return (
    <section
      id="aliados"
      className="scroll-mt-20 bg-white py-20 text-neutral-900 dark:bg-black dark:text-white"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-wide text-neutral-900 dark:text-white sm:text-4xl">
            {t.partnersSection.heading}
          </h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-lime-500 dark:bg-lime-400" />
          <p className="mx-auto mt-6 max-w-xl text-neutral-600 dark:text-neutral-400">
            {t.partnersSection.subheading}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {partners.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/${restaurant.slug}`}
              className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-6 text-center transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
            >
              {restaurant.logo_url ? (
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-lg font-semibold text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
                  {restaurant.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {restaurant.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
