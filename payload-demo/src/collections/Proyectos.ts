import type { CollectionConfig } from 'payload'

import { autenticado, publicadoOAutenticado } from '@/access'
import { campoSlug } from '@/fields/slug'

export const Proyectos: CollectionConfig = {
  slug: 'proyectos',
  labels: {
    singular: 'Proyecto',
    plural: 'Proyectos',
  },
  admin: {
    useAsTitle: 'titulo',
    // Lo que se ve en la tabla del listado, en este orden.
    defaultColumns: ['titulo', 'cliente', 'anio', 'destacado', '_status', 'updatedAt'],
    group: 'Contenido',
    description: 'El corazon del portafolio. Cada trabajo que quieras mostrar va aqui.',
    preview: (doc) =>
      typeof doc?.slug === 'string'
        ? `${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/proyectos/${doc.slug}`
        : null,
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/proyectos/${data?.slug ?? ''}`,
    },
  },
  access: {
    read: publicadoOAutenticado,
    create: autenticado,
    update: autenticado,
    delete: autenticado,
  },
  // Borradores + historial. El cliente puede guardar sin publicar,
  // ver como quedaria y volver a una version anterior si se arrepiente.
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      label: 'Titulo del proyecto',
      required: true,
      admin: {
        description: 'Como quieres que aparezca en la portada. Ej: "Identidad para Cafe Botanica".',
      },
    },
    campoSlug('titulo'),
    {
      name: 'destacado',
      type: 'checkbox',
      label: 'Destacar en la portada',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Los destacados salen primero y mas grandes en la pagina de inicio.',
      },
    },
    {
      name: 'categorias',
      type: 'relationship',
      relationTo: 'categorias',
      hasMany: true,
      label: 'Categorias',
      admin: {
        position: 'sidebar',
        description: 'Sirven para filtrar el portafolio.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Ficha',
          description: 'Los datos que resumen el trabajo.',
          fields: [
            {
              name: 'portada',
              type: 'upload',
              relationTo: 'medios',
              label: 'Imagen de portada',
              required: true,
              admin: {
                description: 'Horizontal y de buena calidad. Es la primera impresion del proyecto.',
              },
            },
            {
              name: 'resumen',
              type: 'textarea',
              label: 'Resumen corto',
              required: true,
              maxLength: 200,
              admin: {
                description: 'Una o dos frases. Se muestra bajo el titulo en el listado.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'cliente',
                  type: 'text',
                  label: 'Cliente',
                  admin: { width: '50%' },
                },
                {
                  name: 'anio',
                  type: 'number',
                  label: 'Año',
                  min: 1990,
                  max: 2100,
                  admin: { width: '25%', step: 1 },
                },
                {
                  name: 'enlace',
                  type: 'text',
                  label: 'Enlace al sitio',
                  admin: {
                    width: '25%',
                    description: 'Opcional.',
                  },
                },
              ],
            },
            {
              name: 'servicios',
              type: 'array',
              label: 'Que se hizo',
              labels: { singular: 'Servicio aplicado', plural: 'Servicios aplicados' },
              admin: {
                description: 'Ej: Naming, Identidad visual, Packaging. Arrastra para reordenar.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'nombre',
                  type: 'text',
                  label: 'Servicio',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Caso de estudio',
          description: 'El texto largo. Puedes dejarlo vacio si el proyecto solo son imagenes.',
          fields: [
            {
              name: 'descripcion',
              type: 'richText',
              label: 'Descripcion',
            },
            {
              name: 'galeria',
              type: 'array',
              label: 'Galeria',
              labels: { singular: 'Imagen', plural: 'Imagenes' },
              admin: {
                description: 'Arrastra las filas para cambiar el orden en que se muestran.',
              },
              fields: [
                {
                  name: 'imagen',
                  type: 'upload',
                  relationTo: 'medios',
                  label: 'Imagen',
                  required: true,
                },
                {
                  name: 'pie',
                  type: 'text',
                  label: 'Pie de foto',
                },
                {
                  name: 'anchoCompleto',
                  type: 'checkbox',
                  label: 'Mostrar a todo el ancho',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          description: 'Como se ve este proyecto en Google y al compartirlo en WhatsApp.',
          fields: [
            {
              name: 'metaTitulo',
              type: 'text',
              label: 'Titulo para buscadores',
              admin: {
                description: 'Si lo dejas vacio se usa el titulo del proyecto. Ideal: 50-60 caracteres.',
              },
            },
            {
              name: 'metaDescripcion',
              type: 'textarea',
              label: 'Descripcion para buscadores',
              maxLength: 160,
              admin: {
                description: 'Si lo dejas vacio se usa el resumen corto. Ideal: 150-160 caracteres.',
              },
            },
          ],
        },
      ],
    },
  ],
}
