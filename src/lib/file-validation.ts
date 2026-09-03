// Validación real de imágenes subidas por el cliente: el navegador solo
// manda un file.type "declarado" (cualquiera puede mentir con curl/la
// anon key directo), así que esto no reemplaza la restricción real —
// que vive en los buckets de Storage (allowed_mime_types/file_size_limit,
// ver supabase/migrations/0054_storage_upload_limits.sql) y es la que de
// verdad no se puede saltar. Esto es para dar un mensaje de error claro
// en la UI antes de intentar subir, con la MISMA lista de tipos
// permitidos que los buckets — deliberadamente sin SVG (puede traer
// <script> embebido y ejecutarse si alguien abre el archivo subido
// directo en una pestaña).
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!(file.type in ALLOWED_IMAGE_TYPES)) {
    return "Formato no permitido. Usa una imagen JPG, PNG, WEBP o GIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "La imagen no puede pesar más de 5 MB.";
  }
  return null;
}

export function imageExtension(file: File): string {
  return ALLOWED_IMAGE_TYPES[file.type];
}
