-- Suscripciones a notificaciones push (promociones, descuentos, cupones)
-- por restaurante. Un cliente se suscribe desde el menú público (sin
-- sesión); el dueño puede enviarles un mensaje desde /admin/notifications.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "anyone can subscribe to a published restaurant"
  on public.push_subscriptions for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_published = true
    )
  );

create policy "owner can view their subscriptions"
  on public.push_subscriptions for select
  to authenticated
  using (public.is_restaurant_owner(restaurant_id));

create policy "owner can delete their subscriptions"
  on public.push_subscriptions for delete
  to authenticated
  using (public.is_restaurant_owner(restaurant_id));

create index if not exists push_subscriptions_restaurant_id_idx
  on public.push_subscriptions (restaurant_id);
