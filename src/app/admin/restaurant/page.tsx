import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { updateRestaurant } from "@/app/admin/actions";
import { RestaurantForm } from "./restaurant-form";
import { LogoUploader } from "./logo-uploader";

export const metadata: Metadata = { title: "Mi restaurante" };

export default async function RestaurantSettingsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");

  const boundUpdate = updateRestaurant.bind(null, restaurant.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Mi restaurante</h1>
        <p className="text-sm text-neutral-600">
          Esta información aparece en tu menú público.
        </p>
      </div>

      <LogoUploader restaurant={restaurant} />

      <RestaurantForm
        restaurant={restaurant}
        action={boundUpdate}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
