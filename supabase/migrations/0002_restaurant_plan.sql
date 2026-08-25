-- Agrega el plan de suscripción del restaurante (gestión manual, sin pasarela de pago)

alter table public.restaurants
  add column if not exists plan text not null default 'trial'
    check (plan in ('trial', 'pro', 'annual'));

comment on column public.restaurants.plan is
  'Plan actual del restaurante. Se activa manualmente tras confirmar el pago (Pago Móvil, Transferencia, Zelle, Binance, Zinli o Wally) — no hay pasarela de pago automática.';
