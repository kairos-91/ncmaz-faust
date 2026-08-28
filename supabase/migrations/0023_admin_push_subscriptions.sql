-- Suscripciones push del dueño/staff del restaurante (distintas de
-- push_subscriptions, que son de los clientes). Se usan para avisarle
-- al restaurante, con notificación del sistema, cuando entra un pedido
-- nuevo desde el menú público.

create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, endpoint)
);

alter table public.admin_push_subscriptions enable row level security;

create policy "owner or staff can manage their own subscription"
  on public.admin_push_subscriptions for all
  to authenticated
  using (
    user_id = auth.uid()
    and (public.is_restaurant_owner(restaurant_id) or public.is_restaurant_staff(restaurant_id))
  )
  with check (
    user_id = auth.uid()
    and (public.is_restaurant_owner(restaurant_id) or public.is_restaurant_staff(restaurant_id))
  );

create index if not exists admin_push_subscriptions_restaurant_id_idx
  on public.admin_push_subscriptions (restaurant_id);

-- createOrder() se ejecuta sin sesión (lo dispara un cliente anónimo desde
-- el menú público) y necesita avisarle al restaurante — igual que
-- is_restaurant_owner/restaurant_rating, se usan funciones security
-- definer para exponer solo lo necesario sin abrir la tabla por RLS.

create or replace function public.get_admin_push_subscriptions(p_restaurant_id uuid)
returns table (endpoint text, p256dh text, auth text)
language sql
security definer
stable
set search_path = public
as $$
  select endpoint, p256dh, auth
  from public.admin_push_subscriptions
  where restaurant_id = p_restaurant_id;
$$;

grant execute on function public.get_admin_push_subscriptions(uuid) to anon, authenticated;

create or replace function public.delete_admin_push_subscription(p_endpoint text)
returns void
language sql
security definer
as $$
  delete from public.admin_push_subscriptions where endpoint = p_endpoint;
$$;

grant execute on function public.delete_admin_push_subscription(text) to anon, authenticated;
