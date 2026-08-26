"use server";

import { createClient } from "@/lib/supabase/server";

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
