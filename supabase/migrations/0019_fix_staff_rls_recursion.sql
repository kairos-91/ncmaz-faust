-- Corrige "infinite recursion detected in policy for relation
-- restaurants": la política de restaurants que deja ver el restaurante
-- al staff consulta restaurant_staff, y la política de restaurant_staff
-- que deja gestionar al dueño consulta restaurants — un ciclo. Postgres
-- lo detecta y aborta la consulta completa, incluso las que solo
-- necesitaban la política original del dueño (auth.uid() = owner_id),
-- porque para resolver el OR entre políticas igual evalúa todas.
--
-- La solución estándar: mover la comprobación cruzada a funciones
-- security definer (mismo patrón que ya usa add_restaurant_staff), que
-- corren evitando el RLS de la tabla que consultan por dentro, así no
-- vuelven a disparar la política de la tabla original.

create or replace function public.is_restaurant_owner(p_restaurant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.restaurants
    where id = p_restaurant_id and owner_id = auth.uid()
  );
$$;

create or replace function public.is_restaurant_staff(p_restaurant_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.restaurant_staff
    where restaurant_id = p_restaurant_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_restaurant_owner(uuid) to authenticated;
grant execute on function public.is_restaurant_staff(uuid) to authenticated;

-- restaurant_staff: el dueño gestiona el staff de su restaurante
drop policy if exists "owner can manage their staff" on public.restaurant_staff;
create policy "owner can manage their staff"
  on public.restaurant_staff for all
  to authenticated
  using (public.is_restaurant_owner(restaurant_id))
  with check (public.is_restaurant_owner(restaurant_id));

-- restaurants: el staff puede ver su restaurante asignado
drop policy if exists "staff can read their assigned restaurant" on public.restaurants;
create policy "staff can read their assigned restaurant"
  on public.restaurants for select
  to authenticated
  using (public.is_restaurant_staff(id));

-- categories: el staff gestiona las de su restaurante
drop policy if exists "staff can manage categories of their restaurant" on public.categories;
create policy "staff can manage categories of their restaurant"
  on public.categories for all
  to authenticated
  using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

-- menu_items: igual
drop policy if exists "staff can manage menu items of their restaurant" on public.menu_items;
create policy "staff can manage menu items of their restaurant"
  on public.menu_items for all
  to authenticated
  using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));

-- orders: el staff ve y actualiza el estado
drop policy if exists "staff can view orders of their restaurant" on public.orders;
create policy "staff can view orders of their restaurant"
  on public.orders for select
  to authenticated
  using (public.is_restaurant_staff(restaurant_id));

drop policy if exists "staff can update orders of their restaurant" on public.orders;
create policy "staff can update orders of their restaurant"
  on public.orders for update
  to authenticated
  using (public.is_restaurant_staff(restaurant_id))
  with check (public.is_restaurant_staff(restaurant_id));
