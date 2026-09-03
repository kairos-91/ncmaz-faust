// El formulario solo le pide al dueño su usuario (ej. "turestaurante"),
// no la URL completa — evita que alguien pegue el link mal armado o de
// otra red por error. Estas funciones arman la URL final que se guarda
// en restaurants.instagram_url/tiktok_url/facebook_url, y también se
// usan para mostrar solo el usuario al editar un restaurante que ya
// tenía la URL completa guardada de antes.
const KNOWN_SOCIAL_HOSTS = [
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "fb.com",
];

// Deja pasar tanto un usuario suelto ("turestaurante", "@turestaurante")
// como un link completo pegado por costumbre — ambos casos terminan en
// el mismo usuario limpio, sin protocolo, dominio, @ ni barras.
export function extractSocialHandle(raw: string | null | undefined): string {
  if (!raw) return "";
  let value = raw.trim();
  if (!value) return "";

  value = value.replace(/^https?:\/\//i, "");
  for (const host of KNOWN_SOCIAL_HOSTS) {
    const prefix = `${host}/`;
    if (value.toLowerCase().startsWith(prefix)) {
      value = value.slice(prefix.length);
      break;
    }
  }
  value = value.split(/[?#]/)[0];
  value = value.replace(/\/+$/, "");
  value = value.replace(/^@/, "");
  return value;
}

export function buildInstagramUrl(raw: string | null | undefined): string {
  const handle = extractSocialHandle(raw);
  return handle ? `https://instagram.com/${handle}` : "";
}

export function buildTiktokUrl(raw: string | null | undefined): string {
  const handle = extractSocialHandle(raw);
  return handle ? `https://tiktok.com/@${handle}` : "";
}

export function buildFacebookUrl(raw: string | null | undefined): string {
  const handle = extractSocialHandle(raw);
  return handle ? `https://facebook.com/${handle}` : "";
}
