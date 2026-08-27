-- Un restaurante por dueño. Nada impedía antes que un mismo owner_id
-- terminara con dos filas en restaurants (por ejemplo, si el panel
-- fallaba en mostrar el restaurante existente y el dueño volvía a llenar
-- el formulario de "crear restaurante" creyendo que no tenía uno). Con
-- dos filas, las consultas .maybeSingle() por owner_id empezaban a
-- fallar en todo el panel.
--
-- IMPORTANTE: si tu proyecto ya tiene un owner_id duplicado, este ALTER
-- TABLE va a fallar. Antes de correr esta migración, ve a Table Editor →
-- restaurants, ordena por owner_id y borra manualmente los duplicados
-- (quédate con el que tenga el menú/categorías configurados).

alter table public.restaurants
  add constraint restaurants_owner_id_unique unique (owner_id);
