-- Cupones de descuento configurables por restaurante, aplicables en el
-- checkout público. El código se valida contra la lista de cupones
-- activos y no vencidos del restaurante.

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (restaurant_id, code)
);

comment on column public.coupons.code is
  'Código que escribe el cliente en el checkout. Se compara sin distinguir mayúsculas/minúsculas.';
comment on column public.coupons.discount_type is
  '"percent": porcentaje del subtotal. "fixed": monto fijo en la moneda del restaurante.';

alter table public.coupons enable row level security;

create policy "owner can manage their coupons"
  on public.coupons for all
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

create policy "public can read active, non-expired coupons"
  on public.coupons for select
  to anon, authenticated
  using (is_active = true and (expires_at is null or expires_at > now()));

alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists discount_amount numeric not null default 0;

comment on column public.orders.coupon_code is
  'Código de cupón aplicado por el cliente, si usó uno.';
comment on column public.orders.discount_amount is
  'Monto descontado del subtotal por el cupón, ya restado de orders.total.';
