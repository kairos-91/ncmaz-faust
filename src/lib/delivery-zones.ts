import type { Json } from "@/lib/supabase/database.types";

export type DeliveryZone = { name: string; fee: number };

export function parseDeliveryZones(json: Json | null | undefined): DeliveryZone[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter(
      (entry): entry is Record<string, Json> =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry),
    )
    .map((entry) => ({
      name: String(entry.name ?? "").trim(),
      fee: Number(entry.fee) || 0,
    }))
    .filter((zone) => zone.name.length > 0);
}

export function deliveryZonesToText(zones: DeliveryZone[]) {
  return zones.map((z) => `${z.name}, ${z.fee}`).join("\n");
}

export function parseDeliveryZonesText(text: string): DeliveryZone[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, feeRaw] = line.split(",");
      return {
        name: (name ?? "").trim(),
        fee: Number((feeRaw ?? "0").trim()) || 0,
      };
    })
    .filter((zone) => zone.name.length > 0);
}
