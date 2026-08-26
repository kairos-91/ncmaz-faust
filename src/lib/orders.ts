import type { Json } from "@/lib/supabase/database.types";

export type OrderStatus = "pending" | "accepted" | "rejected";

export type OrderItemSnapshot = {
  name: string;
  qty: number;
  unitPrice: number;
  extraNames: string[];
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
    }));
}
