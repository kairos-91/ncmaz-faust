import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { altMedio, urlMedio } from '@/lib/medios'

type Props = {
  params: Promise<{ slug: string }>
}

/** Busca un proyecto publicado por su slug. */
const buscarProyecto = async (slug: string) => {
  const payload = await getPayload({ config })
  const resultado = await payload.find({
    collection: 'proyectos',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })

  return resultado.docs[0] ?? null
}

// Pre-genera una ruta estatica por proyecto publicado en el build.
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'proyectos',
    where: { _status: { equals: 'published' } },
    select: { slug: true },
    limit: 200,
  })

  return docs.flatMap((doc) => (doc.slug ? [{ slug: doc.slug }] : []))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const proyecto = await buscarProyecto(slug)

  if (!proyecto) return {}

  return {
    title: proyecto.metaTitulo || proyecto.titulo,
    description: proyecto.metaDescripcion || proyecto.resumen,
  }
}

export default async function DetalleProyecto({ params }: Props) {
  const { slug } = await params
  const proyecto = await buscarProyecto(slug)

  if (!proyecto) notFound()

  const servicios = (proyecto.servicios ?? []).map((s) => s.nombre).filter(Boolean)

  return (
    <article className="contenedor">
      <Link className="volver" href="/">
        ← Volver al portafolio
      </Link>

      <header className="detalle-cabecera">
        <h1>{proyecto.titulo}</h1>
        <p className="prosa">{proyecto.resumen}</p>
      </header>

      {urlMedio(proyecto.portada, 'ancha') && (
        <div className="hero-img" style={{ marginTop: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urlMedio(proyecto.portada, 'ancha')} alt={altMedio(proyecto.portada)} />
        </div>
      )}

      <dl className="ficha">
        {proyecto.cliente && (
          <div>
            <dt>Cliente</dt>
            <dd>{proyecto.cliente}</dd>
          </div>
        )}
        {proyecto.anio && (
          <div>
            <dt>Año</dt>
            <dd>{proyecto.anio}</dd>
          </div>
        )}
        {servicios.length > 0 && (
          <div>
            <dt>Servicios</dt>
            <dd>{servicios.join(', ')}</dd>
          </div>
        )}
        {proyecto.enlace && (
          <div>
            <dt>Sitio</dt>
            <dd>
              <a href={proyecto.enlace} rel="noreferrer noopener" target="_blank">
                Ver en vivo ↗
              </a>
            </dd>
          </div>
        )}
      </dl>

      {proyecto.descripcion && (
        <div className="prosa">
          <RichText data={proyecto.descripcion} />
        </div>
      )}

      {proyecto.galeria && proyecto.galeria.length > 0 && (
        <div className="galeria">
          {proyecto.galeria.map((item) => (
            <figure key={item.id ?? item.pie} className={item.anchoCompleto ? 'ancho' : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlMedio(item.imagen, item.anchoCompleto ? 'ancha' : 'tarjeta')}
                alt={altMedio(item.imagen)}
              />
              {item.pie && <figcaption>{item.pie}</figcaption>}
            </figure>
          ))}
        </div>
      )}

      <Link className="volver" href="/">
        ← Volver al portafolio
      </Link>
      <div style={{ height: 64 }} />
    </article>
  )
}
