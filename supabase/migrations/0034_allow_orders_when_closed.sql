-- Deja que el restaurante decida si acepta pedidos aunque esté fuera de
-- su horario configurado (opening_hours). Por defecto sigue igual que
-- antes: sin esto activado, el menú público bloquea el carrito cuando
-- el restaurante está cerrado.
alter table public.restaurants
  add column if not exists allow_orders_when_closed boolean not null default false;
