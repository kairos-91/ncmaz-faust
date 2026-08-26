-- Toppings y extras configurables por plato (ej. "Queso extra, 1.00").

alter table public.menu_items
  add column if not exists extras jsonb not null default '[]'::jsonb;

comment on column public.menu_items.extras is
  'Lista de toppings/extras del plato: [{ "name": string, "price": number }]. Forma parseada en src/lib/menu-item-extras.ts.';
