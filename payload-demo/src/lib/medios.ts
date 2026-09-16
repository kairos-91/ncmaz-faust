/**
 * Los campos `upload` llegan como el documento completo (cuando la consulta
 * tiene profundidad) o como el id a secas. Estos helpers resuelven las dos
 * formas sin que cada componente tenga que comprobarlo.
 */

type TamanoMedio = {
  url?: string | null
  width?: number | null
  height?: number | null
}

type DocMedio = {
  alt?: string | null
  url?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, TamanoMedio | undefined> | null
}

const esDocMedio = (valor: unknown): valor is DocMedio =>
  typeof valor === 'object' && valor !== null && 'url' in valor

/** Devuelve la URL del tamaño pedido, con la original como respaldo. */
export const urlMedio = (valor: unknown, tamano?: 'miniatura' | 'tarjeta' | 'ancha'): string => {
  if (!esDocMedio(valor)) return ''

  if (tamano) {
    const recorte = valor.sizes?.[tamano]
    if (recorte?.url) return recorte.url
  }

  return valor.url ?? ''
}

/** Texto alternativo, o cadena vacia si la imagen no esta poblada. */
export const altMedio = (valor: unknown): string => (esDocMedio(valor) ? (valor.alt ?? '') : '')
