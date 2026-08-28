import { createClient } from "@/lib/supabase/server";

// Se usa solo mientras el superadmin no haya configurado un número real
// en /superadmin/payment-methods.
const FALLBACK_WHATSAPP_NUMBER = "584120000000";

export async function getSupportWhatsappNumber() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_platform_whatsapp_number");
  return data?.trim() || FALLBACK_WHATSAPP_NUMBER;
}
