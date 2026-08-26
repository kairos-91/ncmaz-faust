import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { updateRestaurant } from "@/app/admin/actions";
import { getT } from "@/lib/i18n/locale";
import { RestaurantForm } from "./restaurant-form";
import { LogoUploader } from "./logo-uploader";
import { CoverUploader } from "./cover-uploader";

export const metadata: Metadata = { title: "Mi restaurante" };

export default async function RestaurantSettingsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");
  const { t } = await getT();

  const boundUpdate = updateRestaurant.bind(null, restaurant.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">{t.restaurantPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.restaurantPage.subtitle}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t.restaurantPage.logoLabel}
          </p>
          <LogoUploader restaurant={restaurant} t={t.logoUploader} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t.restaurantPage.coverLabel}
          </p>
          <CoverUploader restaurant={restaurant} t={t.coverUploader} />
        </div>
      </div>

      <RestaurantForm
        restaurant={restaurant}
        action={boundUpdate}
        submitLabel={t.common.save}
        t={t.restaurantForm}
      />
    </div>
  );
}
