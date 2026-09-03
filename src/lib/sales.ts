import { RESTAURANT_TIMEZONE } from "@/lib/opening-hours";

export type SalesOrder = {
  total: number;
  status: string;
  created_at: string;
  payment_method?: string | null;
  order_type?: string;
  delivery_fee?: number;
  delivery_staff_id?: string | null;
  delivery_accepted_at?: string | null;
};

// El envío es ganancia del restaurante solo mientras el restaurante se
// encarga de la entrega. En cuanto el dueño le asigna un repartidor Y
// ese repartidor acepta el pedido (delivery_accepted_at), la parte del
// envío que le corresponde al repartidor (staffSharePercent, 100% por
// defecto — ver "Ganancias de hoy" en /delivery, que suma esa misma
// parte de delivery_fee de sus entregas) deja de contar como ganancia
// del restaurante, para no contarla dos veces. Si el repartidor rechaza
// la asignación, reject_delivery_assignment limpia ambos campos y el
// envío completo vuelve a ser del restaurante automáticamente.
function restaurantAmount(order: SalesOrder, staffSharePercent: number): number {
  const deliveryFee = order.delivery_fee ?? 0;
  const goesToDeliveryStaff =
    order.order_type === "delivery" &&
    Boolean(order.delivery_staff_id) &&
    Boolean(order.delivery_accepted_at);
  if (!goesToDeliveryStaff) return order.total;
  const staffShare = deliveryFee * (staffSharePercent / 100);
  return order.total - staffShare;
}

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
  staffSharePercent = 100,
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
    const amount = restaurantAmount(order, staffSharePercent);
    allTime += amount;
    if (y === currentYear) year += amount;
    if (y === currentYear && m === currentMonth) month += amount;
    if (`${y}-${m}-${d}` === todayKey) today += amount;
  }

  return { today, month, year, allTime };
}

export function groupSalesByDay(
  orders: SalesOrder[],
  staffSharePercent = 100,
): DailySales[] {
  const accepted = acceptedOnly(orders);
  const byDay = new Map<string, DailySales>();
  for (const order of accepted) {
    const day = caracasDayKey(new Date(order.created_at));
    const entry = byDay.get(day) ?? { day, count: 0, total: 0 };
    entry.count += 1;
    entry.total += restaurantAmount(order, staffSharePercent);
    byDay.set(day, entry);
  }
  return [...byDay.values()].sort((a, b) => b.day.localeCompare(a.day));
}

export type MonthlySales = { month: string; total: number };

export function groupSalesByMonth(
  orders: SalesOrder[],
  staffSharePercent = 100,
): MonthlySales[] {
  const accepted = acceptedOnly(orders);
  const byMonth = new Map<string, number>();
  for (const order of accepted) {
    const { year, month } = caracasParts(new Date(order.created_at));
    const key = `${year}-${month}`;
    byMonth.set(
      key,
      (byMonth.get(key) ?? 0) + restaurantAmount(order, staffSharePercent),
    );
  }
  return [...byMonth.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export type PaymentMethodSales = { method: string | null; count: number; total: number };

export function groupSalesByPaymentMethod(
  orders: SalesOrder[],
  staffSharePercent = 100,
): PaymentMethodSales[] {
  const accepted = acceptedOnly(orders);
  const byMethod = new Map<string, PaymentMethodSales>();
  for (const order of accepted) {
    const method = order.payment_method ?? null;
    const key = method ?? "__none__";
    const entry = byMethod.get(key) ?? { method, count: 0, total: 0 };
    entry.count += 1;
    entry.total += restaurantAmount(order, staffSharePercent);
    byMethod.set(key, entry);
  }
  return [...byMethod.values()].sort((a, b) => b.total - a.total);
}

export type SalesPeriod = "today" | "week" | "month" | "year" | "all";

// Lunes = inicio de semana, en hora de Venezuela (mismo criterio que el
// resto del archivo: "esta semana" es de calendario, no "últimos 7 días").
function caracasWeekStartKey(now: Date): string {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TIMEZONE,
    weekday: "short",
  }).format(now);
  const offset = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[weekday] ?? 0;
  return caracasDayKey(new Date(now.getTime() - offset * 86400000));
}

export function filterOrdersByPeriod(
  orders: SalesOrder[],
  period: SalesPeriod,
  now: Date = new Date(),
): SalesOrder[] {
  if (period === "all") return orders;
  const { year: currentYear, month: currentMonth, day: currentDay } = caracasParts(now);
  const todayKey = `${currentYear}-${currentMonth}-${currentDay}`;
  const weekStartKey = caracasWeekStartKey(now);

  return orders.filter((order) => {
    const { year: y, month: m, day: d } = caracasParts(new Date(order.created_at));
    const key = `${y}-${m}-${d}`;
    if (period === "today") return key === todayKey;
    if (period === "week") return key >= weekStartKey && key <= todayKey;
    if (period === "month") return y === currentYear && m === currentMonth;
    return y === currentYear;
  });
}

// Rellena con ceros para que los gráficos siempre tengan un eje continuo,
// aunque no haya ventas todos los días/meses.
export function lastNDays(
  daily: DailySales[],
  now: Date = new Date(),
  n = 30,
): DailySales[] {
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const result: DailySales[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = caracasDayKey(new Date(now.getTime() - i * 86400000));
    result.push(byDay.get(key) ?? { day: key, count: 0, total: 0 });
  }
  return result;
}

export function lastNMonths(
  monthly: MonthlySales[],
  now: Date = new Date(),
  n = 12,
): MonthlySales[] {
  const byMonth = new Map(monthly.map((m) => [m.month, m.total]));
  const { year, month } = caracasParts(now);
  const y = Number(year);
  const m = Number(month);
  const result: MonthlySales[] = [];
  for (let i = n - 1; i >= 0; i--) {
    let targetYear = y;
    let targetMonth = m - i;
    while (targetMonth <= 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    const key = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;
    result.push({ month: key, total: byMonth.get(key) ?? 0 });
  }
  return result;
}
