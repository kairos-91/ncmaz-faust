// Debe ir primero: carga .env antes de que se evalue payload.config.
import './env'

import config from '@payload-config'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'

import { generarImagen } from './imagenes'
import { documento, parrafo, titulo2 } from './lexical'

const ADMIN_EMAIL = process.env.SEED_EMAIL ?? 'demo@portafolio.test'
const ADMIN_PASSWORD = process.env.SEED_PASSWORD ?? 'demo1234'

const seed = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Este script borra datos. No se ejecuta en produccion.')
  }

  const payload = await getPayload({ config })
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'portafolio-seed-'))

  console.log('\nLimpiando contenido anterior...')
  for (const coleccion of [
    'proyectos',
    'servicios',
    'testimonios',
    'categorias',
    'medios',
    'usuarios',
  ] as const) {
    await payload.delete({ collection: coleccion, where: { id: { exists: true } } })
  }

  console.log('Creando usuario del panel...')
  await payload.create({
    collection: 'usuarios',
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      nombre: 'Estudio Demo',
      rol: 'admin',
    },
  })

  console.log('Generando y subiendo imagenes...')
  const subirImagen = async (nombre: string, texto: string, desde: string, hasta: string) => {
    const filePath = await generarImagen(path.join(tmp, `${nombre}.jpg`), texto, desde, hasta)
    const doc = await payload.create({
      collection: 'medios',
      data: { alt: texto },
      filePath,
    })
    return doc.id
  }

  const hero = await subirImagen('hero', 'Estudio Demo', '#1f2937', '#4b5563')
  const portadas = {
    botanica: await subirImagen('botanica', 'Cafe Botanica', '#14532d', '#65a30d'),
    aurora: await subirImagen('aurora', 'Aurora Editorial', '#1e1b4b', '#7c3aed'),
    marea: await subirImagen('marea', 'Marea Surf Club', '#0c4a6e', '#0ea5e9'),
    horno: await subirImagen('horno', 'Horno Quince', '#7c2d12', '#ea580c'),
  }
  const galeria = {
    uno: await subirImagen('galeria-1', 'Papeleria', '#166534', '#84cc16'),
    dos: await subirImagen('galeria-2', 'Packaging', '#3f6212', '#a3e635'),
    tres: await subirImagen('galeria-3', 'Señaletica', '#1a2e05', '#4d7c0f'),
  }

  console.log('Creando categorias...')
  const categorias: Record<string, number> = {}
  for (const nombre of ['Branding', 'Diseño web', 'Packaging', 'Fotografia']) {
    const doc = await payload.create({ collection: 'categorias', data: { nombre } })
    categorias[nombre] = doc.id
  }

  console.log('Creando proyectos...')
  await payload.create({
    collection: 'proyectos',
    data: {
      _status: 'published',
      titulo: 'Identidad para Cafe Botanica',
      destacado: true,
      portada: portadas.botanica,
      resumen:
        'Naming, identidad visual y packaging para una cafeteria de especialidad con huerto propio.',
      cliente: 'Cafe Botanica',
      anio: 2024,
      enlace: 'https://ejemplo.test',
      categorias: [categorias['Branding'], categorias['Packaging']],
      servicios: [{ nombre: 'Naming' }, { nombre: 'Identidad visual' }, { nombre: 'Packaging' }],
      descripcion: documento(
        parrafo(
          'Cafe Botanica abria su primer local con una idea clara: un cafe que se cultiva, no solo se sirve. El encargo fue traducir esa idea a una marca que funcionara igual de bien en una taza que en un rotulo de dos metros.',
        ),
        titulo2('El proceso'),
        parrafo(
          'Partimos de un archivo de laminas botanicas del siglo XIX y construimos un sistema de ilustracion propio. Cada variedad de grano tiene su lamina, lo que permite ampliar la familia sin rehacer la marca.',
        ),
        titulo2('Resultado'),
        parrafo(
          'La marca se aplico a packaging, uniformes, señaletica y tienda online. Tres meses despues de la apertura, el local duplico su ticket medio en grano para llevar.',
        ),
      ),
      galeria: [
        { imagen: galeria.uno, pie: 'Papeleria y tarjetas', anchoCompleto: false },
        { imagen: galeria.dos, pie: 'Sistema de packaging por variedad', anchoCompleto: false },
        { imagen: galeria.tres, pie: 'Señaletica del local', anchoCompleto: true },
      ],
      metaDescripcion:
        'Caso de estudio: identidad visual y packaging para Cafe Botanica, cafeteria de especialidad.',
    },
  })

  await payload.create({
    collection: 'proyectos',
    data: {
      _status: 'published',
      titulo: 'Aurora Editorial',
      portada: portadas.aurora,
      resumen: 'Rediseño del sitio y del catalogo digital de una editorial independiente.',
      cliente: 'Aurora',
      anio: 2024,
      categorias: [categorias['Diseño web']],
      servicios: [{ nombre: 'Diseño web' }, { nombre: 'Desarrollo' }],
      descripcion: documento(
        parrafo(
          'Aurora publica veinte titulos al año y gestionaba su catalogo en una hoja de calculo. Montamos un sitio donde el equipo carga cada libro una vez y el catalogo, la ficha y el feed de novedades se actualizan solos.',
        ),
      ),
    },
  })

  await payload.create({
    collection: 'proyectos',
    data: {
      _status: 'published',
      titulo: 'Marea Surf Club',
      portada: portadas.marea,
      resumen: 'Identidad y sistema de señaletica para una escuela de surf en la costa norte.',
      cliente: 'Marea',
      anio: 2023,
      categorias: [categorias['Branding']],
      servicios: [{ nombre: 'Identidad visual' }, { nombre: 'Señaletica' }],
    },
  })

  // Este queda en borrador a proposito: sirve para enseñar al cliente
  // que puede guardar sin publicar y que el sitio no lo muestra.
  await payload.create({
    collection: 'proyectos',
    data: {
      _status: 'draft',
      titulo: 'Horno Quince (borrador)',
      portada: portadas.horno,
      resumen:
        'Proyecto en preparacion. Al estar en borrador no aparece en el sitio publico, solo en el panel.',
      cliente: 'Horno Quince',
      anio: 2025,
    },
  })

  console.log('Creando servicios...')
  const servicios = [
    {
      titulo: 'Identidad de marca',
      descripcion:
        'Naming, logotipo y sistema visual completo, con un manual que tu equipo pueda usar sin llamarnos.',
      icono: 'pincel' as const,
      orden: 1,
    },
    {
      titulo: 'Diseño y desarrollo web',
      descripcion:
        'Sitios rapidos, autoadministrables y pensados para convertir. Del boceto al servidor.',
      icono: 'codigo' as const,
      orden: 2,
    },
    {
      titulo: 'Direccion de arte',
      descripcion:
        'Produccion fotografica y direccion de campañas para que todo lo que publiques se vea como una sola marca.',
      icono: 'camara' as const,
      orden: 3,
    },
  ]
  for (const servicio of servicios) {
    await payload.create({ collection: 'servicios', data: servicio })
  }

  console.log('Creando testimonios...')
  const testimonios = [
    {
      texto:
        'Llegamos con un logo hecho en Word y salimos con una marca que el equipo entiende y sabe aplicar. La diferencia en el local se nota.',
      autor: 'Lucia Ferrer',
      cargo: 'Fundadora',
      empresa: 'Cafe Botanica',
      visible: true,
    },
    {
      texto:
        'Cargar un libro nuevo nos tomaba media mañana entre tres personas. Ahora lo hace una sola persona en diez minutos.',
      autor: 'Martin Oyola',
      cargo: 'Editor',
      empresa: 'Aurora',
      visible: true,
    },
  ]
  for (const testimonio of testimonios) {
    await payload.create({ collection: 'testimonios', data: testimonio })
  }

  console.log('Escribiendo globales...')
  await payload.updateGlobal({
    slug: 'pagina-inicio',
    data: {
      titular: 'Marcas que se sostienen fuera de la presentacion',
      subtitulo:
        'Estudio de identidad y diseño digital. Trabajamos con negocios que ya tienen algo que decir y necesitan que se note.',
      imagenHero: hero,
      sobreMi: documento(
        parrafo(
          'Somos un estudio de dos personas. Tomamos pocos proyectos al año porque preferimos entrar en el detalle: como se imprime, como se carga, quien lo va a actualizar dentro de seis meses.',
        ),
        parrafo(
          'Trabajamos con gastronomia, editorial y cultura, aunque lo que de verdad nos interesa es el encargo, no el rubro.',
        ),
      ),
    },
  })

  await payload.updateGlobal({
    slug: 'ajustes-sitio',
    data: {
      nombreSitio: 'Estudio Demo',
      descripcion: 'Estudio de identidad y diseño digital. Portafolio de trabajos seleccionados.',
      logo: hero,
      email: 'hola@estudiodemo.test',
      telefono: '+34 600 000 000',
      ciudad: 'Valencia',
      redes: [
        { plataforma: 'instagram', url: 'https://instagram.com/ejemplo' },
        { plataforma: 'behance', url: 'https://behance.net/ejemplo' },
        { plataforma: 'linkedin', url: 'https://linkedin.com/company/ejemplo' },
      ],
    },
  })

  await fs.rm(tmp, { recursive: true, force: true })

  console.log('\n  Listo. Contenido de ejemplo cargado.')
  console.log('  Panel:    http://localhost:3000/admin')
  console.log(`  Usuario:  ${ADMIN_EMAIL}`)
  console.log(`  Clave:    ${ADMIN_PASSWORD}\n`)
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
