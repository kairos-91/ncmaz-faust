-- Servicios que ofrece el restaurante (delivery/pickup/comer en el local) y
-- dos comodidades sueltas (wifi, mascotas), visibles en el menú público.

alter table public.restaurants
  add column if not exists services jsonb not null default '[]'::jsonb,
  add column if not exists has_wifi boolean not null default false,
  add column if not exists accepts_pets boolean not null default false;

comment on column public.restaurants.services is
  'Servicios habilitados: ["delivery", "pickup", "dine_in"]. Forma parseada en src/lib/restaurant-services.ts.';
comment on column public.restaurants.has_wifi is
  'Si el restaurante ofrece wifi a los clientes.';
comment on column public.restaurants.accepts_pets is
  'Si el restaurante acepta mascotas.';
