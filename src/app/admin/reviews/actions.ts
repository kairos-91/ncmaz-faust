"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireOwnedRestaurant(restaurantId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, owner_id")
    .eq("id", restaurantId)
    .single();
  if (!restaurant || restaurant.owner_id !== user.id) {
    throw new Error("No autorizado");
  }
  return supabase;
}

export async function toggleReviewVisibility(
  restaurantId: string,
  reviewId: string,
  isVisible: boolean,
) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("reviews")
    .update({ is_visible: isVisible })
    .eq("id", reviewId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
}

export async function deleteReview(restaurantId: string, reviewId: string) {
  const supabase = await requireOwnedRestaurant(restaurantId);
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("restaurant_id", restaurantId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
}
