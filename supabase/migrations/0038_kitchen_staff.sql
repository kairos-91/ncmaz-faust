-- Roster de personal de cocina del restaurante (sin cuenta/login). Por
-- ahora es informativo (no se asigna a pedidos individuales, ver
-- 0039_orders_delivery_kitchen.sql para "enviar a cocina").

create table if not exists public.kitchen_staff (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists kitchen_staff_restaurant_id_idx
  on public.kitchen_staff(restaurant_id);

alter table public.kitchen_staff enable row level security;

create policy "owner can manage their kitchen staff"
  on public.kitchen_staff for all
  to authenticated
  using (public.is_restaurant_owner(restaurant_id))
  with check (public.is_restaurant_owner(restaurant_id));

create policy "staff can view kitchen staff of their restaurant"
  on public.kitchen_staff for select
  to authenticated
  using (public.is_restaurant_staff(restaurant_id));
