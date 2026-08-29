-- Agrega ilustraciones a cada plato/bebida del menú demo de "Vaquita
-- Hot" (slug 'vaquita-hot'). Son ilustraciones planas generadas
-- localmente (no fotos), servidas desde /public/menu-demo/*.svg de la
-- propia app — no dependen de ningún servicio externo.

do $$
declare
  v_restaurant_id uuid;
begin
  select id into v_restaurant_id from public.restaurants where slug = 'vaquita-hot';
  if v_restaurant_id is null then
    raise exception 'No existe ningún restaurante con slug "vaquita-hot".';
  end if;

  update public.menu_items set image_url = case name
    when 'Perro Especial Vaquita' then '/menu-demo/perro-especial-vaquita.svg'
    when 'Perro Doble Carne' then '/menu-demo/perro-doble-carne.svg'
    when 'Perro Criollo' then '/menu-demo/perro-criollo.svg'
    when 'Hamburguesa Vaquita Clásica' then '/menu-demo/hamburguesa-vaquita-clasica.svg'
    when 'Hamburguesa Doble Carne' then '/menu-demo/hamburguesa-doble-carne.svg'
    when 'Hamburguesa BBQ' then '/menu-demo/hamburguesa-bbq.svg'
    when 'Pabellón Criollo' then '/menu-demo/pabellon-criollo.svg'
    when 'Punta Trasera a la Parrilla' then '/menu-demo/punta-trasera-parrilla.svg'
    when 'Chuleta Ahumada' then '/menu-demo/chuleta-ahumada.svg'
    when 'Arepa Reina Pepiada' then '/menu-demo/arepa-reina-pepiada.svg'
    when 'Arepa Dominó' then '/menu-demo/arepa-domino.svg'
    when 'Arepa Pelúa' then '/menu-demo/arepa-pelua.svg'
    when 'Cachapa con Queso de Mano' then '/menu-demo/cachapa-queso-mano.svg'
    when 'Cachapa con Cochino Frito' then '/menu-demo/cachapa-cochino-frito.svg'
    when 'Tequeños (6 unidades)' then '/menu-demo/tequenos.svg'
    when 'Empanadas de Carne Mechada (2 unidades)' then '/menu-demo/empanadas-carne-mechada.svg'
    when 'Yuca Frita' then '/menu-demo/yuca-frita.svg'
    when 'Papelón con Limón' then '/menu-demo/papelon-limon.svg'
    when 'Chicha Criolla' then '/menu-demo/chicha-criolla.svg'
    when 'Malta' then '/menu-demo/malta.svg'
    when 'Refresco' then '/menu-demo/refresco.svg'
    when 'Agua Mineral' then '/menu-demo/agua-mineral.svg'
    when 'Jugo de Parchita' then '/menu-demo/jugo-parchita.svg'
    else image_url
  end
  where restaurant_id = v_restaurant_id;
end $$;
