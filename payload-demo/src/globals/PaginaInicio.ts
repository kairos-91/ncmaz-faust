import type { GlobalConfig } from 'payload'

import { autenticado, publico } from '@/access'

export const PaginaInicio: GlobalConfig = {
  slug: 'pagina-inicio',
  label: 'Pagina de inicio',
  admin: {
    group: 'Contenido',
    description: 'El texto grande de la portada y la seccion "sobre mi".',
  },
  access: {
    read: publico,
    update: autenticado,
  },
  fields: [
    {
      name: 'titular',
      type: 'text',
      label: 'Titular',
      required: true,
      admin: {
        description: 'La frase grande de arriba. Corta y directa.',
      },
    },
    {
      name: 'subtitulo',
      type: 'textarea',
      label: 'Subtitulo',
      maxLength: 240,
    },
    {
      name: 'imagenHero',
      type: 'upload',
      relationTo: 'medios',
      label: 'Imagen principal',
    },
    {
      name: 'sobreMi',
      type: 'richText',
      label: 'Sobre mi',
    },
  ],
}
