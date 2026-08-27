-- Personal (staff) con acceso limitado al panel de un restaurante: solo
-- pueden gestionar categorías, menú y pedidos. No pueden tocar los datos
-- del restaurante, métodos de pago, suscripción, cupones ni reseñas —
-- esas siguen siendo solo del dueño (owner_id). El dueño agrega staff
-- por correo desde /admin/team; la persona debe ya tener una cuenta
-- creada en Levery (se busca por email en auth.users, que no es
-- consultable directo desde el cliente, de ahí la función RPC).

create table if not exists public.restaurant_staff (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

alter table public.restaurant_staff enable row level security;

create policy "owner can manage their staff"
  on public.restaurant_staff for all
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

create policy "staff can see their own membership"
  on public.restaurant_staff for select
  to authenticated
  using (user_id = auth.uid());

create index if not exists restaurant_staff_user_id_idx
  on public.restaurant_staff (user_id);
create index if not exists restaurant_staff_restaurant_id_idx
  on public.restaurant_staff (restaurant_id);

-- Busca el usuario por correo (requiere acceso a auth.users, de ahí
-- security definer) y lo agrega como staff. Solo el dueño puede llamarla
-- para su propio restaurante.
create or replace function public.add_restaurant_staff(p_restaurant_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if not exists (
    select 1 from public.restaurants
    where id = p_restaurant_id and owner_id = auth.uid()
  ) then
    raise exception 'not_authorized';
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(p_email) limit 1;
  if v_user_id is null then
    raise exception 'user_not_found';
  end if;

  insert into public.restaurant_staff (restaurant_id, user_id, email)
  values (p_restaurant_id, v_user_id, lower(p_email))
  on conflict (restaurant_id, user_id) do nothing;
end;
$$;

grant execute on function public.add_restaurant_staff(uuid, text) to authenticated;

-- restaurants: el staff puede ver (no editar) el restaurante asignado
create policy "staff can read their assigned restaurant"
  on public.restaurants for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurant_staff s
      where s.restaurant_id = restaurants.id and s.user_id = auth.uid()
    )
  );

-- categories: el staff gestiona las de su restaurante asignado
create policy "staff can manage categories of their restaurant"
  on public.categories for all
  to authenticated
  using (
    exists (
      select 1 from public.restaurant_staff s
      where s.restaurant_id = categories.restaurant_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurant_staff s
      where s.restaurant_id = categories.restaurant_id and s.user_id = auth.uid()
    )
  );

-- menu_items: igual
create policy "staff can manage menu items of their restaurant"
  on public.menu_items for all
  to authenticated
  using (
    exists (
      select 1 from public.restaurant_staff s
      where s.restaurant_id = menu_items.restaurant_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurant_staff s
      where s.restaurant_id = menu_items.restaurant_id and s.user_id = auth.uid()
    )
  );

-- orders: el staff puede ver y actualizar el estado (no insertar/eliminar)
create policy "staff can view orders of their restaurant"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurant_staff s
      where s.restaurant_id = orders.restaurant_id and s.user_id = auth.uid()
    )
  );

create policy "staff can update orders of their restaurant"
  on public.orders for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurant_staff s
      where s.restaurant_id = orders.restaurant_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurant_staff s
      where s.restaurant_id = orders.restaurant_id and s.user_id = auth.uid()
    )
  );
