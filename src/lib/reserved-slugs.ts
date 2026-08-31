// El menú público vive en la raíz (/mi-restaurante), así que una URL de
// restaurante no puede coincidir con ninguna ruta propia del sitio o
// quedaría inalcanzable (Next.js siempre prioriza la ruta estática).
export const RESERVED_SLUGS = [
  "admin",
  "auth",
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "pricing",
  "superadmin",
  "delivery",
  "kitchen-board",
  "r",
  "api",
];

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.includes(slug.toLowerCase());
}
