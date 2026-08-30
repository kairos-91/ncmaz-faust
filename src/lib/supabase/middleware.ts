import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El service worker y el manifest deben poder cargarse aunque la sesión
  // haya expirado o el usuario cierre sesión en otra pestaña — si estas
  // rutas quedaran detrás del login, el navegador aborta la actualización
  // del SW, y iOS/Safari no puede leer el manifest para "Agregar a
  // inicio" (sin eso, las notificaciones push nunca llegan en iPhone,
  // aunque el permiso se haya concedido). Ninguna de las dos rutas tiene
  // nada específico del restaurante: son estáticas.
  const ADMIN_PUBLIC_PATHS = [
    "/admin/sw.js",
    "/admin/manifest.webmanifest",
    "/delivery/sw.js",
    "/delivery/manifest.webmanifest",
  ];
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/delivery") ||
      request.nextUrl.pathname.startsWith("/kitchen-board")) &&
    !ADMIN_PUBLIC_PATHS.includes(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
