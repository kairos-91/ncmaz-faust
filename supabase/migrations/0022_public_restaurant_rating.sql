-- Expone solo el promedio de calificación (sin nombres, comentarios ni
-- filas individuales) para mostrarlo en el menú público, ahora que la
-- lectura pública de la tabla reviews está bloqueada (0021). Igual que
-- is_restaurant_owner/is_restaurant_staff, se usa security definer para
-- calcular el agregado sin depender de RLS de reviews.

create or replace function public.restaurant_rating(p_restaurant_id uuid)
returns table (avg_rating numeric, review_count integer)
language sql
security definer
stable
set search_path = public
as $$
  select
    round(avg(rating)::numeric, 1) as avg_rating,
    count(*)::integer as review_count
  from public.reviews
  where restaurant_id = p_restaurant_id
    and is_visible = true;
$$;

grant execute on function public.restaurant_rating(uuid) to anon, authenticated;
