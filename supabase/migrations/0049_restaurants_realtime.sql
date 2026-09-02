-- Habilita Supabase Realtime en restaurants para que /admin/subscription
-- se refresque solo cuando el plan se aprueba en segundo plano (la
-- notificación del banco puede llegar minutos después de que el
-- restaurante reportó el pago, mientras sigue con la pantalla abierta).
-- Las políticas RLS existentes (dueño ve/edita su propio restaurante) ya
-- aplican también a las suscripciones realtime.

do $$
begin
  alter publication supabase_realtime add table public.restaurants;
exception
  when duplicate_object then null;
end $$;
