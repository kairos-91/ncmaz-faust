-- URL de Google Maps del restaurante, visible en el menú público como enlace de "Ubicación".

alter table public.restaurants
  add column if not exists maps_url text;

comment on column public.restaurants.maps_url is
  'Enlace de Google Maps (o similar) hacia la ubicación del restaurante, mostrado en /r/[slug].';
