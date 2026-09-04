-- Preferencias configurables por plato (ej. "Sin sal", "Sin azúcar", "Sin
-- queso"): igual que los extras, pero sin precio — solo marcan una
-- preferencia del cliente en el pedido.
alter table public.menu_items
  add column if not exists preferences jsonb not null default '[]'::jsonb;

comment on column public.menu_items.preferences is
  'Lista de preferencias del plato (sin costo): [string]. Forma parseada en src/lib/menu-item-preferences.ts.';

-- Precio "antes" del descuento, opcional. Cuando está definido y es mayor
-- que price, el menú público muestra price como precio con descuento y
-- original_price tachado — price sigue siendo el único monto usado en
-- carrito, pedidos y ventas, así que esto es puramente informativo.
alter table public.menu_items
  add column if not exists original_price numeric;

comment on column public.menu_items.original_price is
  'Precio de referencia antes del descuento (opcional). Se muestra tachado en el menú público cuando es mayor que price.';
