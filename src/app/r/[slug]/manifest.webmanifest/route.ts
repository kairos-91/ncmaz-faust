import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, theme_color, logo_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  const name = restaurant?.name ?? "Menú digital";
  const icons = restaurant?.logo_url
    ? [
        { src: restaurant.logo_url, sizes: "192x192", type: "image/png" },
        { src: restaurant.logo_url, sizes: "512x512", type: "image/png" },
      ]
    : [];

  return NextResponse.json(
    {
      name,
      short_name: name,
      start_url: `/r/${slug}`,
      scope: `/r/${slug}`,
      display: "standalone",
      background_color: "#ffffff",
      theme_color: restaurant?.theme_color ?? "#f97316",
      icons,
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
