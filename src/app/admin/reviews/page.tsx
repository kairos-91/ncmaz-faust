import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { ReviewsManager } from "./reviews-manager";

export const metadata: Metadata = { title: "Reseñas" };

export default async function ReviewsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { locale, t } = await getT();

  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.reviewsPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.reviewsPage.subtitle}
        </p>
      </div>
      <ReviewsManager restaurantId={restaurant.id} reviews={reviews ?? []} locale={locale} />
    </div>
  );
}
