-- Zonas de envío configurables por restaurante, con un costo fijo cada
-- una. Se eligen en el checkout público cuando el pedido es delivery, y
-- su costo se suma al total del pedido.

alter table public.restaurants
  add column if not exists delivery_zones jsonb not null default '[]'::jsonb;

comment on column public.restaurants.delivery_zones is
  'Zonas de envío del restaurante: [{ "name": string, "fee": number }]. Forma parseada en src/lib/delivery-zones.ts.';

alter table public.orders
  add column if not exists delivery_zone text,
  add column if not exists delivery_fee numeric not null default 0;

comment on column public.orders.delivery_zone is
  'Nombre de la zona de envío elegida (si el pedido es delivery y el restaurante tiene zonas configuradas).';
comment on column public.orders.delivery_fee is
  'Costo de envío de la zona elegida, ya sumado a orders.total.';
