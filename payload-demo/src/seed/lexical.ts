/**
 * Utilidades minimas para construir contenido Lexical desde codigo.
 * En el panel esto lo escribe el cliente con el editor visual; aqui solo
 * hacen falta para sembrar datos de ejemplo.
 */

type NodoTexto = {
  type: 'text'
  text: string
  detail: number
  format: number
  mode: 'normal'
  style: string
  version: number
}

const texto = (contenido: string): NodoTexto => ({
  type: 'text',
  text: contenido,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const bloque = (tipo: 'paragraph' | 'heading', contenido: string, tag?: string) => ({
  type: tipo,
  ...(tag ? { tag } : {}),
  children: [texto(contenido)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})

export const parrafo = (contenido: string) => bloque('paragraph', contenido)
export const titulo2 = (contenido: string) => bloque('heading', contenido, 'h2')

/** Envuelve los bloques en la raiz que espera el campo richText. */
export const documento = (...bloques: ReturnType<typeof parrafo>[]) => ({
  root: {
    type: 'root',
    children: bloques,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})
