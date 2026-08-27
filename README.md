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
  r/[slug]/                Menú público del restaurante (el que ve el cliente)
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
- El menú público del cliente (`/r/[slug]`, carrito, checkout) — el
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
     `/admin/restaurant`, visible en el menú público (`/r/[slug]`) como un
     indicador de "Abierto ahora" / "Cerrado ahora" y el horario completo.
   - `supabase/migrations/0011_maps_url.sql` — columna
     `restaurants.maps_url` con el enlace de Google Maps configurable desde
     `/admin/restaurant`, mostrado como "Ubicación" en el menú público.
   - `supabase/migrations/0012_restaurant_services.sql` — columnas
     `restaurants.services` (delivery/pickup/comer en el local),
     `restaurants.has_wifi` y `restaurants.accepts_pets`, configurables
     desde `/admin/restaurant` y mostradas como íconos en el menú público.
3. Copia `.env.example` a `.env.local` y completa las credenciales de tu
   proyecto (Settings → API):

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

## Modelo de datos

- **restaurants** — un restaurante por usuario dueño (`owner_id`), con slug
  público único, color de marca, moneda y estado de publicación.
- **categories** — secciones del menú (entradas, postres, etc).
- **menu_items** — platos con precio, imagen, disponibilidad, destacado y
  etiquetas.

Row Level Security garantiza que cada dueño solo pueda editar su propio
restaurante, y que el público solo vea restaurantes publicados y platos
disponibles.
