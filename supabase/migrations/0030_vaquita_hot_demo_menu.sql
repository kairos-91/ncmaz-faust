-- Menú completo de demostración para el restaurante "Vaquita Hot"
-- (slug 'vaquita-hot'), comida rápida venezolana: perros calientes,
-- hamburguesas, parrilla, arepas, cachapas, pasapalos y bebidas, con
-- toppings/extras por plato. Pensado para usar como demo del producto.

do $$
declare
  v_restaurant_id uuid;
  v_cat_perros uuid;
  v_cat_hamburguesas uuid;
  v_cat_parrilla uuid;
  v_cat_arepas uuid;
  v_cat_cachapas uuid;
  v_cat_pasapalos uuid;
  v_cat_bebidas uuid;
begin
  select id into v_restaurant_id from public.restaurants where slug = 'vaquita-hot';
  if v_restaurant_id is null then
    raise exception 'No existe ningún restaurante con slug "vaquita-hot". Créalo primero desde /signup.';
  end if;

  if exists (
    select 1 from public.categories
    where restaurant_id = v_restaurant_id and name = 'Perros Calientes'
  ) then
    raise notice 'Vaquita Hot ya tiene la categoría "Perros Calientes" — no se insertó nada (migración ya aplicada).';
    return;
  end if;

  insert into public.categories (restaurant_id, name, sort_order)
    values (v_restaurant_id, 'Perros Calientes', 1) returning id into v_cat_perros;
  insert into public.categories (restaurant_id, name, sort_order)
    values (v_restaurant_id, 'Hamburguesas', 2) returning id into v_cat_hamburguesas;
  insert into public.categories (restaurant_id, name, sort_order)
    values (v_restaurant_id, 'Parrilla', 3) returning id into v_cat_parrilla;
  insert into public.categories (restaurant_id, name, sort_order)
    values (v_restaurant_id, 'Arepas', 4) returning id into v_cat_arepas;
  insert into public.categories (restaurant_id, name, sort_order)
    values (v_restaurant_id, 'Cachapas', 5) returning id into v_cat_cachapas;
  insert into public.categories (restaurant_id, name, sort_order)
    values (v_restaurant_id, 'Pasapalos', 6) returning id into v_cat_pasapalos;
  insert into public.categories (restaurant_id, name, sort_order)
    values (v_restaurant_id, 'Bebidas', 7) returning id into v_cat_bebidas;

  insert into public.menu_items
    (restaurant_id, category_id, name, description, price, extras, sort_order, is_featured, tags)
  values
    (v_restaurant_id, v_cat_perros, 'Perro Especial Vaquita',
      'Pan artesanal, salchicha jumbo, papitas, repollo y salsas de la casa.',
      3.50,
      '[{"name":"Queso amarillo","price":0.5},{"name":"Tocineta","price":0.75},{"name":"Huevo de codorniz","price":0.5},{"name":"Guacamole","price":0.75}]'::jsonb,
      1, true, '{}'),
    (v_restaurant_id, v_cat_perros, 'Perro Doble Carne',
      'Doble salchicha, doble queso y papitas crocantes.',
      4.50,
      '[{"name":"Queso extra","price":0.5},{"name":"Tocineta","price":0.75},{"name":"Jalapeños","price":0.5}]'::jsonb,
      2, false, '{}'),
    (v_restaurant_id, v_cat_perros, 'Perro Criollo',
      'Salchicha, guasacaca, maíz tierno y papitas.',
      3.75,
      '[{"name":"Queso","price":0.5},{"name":"Aguacate","price":0.75}]'::jsonb,
      3, false, '{Picante}'),

    (v_restaurant_id, v_cat_hamburguesas, 'Hamburguesa Vaquita Clásica',
      '100% carne de res, queso amarillo, lechuga, tomate y salsa especial de la casa.',
      5.50,
      '[{"name":"Tocineta","price":1},{"name":"Huevo frito","price":0.75},{"name":"Queso extra","price":0.75},{"name":"Aro de cebolla","price":0.5}]'::jsonb,
      1, true, '{}'),
    (v_restaurant_id, v_cat_hamburguesas, 'Hamburguesa Doble Carne',
      'Doble carne, doble queso cheddar y cebolla caramelizada.',
      7.50,
      '[{"name":"Tocineta","price":1},{"name":"Champiñones","price":0.75}]'::jsonb,
      2, false, '{}'),
    (v_restaurant_id, v_cat_hamburguesas, 'Hamburguesa BBQ',
      'Carne, queso cheddar, salsa BBQ y aros de cebolla crocante.',
      6.50,
      '[{"name":"Tocineta","price":1},{"name":"Jalapeños","price":0.5}]'::jsonb,
      3, false, '{}'),

    (v_restaurant_id, v_cat_parrilla, 'Pabellón Criollo',
      'Carne mechada, caraotas negras, arroz blanco y tajadas dulces.',
      8.90,
      '[{"name":"Huevo frito","price":0.75},{"name":"Queso rallado","price":0.5}]'::jsonb,
      1, true, '{}'),
    (v_restaurant_id, v_cat_parrilla, 'Punta Trasera a la Parrilla',
      'Término a elección, con yuca sancochada y ensalada fresca.',
      11.50,
      '[{"name":"Chimichurri","price":0.5},{"name":"Guasacaca","price":0.5}]'::jsonb,
      2, false, '{}'),
    (v_restaurant_id, v_cat_parrilla, 'Chuleta Ahumada',
      'Con papas doradas y ensalada de la casa.',
      9.90,
      '[{"name":"Queso fundido","price":1}]'::jsonb,
      3, false, '{}'),

    (v_restaurant_id, v_cat_arepas, 'Arepa Reina Pepiada',
      'Pollo guisado, aguacate y mayonesa casera.',
      4.00,
      '[{"name":"Aguacate extra","price":0.75},{"name":"Queso","price":0.5}]'::jsonb,
      1, false, '{}'),
    (v_restaurant_id, v_cat_arepas, 'Arepa Dominó',
      'Caraotas negras y queso blanco rallado.',
      3.50,
      '[{"name":"Aguacate","price":0.75}]'::jsonb,
      2, false, '{Vegetariano}'),
    (v_restaurant_id, v_cat_arepas, 'Arepa Pelúa',
      'Carne mechada y queso amarillo derretido.',
      4.50,
      '[{"name":"Queso extra","price":0.5},{"name":"Aguacate","price":0.75}]'::jsonb,
      3, false, '{}'),

    (v_restaurant_id, v_cat_cachapas, 'Cachapa con Queso de Mano',
      'Cachapa dulce de maíz con queso de mano derretido.',
      5.00,
      '[{"name":"Nata","price":0.5},{"name":"Queso extra","price":0.5}]'::jsonb,
      1, false, '{}'),
    (v_restaurant_id, v_cat_cachapas, 'Cachapa con Cochino Frito',
      'Con trozos de cochino frito bien crocante.',
      6.50,
      '[{"name":"Nata","price":0.5},{"name":"Queso extra","price":0.5}]'::jsonb,
      2, false, '{}'),

    (v_restaurant_id, v_cat_pasapalos, 'Tequeños (6 unidades)',
      'Palitos de queso envueltos en masa crocante, fritos al momento.',
      4.00,
      '[]'::jsonb,
      1, true, '{}'),
    (v_restaurant_id, v_cat_pasapalos, 'Empanadas de Carne Mechada (2 unidades)',
      'Masa de maíz rellena de carne mechada guisada.',
      3.00,
      '[]'::jsonb,
      2, false, '{}'),
    (v_restaurant_id, v_cat_pasapalos, 'Yuca Frita',
      'Con guasacaca casera.',
      2.50,
      '[{"name":"Guasacaca extra","price":0.5}]'::jsonb,
      3, false, '{Vegetariano}'),

    (v_restaurant_id, v_cat_bebidas, 'Papelón con Limón',
      'Refrescante bebida de papelón y limón.',
      1.50, '[]'::jsonb, 1, false, '{}'),
    (v_restaurant_id, v_cat_bebidas, 'Chicha Criolla',
      'Cremosa chicha venezolana.',
      2.00, '[]'::jsonb, 2, false, '{}'),
    (v_restaurant_id, v_cat_bebidas, 'Malta',
      null,
      1.50, '[]'::jsonb, 3, false, '{}'),
    (v_restaurant_id, v_cat_bebidas, 'Refresco',
      'Coca-Cola, Sprite o Fanta.',
      1.25, '[]'::jsonb, 4, false, '{}'),
    (v_restaurant_id, v_cat_bebidas, 'Agua Mineral',
      null,
      1.00, '[]'::jsonb, 5, false, '{}'),
    (v_restaurant_id, v_cat_bebidas, 'Jugo de Parchita',
      'Natural, endulzado al gusto.',
      1.75, '[]'::jsonb, 6, false, '{}');
end $$;
