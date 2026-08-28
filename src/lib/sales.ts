import { RESTAURANT_TIMEZONE } from "@/lib/opening-hours";

export type SalesOrder = {
  total: number;
  status: string;
  created_at: string;
};

export type DailySales = { day: string; count: number; total: number };

export type SalesSummary = {
  today: number;
  month: number;
  year: number;
  allTime: number;
};

// El servidor corre en UTC; "hoy/este mes/este año" deben calcularse en
// hora de Venezuela o un pedido de las 8pm quedaría contado en el día
// siguiente (mismo criterio que opening-hours.ts).
function caracasParts(date: Date): { year: string; month: string; day: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: RESTAURANT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { year: byType.year, month: byType.month, day: byType.day };
}

export function caracasDayKey(date: Date): string {
  const { year, month, day } = caracasParts(date);
  return `${year}-${month}-${day}`;
}

function acceptedOnly(orders: SalesOrder[]): SalesOrder[] {
  return orders.filter((o) => o.status === "accepted");
}

export function computeSalesSummary(
  orders: SalesOrder[],
  now: Date = new Date(),
): SalesSummary {
  const accepted = acceptedOnly(orders);
  const { year: currentYear, month: currentMonth, day: currentDay } =
    caracasParts(now);
  const todayKey = `${currentYear}-${currentMonth}-${currentDay}`;

  let today = 0;
  let month = 0;
  let year = 0;
  let allTime = 0;

  for (const order of accepted) {
    const { year: y, month: m, day: d } = caracasParts(new Date(order.created_at));
    allTime += order.total;
    if (y === currentYear) year += order.total;
    if (y === currentYear && m === currentMonth) month += order.total;
    if (`${y}-${m}-${d}` === todayKey) today += order.total;
  }

  return { today, month, year, allTime };
}

export function groupSalesByDay(orders: SalesOrder[]): DailySales[] {
  const accepted = acceptedOnly(orders);
  const byDay = new Map<string, DailySales>();
  for (const order of accepted) {
    const day = caracasDayKey(new Date(order.created_at));
    const entry = byDay.get(day) ?? { day, count: 0, total: 0 };
    entry.count += 1;
    entry.total += order.total;
    byDay.set(day, entry);
  }
  return [...byDay.values()].sort((a, b) => b.day.localeCompare(a.day));
}
