import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { getT } from "@/lib/i18n/locale";
import { createRestaurant } from "@/app/admin/actions";
import { RestaurantForm } from "@/app/admin/restaurant/restaurant-form";

export const metadata: Metadata = { title: "Agregar sucursal" };

export default async function NewBranchPage() {
  const { userEmail, role } = await getStaffRestaurant();
  if (!userEmail) redirect("/login");
  // El staff pertenece a una sola sucursal — solo el dueño puede agregar
  // sucursales nuevas.
  if (role === "staff") redirect("/admin");

  const { t } = await getT();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">{t.branchSwitcher.newBranchTitle}</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        {t.branchSwitcher.newBranchSubtitle}
      </p>
      <RestaurantForm
        action={createRestaurant}
        submitLabel={t.branchSwitcher.newBranchSubmitLabel}
        t={t.restaurantForm}
        hoursT={t.openingHours}
      />
    </div>
  );
}
