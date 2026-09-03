-- Por defecto el repartidor se queda con el 100% del costo de envío
-- (comportamiento actual, ver restaurantAmount() en src/lib/sales.ts).
-- Con esto el restaurante puede activar un porcentaje distinto: el
-- repartidor recibe ese % del envío y el resto queda como ganancia del
-- restaurante.

alter table public.restaurants
  add column if not exists delivery_fee_percentage_enabled boolean not null default false,
  add column if not exists delivery_staff_fee_percentage numeric not null default 100
    check (delivery_staff_fee_percentage >= 0 and delivery_staff_fee_percentage <= 100);
