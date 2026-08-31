-- Permite que un usuario borre su propia cuenta desde el menú de perfil en
-- /admin (solo cuentas registradas por correo; las de Google se gestionan
-- desde Google). Al borrar la fila de auth.users se dispara la cascada que
-- ya existe desde 0001_init.sql (restaurants.owner_id references
-- auth.users(id) on delete cascade, y de ahí en cascada categories,
-- menu_items, orders, coupons, reviews, delivery_staff, etc.), así que el
-- restaurante completo desaparece y su slug/URL queda libre para volver a
-- usarse. Va en función security definer porque un usuario autenticado
-- normal no tiene permiso para borrar filas de auth.users — mismo patrón
-- que add_restaurant_staff (0017) y link_delivery_staff_user (0041).
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
