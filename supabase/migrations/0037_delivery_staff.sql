-- Roster de personal de delivery del restaurante (sin cuenta/login), para
-- poder asignarlo a los pedidos desde /admin/orders.

create table if not exists public.delivery_staff (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists delivery_staff_restaurant_id_idx
  on public.delivery_staff(restaurant_id);

alter table public.delivery_staff enable row level security;

create policy "owner can manage their delivery staff"
  on public.delivery_staff for all
  to authenticated
  using (public.is_restaurant_owner(restaurant_id))
  with check (public.is_restaurant_owner(restaurant_id));

create policy "staff can view delivery staff of their restaurant"
  on public.delivery_staff for select
  to authenticated
  using (public.is_restaurant_staff(restaurant_id));
