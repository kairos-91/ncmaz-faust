import type { Json } from "@/lib/supabase/database.types";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DayHours = {
  day: DayKey;
  open: string;
  close: string;
  closed: boolean;
};

export const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// El servidor (Vercel) corre en UTC, pero los horarios se cargan en hora
// de Venezuela. Todo el cálculo de "abierto/cerrado" debe hacerse en esa
// zona horaria, no en la del proceso, o el horario queda desfasado ~4-5h.
export const RESTAURANT_TIMEZONE = "America/Caracas";

const WEEKDAY_TO_DAY_KEY: Record<string, DayKey> = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

function getZonedParts(date: Date): { day: DayKey; minutesOfDay: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const day = WEEKDAY_TO_DAY_KEY[byType.weekday] ?? "mon";
  const hour = Number(byType.hour) % 24;
  const minute = Number(byType.minute) || 0;
  return { day, minutesOfDay: hour * 60 + minute };
}

export function getDayKey(date: Date): DayKey {
  return getZonedParts(date).day;
}

export function formatTime12h(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
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
  const { day: todayKey, minutesOfDay: minutesNow } = getZonedParts(now);
  const todayIndex = DAY_KEYS.indexOf(todayKey);
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
  const { day: todayKey, minutesOfDay: minutesNow } = getZonedParts(now);
  const today = hours.find((h) => h.day === todayKey);
  if (!today || today.closed) return false;
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
