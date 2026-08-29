-- Restaurantes "aliados": el superadmin marca cuáles se muestran en la
-- sección "Aliados" del home. Se protege igual que plan/plan_expires_at
-- (solo el superadmin puede cambiarlo) para que un dueño de restaurante
-- no pueda auto-promocionarse sin curación.

alter table public.restaurants
  add column if not exists is_partner boolean not null default false;

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
    new.is_partner := old.is_partner;
  end if;
  return new;
end;
$$;
