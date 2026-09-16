import type { CollectionConfig } from 'payload'

import { soloAdmin } from '@/access'

export const Usuarios: CollectionConfig = {
  slug: 'usuarios',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  auth: true,
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'email', 'rol'],
    group: 'Configuracion',
    description: 'Quien puede entrar a este panel.',
  },
  access: {
    // Solo un admin administra usuarios. El cliente (rol "editor")
    // no ve siquiera esta seccion en el menu lateral.
    create: soloAdmin,
    delete: soloAdmin,
    update: soloAdmin,
    read: soloAdmin,
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // El campo email y la contrasena los añade Payload automaticamente
    // porque esta coleccion tiene auth: true.
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    {
      name: 'rol',
      type: 'select',
      label: 'Rol',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrador (acceso total)', value: 'admin' },
        { label: 'Editor (solo contenido)', value: 'editor' },
      ],
      admin: {
        description:
          'El editor puede crear y publicar contenido, pero no tocar usuarios ni ajustes tecnicos.',
      },
    },
  ],
}
