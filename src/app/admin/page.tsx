import type { Metadata } from "next";
import Link from "next/link";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { createRestaurant } from "./actions";
import { RestaurantForm } from "./restaurant/restaurant-form";
import { QrCard } from "./qr-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Resumen" };

export default async function AdminDashboardPage() {
  const { restaurant } = await getOwnerRestaurant();

  if (!restaurant) {
    return (
      <div>
        <h1 className="mb-1 text-xl font-semibold">
          Crea el menú de tu restaurante
        </h1>
        <p className="mb-6 text-sm text-neutral-600">
          Solo toma un minuto. Podrás editar todo después.
        </p>
        <RestaurantForm action={createRestaurant} submitLabel="Crear restaurante" />
      </div>
    );
  }

  const supabase = await createClient();
  const [{ count: categoryCount }, { count: itemCount }] = await Promise.all([
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
    supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurant.id),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const publicUrl = `${siteUrl}/r/${restaurant.slug}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Hola, {restaurant.name} 👋</h1>
        <p className="text-sm text-neutral-600">
          {restaurant.is_published
            ? "Tu menú está publicado y visible al público."
            : "Tu menú aún no está publicado. Actívalo en Mi restaurante."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Categorías" value={categoryCount ?? 0} />
        <StatCard label="Platos" value={itemCount ?? 0} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/categories">
          <Button variant="secondary">Gestionar categorías</Button>
        </Link>
        <Link href="/admin/menu">
          <Button variant="secondary">Gestionar menú</Button>
        </Link>
      </div>

      <QrCard publicUrl={publicUrl} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-neutral-600">{label}</p>
    </div>
  );
}
