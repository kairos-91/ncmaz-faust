-- Suscripciones push de cada repartidor (por dispositivo), para avisarle
-- cuando el restaurante le asigna un pedido nuevo. Mismo patrón que
-- admin_push_subscriptions, pero por delivery_staff en vez de por
-- restaurante completo: cada repartidor solo recibe sus propios avisos.

create table if not exists public.delivery_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  delivery_staff_id uuid not null references public.delivery_staff(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (delivery_staff_id, endpoint)
);

create index if not exists delivery_push_subscriptions_staff_id_idx
  on public.delivery_push_subscriptions (delivery_staff_id);

alter table public.delivery_push_subscriptions enable row level security;

create policy "delivery staff can manage their own push subscriptions"
  on public.delivery_push_subscriptions for all
  to authenticated
  using (
    exists (
      select 1 from public.delivery_staff ds
      where ds.id = delivery_staff_id and ds.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.delivery_staff ds
      where ds.id = delivery_staff_id and ds.user_id = auth.uid()
    )
  );

-- El dueño/staff del restaurante necesita leerlas para poder enviar el
-- push al asignar un pedido desde /admin/orders.
create policy "restaurant staff can view push subscriptions of their delivery staff"
  on public.delivery_push_subscriptions for select
  to authenticated
  using (
    exists (
      select 1 from public.delivery_staff ds
      where ds.id = delivery_staff_id
        and (
          public.is_restaurant_owner(ds.restaurant_id)
          or public.is_restaurant_staff(ds.restaurant_id)
        )
    )
  );
