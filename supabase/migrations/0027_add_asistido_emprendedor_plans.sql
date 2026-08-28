-- Agrega los planes "Asistido" y "Emprendedor", con las mismas
-- funciones que el plan "Pro" (solo cambia nombre, precio y precio
-- anterior tachado).

insert into public.subscription_plans
  (key, name, price_usd, old_price_usd, period, cta_label, duration_days, highlight, features, sort_order)
values
  ('emprendedor', 'Emprendedor', 9.00, 15.00, '/ mes', 'Elegir Emprendedor', 30, false, '[
    "Página de bienvenida y menú público",
    "Menú (platos ilimitados)",
    "Categorías ilimitadas",
    "Etiquetas y platos destacados",
    "Código QR para tus mesas",
    "Pedidos por WhatsApp (ilimitados)",
    "Fotos en cada plato",
    "Reordenar categorías y platos",
    "Datos de contacto y ubicación",
    "Optimizado para celular"
  ]'::jsonb, 4),
  ('asistido', 'Asistido', 19.00, 29.00, '/ mes', 'Elegir Asistido', 30, false, '[
    "Página de bienvenida y menú público",
    "Menú (platos ilimitados)",
    "Categorías ilimitadas",
    "Etiquetas y platos destacados",
    "Código QR para tus mesas",
    "Pedidos por WhatsApp (ilimitados)",
    "Fotos en cada plato",
    "Reordenar categorías y platos",
    "Datos de contacto y ubicación",
    "Optimizado para celular"
  ]'::jsonb, 5)
on conflict (key) do nothing;
