import config from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import './styles.css'

// Los ajustes del sitio los edita el cliente en el panel y alimentan
// el <title> y la meta descripcion de todas las paginas.
export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const ajustes = await payload.findGlobal({ slug: 'ajustes-sitio' })

  return {
    title: {
      default: ajustes.nombreSitio || 'Portafolio',
      template: `%s · ${ajustes.nombreSitio || 'Portafolio'}`,
    },
    description: ajustes.descripcion || undefined,
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <p className="aviso">
          Demo de Payload CMS · el panel de contenido esta en{' '}
          {/* El panel es otra aplicacion: queremos una carga completa de pagina,
              no una navegacion de cliente que arrastre su bundle hasta aqui. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/admin">/admin</a>
        </p>
        {children}
      </body>
    </html>
  )
}
