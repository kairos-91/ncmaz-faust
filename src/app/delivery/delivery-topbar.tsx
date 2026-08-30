import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/admin/actions";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function DeliveryTopBar({
  email,
  restaurantName,
  locale,
  t,
}: {
  email: string | null;
  restaurantName: string;
  locale: Locale;
  t: Dictionary["deliveryPortal"];
}) {
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Logo height={40} />
        <span className="hidden truncate text-sm font-medium text-neutral-500 dark:text-neutral-400 sm:inline">
          {restaurantName} · {t.title}
        </span>
      </div>
      <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
