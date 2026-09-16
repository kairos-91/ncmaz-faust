import type { CollectionConfig } from 'payload'

import { autenticado, publico } from '@/access'

export const Servicios: CollectionConfig = {
  slug: 'servicios',
  labels: {
    singular: 'Servicio',
    plural: 'Servicios',
  },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'orden', 'updatedAt'],
    group: 'Contenido',
    description: 'Lo que ofreces. Se listan en la portada.',
  },
  access: {
    read: publico,
    create: autenticado,
    update: autenticado,
    delete: autenticado,
  },
  // Con esto el listado sale ya ordenado como el cliente lo dejo.
  defaultSort: 'orden',
  fields: [
    {
      name: 'titulo',
      type: 'text',
      label: 'Titulo',
      required: true,
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: 'Descripcion',
      required: true,
      maxLength: 300,
      admin: {
        description: 'Dos o tres frases explicando en que consiste.',
      },
    },
    {
      name: 'icono',
      type: 'select',
      label: 'Icono',
      defaultValue: 'estrella',
      options: [
        { label: 'Estrella', value: 'estrella' },
        { label: 'Pincel', value: 'pincel' },
        { label: 'Camara', value: 'camara' },
        { label: 'Codigo', value: 'codigo' },
        { label: 'Megafono', value: 'megafono' },
      ],
      admin: {
        description: 'Se muestra sobre el titulo de la tarjeta.',
      },
    },
    {
      name: 'orden',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        step: 1,
        description: 'Menor numero = aparece antes.',
      },
    },
  ],
}
