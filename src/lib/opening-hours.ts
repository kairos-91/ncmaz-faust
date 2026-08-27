import type { Json } from "@/lib/supabase/database.types";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DayHours = {
  day: DayKey;
  open: string;
  close: string;
  closed: boolean;
};

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// JS Date#getDay(): 0 = Sunday ... 6 = Saturday.
const DAY_KEY_BY_JS_INDEX: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function getDayKey(date: Date): DayKey {
  return DAY_KEY_BY_JS_INDEX[date.getDay()];
}

function defaultDayHours(day: DayKey): DayHours {
  return { day, open: "08:00", close: "18:00", closed: false };
}

export function defaultOpeningHours(): DayHours[] {
  return DAY_KEYS.map(defaultDayHours);
}

export function parseOpeningHours(json: Json | null | undefined): DayHours[] {
  const byDay = new Map<string, DayHours>();
  if (Array.isArray(json)) {
    for (const entry of json) {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
      const record = entry as Record<string, Json>;
      const day = String(record.day ?? "");
      if (!DAY_KEYS.includes(day as DayKey)) continue;
      byDay.set(day, {
        day: day as DayKey,
        open: typeof record.open === "string" ? record.open : "08:00",
        close: typeof record.close === "string" ? record.close : "18:00",
        closed: Boolean(record.closed),
      });
    }
  }
  return DAY_KEYS.map((day) => byDay.get(day) ?? defaultDayHours(day));
}

export function getNextOpening(
  hours: DayHours[],
  now: Date = new Date(),
): { day: DayKey; time: string; isToday: boolean } | null {
  const todayKey = getDayKey(now);
  const todayIndex = DAY_KEYS.indexOf(todayKey);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const byDay = new Map(hours.map((h) => [h.day, h]));

  const today = byDay.get(todayKey);
  if (today && !today.closed) {
    const [openH, openM] = today.open.split(":").map(Number);
    const openMinutes = openH * 60 + (openM || 0);
    if (minutesNow < openMinutes) {
      return { day: todayKey, time: today.open, isToday: true };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const day = DAY_KEYS[(todayIndex + i) % 7];
    const entry = byDay.get(day);
    if (entry && !entry.closed) {
      return { day, time: entry.open, isToday: false };
    }
  }
  return null;
}

export function isOpenNow(hours: DayHours[], now: Date = new Date()): boolean {
  const today = hours.find((h) => h.day === DAY_KEY_BY_JS_INDEX[now.getDay()]);
  if (!today || today.closed) return false;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const openMinutes = openH * 60 + (openM || 0);
  const closeMinutes = closeH * 60 + (closeM || 0);
  if (closeMinutes <= openMinutes) {
    // Overnight schedule (e.g. 18:00–02:00).
    return minutesNow >= openMinutes || minutesNow < closeMinutes;
  }
  return minutesNow >= openMinutes && minutesNow < closeMinutes;
}
