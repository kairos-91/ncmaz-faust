import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Dominios externos reales que carga la app — hay que mantener esta
// lista al día si se agrega algún recurso externo nuevo:
//   - Supabase (API/Auth vía https, Realtime vía wss) — url del proyecto.
//   - unpkg.com — íconos del pin de Leaflet (src/app/[slug]/location-picker.tsx).
//   - *.tile.openstreetmap.org — los tiles del mapa (mismo archivo).
function buildCsp(nonce: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
  const supabaseWs = supabaseOrigin ? supabaseOrigin.replace(/^https:/, "wss:") : "";

  // React en modo desarrollo usa eval() para reconstruir stack traces
  // (herramientas de debug) — nunca en producción, así que esto solo
  // afloja el CSP en `next dev`, no en el sitio real.
  const isDev = process.env.NODE_ENV !== "production";

  const directives = [
    `default-src 'self'`,
    // 'strict-dynamic' hace que los scripts cargados por uno ya
    // confiable (con nonce) también sean confiables — así los chunks
    // que Next.js inyecta dinámicamente no rompen. Los navegadores que
    // no soportan 'strict-dynamic' caen al nonce explícito.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Inline style={{...}} es el patrón que usa toda la app para el
    // color de marca de cada restaurante — no hay forma de dar nonce a
    // atributos style, así que esto necesita 'unsafe-inline' a
    // propósito (CSS no puede ejecutar JS arbitrario; el riesgo real
    // que evita script-src ya está cubierto arriba).
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: ${supabaseOrigin} https://unpkg.com https://*.tile.openstreetmap.org`,
    `font-src 'self'`,
    `connect-src 'self' ${supabaseOrigin} ${supabaseWs}`,
    `worker-src 'self'`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `upgrade-insecure-requests`,
  ];
  return directives.join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = await updateSession(request, requestHeaders);

  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(self), camera=(), microphone=(), payment=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
