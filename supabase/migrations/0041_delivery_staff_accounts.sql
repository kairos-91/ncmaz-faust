-- Permite vincular una persona del roster de delivery_staff a una cuenta
-- de Levery (auth.users), para que tenga su propio panel en /delivery:
-- ver los pedidos que le asignaron, aceptarlos o rechazarlos, marcarlos
-- como entregados y ver sus ganancias del día. Mismo patrón que
-- restaurant_staff/add_restaurant_staff (0017): el dueño vincula por
-- correo, la persona debe ya tener cuenta creada (puede registrarse en
-- /signup).

alter table public.delivery_staff
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists delivery_staff_user_id_idx
  on public.delivery_staff (user_id);

create policy "delivery staff can view their own record"
  on public.delivery_staff for select
  to authenticated
  using (user_id = auth.uid());

-- restaurants: el repartidor puede ver (no editar) el restaurante al que
-- está vinculado.
create policy "delivery staff can read their assigned restaurant"
  on public.restaurants for select
  to authenticated
  using (
    exists (
      select 1 from public.delivery_staff ds
      where ds.restaurant_id = restaurants.id and ds.user_id = auth.uid()
    )
  );

-- orders: el repartidor ve y actualiza (aceptar/entregar) solo los
-- pedidos que tiene asignados.
create policy "delivery staff can view their assigned orders"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1 from public.delivery_staff ds
      where ds.id = orders.delivery_staff_id and ds.user_id = auth.uid()
    )
  );

create policy "delivery staff can update their assigned orders"
  on public.orders for update
  to authenticated
  using (
    exists (
      select 1 from public.delivery_staff ds
      where ds.id = orders.delivery_staff_id and ds.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.delivery_staff ds
      where ds.id = orders.delivery_staff_id and ds.user_id = auth.uid()
    )
  );

-- Vincula (por correo) una fila del roster a una cuenta existente.
-- Solo el dueño del restaurante puede llamarla para su propio roster.
create or replace function public.link_delivery_staff_user(
  p_delivery_staff_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_restaurant_id uuid;
begin
  select restaurant_id into v_restaurant_id
  from public.delivery_staff
  where id = p_delivery_staff_id;

  if v_restaurant_id is null or not public.is_restaurant_owner(v_restaurant_id) then
    raise exception 'not_authorized';
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(p_email) limit 1;
  if v_user_id is null then
    raise exception 'user_not_found';
  end if;

  update public.delivery_staff set user_id = v_user_id where id = p_delivery_staff_id;
end;
$$;

grant execute on function public.link_delivery_staff_user(uuid, text) to authenticated;

-- Rechazar una asignación libera el pedido (delivery_staff_id vuelve a
-- null) para que el restaurante lo reasigne. Va en función security
-- definer porque, tras el update, la fila deja de cumplir la condición
-- de la política de "orders" de arriba (delivery_staff_id ya no es el
-- suyo), y esa misma política es la que evalúa el "with check".
create or replace function public.reject_delivery_assignment(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders o
  set delivery_staff_id = null, delivery_accepted_at = null
  where o.id = p_order_id
    and exists (
      select 1 from public.delivery_staff ds
      where ds.id = o.delivery_staff_id and ds.user_id = auth.uid()
    );
end;
$$;

grant execute on function public.reject_delivery_assignment(uuid) to authenticated;
