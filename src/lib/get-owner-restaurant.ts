import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "@/lib/supabase/database.types";

export async function getOwnerRestaurant(): Promise<{
  userEmail: string | null;
  restaurant: Restaurant | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userEmail: null, restaurant: null };

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  return { userEmail: user.email ?? null, restaurant };
}
