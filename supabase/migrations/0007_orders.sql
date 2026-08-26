-- Pedidos hechos desde el menú público (/r/[slug]), para gestionarlos
-- desde /admin/orders (aceptar/rechazar, ver tipo de entrega, datos del
-- cliente y datos del pago). Quien inserta normalmente no tiene sesión
-- (es un cliente del restaurante), así que insert queda abierto a "anon",
-- igual que el bucket order-receipts. Solo el dueño del restaurante puede
-- ver y actualizar sus propios pedidos.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  order_type text not null check (order_type in ('delivery', 'pickup', 'dine_in')),
  customer_name text not null,
  customer_phone text not null,
  address text,
  table_number text,
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  currency text not null default 'USD',
  payment_method text,
  bank_paid_from text,
  payment_reference text,
  amount_paid text,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.orders.items is
  'Snapshot de los platos pedidos: [{ "name": string, "qty": number, "unitPrice": number, "extraNames": string[] }]. Forma parseada en src/lib/orders.ts.';

alter table public.orders enable row level security;

create policy "anyone can create an order for a published restaurant"
  on public.orders for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_published = true
    )
  );

create policy "owner can view their restaurant's orders"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create policy "owner can update their restaurant's orders"
  on public.orders for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create index if not exists orders_restaurant_id_created_at_idx
  on public.orders (restaurant_id, created_at desc);
