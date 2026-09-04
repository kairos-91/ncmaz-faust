import type { Json } from "@/lib/supabase/database.types";

export function parsePreferences(json: Json | null | undefined): string[] {
  if (!Array.isArray(json)) return [];
  return json.map((entry) => String(entry ?? "").trim()).filter(Boolean);
}

export function preferencesToText(preferences: string[]) {
  return preferences.join("\n");
}

export function parsePreferencesText(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
