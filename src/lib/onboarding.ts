// Recuerda, por navegador, qué mini-resúmenes de sección ya vio cada
// restaurante y si cerraron la lista de primeros pasos. Es intencional que
// viva en localStorage y no en la base de datos: es solo una ayuda de
// interfaz (no crítica) y así no hace falta pedir permisos ni sincronizar
// nada entre dispositivos — si el dueño entra desde otro navegador, vuelve
// a ver los resúmenes una vez, lo cual es un costo aceptable.

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Modo privado o storage lleno: no rompe la funcionalidad, solo no
    // recuerda la preferencia.
  }
}

export function hasSeenTip(restaurantId: string, tipKey: string): boolean {
  return safeGet(`levery-tip-${restaurantId}-${tipKey}`) === "1";
}

export function markTipSeen(restaurantId: string, tipKey: string) {
  safeSet(`levery-tip-${restaurantId}-${tipKey}`, "1");
}

export function isOnboardingDismissed(restaurantId: string): boolean {
  return safeGet(`levery-onboarding-dismissed-${restaurantId}`) === "1";
}

export function dismissOnboarding(restaurantId: string) {
  safeSet(`levery-onboarding-dismissed-${restaurantId}`, "1");
}
