"use client";

import { useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasSeenWelcome, markWelcomeSeen } from "@/lib/onboarding";

// Mismo patrón que theme-toggle.tsx / SectionIntro / OnboardingChecklist:
// useSyncExternalStore en vez de setState dentro de un efecto.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getServerSnapshot() {
  // Oculto en el servidor para no parpadear al hidratar (mismo criterio
  // que el resto de los avisos de onboarding).
  return true;
}

export type WelcomeSlide = {
  icon: ReactNode;
  title: string;
  body: string;
};

export function WelcomeModal({
  userKey,
  slides,
  nextLabel,
  backLabel,
  skipLabel,
  startLabel,
}: {
  userKey: string;
  slides: WelcomeSlide[];
  nextLabel: string;
  backLabel: string;
  skipLabel: string;
  startLabel: string;
}) {
  const seen = useSyncExternalStore(
    subscribe,
    () => hasSeenWelcome(userKey),
    getServerSnapshot,
  );
  const [index, setIndex] = useState(0);

  if (seen) return null;

  const dismiss = () => {
    markWelcomeSeen(userKey);
    listeners.forEach((callback) => callback());
  };

  const isLast = index === slides.length - 1;
  const slide = slides[index];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            {skipLabel}
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-100 text-lime-700 dark:bg-lime-400/10 dark:text-lime-400 [&_svg]:h-8 [&_svg]:w-8">
            {slide.icon}
          </div>
          <p className="mt-4 text-lg font-bold text-neutral-900 dark:text-white">
            {slide.title}
          </p>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{slide.body}</p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-5 bg-lime-500"
                  : "w-1.5 bg-neutral-200 dark:bg-neutral-700",
              )}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex((i) => i - 1)}
              aria-label={backLabel}
              className="flex items-center justify-center rounded-full border border-neutral-200 p-2.5 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? dismiss() : setIndex((i) => i + 1))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isLast ? startLabel : nextLabel}
            {!isLast && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
