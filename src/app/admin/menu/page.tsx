import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { MenuManager } from "./menu-manager";

export const metadata: Metadata = { title: "Menú" };

export default async function MenuPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");

  const supabase = await createClient();
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
      .order("sort_order"),
  ]);

  if (!categories || categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
        <p className="mb-3 text-sm text-neutral-600">
          Crea al menos una categoría antes de agregar platos.
        </p>
        <Link
          href="/admin/categories"
          className="text-sm font-medium text-neutral-900 underline"
        >
          Ir a categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Menú</h1>
        <p className="text-sm text-neutral-600">
          Agrega, edita y organiza los platos de tu restaurante.
        </p>
      </div>
      <MenuManager
        restaurantId={restaurant.id}
        currency={restaurant.currency}
        categories={categories}
        items={items ?? []}
      />
    </div>
  );
}
