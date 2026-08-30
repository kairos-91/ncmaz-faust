import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDeliveryStaffSession } from "@/lib/get-owner-restaurant";
import { getT } from "@/lib/i18n/locale";
import { signOut } from "@/app/admin/actions";
import { DeliveryTopBar } from "./delivery-topbar";

// Necesario para que el panel de delivery se pueda "Agregar a inicio" —
// sin esto, iOS/Safari nunca entrega push fuera de una PWA instalada.
export const metadata: Metadata = {
  title: "Panel de delivery",
  manifest: "/delivery/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Levery Delivery",
  },
};

export default async function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userEmail, restaurant, deliveryStaff } = await getDeliveryStaffSession();
  if (!userEmail) redirect("/login");
  const { locale, t } = await getT();

  if (!restaurant || !deliveryStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 px-6 text-center dark:bg-neutral-950">
        <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
          {t.deliveryPortal.noAccess}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm font-medium text-neutral-900 underline dark:text-white"
          >
            {t.deliveryPortal.logout}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <DeliveryTopBar
        email={userEmail}
        restaurantName={restaurant.name}
        locale={locale}
        t={t.deliveryPortal}
      />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
