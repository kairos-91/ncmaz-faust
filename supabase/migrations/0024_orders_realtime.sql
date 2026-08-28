-- Habilita Supabase Realtime en orders para que el admin vea pedidos
-- nuevos (insignia roja + lista) sin recargar la página. Las políticas
-- RLS existentes (dueño/staff ven los pedidos de su restaurante) ya
-- aplican también a las suscripciones realtime.

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;

-- replica identity full para que los eventos de UPDATE incluyan la fila
-- completa (necesitamos el status anterior para saber si un pedido dejó
-- de estar pendiente).
alter table public.orders replica identity full;
