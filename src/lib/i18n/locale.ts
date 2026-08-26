import { cookies } from "next/headers";
import { getDictionary, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "levery-locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "es";
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
