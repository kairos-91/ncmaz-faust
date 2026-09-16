import path from 'path'
import sharp from 'sharp'

/**
 * Genera imagenes de relleno con sharp para que el demo no dependa de
 * descargar fotos. Son degradados con el nombre del proyecto encima.
 */
export const generarImagen = async (
  destino: string,
  texto: string,
  desde: string,
  hasta: string,
  ancho = 2000,
  alto = 1500,
): Promise<string> => {
  const svg = `
    <svg width="${ancho}" height="${alto}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${desde}" />
          <stop offset="100%" stop-color="${hasta}" />
        </linearGradient>
      </defs>
      <rect width="${ancho}" height="${alto}" fill="url(#g)" />
      <text
        x="50%" y="50%"
        font-family="Helvetica, Arial, sans-serif"
        font-size="${Math.round(ancho / 16)}"
        font-weight="600"
        fill="rgba(255,255,255,0.92)"
        text-anchor="middle"
        dominant-baseline="middle"
      >${texto.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>
    </svg>`

  const ruta = path.resolve(destino)
  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(ruta)

  return ruta
}
