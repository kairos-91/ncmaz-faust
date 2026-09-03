-- Ubicación GPS del cliente para pedidos delivery, capturada con la
-- Geolocation API del navegador + un pin ajustable en el mapa (ver
-- src/app/[slug]/location-picker.tsx). Opcional: el cliente puede seguir
-- escribiendo solo la dirección de texto si no da permiso de ubicación o
-- prefiere no compartirla.
alter table public.orders
  add column if not exists lat double precision,
  add column if not exists lng double precision;
