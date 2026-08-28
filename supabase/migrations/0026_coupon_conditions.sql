-- Condiciones y límites opcionales para cupones: monto mínimo de pedido,
-- tope de usos (total y por cliente), vigencia por fecha de inicio/horario
-- válido/días de la semana, y restricción a ciertos métodos de pago.
-- Todo opcional: los valores por defecto (0, null, [] vacío) equivalen a
-- "sin restricción", igual que el comportamiento actual.

alter table public.coupons
  add column if not exists min_order_amount numeric not null default 0,
  add column if not exists max_total_uses integer,
  add column if not exists max_uses_per_customer integer,
  add column if not exists starts_at timestamptz,
  add column if not exists valid_time_start time,
  add column if not exists valid_time_end time,
  add column if not exists valid_days jsonb not null default '[]'::jsonb,
  add column if not exists valid_payment_methods jsonb not null default '[]'::jsonb;

comment on column public.coupons.valid_days is
  'Días de la semana en que el cupón es válido: ["mon","tue",...] (ver DAY_KEYS en src/lib/opening-hours.ts). Vacío = todos los días.';
comment on column public.coupons.valid_payment_methods is
  'Métodos de pago con los que se puede usar el cupón (ids de src/lib/payment-methods.ts). Vacío = todos.';

-- Cuenta cuántas veces se ha usado un cupón (en total y por teléfono del
-- cliente) para hacer cumplir max_total_uses/max_uses_per_customer desde
-- el checkout público. security definer porque quien aplica el cupón no
-- tiene sesión y "orders" solo lo puede leer el dueño (ver RLS en
-- 0007_orders.sql).
create or replace function public.get_coupon_usage(
  p_restaurant_id uuid,
  p_code text,
  p_customer_phone text
)
returns table(total_uses bigint, customer_uses bigint)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total_uses,
    count(*) filter (where customer_phone = p_customer_phone)::bigint as customer_uses
  from public.orders
  where restaurant_id = p_restaurant_id
    and coupon_code = p_code
    and status <> 'rejected';
$$;

grant execute on function public.get_coupon_usage(uuid, text, text) to anon, authenticated;
