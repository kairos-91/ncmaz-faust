import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { getPayload } from 'payload'

import { altMedio, urlMedio } from '@/lib/medios'

const ICONOS: Record<string, string> = {
  estrella: '✦',
  pincel: '✎',
  camara: '◉',
  codigo: '‹›',
  megafono: '◈',
}

export default async function Inicio() {
  const payload = await getPayload({ config })

  // La Local API consulta la base de datos en el mismo proceso: sin fetch,
  // sin red, sin token. Es la gran ventaja de tener el CMS dentro de Next.
  const [inicio, ajustes, proyectos, servicios, testimonios] = await Promise.all([
    payload.findGlobal({ slug: 'pagina-inicio', depth: 1 }),
    payload.findGlobal({ slug: 'ajustes-sitio', depth: 1 }),
    payload.find({
      collection: 'proyectos',
      // La Local API ignora el control de acceso por defecto, asi que
      // filtramos los borradores a mano.
      where: { _status: { equals: 'published' } },
      sort: ['-destacado', '-anio'],
      depth: 1,
      limit: 12,
    }),
    payload.find({ collection: 'servicios', sort: 'orden', limit: 20 }),
    payload.find({
      collection: 'testimonios',
      where: { visible: { equals: true } },
      depth: 1,
      limit: 10,
    }),
  ])

  return (
    <>
      <header className="hero">
        <div className="contenedor">
          <h1>{inicio.titular}</h1>
          {inicio.subtitulo && <p>{inicio.subtitulo}</p>}
          {urlMedio(inicio.imagenHero, 'ancha') && (
            <div className="hero-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlMedio(inicio.imagenHero, 'ancha')}
                alt={altMedio(inicio.imagenHero)}
              />
            </div>
          )}
        </div>
      </header>

      <section>
        <div className="contenedor">
          <h2>Proyectos</h2>
          {proyectos.docs.length === 0 ? (
            <p className="vacio">
              Todavia no hay proyectos publicados. Entra en{' '}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/admin">/admin</a> y crea el primero.
            </p>
          ) : (
            <div className="rejilla">
              {proyectos.docs.map((proyecto) => (
                <Link
                  key={proyecto.id}
                  href={`/proyectos/${proyecto.slug}`}
                  className={`tarjeta${proyecto.destacado ? ' destacada' : ''}`}
                >
                  <div className="marco">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={urlMedio(proyecto.portada, proyecto.destacado ? 'ancha' : 'tarjeta')}
                      alt={altMedio(proyecto.portada)}
                    />
                  </div>
                  <h3>{proyecto.titulo}</h3>
                  <p>{proyecto.resumen}</p>
                  <p className="meta">
                    {[proyecto.cliente, proyecto.anio].filter(Boolean).join(' · ')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {servicios.docs.length > 0 && (
        <section>
          <div className="contenedor">
            <h2>Servicios</h2>
            <div className="rejilla">
              {servicios.docs.map((servicio) => (
                <article key={servicio.id} className="servicio">
                  <span className="icono" aria-hidden="true">
                    {ICONOS[servicio.icono ?? 'estrella'] ?? ICONOS.estrella}
                  </span>
                  <h3>{servicio.titulo}</h3>
                  <p>{servicio.descripcion}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonios.docs.length > 0 && (
        <section>
          <div className="contenedor">
            <h2>Testimonios</h2>
            <div className="rejilla">
              {testimonios.docs.map((testimonio) => (
                <div key={testimonio.id} className="testimonio">
                  <blockquote>“{testimonio.texto}”</blockquote>
                  <p className="autor">
                    {[testimonio.autor, testimonio.cargo, testimonio.empresa]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {inicio.sobreMi && (
        <section>
          <div className="contenedor">
            <h2>Sobre mi</h2>
            <div className="prosa">
              <RichText data={inicio.sobreMi} />
            </div>
          </div>
        </section>
      )}

      <footer className="pie">
        <div className="contenedor" style={{ display: 'contents' }}>
          <span>
            {ajustes.nombreSitio}
            {ajustes.ciudad ? ` · ${ajustes.ciudad}` : ''}
            {ajustes.email ? ` · ${ajustes.email}` : ''}
          </span>
          {ajustes.redes && ajustes.redes.length > 0 && (
            <nav>
              {ajustes.redes.map((red) => (
                <a key={red.id ?? red.url} href={red.url} rel="noreferrer noopener" target="_blank">
                  {red.plataforma}
                </a>
              ))}
            </nav>
          )}
        </div>
      </footer>
    </>
  )
}
