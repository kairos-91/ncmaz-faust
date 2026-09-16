import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import { autenticado, publico } from '@/access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Medios: CollectionConfig = {
  slug: 'medios',
  labels: {
    singular: 'Imagen',
    plural: 'Imagenes',
  },
  admin: {
    group: 'Contenido',
    description: 'Todas las imagenes del sitio. Se suben una vez y se reutilizan donde haga falta.',
  },
  access: {
    read: publico,
    create: autenticado,
    update: autenticado,
    delete: autenticado,
  },
  upload: {
    // Carpeta local. En produccion esto se cambia por el plugin de S3,
    // Vercel Blob o Supabase Storage (ver README).
    staticDir: path.resolve(dirname, '../../public/medios'),
    mimeTypes: ['image/*'],
    // Payload recorta estas versiones al subir. El frontend pide la que
    // necesita y nunca sirve un JPG de 4 MB en una miniatura.
    imageSizes: [
      { name: 'miniatura', width: 400, height: 300, position: 'centre' },
      { name: 'tarjeta', width: 768, height: 576, position: 'centre' },
      { name: 'ancha', width: 1920, height: undefined },
    ],
    adminThumbnail: 'miniatura',
    focalPoint: true,
    crop: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      required: true,
      admin: {
        description:
          'Describe la imagen en una frase. Lo leen los buscadores y los lectores de pantalla. Ej: "Fachada del restaurante al atardecer".',
      },
    },
    {
      name: 'credito',
      type: 'text',
      label: 'Credito / autor',
      admin: {
        description: 'Opcional. Si la foto es de un fotografo externo, ponlo aqui.',
      },
    },
  ],
}
