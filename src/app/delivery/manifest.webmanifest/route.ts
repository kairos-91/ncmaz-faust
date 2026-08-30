import { NextResponse } from "next/server";

// Sin este manifest el panel de delivery no se puede instalar como app — y
// sin instalarlo, iOS/Safari nunca entrega notificaciones push (las
// bloquea fuera de una PWA en modo standalone), aunque el navegador haya
// aceptado el permiso.
export async function GET() {
  return NextResponse.json(
    {
      name: "Levery Delivery",
      short_name: "Levery",
      start_url: "/delivery",
      scope: "/delivery",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#84cc16",
      icons: [
        { src: "/icon.png", sizes: "192x192", type: "image/png" },
        { src: "/icon.png", sizes: "512x512", type: "image/png" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
