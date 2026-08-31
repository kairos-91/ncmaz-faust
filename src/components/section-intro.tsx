"use client";

import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { hasSeenTip, markTipSeen } from "@/lib/onboarding";

// Mismo patrón que theme-toggle.tsx: localStorage no tiene un evento de
// cambio dentro de la misma pestaña, así que se avisa a mano con un set de
// listeners cuando se marca como visto, para que useSyncExternalStore
// vuelva a leer el snapshot y oculte el aviso.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getServerSnapshot() {
  // En el servidor no hay localStorage: asumimos "ya visto" para no
  // mostrar el aviso en el HTML inicial y luego hacerlo desaparecer de
  // golpe si el usuario ya lo había cerrado antes (más suave que aparezca
  // después de hidratar si de verdad es la primera vez, a que aparezca y
  // desaparezca).
  return true;
}

export function SectionIntro({
  restaurantId,
  tipKey,
  icon: Icon,
  title,
  body,
  dismissLabel,
}: {
  restaurantId: string;
  tipKey: string;
  icon: LucideIcon;
  title: string;
  body: string;
  dismissLabel: string;
}) {
  const seen = useSyncExternalStore(
    subscribe,
    () => hasSeenTip(restaurantId, tipKey),
    getServerSnapshot,
  );

  if (seen) return null;

  const dismiss = () => {
    markTipSeen(restaurantId, tipKey);
    listeners.forEach((callback) => callback());
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-lime-200 bg-lime-50 p-4 dark:border-lime-400/20 dark:bg-lime-400/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-100 dark:bg-lime-400/20">
        <Icon className="h-5 w-5 text-lime-700 dark:text-lime-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{body}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={dismissLabel}
        className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-lime-100 hover:text-neutral-600 dark:hover:bg-lime-400/20 dark:hover:text-neutral-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
