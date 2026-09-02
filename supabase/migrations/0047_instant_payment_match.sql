-- Hasta ahora, el emparejamiento automático solo funcionaba en una
-- dirección: notificación del banco llega → busca un pago pendiente. Si
-- el restaurante reporta el pago DESPUÉS de que ya llegó la notificación
-- (lo más común: paga, y unos minutos después entra a la app a llenar el
-- formulario), la notificación se queda "sin match" y nunca se revisa de
-- nuevo. Esta migración agrega la dirección contraria: al reportar el
-- pago, se revisa al toque si ya hay una notificación sin emparejar que
-- coincida — así la aprobación puede sentirse instantánea para el
-- restaurante en vez de depender de que llegue una notificación nueva
-- después.
--
-- De paso, las funciones de emparejamiento ahora devuelven restaurant_id
-- y plan_expires_at (antes solo el id del pago) para poder mandar la
-- notificación push de "pago validado" con los días que quedan, sin una
-- segunda consulta.

create or replace function public._ingest_and_match_bank_notification(
  p_raw_text text,
  p_source text,
  p_bank text,
  p_amount numeric,
  p_reference text
)
returns table (payment_id uuid, restaurant_id uuid, plan_expires_at timestamptz)
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
    return;
  end if;

  select count(*) into v_match_count
  from public.subscription_payments sp
  where sp.status = 'pending'
    and public.parse_bs_amount(sp.amount_paid_bs) = p_amount
    and right(regexp_replace(coalesce(sp.payment_reference, ''), '\D', '', 'g'), 4) = v_ref_suffix;

  if v_match_count <> 1 then
    return;
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

  return query select v_payment_id, v_restaurant_id, v_next_expiry;
end;
$$;

create or replace function public.record_and_match_bank_notification(
  p_secret text,
  p_raw_text text,
  p_source text,
  p_bank text,
  p_amount numeric,
  p_reference text
)
returns table (payment_id uuid, restaurant_id uuid, plan_expires_at timestamptz)
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

  return query
  select * from public._ingest_and_match_bank_notification(
    p_raw_text, p_source, p_bank, p_amount, p_reference
  );
end;
$$;

grant execute on function public.record_and_match_bank_notification(text, text, text, text, numeric, text)
  to anon, authenticated;

create or replace function public.superadmin_test_bank_notification(
  p_raw_text text,
  p_source text,
  p_bank text,
  p_amount numeric,
  p_reference text
)
returns table (payment_id uuid, restaurant_id uuid, plan_expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') not in ('joseph.ro.silva@gmail.com') then
    raise exception 'not_authorized';
  end if;

  return query
  select * from public._ingest_and_match_bank_notification(
    p_raw_text, p_source, p_bank, p_amount, p_reference
  );
end;
$$;

grant execute on function public.superadmin_test_bank_notification(text, text, text, numeric, text)
  to authenticated;

-- ── Emparejamiento en la dirección contraria: al reportar el pago ───────

create or replace function public.match_new_subscription_payment(p_payment_id uuid)
returns table (matched boolean, restaurant_id uuid, plan_expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id uuid;
  v_plan_id uuid;
  v_amount numeric;
  v_reference text;
  v_ref_suffix text;
  v_match_count int;
  v_notification_id uuid;
  v_duration_days int;
  v_plan_key text;
  v_current_expiry timestamptz;
  v_next_expiry timestamptz;
begin
  select sp.restaurant_id, sp.plan_id, public.parse_bs_amount(sp.amount_paid_bs), sp.payment_reference
  into v_restaurant_id, v_plan_id, v_amount, v_reference
  from public.subscription_payments sp
  where sp.id = p_payment_id and sp.status = 'pending';

  if v_restaurant_id is null then
    return query select false, null::uuid, null::timestamptz;
    return;
  end if;

  if not public.is_restaurant_owner(v_restaurant_id) then
    raise exception 'not_authorized';
  end if;

  v_ref_suffix := right(regexp_replace(coalesce(v_reference, ''), '\D', '', 'g'), 4);

  if v_amount is null or length(v_ref_suffix) < 4 then
    return query select false, v_restaurant_id, null::timestamptz;
    return;
  end if;

  select count(*) into v_match_count
  from public.bank_notifications bn
  where bn.matched_payment_id is null
    and bn.amount = v_amount
    and right(regexp_replace(coalesce(bn.reference, ''), '\D', '', 'g'), 4) = v_ref_suffix;

  if v_match_count <> 1 then
    return query select false, v_restaurant_id, null::timestamptz;
    return;
  end if;

  select bn.id into v_notification_id
  from public.bank_notifications bn
  where bn.matched_payment_id is null
    and bn.amount = v_amount
    and right(regexp_replace(coalesce(bn.reference, ''), '\D', '', 'g'), 4) = v_ref_suffix
  limit 1;

  update public.bank_notifications set matched_payment_id = p_payment_id where id = v_notification_id;
  update public.subscription_payments set status = 'approved' where id = p_payment_id;

  if v_plan_id is not null then
    select duration_days, key into v_duration_days, v_plan_key
    from public.subscription_plans where id = v_plan_id;

    select plan_expires_at into v_current_expiry
    from public.restaurants where id = v_restaurant_id;

    v_next_expiry := greatest(now(), coalesce(v_current_expiry, now()))
      + (coalesce(v_duration_days, 0) || ' days')::interval;

    update public.restaurants
    set plan = coalesce(v_plan_key, plan), plan_expires_at = v_next_expiry
    where id = v_restaurant_id;
  end if;

  return query select true, v_restaurant_id, v_next_expiry;
end;
$$;

grant execute on function public.match_new_subscription_payment(uuid) to authenticated;
