-- Costo de empaque opcional, configurable por restaurante. Si está
-- activado, se suma al total del pedido solo cuando es delivery o para
-- retirar (no aplica a "comer en el local", que no usa empaque).

alter table public.restaurants
  add column if not exists packaging_fee_enabled boolean not null default false,
  add column if not exists packaging_fee numeric not null default 0;

alter table public.orders
  add column if not exists packaging_fee numeric not null default 0;

comment on column public.orders.packaging_fee is
  'Costo de empaque cobrado en este pedido (si el restaurante lo tenía activado para delivery/pickup), ya sumado a orders.total.';
