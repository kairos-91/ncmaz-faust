"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "levery-theme";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

function setDark(next: boolean) {
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  listeners.forEach((callback) => callback());
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // En desarrollo, el remount de Strict Mode borra el "dark" que puso el
  // script inline de layout.tsx (solo gestiona los atributos que vienen del
  // JSX). Reaplicarlo aquí es un no-op en producción — ver la guía de Next.js
  // "preventing-flash-before-hydration" (sección Themes).
  useLayoutEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") document.documentElement.classList.add("dark");
  }, []);

  return (
    <button
      type="button"
      onClick={() => setDark(!isDark)}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
