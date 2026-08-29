-- Estado/país del restaurante (se muestran en el menú público, ej.
-- "Carabobo, Venezuela") y la insignia de "Verificado" (como la de
-- Instagram) — esta última solo la puede activar el superadmin, igual
-- que is_partner, para que un dueño no pueda auto-verificarse.

alter table public.restaurants
  add column if not exists state text,
  add column if not exists country text not null default 'Venezuela',
  add column if not exists is_verified boolean not null default false;

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
    new.is_verified := old.is_verified;
  end if;
  return new;
end;
$$;
