"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireDeliveryStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const { data: deliveryStaff } = await supabase
    .from("delivery_staff")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!deliveryStaff) throw new Error("No autorizado");

  return { supabase, deliveryStaffId: deliveryStaff.id };
}

export async function acceptDeliveryAssignment(orderId: string) {
  const { supabase, deliveryStaffId } = await requireDeliveryStaff();
  const { error } = await supabase
    .from("orders")
    .update({ delivery_accepted_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("delivery_staff_id", deliveryStaffId);
  if (error) throw new Error(error.message);
  revalidatePath("/delivery");
}

export async function rejectDeliveryAssignment(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_delivery_assignment", {
    p_order_id: orderId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/delivery");
}

export async function markOrderDelivered(orderId: string) {
  const { supabase, deliveryStaffId } = await requireDeliveryStaff();
  const { error } = await supabase
    .from("orders")
    .update({ delivered_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("delivery_staff_id", deliveryStaffId);
  if (error) throw new Error(error.message);
  revalidatePath("/delivery");
}
