-- Rate limiting para los endpoints públicos sin sesión (crear pedido,
-- dejar reseña, subir comprobante, webhook de notificaciones bancarias):
-- hasta ahora no había ningún límite, así que cualquiera podía inundar
-- de pedidos falsos a un restaurante o llenar los buckets de storage sin
-- costo alguno para quien lo hace.
--
-- Contador de ventana fija por clave (típicamente "accion:ip" o
-- "accion:restaurantId:ip"), sin depender de infraestructura nueva
-- (Redis/Upstash) — vive en la misma base de datos que ya es el límite
-- de confianza de toda la app. rate_limits, como app_secrets, no tiene
-- ninguna política RLS: solo se lee/escribe desde dentro de
-- check_rate_limit (security definer), nunca directo desde un cliente.
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count int not null default 1
);

alter table public.rate_limits enable row level security;

-- Sube el contador de "key" y devuelve si todavía está dentro del
-- límite. Ventana fija (no deslizante): si ya pasó p_window_seconds
-- desde window_start, reinicia el contador en vez de acumular. El
-- upsert es atómico por fila (Postgres bloquea la fila en conflicto),
-- así que dos llamadas simultáneas con la misma key no se pisan.
create or replace function public.check_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.rate_limits (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case
          when public.rate_limits.window_start > now() - (p_window_seconds || ' seconds')::interval
            then public.rate_limits.count + 1
          else 1
        end,
        window_start = case
          when public.rate_limits.window_start > now() - (p_window_seconds || ' seconds')::interval
            then public.rate_limits.window_start
          else now()
        end
  returning count into v_count;

  -- Limpieza oportunista (1% de las llamadas) en vez de un cron aparte:
  -- este proyecto no tiene pg_cron configurado, y esta tabla solo la usa
  -- este mecanismo, así que no hace falta más que esto para que no
  -- crezca sin límite.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_count <= p_max;
end;
$$;

grant execute on function public.check_rate_limit(text, int, int) to anon, authenticated;
