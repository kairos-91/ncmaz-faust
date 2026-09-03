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

// Lee las filas que arma DeliveryZonesFields (delivery_zones.0.name,
// delivery_zones.0.fee, delivery_zones.1.name, ...) — se detiene en el
// primer índice sin nombre, así que no importa si el cliente reordenó
// o borró filas antes de enviar el formulario.
export function parseDeliveryZonesForm(formData: FormData): DeliveryZone[] {
  const zones: DeliveryZone[] = [];
  for (let i = 0; formData.has(`delivery_zones.${i}.name`); i++) {
    const name = String(formData.get(`delivery_zones.${i}.name`) ?? "").trim();
    const feeRaw = String(formData.get(`delivery_zones.${i}.fee`) ?? "0").trim();
    if (!name) continue;
    zones.push({ name, fee: Number(feeRaw) || 0 });
  }
  return zones;
}
