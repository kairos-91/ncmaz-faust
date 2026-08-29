-- RIF (Registro de Información Fiscal) del restaurante, opcional. Se
-- muestra en el footer del menú público, arriba del crédito "Hecho con
-- Levery".
alter table public.restaurants
  add column if not exists rif text;
