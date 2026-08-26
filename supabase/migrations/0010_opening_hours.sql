-- Horarios de apertura y cierre por día, visibles en el menú público.

alter table public.restaurants
  add column if not exists opening_hours jsonb not null default '[]'::jsonb;

comment on column public.restaurants.opening_hours is
  'Horario semanal: [{ "day": "mon".."sun", "open": "HH:MM", "close": "HH:MM", "closed": boolean }]. Forma parseada en src/lib/opening-hours.ts.';
