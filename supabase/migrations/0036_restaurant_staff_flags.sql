-- Indica si el restaurante maneja personal propio de delivery y/o de
-- cocina. Al activarlos se habilitan los menús "Delivery" y "Cocina" en
-- el admin, donde se administra el personal, y en Pedidos aparecen las
-- acciones de asignar delivery / enviar a cocina.

alter table public.restaurants
  add column if not exists manages_delivery_staff boolean not null default false,
  add column if not exists manages_kitchen_staff boolean not null default false;
