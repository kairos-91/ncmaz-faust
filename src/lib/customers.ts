export type CustomerOrder = {
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
  created_at: string;
};

export type CustomerStats = {
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
};

// Agrupa por teléfono (más estable que el nombre, que puede variar entre
// pedidos). Los pedidos totales cuentan cualquier estado; el gasto total
// solo cuenta los aceptados, igual que el resumen de ventas.
export function computeCustomerStats(orders: CustomerOrder[]): CustomerStats[] {
  const byPhone = new Map<string, CustomerStats>();

  for (const order of orders) {
    const phone = order.customer_phone.trim();
    if (!phone) continue;

    const entry = byPhone.get(phone) ?? {
      phone,
      name: order.customer_name.trim(),
      orderCount: 0,
      totalSpent: 0,
      lastOrderAt: order.created_at,
    };
    entry.orderCount += 1;
    if (order.status === "accepted") entry.totalSpent += order.total;
    if (order.created_at >= entry.lastOrderAt) {
      entry.name = order.customer_name.trim();
      entry.lastOrderAt = order.created_at;
    }
    byPhone.set(phone, entry);
  }

  return [...byPhone.values()].sort(
    (a, b) => b.orderCount - a.orderCount || b.totalSpent - a.totalSpent,
  );
}
