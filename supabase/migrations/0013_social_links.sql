-- Enlaces a redes sociales del restaurante, mostrados junto al logo en el menú público.

alter table public.restaurants
  add column if not exists instagram_url text,
  add column if not exists tiktok_url text,
  add column if not exists facebook_url text;

comment on column public.restaurants.instagram_url is
  'Enlace a Instagram del restaurante, mostrado junto al logo en /r/[slug].';
comment on column public.restaurants.tiktok_url is
  'Enlace a TikTok del restaurante, mostrado junto al logo en /r/[slug].';
comment on column public.restaurants.facebook_url is
  'Enlace a Facebook del restaurante, mostrado junto al logo en /r/[slug].';
