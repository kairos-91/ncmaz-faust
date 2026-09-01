import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseBankNotification } from "@/lib/bank-notification-parser";
import type { Database } from "@/lib/supabase/database.types";

// Webhook público (sin sesión de Supabase) para recibir notificaciones
// bancarias reenviadas desde afuera — típicamente una app de reenvío de
// SMS en un celular con el chip del banco, o un correo reenviado vía
// Gmail + Apps Script. No usa cookies ni RLS por sesión: la autorización
// vive dentro de record_and_match_bank_notification (0045_bank_notifications.sql),
// que solo procede si "secret" coincide con el valor guardado en
// app_secrets — una tabla que ni siquiera el superadmin autenticado puede
// leer por la API normal.
function anonClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

async function extractParams(request: Request) {
  const url = new URL(request.url);
  const fromQuery = {
    text: url.searchParams.get("text"),
    secret: url.searchParams.get("secret"),
    source: url.searchParams.get("source"),
  };
  if (fromQuery.text) return fromQuery;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}) as Record<string, unknown>);
    return {
      text: typeof body.text === "string" ? body.text : null,
      secret: typeof body.secret === "string" ? body.secret : null,
      source: typeof body.source === "string" ? body.source : null,
    };
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await request.formData().catch(() => null);
    return {
      text: (form?.get("text") as string | null) ?? null,
      secret: (form?.get("secret") as string | null) ?? null,
      source: (form?.get("source") as string | null) ?? null,
    };
  }
  return { text: null, secret: null, source: null };
}

async function handle(request: Request) {
  const { text, secret, source } = await extractParams(request);

  if (!text || !secret) {
    return NextResponse.json(
      { error: "Faltan 'text' y/o 'secret'." },
      { status: 400 },
    );
  }

  const { amount, reference, bank } = parseBankNotification(text);

  const supabase = anonClient();
  const { data, error } = await supabase.rpc("record_and_match_bank_notification", {
    p_secret: secret,
    p_raw_text: text,
    p_source: source,
    p_bank: bank,
    p_amount: amount,
    p_reference: reference,
  });

  if (error) {
    const status = error.message.includes("not_authorized") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ matched: Boolean(data), parsed: { amount, reference, bank } });
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
