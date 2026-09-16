import type { CollectionConfig } from 'payload'

import { autenticado, publico } from '@/access'

export const Testimonios: CollectionConfig = {
  slug: 'testimonios',
  labels: {
    singular: 'Testimonio',
    plural: 'Testimonios',
  },
  admin: {
    useAsTitle: 'autor',
    defaultColumns: ['autor', 'empresa', 'visible', 'updatedAt'],
    group: 'Contenido',
    description: 'Lo que dicen tus clientes. Puedes ocultar uno sin borrarlo.',
  },
  access: {
    read: publico,
    create: autenticado,
    update: autenticado,
    delete: autenticado,
  },
  fields: [
    {
      name: 'texto',
      type: 'textarea',
      label: 'Testimonio',
      required: true,
      maxLength: 400,
      admin: {
        description: 'Citalo tal cual lo dijo el cliente. Corto funciona mejor.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'autor',
          type: 'text',
          label: 'Nombre',
          required: true,
          admin: { width: '40%' },
        },
        {
          name: 'cargo',
          type: 'text',
          label: 'Cargo',
          admin: { width: '30%' },
        },
        {
          name: 'empresa',
          type: 'text',
          label: 'Empresa',
          admin: { width: '30%' },
        },
      ],
    },
    {
      name: 'foto',
      type: 'upload',
      relationTo: 'medios',
      label: 'Foto',
      admin: {
        description: 'Opcional. Cuadrada queda mejor.',
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      label: 'Mostrar en el sitio',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Desmarcalo para esconderlo sin perderlo.',
      },
    },
  ],
}
