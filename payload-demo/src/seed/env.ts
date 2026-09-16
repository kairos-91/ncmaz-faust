import path from 'path'

/**
 * Carga .env antes que nada. Vive en su propio modulo porque los imports de
 * ESM se evaluan en orden: si esto estuviera dentro de run.ts, payload.config
 * ya se habria importado (y leido process.env vacio) antes de ejecutarse.
 */
try {
  process.loadEnvFile(path.resolve(process.cwd(), '.env'))
} catch {
  // Sin .env seguimos: las variables pueden venir del entorno.
}
