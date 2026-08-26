"use server";

import { createClient } from "@/lib/supabase/server";
import type { OrderItemSnapshot } from "@/lib/orders";

export async function createOrder(
  restaurantId: string,
  input: {
    orderType: "delivery" | "pickup" | "dine_in";
    customerName: string;
    customerPhone: string;
    address?: string;
    tableNumber?: string;
    deliveryZone?: string;
    deliveryFee?: number;
    items: OrderItemSnapshot[];
    total: number;
    currency: string;
    paymentMethod?: string;
    bankPaidFrom?: string;
    reference?: string;
    amountPaid?: string;
    receiptUrl?: string;
  },
) {
  if (!input.customerName.trim() || !input.customerPhone.trim()) {
    return { error: "Faltan los datos del cliente" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      restaurant_id: restaurantId,
      order_type: input.orderType,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone.trim(),
      address: input.address?.trim() || null,
      table_number: input.tableNumber?.trim() || null,
      delivery_zone: input.deliveryZone?.trim() || null,
      delivery_fee: input.deliveryFee ?? 0,
      items: input.items,
      total: input.total,
      currency: input.currency,
      payment_method: input.paymentMethod || null,
      bank_paid_from: input.bankPaidFrom || null,
      payment_reference: input.reference || null,
      amount_paid: input.amountPaid || null,
      receipt_url: input.receiptUrl || null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  return { id: data.id };
}

export async function uploadOrderReceipt(
  restaurantId: string,
  formData: FormData,
) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No se recibió ninguna imagen" };
  if (!file.type.startsWith("image/")) {
    return { error: "El comprobante debe ser una imagen" };
  }

  const supabase = await createClient();
  const ext = file.type.split("/")[1] ?? "png";
  const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("order-receipts")
    .upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const url = supabase.storage.from("order-receipts").getPublicUrl(path).data
    .publicUrl;
  return { url };
}
