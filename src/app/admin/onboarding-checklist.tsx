"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dismissOnboarding, isOnboardingDismissed } from "@/lib/onboarding";

type Step = {
  key: string;
  label: string;
  href: string;
  done: boolean;
  icon: LucideIcon;
};

// Mismo patrón que theme-toggle.tsx / SectionIntro: useSyncExternalStore en
// vez de setState dentro de un efecto para leer localStorage.
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getServerSnapshot() {
  // Igual que en SectionIntro: en el servidor asumimos "cerrado" para
  // evitar el parpadeo de mostrarlo y ocultarlo de golpe tras hidratar.
  return true;
}

export function OnboardingChecklist({
  restaurantId,
  title,
  subtitle,
  dismissLabel,
  steps,
}: {
  restaurantId: string;
  title: string;
  subtitle: string;
  dismissLabel: string;
  steps: Step[];
}) {
  const allDone = steps.every((s) => s.done);
  const dismissed = useSyncExternalStore(
    subscribe,
    () => isOnboardingDismissed(restaurantId),
    getServerSnapshot,
  );

  if (allDone || dismissed) return null;

  const dismiss = () => {
    dismissOnboarding(restaurantId);
    listeners.forEach((callback) => callback());
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</p>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={dismissLabel}
          className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className="flex items-center gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  step.done
                    ? "bg-green-100 text-green-700 dark:bg-green-400/20 dark:text-green-400"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
                )}
              >
                {step.done ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  step.done
                    ? "text-neutral-400 line-through dark:text-neutral-600"
                    : "text-neutral-900 dark:text-white",
                )}
              >
                {step.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
