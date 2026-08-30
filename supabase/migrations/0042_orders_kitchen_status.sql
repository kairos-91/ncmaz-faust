-- Estado de preparación en cocina, para el KDS (Kitchen Display System)
-- en /admin/kitchen-staff. Se inicializa en "queued" al enviar el pedido
-- a cocina (sent_to_kitchen_at) y el personal lo va avanzando.

alter table public.orders
  add column if not exists kitchen_status text;

alter table public.orders
  drop constraint if exists orders_kitchen_status_check;
alter table public.orders
  add constraint orders_kitchen_status_check
  check (kitchen_status is null or kitchen_status in ('queued', 'preparing', 'ready'));

comment on column public.orders.kitchen_status is
  'Estado de preparación en cocina: queued, preparing o ready. Null si no está en cocina.';
