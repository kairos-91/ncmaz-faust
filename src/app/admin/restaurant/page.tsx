import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { updateRestaurant } from "@/app/admin/actions";
import { RestaurantForm } from "./restaurant-form";
import { LogoUploader } from "./logo-uploader";
import { CoverUploader } from "./cover-uploader";

export const metadata: Metadata = { title: "Mi restaurante" };

export default async function RestaurantSettingsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");

  const boundUpdate = updateRestaurant.bind(null, restaurant.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Mi restaurante</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Esta información aparece en tu menú público.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Logo
          </p>
          <LogoUploader restaurant={restaurant} />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Portada
          </p>
          <CoverUploader restaurant={restaurant} />
        </div>
      </div>

      <RestaurantForm
        restaurant={restaurant}
        action={boundUpdate}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
