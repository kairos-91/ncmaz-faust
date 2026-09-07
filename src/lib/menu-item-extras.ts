import type { Json } from "@/lib/supabase/database.types";

export type MenuItemExtra = { name: string; price: number };

export function parseExtras(json: Json | null | undefined): MenuItemExtra[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter(
      (entry): entry is Record<string, Json> =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry),
    )
    .map((entry) => ({
      name: String(entry.name ?? "").trim(),
      price: Number(entry.price) || 0,
    }))
    .filter((extra) => extra.name.length > 0);
}

// Lee las filas que arma ExtrasFields (extras.0.name, extras.0.price,
// extras.1.name, ...) — se detiene en el primer índice sin nombre, así
// que no importa si el cliente reordenó o borró filas antes de enviar
// el formulario. Mismo patrón que parseDeliveryZonesForm.
export function parseExtrasForm(formData: FormData): MenuItemExtra[] {
  const extras: MenuItemExtra[] = [];
  for (let i = 0; formData.has(`extras.${i}.name`); i++) {
    const name = String(formData.get(`extras.${i}.name`) ?? "").trim();
    const priceRaw = String(formData.get(`extras.${i}.price`) ?? "0").trim();
    if (!name) continue;
    extras.push({ name, price: Number(priceRaw) || 0 });
  }
  return extras;
}

export function extrasTotal(extras: MenuItemExtra[], selectedNames: string[]) {
  return selectedNames.reduce((sum, name) => {
    const extra = extras.find((e) => e.name === name);
    return sum + (extra?.price ?? 0);
  }, 0);
}
