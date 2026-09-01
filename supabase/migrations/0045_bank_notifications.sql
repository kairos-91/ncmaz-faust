-- Verificación automática de pagos de suscripción (restaurante → Levery):
-- un webhook externo (por ejemplo, una app de reenvío de SMS bancarios, o
-- un correo reenviado desde Gmail con Apps Script) manda el texto crudo de
-- la notificación bancaria a /api/bank-notifications. Esa ruta hace un
-- parseo liviano (monto y referencia) en TypeScript y llama a la función
-- de abajo, que guarda la notificación e intenta emparejarla con un pago
-- pendiente en subscription_payments. Si el match es exacto y único
-- (mismo monto y mismos últimos 4 dígitos de referencia), aprueba el pago
-- y extiende el plan automáticamente — mismo efecto que hacer clic en
-- "Aprobar" en /superadmin/payments, sin intervención manual.

-- ── app_secrets: valores sensibles que NINGÚN cliente (ni siquiera el
-- superadmin autenticado) puede leer vía la API REST/RPC normal, porque
-- la tabla tiene RLS activado y cero políticas. Solo las funciones
-- security definer de abajo, que corren con los privilegios del dueño de
-- la función y no están sujetas a RLS, pueden consultarla. Así el secreto
-- del webhook nunca queda expuesto en el bundle del cliente ni en una
-- consulta autenticada normal.
create table if not exists public.app_secrets (
  key text primary key,
  value text not null
);

alter table public.app_secrets enable row level security;

-- ── bank_notifications: historial de notificaciones recibidas ───────────

create table if not exists public.bank_notifications (
  id uuid primary key default gen_random_uuid(),
  raw_text text not null,
  source text,
  bank text,
  amount numeric,
  reference text,
  matched_payment_id uuid references public.subscription_payments(id) on delete set null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists bank_notifications_matched_payment_id_idx
  on public.bank_notifications (matched_payment_id);

alter table public.bank_notifications enable row level security;

drop policy if exists "superadmin can read bank notifications" on public.bank_notifications;
create policy "superadmin can read bank notifications"
  on public.bank_notifications for select
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'));

-- ── parse_bs_amount: normaliza montos en bolívares escritos a mano ──────
-- ("1.234,56", "1234,56", "1234.56") a numeric. Devuelve null si no puede.

create or replace function public.parse_bs_amount(p text)
returns numeric
language plpgsql
immutable
as $$
declare
  v text;
begin
  if p is null then
    return null;
  end if;
  v := regexp_replace(trim(p), '[^0-9,.\-]', '', 'g');
  if v = '' then
    return null;
  end if;
  if position(',' in v) > 0 then
    v := replace(v, '.', '');
    v := replace(v, ',', '.');
  end if;
  return v::numeric;
exception when others then
  return null;
end;
$$;

-- ── Lógica compartida de emparejar + aprobar (no se expone directo) ─────
-- Solo aprueba automáticamente cuando hay exactamente un pago pendiente
-- que coincide en monto exacto y en los últimos 4 dígitos de la
-- referencia — si hay cero o más de un match, se queda pendiente para
-- revisión manual en /superadmin/payments (mismo comportamiento de hoy).

create or replace function public._ingest_and_match_bank_notification(
  p_raw_text text,
  p_source text,
  p_bank text,
  p_amount numeric,
  p_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification_id uuid;
  v_ref_suffix text;
  v_match_count int;
  v_payment_id uuid;
  v_restaurant_id uuid;
  v_plan_id uuid;
  v_duration_days int;
  v_plan_key text;
  v_current_expiry timestamptz;
  v_next_expiry timestamptz;
begin
  insert into public.bank_notifications (raw_text, source, bank, amount, reference)
  values (p_raw_text, p_source, p_bank, p_amount, p_reference)
  returning id into v_notification_id;

  v_ref_suffix := right(regexp_replace(coalesce(p_reference, ''), '\D', '', 'g'), 4);

  if p_amount is null or length(v_ref_suffix) < 4 then
    return null;
  end if;

  select count(*) into v_match_count
  from public.subscription_payments sp
  where sp.status = 'pending'
    and public.parse_bs_amount(sp.amount_paid_bs) = p_amount
    and right(regexp_replace(coalesce(sp.payment_reference, ''), '\D', '', 'g'), 4) = v_ref_suffix;

  if v_match_count <> 1 then
    return null;
  end if;

  select sp.id, sp.restaurant_id, sp.plan_id
  into v_payment_id, v_restaurant_id, v_plan_id
  from public.subscription_payments sp
  where sp.status = 'pending'
    and public.parse_bs_amount(sp.amount_paid_bs) = p_amount
    and right(regexp_replace(coalesce(sp.payment_reference, ''), '\D', '', 'g'), 4) = v_ref_suffix
  limit 1;

  update public.bank_notifications
  set matched_payment_id = v_payment_id
  where id = v_notification_id;

  update public.subscription_payments
  set status = 'approved'
  where id = v_payment_id;

  if v_plan_id is not null then
    select duration_days, key into v_duration_days, v_plan_key
    from public.subscription_plans
    where id = v_plan_id;

    select plan_expires_at into v_current_expiry
    from public.restaurants
    where id = v_restaurant_id;

    v_next_expiry := greatest(now(), coalesce(v_current_expiry, now()))
      + (coalesce(v_duration_days, 0) || ' days')::interval;

    update public.restaurants
    set plan = coalesce(v_plan_key, plan), plan_expires_at = v_next_expiry
    where id = v_restaurant_id;
  end if;

  return v_payment_id;
end;
$$;

-- ── Entrada pública para el webhook externo (gate: secreto compartido) ──

create or replace function public.record_and_match_bank_notification(
  p_secret text,
  p_raw_text text,
  p_source text,
  p_bank text,
  p_amount numeric,
  p_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
begin
  select value into v_secret
  from public.app_secrets
  where key = 'bank_notification_webhook_secret';

  if v_secret is null or p_secret is null or p_secret <> v_secret then
    raise exception 'not_authorized';
  end if;

  return public._ingest_and_match_bank_notification(
    p_raw_text, p_source, p_bank, p_amount, p_reference
  );
end;
$$;

grant execute on function public.record_and_match_bank_notification(text, text, text, text, numeric, text)
  to anon, authenticated;

-- ── Entrada para "probar notificación" desde /superadmin (gate: sesión) ─

create or replace function public.superadmin_test_bank_notification(
  p_raw_text text,
  p_source text,
  p_bank text,
  p_amount numeric,
  p_reference text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') not in ('joseph.ro.silva@gmail.com') then
    raise exception 'not_authorized';
  end if;

  return public._ingest_and_match_bank_notification(
    p_raw_text, p_source, p_bank, p_amount, p_reference
  );
end;
$$;

grant execute on function public.superadmin_test_bank_notification(text, text, text, numeric, text)
  to authenticated;
