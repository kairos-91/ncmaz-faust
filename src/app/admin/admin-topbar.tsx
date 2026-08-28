import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "./actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function AdminTopBar({
  email,
  locale,
  t,
}: {
  email: string | null;
  locale: Locale;
  t: Dictionary["adminNav"];
}) {
  return (
    <header className="flex items-center justify-end gap-3 border-b border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900 md:px-10">
      {email && (
        <span className="hidden max-w-[220px] truncate text-xs text-neutral-500 dark:text-neutral-500 sm:inline">
          {email}
        </span>
      )}
      <div className="flex items-center gap-1">
        <LanguageToggle locale={locale} />
        <ThemeToggle />
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          {t.logout}
        </button>
      </form>
    </header>
  );
}
