-- Pedidos aceptados de demostración para "Vaquita Hot" (slug
-- 'vaquita-hot'), la demo pública enlazada desde el botón "Ver demo"
-- de la landing. Sin pedidos reales, el badge "🔥 Más vendido" (que
-- exige 3+ unidades vendidas en pedidos aceptados, ver [slug]/page.tsx)
-- nunca aparece en la demo — esto le da a "Pabellón" suficiente
-- historial para que se vea funcionando.

do $$
declare
  v_restaurant_id uuid;
  v_currency text;
  v_item_name text := 'Pabellón';
  v_item_price numeric;
  v_already_seeded int;
begin
  select id, currency into v_restaurant_id, v_currency
    from public.restaurants where slug = 'vaquita-hot';
  if v_restaurant_id is null then
    raise notice 'No existe ningún restaurante con slug "vaquita-hot" — no se insertó nada.';
    return;
  end if;

  select price into v_item_price
    from public.menu_items
    where restaurant_id = v_restaurant_id and name = v_item_name
    limit 1;
  if v_item_price is null then
    raise notice 'Vaquita Hot no tiene un plato llamado "%" — no se insertó nada.', v_item_name;
    return;
  end if;

  select count(*) into v_already_seeded
    from public.orders
    where restaurant_id = v_restaurant_id
      and customer_phone = '04120000001';
  if v_already_seeded > 0 then
    raise notice 'Ya existen pedidos demo sembrados para Vaquita Hot — no se insertó nada de nuevo.';
    return;
  end if;

  insert into public.orders
    (restaurant_id, status, order_type, customer_name, customer_phone,
     items, total, currency, created_at)
  values
    (v_restaurant_id, 'accepted', 'pickup', 'María Pérez', '04120000001',
      jsonb_build_array(jsonb_build_object(
        'name', v_item_name, 'qty', 1, 'unitPrice', v_item_price,
        'extraNames', '[]'::jsonb, 'preferenceNames', '[]'::jsonb)),
      v_item_price, v_currency, now() - interval '6 days'),
    (v_restaurant_id, 'accepted', 'dine_in', 'Carlos Gómez', '04120000002',
      jsonb_build_array(jsonb_build_object(
        'name', v_item_name, 'qty', 2, 'unitPrice', v_item_price,
        'extraNames', '[]'::jsonb, 'preferenceNames', '[]'::jsonb)),
      v_item_price * 2, v_currency, now() - interval '4 days'),
    (v_restaurant_id, 'accepted', 'delivery', 'Ana Torres', '04120000003',
      jsonb_build_array(jsonb_build_object(
        'name', v_item_name, 'qty', 1, 'unitPrice', v_item_price,
        'extraNames', '[]'::jsonb, 'preferenceNames', '[]'::jsonb)),
      v_item_price, v_currency, now() - interval '1 days');
end $$;
