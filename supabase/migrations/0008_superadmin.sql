-- Superadmin de Levery: gestiona la suscripción de cada restaurante
-- (plan, vencimiento, alertas), los pagos que le hacen los restaurantes
-- (con su comprobante), los planes de suscripción disponibles y los
-- métodos de pago propios de Levery para recibir esos pagos.
--
-- El superadmin se identifica por email (no hay un rol de Postgres
-- dedicado). Los correos autorizados están hardcodeados tanto aquí
-- (para las políticas RLS) como en src/lib/superadmin.ts (para las
-- rutas /superadmin en la app) — si agregas o quitas un superadmin,
-- actualiza AMBOS lugares.

-- ── restaurants: vencimiento del plan, protegido de auto-edición ──────

alter table public.restaurants
  add column if not exists plan_expires_at timestamptz;

-- Un dueño de restaurante puede actualizar su propia fila (nombre, logo,
-- etc. — ver policy "owners can update their own restaurants" en
-- 0001_init.sql), pero plan y plan_expires_at solo debe poder cambiarlos
-- el superadmin. RLS no restringe columnas por sí sola, así que este
-- trigger revierte esos dos campos cuando quien edita no es superadmin.
create or replace function public.protect_restaurant_plan_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') not in ('joseph.ro.silva@gmail.com') then
    new.plan := old.plan;
    new.plan_expires_at := old.plan_expires_at;
  end if;
  return new;
end;
$$;

drop trigger if exists restaurants_protect_plan_fields on public.restaurants;
create trigger restaurants_protect_plan_fields
  before update on public.restaurants
  for each row execute function public.protect_restaurant_plan_fields();

drop policy if exists "superadmin can update any restaurant" on public.restaurants;
create policy "superadmin can update any restaurant"
  on public.restaurants for update
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'))
  with check (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'));

drop policy if exists "superadmin can read any restaurant" on public.restaurants;
create policy "superadmin can read any restaurant"
  on public.restaurants for select
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'));

-- ── subscription_plans ─────────────────────────────────────────────

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  price_usd numeric not null default 0,
  old_price_usd numeric,
  period text not null default '/ mes',
  cta_label text not null default 'Elegir plan',
  duration_days integer not null default 30,
  highlight boolean not null default false,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists subscription_plans_set_updated_at on public.subscription_plans;
create trigger subscription_plans_set_updated_at
  before update on public.subscription_plans
  for each row execute function public.set_updated_at();

alter table public.subscription_plans enable row level security;

drop policy if exists "public can read active plans" on public.subscription_plans;
create policy "public can read active plans"
  on public.subscription_plans for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "superadmin can manage plans" on public.subscription_plans;
create policy "superadmin can manage plans"
  on public.subscription_plans for all
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'))
  with check (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'));

insert into public.subscription_plans
  (key, name, price_usd, old_price_usd, period, cta_label, duration_days, highlight, features, sort_order)
values
  ('trial', 'Prueba gratis', 0, null, '/ 15 días', 'Empezar gratis', 15, false, '[
    "Página de bienvenida y menú público",
    "Menú (hasta 30 platos)",
    "Categorías ilimitadas",
    "Etiquetas y platos destacados",
    "Código QR para tus mesas",
    "Pedidos por WhatsApp (limitados)",
    "Fotos en cada plato",
    "Reordenar categorías y platos",
    "Datos de contacto y ubicación",
    "Optimizado para celular"
  ]'::jsonb, 1),
  ('pro', 'Pro', 11.99, 24.99, '/ mes', 'Elegir Pro', 30, true, '[
    "Página de bienvenida y menú público",
    "Menú (platos ilimitados)",
    "Categorías ilimitadas",
    "Etiquetas y platos destacados",
    "Código QR para tus mesas",
    "Pedidos por WhatsApp (ilimitados)",
    "Fotos en cada plato",
    "Reordenar categorías y platos",
    "Datos de contacto y ubicación",
    "Optimizado para celular"
  ]'::jsonb, 2),
  ('annual', 'Anual', 109.99, 143.88, '/ año', 'Elegir Anual', 365, false, '[
    "Página de bienvenida y menú público",
    "Menú (platos ilimitados)",
    "Categorías ilimitadas",
    "Etiquetas y platos destacados",
    "Código QR para tus mesas",
    "Pedidos por WhatsApp (ilimitados)",
    "Fotos en cada plato",
    "Reordenar categorías y platos",
    "Datos de contacto y ubicación",
    "Optimizado para celular"
  ]'::jsonb, 3)
on conflict (key) do nothing;

-- ── subscription_payments: pagos que los restaurantes le hacen a Levery ──

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  plan_name text not null,
  amount_usd numeric not null default 0,
  payment_method text,
  bank_paid_from text,
  payment_reference text,
  amount_paid_bs text,
  receipt_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists subscription_payments_set_updated_at on public.subscription_payments;
create trigger subscription_payments_set_updated_at
  before update on public.subscription_payments
  for each row execute function public.set_updated_at();

alter table public.subscription_payments enable row level security;

drop policy if exists "owner can create their own subscription payments" on public.subscription_payments;
create policy "owner can create their own subscription payments"
  on public.subscription_payments for insert
  to authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

drop policy if exists "owner can read their own subscription payments" on public.subscription_payments;
create policy "owner can read their own subscription payments"
  on public.subscription_payments for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

drop policy if exists "superadmin can read all subscription payments" on public.subscription_payments;
create policy "superadmin can read all subscription payments"
  on public.subscription_payments for select
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'));

drop policy if exists "superadmin can update subscription payments" on public.subscription_payments;
create policy "superadmin can update subscription payments"
  on public.subscription_payments for update
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'))
  with check (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'));

-- ── platform_settings: métodos de pago propios de Levery (fila única) ──

create table if not exists public.platform_settings (
  id boolean primary key default true check (id),
  payment_methods jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists platform_settings_set_updated_at on public.platform_settings;
create trigger platform_settings_set_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

insert into public.platform_settings (id, payment_methods)
values (true, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;

drop policy if exists "authenticated users can read platform settings" on public.platform_settings;
create policy "authenticated users can read platform settings"
  on public.platform_settings for select
  to authenticated
  using (true);

drop policy if exists "superadmin can update platform settings" on public.platform_settings;
create policy "superadmin can update platform settings"
  on public.platform_settings for update
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'))
  with check (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'));
