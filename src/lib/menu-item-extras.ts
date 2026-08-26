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

export function extrasToText(extras: MenuItemExtra[]) {
  return extras.map((e) => `${e.name}, ${e.price}`).join("\n");
}

export function parseExtrasText(text: string): MenuItemExtra[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, priceRaw] = line.split(",");
      return {
        name: (name ?? "").trim(),
        price: Number((priceRaw ?? "0").trim()) || 0,
      };
    })
    .filter((extra) => extra.name.length > 0);
}

export function extrasTotal(extras: MenuItemExtra[], selectedNames: string[]) {
  return selectedNames.reduce((sum, name) => {
    const extra = extras.find((e) => e.name === name);
    return sum + (extra?.price ?? 0);
  }, 0);
}
