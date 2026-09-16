# Demo de Payload CMS — sitio de portafolio

Proyecto de prueba para evaluar Payload CMS antes de proponerlo a un cliente.
Es **independiente** de la app principal del repo: tiene su propio `package.json`,
su propio `node_modules` y su propia base de datos. No toca nada de `../src`.

La idea es poder abrir `/admin`, sentarse con el cliente y que vea exactamente
el panel donde va a cargar su contenido.

---

## Arrancar en 3 comandos

```bash
cd payload-demo
npm install
cp .env.example .env     # y cambia PAYLOAD_SECRET por cualquier cadena larga
npm run seed             # crea la base de datos y carga contenido de ejemplo
npm run dev
```

| Donde | URL |
| --- | --- |
| Sitio publico | http://localhost:3000 |
| Panel de contenido | http://localhost:3000/admin |
| API REST | http://localhost:3000/api/proyectos |
| GraphQL | http://localhost:3000/api/graphql-playground |

Credenciales que crea el seed:

```
demo@portafolio.test
demo1234
```

> La base de datos es **SQLite**: se crea sola en `portafolio.db`, no hace falta
> instalar ni levantar nada. Para borrar todo y empezar de cero:
> `rm portafolio.db && rm -rf public/medios && npm run seed`.

---

## Que enseñarle al cliente

Este orden funciona bien en una demo de diez minutos:

1. **Listado de Proyectos** — columnas elegidas por nosotros (`defaultColumns`),
   buscador, filtros y la columna *Estado* con Borrador / Publicado.
2. **Abrir "Identidad para Cafe Botanica"** — el formulario esta partido en
   pestañas (*Ficha*, *Caso de estudio*, *SEO*) y cada campo lleva su texto de
   ayuda en español. Nada de nombres tecnicos.
3. **La barra lateral** — el slug se genera solo desde el titulo, y ahi viven
   las opciones que no son "contenido" (destacar, categorias).
4. **El icono del ojo (Live Preview)** — el sitio real se actualiza mientras
   escribe, al lado del formulario.
5. **Escribir algo y esperar** — el autoguardado deja constancia sin pulsar nada.
   Luego la pestaña **Versiones**: historial completo y restaurar una anterior.
6. **"Horno Quince (borrador)"** — esta en el panel pero NO en el sitio publico
   (http://localhost:3000/proyectos/horno-quince-borrador da 404). Asi se
   demuestra que puede trabajar tranquilo sin publicar.
7. **Galeria del caso de estudio** — arrastrar filas para reordenar.
8. **Imagenes** — subir una y ver que Payload genera solo las versiones
   recortadas (400px, 768px, 1920px) y permite fijar el punto focal.
9. **Ajustes del sitio** — un documento unico, sin listado: entra directo al
   formulario. Ideal para logo, contacto y redes.
10. **Entrar como editor** — crear un usuario con rol *Editor* y comprobar que
    la seccion Usuarios le desaparece del menu.

---

## Como esta armado

```
src/
  payload.config.ts      # el CMS entero se describe aqui
  collections/           # tipos de contenido -> tablas + panel + API
    Proyectos.ts           pestañas, borradores, versiones, live preview
    Servicios.ts           lista ordenable
    Testimonios.ts         con interruptor de visibilidad
    Categorias.ts          relacion con Proyectos
    Medios.ts              subidas + recortes automaticos
    Usuarios.ts            login del panel + roles
  globals/               # documentos unicos (no hay listado)
    PaginaInicio.ts
    AjustesSitio.ts
  access/index.ts        # quien puede leer y escribir cada cosa
  fields/slug.ts         # campo reutilizable con auto-slug
  lib/medios.ts          # helpers para resolver URLs de imagen
  seed/                  # contenido de ejemplo (genera las imagenes con sharp)
  app/
    (payload)/           # el panel. Archivos generados, no se tocan
    (frontend)/          # el sitio publico
```

### El punto clave: la Local API

El frontend no hace `fetch` al CMS. Consulta la base de datos en el mismo
proceso de Node:

```tsx
const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'proyectos',
  where: { _status: { equals: 'published' } },
  sort: ['-destacado', '-anio'],
})
```

Sin red, sin token, y tipado de punta a punta gracias a `src/payload-types.ts`,
que Payload regenera con `npm run generate:types`.

> Ojo: la Local API **ignora el control de acceso por defecto**. Por eso las
> consultas del frontend filtran `_status: published` a mano. Via REST o GraphQL
> si se aplica el control de acceso de `src/access/index.ts`.

---

## Lo que hay que cambiar para un proyecto real

| Tema | En el demo | En produccion |
| --- | --- | --- |
| Base de datos | SQLite en un archivo | Postgres (Supabase, Neon) o Mongo |
| Imagenes | carpeta local `public/medios` | S3, Vercel Blob o Supabase Storage |
| Esquema | `push: true` (se sincroniza solo) | migraciones (`payload migrate:create`) |
| Emails | se imprimen en consola | adaptador de Resend / Nodemailer |
| Idioma del panel | solo español | añade `en` si algun usuario lo necesita |

### Cambiar a Postgres / Supabase

```bash
npm uninstall @payloadcms/db-sqlite
npm install @payloadcms/db-postgres
```

```ts
// src/payload.config.ts
import { postgresAdapter } from '@payloadcms/db-postgres'

db: postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URI },
}),
```

Y en `.env`, la cadena de conexion de Supabase:

```
DATABASE_URI=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

Payload crea y gestiona sus propias tablas, asi que puede convivir con las que
ya tenga el proyecto.

### Almacenamiento de imagenes

En Vercel el sistema de archivos es efimero: lo que se sube se pierde en el
siguiente deploy. Hay que instalar uno de estos y quitar `staticDir` de
`src/collections/Medios.ts`:

```bash
npm install @payloadcms/storage-s3          # S3 o cualquier compatible
npm install @payloadcms/storage-vercel-blob  # Vercel Blob
```

---

## Comandos

| Comando | Que hace |
| --- | --- |
| `npm run dev` | servidor de desarrollo |
| `npm run build` | build de produccion |
| `npm run seed` | **borra** el contenido y vuelve a cargar el de ejemplo |
| `npm run generate:types` | regenera `src/payload-types.ts` tras tocar el esquema |
| `npm run generate:importmap` | regenera el mapa de componentes del panel |

Tras cambiar campos en una coleccion, `npm run generate:types`. Si añades
componentes propios al panel, ademas `npm run generate:importmap`.

---

## Verificado en este entorno

- Node 22.22 · Next 16.3.3 · React 19.2.8 · Payload 3.89.0
- `npx tsc --noEmit` sin errores
- `npm run build` completo; las tres fichas de proyecto publicadas se
  pre-generan como estaticas y el borrador queda fuera
- El borrador devuelve 404 en el sitio publico y tampoco aparece en
  `/api/proyectos` sin sesion
