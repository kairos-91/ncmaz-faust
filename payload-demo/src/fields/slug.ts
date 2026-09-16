import type { Field, FieldHook } from 'payload'

/** Convierte "Café Botánica 2024" en "cafe-botanica-2024". */
export const slugify = (valor: string): string =>
  valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Rellena el slug a partir de otro campo cuando el editor lo deja vacio.
 * Si el cliente escribe uno a mano, se respeta.
 */
const generarDesde =
  (campoOrigen: string): FieldHook =>
  ({ data, value }) => {
    if (typeof value === 'string' && value.length > 0) return slugify(value)

    const origen = data?.[campoOrigen]
    if (typeof origen === 'string' && origen.length > 0) return slugify(origen)

    return value
  }

/**
 * Campo slug reutilizable. Vive en la barra lateral para no estorbar
 * en el formulario principal.
 */
export const campoSlug = (campoOrigen = 'titulo'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Slug (URL)',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description:
      'Se genera solo a partir del titulo. Editalo unicamente si sabes lo que haces: cambiarlo rompe los enlaces que ya circulan.',
  },
  hooks: {
    beforeValidate: [generarDesde(campoOrigen)],
  },
})
