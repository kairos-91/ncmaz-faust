import type { Json } from "@/lib/supabase/database.types";

export type OrderStatus = "pending" | "accepted" | "rejected";

export type OrderItemSnapshot = {
  name: string;
  qty: number;
  unitPrice: number;
  extraNames: string[];
  preferenceNames: string[];
  note?: string;
};

export const ORDER_TYPE_LABELS: Record<string, string> = {
  delivery: "Delivery",
  pickup: "Para retirar",
  dine_in: "Comer en el local",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

export function parseOrderItems(json: Json | null | undefined): OrderItemSnapshot[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter(
      (entry): entry is Record<string, Json> =>
        typeof entry === "object" && entry !== null && !Array.isArray(entry),
    )
    .map((entry) => ({
      name: String(entry.name ?? ""),
      qty: Number(entry.qty) || 0,
      unitPrice: Number(entry.unitPrice) || 0,
      extraNames: Array.isArray(entry.extraNames)
        ? entry.extraNames.map((n) => String(n))
        : [],
      preferenceNames: Array.isArray(entry.preferenceNames)
        ? entry.preferenceNames.map((n) => String(n))
        : [],
      note: typeof entry.note === "string" && entry.note ? entry.note : undefined,
    }));
}

export function topOrderedItems(
  ordersItems: (Json | null | undefined)[],
  limit = 5,
): { name: string; qty: number }[] {
  const counts = new Map<string, number>();
  for (const json of ordersItems) {
    for (const item of parseOrderItems(json)) {
      if (!item.name) continue;
      counts.set(item.name, (counts.get(item.name) ?? 0) + item.qty);
    }
  }
  return [...counts.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}
