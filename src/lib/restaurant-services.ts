import type { Json } from "@/lib/supabase/database.types";

export type ServiceId = "delivery" | "pickup" | "dine_in";

export const SERVICE_IDS: ServiceId[] = ["delivery", "pickup", "dine_in"];

export function parseServices(json: Json | null | undefined): ServiceId[] {
  if (!Array.isArray(json)) return [];
  return SERVICE_IDS.filter((id) => json.includes(id));
}
