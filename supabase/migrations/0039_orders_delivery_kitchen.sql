-- Permite asignar un pedido a una persona de delivery y marcar cuándo se
-- envió a cocina, ambos gestionados desde /admin/orders.

alter table public.orders
  add column if not exists delivery_staff_id uuid references public.delivery_staff(id) on delete set null,
  add column if not exists sent_to_kitchen_at timestamptz;

comment on column public.orders.delivery_staff_id is
  'Persona del personal de delivery asignada a este pedido, si aplica.';
comment on column public.orders.sent_to_kitchen_at is
  'Cuándo se envió este pedido a cocina. Null si no se ha enviado.';
