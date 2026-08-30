-- Ciclo de vida de la entrega de un pedido, para el panel propio del
-- repartidor (/delivery): cuándo aceptó la asignación y cuándo entregó
-- el pedido. Ambos null hasta que el repartidor actúa.

alter table public.orders
  add column if not exists delivery_accepted_at timestamptz,
  add column if not exists delivered_at timestamptz;

comment on column public.orders.delivery_accepted_at is
  'Cuándo el repartidor asignado aceptó hacer esta entrega. Null mientras espera su respuesta.';
comment on column public.orders.delivered_at is
  'Cuándo el repartidor marcó el pedido como entregado.';
