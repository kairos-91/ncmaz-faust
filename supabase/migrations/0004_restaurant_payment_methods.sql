-- Métodos de pago propios de cada restaurante (para cobrar a SUS clientes),
-- distintos de los de Levery en /admin/subscription (para pagarle a Levery).

alter table public.restaurants
  add column if not exists payment_methods jsonb not null default '{}'::jsonb;

comment on column public.restaurants.payment_methods is
  'Config de métodos de pago del restaurante (Pago Móvil, Transferencia, Zelle, Binance, Zinli, Wally) para el checkout del menú público. Forma parseada/normalizada en src/lib/payment-methods.ts.';
