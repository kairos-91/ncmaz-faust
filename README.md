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
src/lib/supabase/          Clientes de Supabase (browser, server, middleware)
supabase/migrations/        Esquema SQL + Row Level Security
```

## Configuración

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta `supabase/migrations/0001_init.sql` en el SQL Editor del proyecto
   (crea las tablas, las políticas de RLS y el bucket de imágenes `menu-images`).
3. Copia `.env.example` a `.env.local` y completa las credenciales de tu
   proyecto (Settings → API):

   ```bash
   cp .env.example .env.local
   ```

4. Instala dependencias y levanta el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000). Regístrate en
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
