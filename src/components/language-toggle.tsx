"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function LanguageToggle({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next: Locale = locale === "es" ? "en" : "es";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={locale === "es" ? "Switch to English" : "Cambiar a español"}
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-neutral-600 hover:bg-neutral-100 disabled:opacity-60 dark:text-neutral-300 dark:hover:bg-neutral-800",
        compact ? "h-5 min-w-5 px-1 text-[10px]" : "h-9 min-w-9 px-2 text-sm",
      )}
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
