import type { Json } from "@/lib/supabase/database.types";

export function parsePreferences(json: Json | null | undefined): string[] {
  if (!Array.isArray(json)) return [];
  return json.map((entry) => String(entry ?? "").trim()).filter(Boolean);
}

// Lee las filas que arma PreferencesFields (preferences.0, preferences.1,
// ...) — se detiene en el primer índice vacío, así que no importa si el
// cliente reordenó o borró filas antes de enviar el formulario. Mismo
// patrón que parseExtrasForm/parseDeliveryZonesForm.
export function parsePreferencesForm(formData: FormData): string[] {
  const preferences: string[] = [];
  for (let i = 0; formData.has(`preferences.${i}`); i++) {
    const value = String(formData.get(`preferences.${i}`) ?? "").trim();
    if (value) preferences.push(value);
  }
  return preferences;
}
