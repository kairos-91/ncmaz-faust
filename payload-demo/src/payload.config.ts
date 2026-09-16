import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categorias } from './collections/Categorias'
import { Medios } from './collections/Medios'
import { Proyectos } from './collections/Proyectos'
import { Servicios } from './collections/Servicios'
import { Testimonios } from './collections/Testimonios'
import { Usuarios } from './collections/Usuarios'
import { AjustesSitio } from './globals/AjustesSitio'
import { PaginaInicio } from './globals/PaginaInicio'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Usuarios.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Panel de contenido',
    },
    // Iniciales en vez de Gravatar: el panel no hace peticiones a servicios
    // externos y funciona igual en una intranet o sin internet.
    avatar: 'default',
  },

  collections: [Proyectos, Servicios, Testimonios, Categorias, Medios, Usuarios],
  globals: [PaginaInicio, AjustesSitio],

  // Panel solo en español: el cliente nunca ve una etiqueta en ingles.
  // Payload elige idioma por el Accept-Language del navegador, asi que si
  // dejaras { es, en } un navegador en ingles abriria el panel en ingles.
  // Para ofrecer los dos, añade `en` aqui y deja que cada usuario elija
  // el suyo en su perfil del panel.
  i18n: {
    fallbackLanguage: 'es',
    supportedLanguages: { es },
  },

  editor: lexicalEditor(),

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./portafolio.db',
    },
    // En un demo conviene que el esquema se cree solo al arrancar.
    // En produccion se usan migraciones (npm run payload migrate:create).
    push: true,
  }),

  // Necesario para recortar las imagenes al subirlas.
  sharp,

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
})
