import type { GlobalConfig } from 'payload'

import { autenticado, publico } from '@/access'

/**
 * Un "global" es un documento unico: no hay listado, el cliente entra
 * directo al formulario. Perfecto para ajustes que existen una sola vez.
 */
export const AjustesSitio: GlobalConfig = {
  slug: 'ajustes-sitio',
  label: 'Ajustes del sitio',
  admin: {
    group: 'Configuracion',
    description: 'Datos que se repiten en todas las paginas: logo, contacto, redes.',
  },
  access: {
    read: publico,
    update: autenticado,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'nombreSitio',
              type: 'text',
              label: 'Nombre del sitio',
              required: true,
            },
            {
              name: 'descripcion',
              type: 'textarea',
              label: 'Descripcion',
              maxLength: 160,
              admin: {
                description: 'Aparece en Google bajo el nombre del sitio.',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'medios',
              label: 'Logo',
            },
          ],
        },
        {
          label: 'Contacto',
          fields: [
            {
              name: 'email',
              type: 'email',
              label: 'Email de contacto',
            },
            {
              name: 'telefono',
              type: 'text',
              label: 'Telefono / WhatsApp',
            },
            {
              name: 'ciudad',
              type: 'text',
              label: 'Ciudad',
            },
          ],
        },
        {
          label: 'Redes sociales',
          fields: [
            {
              name: 'redes',
              type: 'array',
              label: 'Redes',
              labels: { singular: 'Red', plural: 'Redes' },
              admin: {
                description: 'Añade solo las que uses. Arrastra para ordenar.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'plataforma',
                      type: 'select',
                      label: 'Plataforma',
                      required: true,
                      options: [
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Behance', value: 'behance' },
                        { label: 'LinkedIn', value: 'linkedin' },
                        { label: 'Dribbble', value: 'dribbble' },
                        { label: 'YouTube', value: 'youtube' },
                      ],
                      admin: { width: '40%' },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      label: 'URL',
                      required: true,
                      admin: { width: '60%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
