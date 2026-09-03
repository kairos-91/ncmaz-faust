-- Multi-sucursal: permite que un mismo dueño (owner_id) tenga más de un
-- restaurante. Hasta ahora restaurants_owner_id_unique (0018) lo impedía
-- a propósito, porque en ese momento el panel no sabía elegir "cuál"
-- restaurante mostrar si hubiera más de uno. Ahora sí: /admin usa una
-- cookie (active_restaurant_id) para recordar la sucursal activa, y cada
-- sucursal es una fila independiente en restaurants con su propio plan,
-- suscripción, menú, pedidos y staff — el mismo aislamiento por
-- restaurant_id que ya usa todo el resto del esquema.
alter table public.restaurants
  drop constraint if exists restaurants_owner_id_unique;
