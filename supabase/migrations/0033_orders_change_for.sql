-- Cuando el cliente paga en efectivo y necesita cambio/vuelto, guarda con
-- cuánto va a pagar (ej. "Billete de $20") para que el restaurante sepa
-- cuánto vuelto llevar.
alter table public.orders
  add column if not exists change_for text;
