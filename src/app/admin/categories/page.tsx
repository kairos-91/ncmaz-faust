import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { createClient } from "@/lib/supabase/server";
import { CategoryManager } from "./category-manager";

export const metadata: Metadata = { title: "Categorías" };

export default async function CategoriesPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Categorías</h1>
        <p className="text-sm text-neutral-500">
          Organiza tu menú en secciones: entradas, platos fuertes, postres...
        </p>
      </div>
      <CategoryManager restaurantId={restaurant.id} categories={categories ?? []} />
    </div>
  );
}
