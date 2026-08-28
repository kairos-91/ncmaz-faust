-- Número de WhatsApp de soporte de Levery, configurable desde
-- /superadmin/payment-methods. Se expone también vía una función
-- security definer porque el botón flotante del home lo necesita leer
-- sin sesión (rol anon), y platform_settings solo es legible por
-- usuarios autenticados.

alter table public.platform_settings
  add column if not exists whatsapp_number text not null default '';

create or replace function public.get_platform_whatsapp_number()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select whatsapp_number from public.platform_settings where id = true;
$$;

grant execute on function public.get_platform_whatsapp_number() to anon, authenticated;
