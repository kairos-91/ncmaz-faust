import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

// Ventana fija respaldada por Postgres (check_rate_limit en
// 0055_rate_limiting.sql), pensada para Server Actions y Route Handlers
// que corren sin sesión (checkout público, reseñas, comprobantes,
// webhook de banco) — no hay memoria compartida entre invocaciones
// serverless, así que un contador en RAM no serviría.
//
// Falla abierto a propósito: si el RPC falla por lo que sea (blip de
// red, etc.), no queremos bloquear pedidos reales de clientes por un
// problema del rate limiter en sí.
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) return true;
  return data === true;
}

export async function checkIpRateLimit(
  action: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const ip = await getClientIp();
  return checkRateLimit(`${action}:${ip}`, max, windowSeconds);
}
