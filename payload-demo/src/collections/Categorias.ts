import type { CollectionConfig } from 'payload'

import { autenticado, publico } from '@/access'
import { campoSlug } from '@/fields/slug'

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: {
    singular: 'Categoria',
    plural: 'Categorias',
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug'],
    group: 'Contenido',
    description: 'Etiquetas para agrupar los proyectos: Branding, Web, Fotografia...',
  },
  access: {
    read: publico,
    create: autenticado,
    update: autenticado,
    delete: autenticado,
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    campoSlug('nombre'),
  ],
}
