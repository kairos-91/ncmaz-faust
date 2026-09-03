# Levery — menú digital para restaurantes

Aplicación web multi-tenant para crear el menú digital de un restaurante:
landing pública con código QR y panel de administración para gestionar
categorías, platos, precios y fotos.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com) — Postgres, Auth y Storage
- [react-hook-form](https://react-hook-form.com) + [zod](https://zod.dev) para formularios y validación

## Estructura

```
src/app/
  page.tsx              Landing de marketing del producto
  (auth)/login           Inicio de sesión
  (auth)/signup           Registro
  auth/callback           Intercambio de código de Supabase Auth
  admin/                   Panel protegido (requiere sesión)
    page.tsx               Onboarding / resumen
    restaurant/             Datos del restaurante + logo
    categories/              CRUD de categorías
    menu/                     CRUD de platos
  [slug]/                  Menú público del restaurante (el que ve el cliente)
  superadmin/              Panel de Levery (requiere email superadmin)
    restaurants/            Plan y vencimiento de cada restaurante
    payments/                Pagos de suscripción recibidos, con comprobante
    plans/                    CRUD de los planes de suscripción
    payment-methods/          Métodos de pago propios de Levery
src/lib/supabase/          Clientes de Supabase (browser, server, middleware)
supabase/migrations/        Esquema SQL + Row Level Security
```

## Superadmin

`/superadmin` es un panel aparte, solo accesible para los correos listados
en `src/lib/superadmin.ts` (`SUPERADMIN_EMAILS`). Desde ahí se puede:

- Ver y cambiar el plan y la fecha de vencimiento de cualquier restaurante,
  y enviarle una alerta de vencimiento por WhatsApp.
- Revisar los pagos de suscripción que hacen los restaurantes, con su
  comprobante, y aprobarlos o rechazarlos — al aprobar uno se extiende
  automáticamente el vencimiento del plan del restaurante.
- Crear, editar y desactivar los planes de suscripción (los que se ven en
  la landing y en `/admin/subscription`).
- Configurar los métodos de pago propios de Levery (Pago Móvil,
  Transferencia, Zelle, etc.) que los restaurantes ven al pagar su plan.

Un usuario con sesión que visite `/admin` y sea superadmin verá un enlace
"Panel superadmin" en el menú lateral.

## Idioma (Español / English)

El home y todo el panel de administración (`/admin`, auth, `/superadmin`)
tienen un selector ES/EN junto al botón de modo oscuro. No usa rutas por
idioma (`/en`, `/es`) — guarda el idioma elegido en una cookie
(`levery-locale`) y renderiza todo el texto de la app desde
`src/lib/i18n/dictionaries.ts` según esa cookie, tanto en componentes de
servidor (`getT()` en `src/lib/i18n/locale.ts`) como pasando el diccionario
como prop a los componentes de cliente.

Fuera de este alcance, intencionalmente:
- El menú público del cliente (`/[slug]`, carrito, checkout) — el
  restaurante suele cargar sus platos en español, así que no se tradujo.
- Los mensajes de validación de formularios que vienen de
  `src/lib/validations.ts` (zod), que corren en los Server Actions sin
  acceso directo a la cookie de idioma.
- Términos bancarios/financieros venezolanos (Pago Móvil, nombres de
  bancos, etc. en `src/lib/payment-methods.ts` y
  `src/lib/venezuelan-banks.ts`) — se dejaron igual en ambos idiomas, como
  cualquier producto financiero local.

Para agregar un nuevo texto: agrégalo en ambos objetos (`es` y `en`) de
`src/lib/i18n/dictionaries.ts` con la misma clave, y usa `getT()` (server)
o recíbelo como prop `t` (client) donde lo necesites.

## Configuración

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta en orden, en el SQL Editor del proyecto:
   - `supabase/migrations/0001_init.sql` — crea las tablas, las políticas de
     RLS y el bucket de imágenes `menu-images`.
   - `supabase/migrations/0002_restaurant_plan.sql` — agrega la columna
     `plan` usada por `/admin/subscription`.
   - `supabase/migrations/0003_payment_proofs_bucket.sql` — bucket
     `payment-proofs` para los comprobantes de pago pegados en
     `/admin/subscription`.
   - `supabase/migrations/0004_restaurant_payment_methods.sql` — columna
     `payment_methods` usada por `/admin/payment-methods` y el checkout
     del menú público.
   - `supabase/migrations/0005_order_receipts_bucket.sql` — bucket
     `order-receipts` para los comprobantes que suben los clientes al
     pagar su pedido (subida pública, sin sesión).
   - `supabase/migrations/0006_menu_item_extras.sql` — columna `extras`
     en `menu_items` para toppings/extras configurables por plato.
   - `supabase/migrations/0007_orders.sql` — tabla `orders` con los
     pedidos hechos desde el menú público, gestionables desde
     `/admin/orders`.
   - `supabase/migrations/0008_superadmin.sql` — columna
     `restaurants.plan_expires_at`, tablas `subscription_plans`,
     `subscription_payments` y `platform_settings`, y las políticas RLS
     del panel `/superadmin`. **Antes de ejecutarla**, reemplaza el email
     `joseph.ro.silva@gmail.com` por el o los correos que deban ser
     superadmin (aparece varias veces en el archivo). Actualiza también
     `SUPERADMIN_EMAILS` en `src/lib/superadmin.ts` con la misma lista —
     ambos deben coincidir.
   - `supabase/migrations/0009_delivery_zones.sql` — columna
     `restaurants.delivery_zones` (zonas de envío configurables desde
     `/admin/restaurant`) y columnas `orders.delivery_zone` /
     `orders.delivery_fee` para registrar la zona y el costo de envío de
     cada pedido.
   - `supabase/migrations/0010_opening_hours.sql` — columna
     `restaurants.opening_hours` con el horario semanal configurable desde
     `/admin/restaurant`, visible en el menú público (`/[slug]`) como un
     indicador de "Abierto ahora" / "Cerrado ahora" y el horario completo.
   - `supabase/migrations/0011_maps_url.sql` — columna
     `restaurants.maps_url` con el enlace de Google Maps configurable desde
     `/admin/restaurant`, mostrado como "Ubicación" en el menú público.
   - `supabase/migrations/0012_restaurant_services.sql` — columnas
     `restaurants.services` (delivery/pickup/comer en el local),
     `restaurants.has_wifi` y `restaurants.accepts_pets`, configurables
     desde `/admin/restaurant` y mostradas como íconos en el menú público.
   - `supabase/migrations/0013_social_links.sql` — columnas
     `restaurants.instagram_url`, `restaurants.tiktok_url` y
     `restaurants.facebook_url`, configurables desde `/admin/restaurant`
     y mostradas como íconos junto al logo en el menú público.
   - `supabase/migrations/0014_coupons.sql` — tabla `coupons` (código,
     tipo de descuento, vencimiento) gestionable desde `/admin/coupons`,
     y columnas `orders.coupon_code` / `orders.discount_amount` para
     registrar el cupón usado en cada pedido. Los cupones activos y no
     vencidos son legibles públicamente (igual que los métodos de pago)
     para poder validarlos desde el checkout sin sesión.
   - `supabase/migrations/0015_reviews.sql` — tabla `reviews` (nombre,
     calificación 1-5, comentario) que los clientes dejan desde el menú
     público. Visibles por defecto; gestionables (ocultar/eliminar)
     desde `/admin/reviews`.
   - `supabase/migrations/0016_menu_views.sql` — tabla `menu_views`: un
     registro por cada carga del menú público, usado en `/admin/analytics`
     para mostrar vistas totales/últimos 30 días, pedidos totales/últimos
     30 días y los platos más pedidos (estos últimos calculados a partir
     de `orders.items`, sin necesitar una tabla nueva).
   - `supabase/migrations/0017_restaurant_staff.sql` — tabla
     `restaurant_staff` y función `add_restaurant_staff(restaurant_id,
     email)` para que el dueño agregue personas de su equipo (deben
     tener cuenta creada en Levery) desde `/admin/team`. El staff puede
     gestionar categorías, menú y pedidos de ese restaurante, pero no
     sus datos, pagos, suscripción, cupones ni reseñas — eso sigue
     siendo solo del dueño. Agrega políticas RLS nuevas (aditivas, no
     reemplazan las del dueño) en `restaurants`, `categories`,
     `menu_items` y `orders`.
   - `supabase/migrations/0018_restaurant_owner_unique.sql` — agrega un
     `unique (owner_id)` en `restaurants` para que nunca un dueño termine
     con dos restaurantes (rompía las consultas `.maybeSingle()` del
     panel). **Antes de correrla**, revisa en Table Editor si ya tienes
     un `owner_id` duplicado y borra la fila de más (quédate con la que
     tenga el menú configurado) — si no, el `ALTER TABLE` va a fallar.
   - `supabase/migrations/0019_fix_staff_rls_recursion.sql` — **corrige un
     bug crítico** de la migración 0017: las políticas RLS de
     `restaurants` y `restaurant_staff` se consultaban una a la otra en
     ciclo, y Postgres respondía "infinite recursion detected in policy
     for relation restaurants" — esto rompía el panel para **todos los
     dueños**, no solo los que tienen staff, porque para resolver el OR
     entre políticas Postgres igual evalúa la del staff. Se corrige
     moviendo esas comprobaciones a funciones `security definer`
     (`is_restaurant_owner`, `is_restaurant_staff`). Ejecútala cuanto
     antes si ya corriste la 0017.
   - `supabase/migrations/0020_push_subscriptions.sql` — tabla
     `push_subscriptions` (endpoint, p256dh, auth) para guardar las
     suscripciones de notificaciones push de los clientes que activan
     "Recibir promociones" en el menú público. RLS: cualquiera puede
     suscribirse a un restaurante publicado, solo el dueño puede leer o
     borrar sus suscripciones.
   - `supabase/migrations/0021_reviews_admin_only.sql` — quita la
     política que permitía leer las reseñas públicamente: ahora solo el
     dueño las ve (en `/admin/reviews`). El menú público ya no muestra el
     listado, solo el botón para dejar una reseña nueva.
   - `supabase/migrations/0022_public_restaurant_rating.sql` — función
     `restaurant_rating(uuid)` (security definer, igual que
     `is_restaurant_owner`) que calcula el promedio y la cantidad de
     reseñas visibles sin exponer las filas individuales; se usa para
     mostrar "★ 4.8" junto al nombre del restaurante en el menú público
     sin depender de la política de lectura pública que se quitó en 0021.
   - `supabase/migrations/0023_admin_push_subscriptions.sql` — tabla
     `admin_push_subscriptions` (distinta de `push_subscriptions`, que es
     de los clientes) para avisarle al dueño/staff, con notificación del
     sistema, cuando entra un pedido nuevo. Incluye las funciones
     `get_admin_push_subscriptions`/`delete_admin_push_subscription`
     (security definer) porque `createOrder()` la dispara un cliente sin
     sesión y necesita leer/limpiar esas suscripciones sin pasar por RLS.
   - `supabase/migrations/0024_orders_realtime.sql` — agrega `orders` a
     la publicación `supabase_realtime` (y `replica identity full`) para
     que el panel admin (insignia de pedidos pendientes en el menú y la
     lista de `/admin/orders`) se actualice solo, sin necesidad de F5,
     cuando entra un pedido nuevo o cambia de estado.
   - `supabase/migrations/0025_packaging_fee.sql` — agrega
     `packaging_fee_enabled`/`packaging_fee` a `restaurants` (configurable
     en Mi restaurante) y `packaging_fee` a `orders`. Si está activado, el
     costo se suma al total del carrito solo en pedidos delivery y para
     retirar (no en "comer en el local").
   - `supabase/migrations/0026_coupon_conditions.sql` — agrega condiciones
     y límites opcionales a `coupons`: monto mínimo de pedido, tope de
     usos (total y por cliente), fecha de inicio, horario y días de la
     semana válidos, y restricción a ciertos métodos de pago. Incluye la
     función `get_coupon_usage` (security definer) para que el checkout
     público pueda contar cuántas veces se usó un cupón sin pasar por la
     política de "orders" (solo el dueño puede leerlas).
   - `supabase/migrations/0027_add_asistido_emprendedor_plans.sql` —
     agrega los planes "Emprendedor" ($9/mes, antes $15) y "Asistido"
     ($19/mes, antes $29) a `subscription_plans`, con las mismas
     funciones que el plan "Pro".
   - `supabase/migrations/0028_platform_whatsapp.sql` — agrega
     `whatsapp_number` a `platform_settings` (configurable desde
     `/superadmin/payment-methods`) y la función `get_platform_whatsapp_number`
     (security definer) para que el botón flotante de WhatsApp del home
     pueda leerlo sin sesión.
   - `supabase/migrations/0029_partner_restaurants.sql` — agrega
     `is_partner` a `restaurants` (solo el superadmin puede activarlo,
     desde /superadmin/restaurants) para la sección "Aliados" del home.
   - `supabase/migrations/0030_vaquita_hot_demo_menu.sql` — carga un
     menú completo (7 categorías, 23 platos con toppings/extras) para
     el restaurante demo "Vaquita Hot" (slug `vaquita-hot`, debe existir
     de antemano). Es seguro correrla más de una vez: si detecta que ya
     tiene el menú cargado, no inserta nada de nuevo.
   - `supabase/migrations/0031_vaquita_hot_menu_images.sql` — asigna una
     ilustración a cada plato/bebida de "Vaquita Hot" (servidas desde
     `/public/menu-demo/*.svg`, generadas localmente, sin depender de
     ningún servicio externo). Requiere haber corrido la 0030 antes.
   - `supabase/migrations/0032_restaurant_state_verified.sql` — agrega
     `state`/`country` a `restaurants` (se muestran en el menú público,
     ej. "Carabobo, Venezuela") y `is_verified` para la insignia de
     verificado tipo Instagram — solo el superadmin puede activarla,
     desde /superadmin/restaurants, igual que `is_partner`.
   - `supabase/migrations/0033_orders_change_for.sql` — agrega
     `change_for` a `orders`: cuando el cliente paga en efectivo y
     necesita cambio/vuelto, guarda con cuánto va a pagar (ej. "Billete
     de $20") para que el restaurante sepa cuánto vuelto llevar.
   - `supabase/migrations/0034_allow_orders_when_closed.sql` — agrega
     `allow_orders_when_closed` a `restaurants` (por defecto
     `false`): si el restaurante lo activa desde /admin/restaurant, el
     menú público sigue aceptando pedidos aunque esté fuera del
     horario configurado.
   - `supabase/migrations/0035_restaurant_rif.sql` — agrega `rif` a
     `restaurants` (opcional): el restaurante lo carga desde
     /admin/restaurant y, si está configurado, se muestra en el menú
     público en el footer, arriba del crédito "Hecho con Levery" (ej.
     "Vaquita Hot J-12345678-9").
   - `supabase/migrations/0036_restaurant_staff_flags.sql` — agrega
     `manages_delivery_staff` y `manages_kitchen_staff` a `restaurants`
     (ambos `false` por defecto). Al activarlos desde /admin/restaurant
     se habilitan los menús "Delivery" y "Cocina" del admin.
   - `supabase/migrations/0037_delivery_staff.sql` — crea la tabla
     `delivery_staff` (roster de personal de delivery por restaurante:
     nombre, teléfono, activo/inactivo), gestionada desde
     /admin/delivery-staff.
   - `supabase/migrations/0038_kitchen_staff.sql` — igual que la
     anterior pero para `kitchen_staff`, gestionada desde
     /admin/kitchen-staff.
   - `supabase/migrations/0039_orders_delivery_kitchen.sql` — agrega
     `delivery_staff_id` (FK a `delivery_staff`) y `sent_to_kitchen_at`
     a `orders`, para poder asignar un repartidor y marcar "enviado a
     cocina" desde /admin/orders.
   - `supabase/migrations/0040_orders_delivery_lifecycle.sql` — agrega
     `delivery_accepted_at` y `delivered_at` a `orders`, para el ciclo
     de vida de la entrega en el panel del repartidor (/delivery).
   - `supabase/migrations/0041_delivery_staff_accounts.sql` — agrega
     `user_id` a `delivery_staff` para vincular una fila del roster a
     una cuenta de Levery (mismo patrón que `restaurant_staff`: el
     dueño vincula por correo desde /admin/delivery-staff, la persona
     debe tener cuenta creada). Agrega las políticas RLS para que un
     repartidor vinculado vea/actualice solo sus pedidos asignados, y
     las funciones `link_delivery_staff_user` y
     `reject_delivery_assignment`. Con la cuenta vinculada, el
     repartidor entra a /delivery: ve los pedidos asignados con los
     datos de contacto del cliente (con link directo a WhatsApp) y la
     dirección, puede aceptar o rechazar cada asignación, marcarla como
     entregada, y ver sus ganancias del día (suma del costo de envío de
     lo entregado).
   - `supabase/migrations/0042_orders_kitchen_status.sql` — agrega
     `kitchen_status` a `orders` (`queued` | `preparing` | `ready`, null
     si no está en cocina). Alimenta el KDS (Kitchen Display System) en
     /admin/kitchen-staff: al enviar un pedido a cocina desde
     /admin/orders queda en "En cola", y desde el tablero se va
     avanzando a "Preparando" y "Listo" hasta completarlo (lo saca del
     tablero). El badge en /admin/orders refleja el estado en vivo.
   - `supabase/migrations/0043_delivery_push_subscriptions.sql` — crea
     `delivery_push_subscriptions` (una fila por dispositivo de cada
     repartidor). Desde /delivery el repartidor activa "Recibir alerta
     de pedidos asignados"; cuando el restaurante le asigna un pedido
     desde /admin/orders, le llega una notificación push (título,
     cliente, total y dirección) aunque no tenga la app abierta.
   - `supabase/migrations/0044_delete_own_account.sql` — crea la función
     `security definer` `delete_own_account()`, que borra la fila de
     `auth.users` del usuario autenticado. Aprovecha la cascada ya
     existente desde `restaurants.owner_id` (y de ahí categorías, menú,
     pedidos, etc.) para borrar todo el restaurante y liberar su slug/URL.
     La usa el menú de perfil en /admin (solo cuentas por correo: las de
     Google se gestionan desde Google) para "Eliminar cuenta".
   - `supabase/migrations/0045_bank_notifications.sql` — verificación
     automática de pagos de suscripción (restaurante → Levery). Crea
     `bank_notifications` (historial de notificaciones bancarias
     recibidas), `app_secrets` (tabla sin políticas RLS, ilegible desde el
     cliente incluso autenticado, para guardar el secreto del webhook) y
     dos funciones `security definer`: `record_and_match_bank_notification`
     (usada por `/api/bank-notifications`, protegida por el secreto
     compartido) y `superadmin_test_bank_notification` (usada por el
     probador en `/superadmin/bank-notifications`, protegida por sesión de
     superadmin). Ambas insertan la notificación y, si hay exactamente un
     pago pendiente cuyo monto y últimos 4 dígitos de referencia coinciden,
     lo aprueban y extienden el plan automáticamente — igual que aprobar a
     mano en `/superadmin/payments`. Después de correr esta migración,
     genera un secreto largo y guárdalo con:
     ```sql
     insert into public.app_secrets (key, value)
     values ('bank_notification_webhook_secret', 'TU_SECRETO_LARGO_AQUI')
     on conflict (key) do update set value = excluded.value;
     ```
   - `supabase/migrations/0046_bank_notifications_delete.sql` — agrega la
     política RLS de `delete` para que el superadmin pueda borrar
     notificaciones bancarias desde `/superadmin/bank-notifications`
     (botón "Limpiar sin match" y borrado individual).
   - `supabase/migrations/0047_instant_payment_match.sql` — agrega la
     dirección contraria de emparejamiento: hasta esta migración, solo se
     revisaba "llega una notificación → busca un pago pendiente que
     coincida". Si el restaurante reporta el pago DESPUÉS de que ya
     llegó la notificación (el caso más común), se quedaba sin revisar
     de nuevo. La nueva función `security definer`
     `match_new_subscription_payment(p_payment_id)` se llama al reportar
     el pago y revisa si ya hay una notificación sin emparejar que
     coincida, aprobando al toque. De paso, `record_and_match_bank_notification`
     y `superadmin_test_bank_notification` ahora devuelven `restaurant_id`
     y `plan_expires_at` (antes solo el id del pago) para poder mandar la
     notificación push de "pago validado" sin una consulta aparte.
   - `supabase/migrations/0048_fix_ambiguous_plan_expires_at.sql` —
     corrige un bug real de la 0047: al declarar
     `returns table (..., plan_expires_at timestamptz)`, Postgres crea una
     variable implícita `plan_expires_at` en el cuerpo de la función, que
     choca con la columna `restaurants.plan_expires_at` cuando se
     selecciona sin calificar con el alias de la tabla ("column reference
     'plan_expires_at' is ambiguous"). Esto rompía por completo la
     aprobación automática (tanto el webhook real como el probador
     manual) desde que se desplegó la 0047.
   - `supabase/migrations/0049_restaurants_realtime.sql` — agrega
     `restaurants` a la publicación `supabase_realtime` para que
     `/admin/subscription` se refresque solo cuando el plan se aprueba en
     segundo plano (la notificación del banco puede llegar minutos
     después de que el restaurante reportó el pago, mientras la pantalla
     sigue abierta) — antes había que recargar a mano (F5) para ver los
     días actualizados.
   - `supabase/migrations/0050_bypass_plan_protection_for_matching.sql` —
     corrige el bug raíz de todo el sistema de verificación automática: el
     trigger `restaurants_protect_plan_fields` (que existe para que solo
     el superadmin autenticado pueda editar `plan`/`plan_expires_at`)
     revertía en silencio cualquier cambio a esos campos que no viniera
     de una sesión con el correo del superadmin — incluyendo las
     funciones `security definer` de emparejamiento automático (el
     webhook no tiene sesión, y el dueño reportando su propio pago
     tampoco es superadmin). El pago quedaba "approved" pero el plan
     nunca se extendía de verdad. Se agrega una bandera de configuración
     local a la transacción (`set_config('app.bypass_plan_protection',
     'on', true)`, se resetea sola al terminar) que solo activan
     `_ingest_and_match_bank_notification` y
     `match_new_subscription_payment` justo antes de su propio `UPDATE` a
     `restaurants`, sin abrirle la puerta a nadie más.
   - `supabase/migrations/0051_multi_branch_restaurants.sql` — multi-sucursal:
     elimina `restaurants_owner_id_unique` (0018), que hasta ahora impedía
     que un mismo dueño (`owner_id`) tuviera más de un restaurante. Cada
     sucursal sigue siendo una fila independiente en `restaurants` con su
     propio menú, pedidos, staff, plan y suscripción — el mismo
     aislamiento por `restaurant_id` que ya usa el resto del esquema, así
     que no hizo falta tocar RLS ni ninguna otra tabla. El panel recuerda
     cuál sucursal está activa con la cookie `active_restaurant_id`
     (`getOwnerRestaurant`/`getStaffRestaurant` en
     `src/lib/get-owner-restaurant.ts`); el switcher junto al logo en
     `/admin` permite cambiar entre sucursales o crear una nueva desde
     `/admin/restaurants/new` (reutiliza `createRestaurant`, que ahora deja
     al dueño repetir el flujo de alta en vez de bloquearlo después de la
     primera sucursal).
   - `supabase/migrations/0052_restaurant_tables.sql` — gestión de mesas
     para pedidos "Comer en el local". Crea `restaurant_tables` (zona,
     nombre/número, capacidad, `is_occupied`) gestionable desde
     `/admin/tables`, con lectura pública para restaurantes publicados
     (la usan tanto el selector de mesas del menú público como la
     pantalla fija al escanear el QR de una mesa) y escritura solo del
     dueño. Agrega `orders.table_id` (referencia opcional a la mesa) y la
     función `security definer` `mark_table_occupied(p_table_id)`, que el
     checkout público y el de admin llaman justo después de crear un
     pedido dine_in con mesa — así no hace falta abrir una política
     pública de `UPDATE` en `restaurant_tables`. Cada mesa tiene su
     propio QR (`/{slug}?table=<id>`, generado con `qr-code-styling` en
     `/admin/tables`) que abre el menú con el pedido fijado en "Comer en
     el local" para esa mesa — sin opción de delivery/pickup. Mientras
     una mesa está ocupada, no aparece en el selector de mesas del menú
     público para quien pide sin haber escaneado un QR específico.
   - `supabase/migrations/0053_order_location.sql` — agrega `lat`/`lng` a
     `orders`. En el checkout público, al pedir delivery el cliente puede
     tocar "Usar mi ubicación actual" (Geolocation API del navegador, sin
     costo ni API key) y ajustar el pin arrastrándolo sobre un mapa
     (Leaflet + tiles de OpenStreetMap, también gratis) antes de enviar el
     pedido — es opcional, sigue pudiendo escribir solo la dirección en
     texto si no da permiso o no quiere compartir su ubicación. Cuando hay
     coordenadas, se agrega un link de Google Maps al mensaje de WhatsApp
     y aparece un "Ver ubicación en el mapa" en `/admin/orders` y en el
     panel del repartidor (`/delivery`), para abrir la ruta con un toque.
   - `supabase/migrations/0054_storage_upload_limits.sql` — cierra un hueco
     de seguridad real: las políticas RLS de `storage.objects` (0001, 0003,
     0005) solo validaban `bucket_id` en el insert, así que cualquiera con
     la anon key (pública, va en cada página) podía subir directo a la API
     de Storage sin pasar por la app — cualquier tipo de archivo, sin
     límite de tamaño. El chequeo de `file.type` que hace el código
     (`uploadImage`, `uploadOrderReceipt`, `uploadPaymentProof`,
     `updateProfileAvatar`, ahora unificados en
     `src/lib/file-validation.ts`) es solo para dar un buen mensaje de
     error en la UI, no una barrera real. Esta migración pone
     `allowed_mime_types` (jpg/png/webp/gif — sin SVG, que puede llevar
     `<script>` embebido) y `file_size_limit` (5 MB) en los buckets
     `menu-images`, `order-receipts` y `payment-proofs`, algo que Supabase
     Storage aplica en su propio endpoint de subida sin importar qué
     cliente haga la petición.
   - `supabase/migrations/0055_rate_limiting.sql` — límite de intentos para
     los endpoints públicos sin sesión, que hasta ahora no tenían ninguno:
     crear pedido, dejar reseña, subir comprobante y el webhook de
     `/api/bank-notifications` (protegido por secreto, pero sin límite de
     intentos alguien podía fuerza-bruteario probando valores sin parar).
     Crea `rate_limits` (contador de ventana fija por clave, sin política
     RLS — como `app_secrets`, solo se toca desde dentro de una función) y
     `check_rate_limit(p_key, p_max, p_window_seconds)`, un `security
     definer` que sube el contador y devuelve si sigue dentro del límite;
     el upsert es atómico por fila, así que no hay condición de carrera
     entre pedidos simultáneos. `src/lib/rate-limit.ts` la envuelve
     (`checkIpRateLimit`, clave por IP + acción, vía el header
     `x-forwarded-for`) y falla abierto si el RPC mismo falla, para no
     bloquear pedidos reales por un problema del rate limiter. Límites:
     8 pedidos / 15 min por restaurante+IP, 5 reseñas / hora por
     restaurante+IP, 15 subidas de comprobante / 15 min por IP, 30
     llamadas al webhook bancario / 10 min por IP. La validación de
     cupones (`checkCoupon` en `src/app/[slug]/actions.ts`) también se
     movió detrás de esta Server Action — antes corría directo en el
     navegador con el cliente anon (`supabase.rpc("get_coupon_usage")` +
     `select` a `coupons`), así que cualquiera podía probar códigos sin
     ningún límite; 20 intentos / 10 min por restaurante+IP.
   - `supabase/migrations/0056_delivery_fee_split.sql` — agrega
     `delivery_fee_percentage_enabled` (boolean, default `false`) y
     `delivery_staff_fee_percentage` (numeric 0-100, default `100`) a
     `restaurants`. Por defecto el repartidor sigue quedándose con el
     100% del envío (comportamiento previo, sin cambios); si el
     restaurante activa la opción, define qué porcentaje del envío se
     lleva el repartidor y el resto pasa a ser ganancia del restaurante.
     Ver "Envío: ¿de quién es la ganancia?" más abajo.
   - `supabase/migrations/0057_cover_position.sql` — agrega
     `cover_position` (text, default `'50% 50%'`, un valor
     `background-position`/`object-position` CSS) a `restaurants`. Se usa
     para recordar dónde quedó la portada al arrastrarla en
     `/admin/restaurant` (`CoverUploader`), en vez de mostrarla siempre
     centrada.
3. Copia `.env.example` a `.env.local` y completa las credenciales de tu
   proyecto (Settings → API). Para las notificaciones push, genera un par
   de claves VAPID con `npx web-push generate-vapid-keys` y agrégalas como
   `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT`
   (esta última es un `mailto:` de contacto):

   ```bash
   cp .env.example .env.local
   ```

4. Para el botón "Continuar con Google" en `/login` y `/signup`, activa el
   provider de Google en el proyecto de Supabase: **Authentication →
   Providers → Google**, con un Client ID/Secret de un proyecto en
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (OAuth consent screen + credencial "Web application"). En ese
   credencial de Google, agrega como **Authorized redirect URI** la URL
   que Supabase muestra en esa misma pantalla
   (`https://<tu-proyecto>.supabase.co/auth/v1/callback`). Sin esto el
   botón muestra un error al hacer clic; el resto de la app funciona
   igual sin configurarlo.
5. El enlace "¿Olvidaste tu contraseña?" de `/login` usa
   `supabase.auth.resetPasswordForEmail` + `/auth/callback` (la misma
   ruta que ya usan la confirmación de registro y "Continuar con
   Google"), así que no requiere configuración adicional en Supabase
   más allá de las URLs de redirect que ya tengas permitidas ahí. Si
   nunca configuraste el envío de correos en el proyecto, Supabase
   usa su SMTP de pruebas con límites bajos — para producción,
   configura un proveedor propio en **Authentication → Emails →
   SMTP Settings**.
6. Instala dependencias y levanta el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

7. Abre [http://localhost:3000](http://localhost:3000). Regístrate en
   `/signup`, crea tu restaurante desde `/admin` y publica tu menú.

## Despliegue

### Vercel

`vercel.json` fija la región de las funciones serverless en `cle1`
(Cleveland, Ohio) para que corran en la misma zona que el proyecto de
Supabase (`us-east-2`, East US / Ohio — confírmalo en tu dashboard de
Supabase en **Settings → General → Project region**) — casi todas las
rutas de esta app son dinámicas (Server Components/Actions que
consultan la base de datos), así que sin esto cada request corría en la
región por defecto de Vercel (`iad1`, Washington D.C.), una zona
distinta a la de la base de datos aunque igual de EE.UU. Si algún día
cambias el proyecto de Supabase a otra región, actualiza `regions` en
`vercel.json` para que coincida.

El proxy (`src/proxy.ts`, antes `middleware.ts`) sí corre siempre en
Edge Runtime — eso lo exige Next.js, no se puede fijar a una región — pero
es una capa liviana (sesión + headers de seguridad); el trabajo pesado
contra la base de datos ya corre en `cle1`.

### VPS propio (PM2 + Nginx)

Supabase sigue siendo el backend en cualquiera de los dos casos — esto
solo mueve dónde corre el proceso de Next.js. Guía completa paso a paso
en [`DEPLOY.md`](./DEPLOY.md); `ecosystem.config.js` (PM2) y
`deploy/nginx.conf.example` ya están en el repo listos para copiar.

## Modelo de datos

- **restaurants** — cada fila es una sucursal, con slug público único,
  color de marca, moneda, estado de publicación y su propio plan de
  suscripción. Un mismo dueño (`owner_id`) puede tener varias (multi-sucursal,
  ver migración 0051) — el panel recuerda cuál está activa con la cookie
  `active_restaurant_id` y permite cambiar entre ellas desde el switcher
  en `/admin`.
- **categories** — secciones del menú (entradas, postres, etc).
- **menu_items** — platos con precio, imagen, disponibilidad, destacado y
  etiquetas.

Row Level Security garantiza que cada dueño solo pueda editar su propio
restaurante, y que el público solo vea restaurantes publicados y platos
disponibles.

### Envío: ¿de quién es la ganancia?

`orders.total` incluye el `delivery_fee`, pero ese envío no siempre es
ganancia del restaurante: en cuanto el dueño le asigna un repartidor
(`delivery_staff_id`) Y ese repartidor acepta el pedido
(`delivery_accepted_at`, se pone al tocar "Aceptar" en `/delivery`), la
parte del envío que le corresponde al repartidor pasa a ser su ganancia
— ya se cuenta en "Ganancias de hoy" de su panel. Si el repartidor
rechaza la asignación, `reject_delivery_assignment` limpia ambos campos
y el envío completo vuelve a ser del restaurante automáticamente; lo
mismo si nunca se asignó nadie (el restaurante hizo la entrega él
mismo).

Por defecto esa parte es el 100% del envío (comportamiento original). El
restaurante puede cambiarlo desde `/admin/restaurant`
(`delivery_fee_percentage_enabled` + `delivery_staff_fee_percentage`,
migración 0056): si activa la opción y define, por ejemplo, 70%, el
repartidor se queda con el 70% del `delivery_fee` de cada entrega y el
30% restante pasa a ser ganancia del restaurante.

`src/lib/sales.ts` (`restaurantAmount()`, usada por `computeSalesSummary`,
`groupSalesByDay/Month` y `groupSalesByPaymentMethod` — todas las cifras
de `/admin` y `/admin/sales`) recibe ese porcentaje como parámetro y
resta solo la parte del repartidor, para no contarla dos veces. El panel
`/delivery` (`earningsToday`) aplica el mismo porcentaje sobre
`delivery_fee` al sumar las ganancias del día. `src/lib/customers.ts`
(gasto total por cliente) NO se toca — ahí sí corresponde sumar el envío
completo, porque es lo que el cliente pagó de verdad, sin importar cómo
se reparte después.

## Seguridad

Además de RLS en cada tabla, los `security definer` acotados (nunca la
service-role key) y las migraciones 0054/0055 (subida de archivos y rate
limiting, ver arriba), `src/proxy.ts` agrega en cada respuesta:

- **Content-Security-Policy** con nonce por request (`'nonce-...' 'strict-dynamic'`
  en `script-src`), generado en el proxy y propagado al `<script>` inline
  del layout (prevención de flash de tema oscuro) vía el header
  `x-nonce` — así ese script sigue permitido sin abrir la puerta a
  cualquier script inyectado. `style-src` sí incluye `'unsafe-inline'`
  a propósito: toda la app usa `style={{ backgroundColor: theme_color }}`
  para el color de marca de cada restaurante, y CSS no puede ejecutar JS
  arbitrario como sí puede un script. `img-src`/`connect-src` están
  acotados al proyecto de Supabase (leído de `NEXT_PUBLIC_SUPABASE_URL`,
  incluyendo `wss://` para Realtime) más `unpkg.com` y
  `*.tile.openstreetmap.org` (íconos y tiles del mapa de ubicación,
  ver `src/app/[slug]/location-picker.tsx`). En `next dev` se agrega
  `'unsafe-eval'` solo a `script-src` (React lo necesita en desarrollo
  para reconstruir stack traces; nunca en producción) — condicionado a
  `NODE_ENV`, así que el sitio real nunca lo tiene.
- **X-Content-Type-Options: nosniff**, **X-Frame-Options: SAMEORIGIN** /
  `frame-ancestors 'self'`, **Referrer-Policy**,
  **Permissions-Policy** (solo `geolocation=(self)`, todo lo demás
  bloqueado) y **Strict-Transport-Security**.

Si agregas un recurso externo nuevo (otro CDN, otra API), hay que sumarlo
a la lista de `buildCsp()` en `src/proxy.ts` o el navegador lo bloquea
en silencio — revisa la consola del navegador (busca "Content Security
Policy" o "Refused to") si algo deja de cargar después de un cambio.
